import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableOfContents } from "https://esm.sh/docx@8.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType, studentData } = await req.json();
    console.log('Received request:', { fileName, fileType, studentData });

    // Extract text and structure from the file based on type
    let extractedData: { text: string; structure: DocumentStructure };
    
    if (fileType === 'application/pdf') {
      extractedData = await extractFromPDF(fileContent);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedData = await extractFromDOCX(fileContent);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      extractedData = await extractFromPPTX(fileContent);
    } else {
      throw new Error('Unsupported file type');
    }

    console.log('Extracted text length:', extractedData.text.length);
    console.log('Document structure:', extractedData.structure);

    // Call Lovable AI to generate the project content
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiPrompt = `You are an MSBTE diploma project generator AI. 
Generate a complete mini project report for the topic: "${studentData.topic}".

Use this reference content as structure and inspiration: ${extractedData.text.substring(0, 5000)}

CRITICAL: Match the exact structure and section organization from the reference document.
The reference has these sections: ${extractedData.structure.sections.map(s => s.title).join(', ')}

Generate content for each section matching the reference structure. For each section:
- Use the same heading style and level as the reference
- Match the approximate length and detail level
- Keep the same organizational flow

Student Information:
Name: ${studentData.name}
Roll No: ${studentData.rollNumber}
Enrollment No: ${studentData.enrollmentNumber}
College: ${studentData.college}

Make the content technical, professional, and relevant to the topic. Use formal academic language.
Format your response with clear section markers using "## SECTION: [Section Name]" for each major heading.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert academic project report writer for engineering diploma students." },
          { role: "user", content: aiPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices[0].message.content;

    console.log('Generated content length:', generatedContent.length);

    // Parse the generated content into structured sections
    const sections = parseGeneratedContent(generatedContent, extractedData.structure);
    
    // Create a Word document matching the reference formatting
    const docChildren: any[] = [];
    
    // Cover Page
    docChildren.push(
      new Paragraph({
        text: studentData.college,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: studentData.topic,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [
          new TextRun({ 
            text: "Submitted by:", 
            bold: true, 
            size: extractedData.structure.defaultFontSize || 24 
          }),
        ],
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: `Name: ${studentData.name}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Roll Number: ${studentData.rollNumber}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Enrollment Number: ${studentData.enrollmentNumber}`,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "",
        spacing: { after: 400 },
        pageBreakBefore: true,
      })
    );
    
    // Add Table of Contents if reference had one
    if (extractedData.structure.hasTableOfContents) {
      docChildren.push(
        new Paragraph({
          text: "Table of Contents",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          text: "",
          spacing: { after: 400 },
          pageBreakBefore: true,
        })
      );
    }
    
    // Add content sections with matching formatting
    sections.forEach((section: ParsedSection) => {
      const refSection = extractedData.structure.sections.find(s => 
        s.title.toLowerCase().includes(section.title.toLowerCase()) ||
        section.title.toLowerCase().includes(s.title.toLowerCase())
      );
      
      const headingLevel = refSection?.level || section.level;
      const fontSize = refSection?.fontSize || extractedData.structure.defaultFontSize || 24;
      
      // Add section heading
      docChildren.push(
        new Paragraph({
          text: section.title,
          heading: mapToHeadingLevel(headingLevel),
          spacing: { before: 400, after: 200 },
        })
      );
      
      // Add section content paragraphs
      section.content.forEach((para: string) => {
        if (para.trim()) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ 
                  text: para, 
                  size: fontSize - 4 // Body text slightly smaller than headings
                })
              ],
              spacing: { before: 100, after: 100 },
            })
          );
        }
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    // Generate the document as a buffer
    const buffer = await Packer.toBuffer(doc);
    const base64Doc = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Return the generated content as base64 DOCX
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: base64Doc,
        fileName: `AI_Project_${studentData.topic.replace(/\s+/g, '_')}.docx`
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-project function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

// Type definitions
interface DocumentSection {
  title: string;
  level: number;
  fontSize: number;
}

interface DocumentStructure {
  sections: DocumentSection[];
  defaultFontSize: number;
  hasTableOfContents: boolean;
}

interface ParsedSection {
  title: string;
  level: number;
  content: string[];
}

// Helper functions for enhanced document extraction
async function extractFromPDF(base64Content: string): Promise<{ text: string; structure: DocumentStructure }> {
  const content = atob(base64Content.split(',')[1] || base64Content);
  const textMatch = content.match(/[A-Za-z0-9\s.,;:!?()-]+/g);
  const text = textMatch ? textMatch.join(' ').substring(0, 10000) : 'No text extracted from PDF';
  
  // Detect structure from PDF (basic implementation)
  const lines = text.split('\n');
  const sections: DocumentSection[] = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    // Detect headings (all caps, short lines, or numbered)
    if (trimmed.length > 0 && trimmed.length < 100 && 
        (trimmed === trimmed.toUpperCase() || /^\d+\.?\s+[A-Z]/.test(trimmed))) {
      sections.push({
        title: trimmed,
        level: /^\d+\.?\s/.test(trimmed) ? 1 : 2,
        fontSize: 28
      });
    }
  });
  
  return {
    text,
    structure: {
      sections,
      defaultFontSize: 24,
      hasTableOfContents: text.toLowerCase().includes('table of contents') || 
                          text.toLowerCase().includes('contents')
    }
  };
}

async function extractFromDOCX(base64Content: string): Promise<{ text: string; structure: DocumentStructure }> {
  const content = atob(base64Content.split(',')[1] || base64Content);
  
  // Extract text
  const textMatch = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  const text = textMatch ? textMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' ').substring(0, 10000) : 'No text extracted';
  
  // Extract structure from DOCX XML
  const sections: DocumentSection[] = [];
  
  // Look for heading styles in the XML
  const headingMatches = content.matchAll(/<w:pStyle w:val="(Heading\d+)"[^>]*>.*?<w:t[^>]*>([^<]+)<\/w:t>/gs);
  for (const match of headingMatches) {
    const level = parseInt(match[1].replace('Heading', ''));
    const title = match[2];
    sections.push({
      title,
      level,
      fontSize: 32 - (level * 4) // Heading 1 = 28, Heading 2 = 24, etc.
    });
  }
  
  // Look for font sizes
  const fontSizes = content.match(/<w:sz w:val="(\d+)"\/>/g);
  const avgFontSize = fontSizes ? 
    Math.round(fontSizes.map(f => parseInt(f.match(/\d+/)?.[0] || '24')).reduce((a, b) => a + b, 0) / fontSizes.length) : 24;
  
  return {
    text,
    structure: {
      sections,
      defaultFontSize: avgFontSize,
      hasTableOfContents: content.includes('TOC') || text.toLowerCase().includes('table of contents')
    }
  };
}

async function extractFromPPTX(base64Content: string): Promise<{ text: string; structure: DocumentStructure }> {
  const content = atob(base64Content.split(',')[1] || base64Content);
  const textMatch = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
  const text = textMatch ? textMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' ').substring(0, 10000) : 'No text extracted';
  
  // PPTX typically has slide titles as headings
  const sections: DocumentSection[] = [];
  const slideMatches = content.matchAll(/<p:ph type="title"[^>]*>.*?<a:t[^>]*>([^<]+)<\/a:t>/gs);
  
  for (const match of slideMatches) {
    sections.push({
      title: match[1],
      level: 1,
      fontSize: 32
    });
  }
  
  return {
    text,
    structure: {
      sections,
      defaultFontSize: 24,
      hasTableOfContents: false
    }
  };
}

function parseGeneratedContent(content: string, structure: DocumentStructure): ParsedSection[] {
  const sections: ParsedSection[] = [];
  
  // Split by section markers
  const sectionPattern = /## SECTION: ([^\n]+)\n/g;
  const parts = content.split(sectionPattern);
  
  // If AI didn't use section markers, fall back to detecting headings
  if (parts.length === 1) {
    const lines = content.split('\n');
    let currentSection: ParsedSection | null = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Detect if line is a heading
      const isHeading = trimmed.startsWith('#') || 
                       (trimmed === trimmed.toUpperCase() && trimmed.length < 100 && trimmed.length > 3) ||
                       /^\d+\.?\s+[A-Z]/.test(trimmed);
      
      if (isHeading) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: trimmed.replace(/^#+\s*/, '').replace(/^\d+\.?\s*/, ''),
          level: trimmed.startsWith('##') ? 2 : 1,
          content: []
        };
      } else if (currentSection) {
        currentSection.content.push(trimmed);
      }
    });
    
    if (currentSection) sections.push(currentSection);
  } else {
    // Parse sections from markers
    for (let i = 1; i < parts.length; i += 2) {
      sections.push({
        title: parts[i].trim(),
        level: 1,
        content: parts[i + 1]?.split('\n').filter(l => l.trim()) || []
      });
    }
  }
  
  return sections;
}

function mapToHeadingLevel(level: number): HeadingLevel {
  switch (level) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    case 4: return HeadingLevel.HEADING_4;
    case 5: return HeadingLevel.HEADING_5;
    case 6: return HeadingLevel.HEADING_6;
    default: return HeadingLevel.HEADING_2;
  }
}
