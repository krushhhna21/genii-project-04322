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

    const aiPrompt = `You are an MSBTE diploma micro-project report generator AI. 
Generate content for the topic: "${studentData.topic}".

CRITICAL - Follow this EXACT MSBTE structure:

ANNEXURE I - MICRO PROJECT PROPOSAL:
1. Aims/Benefits of the Micro-Project (2-3 paragraphs about benefits)
2. Course Outcome Addressed (2-3 bullet points starting with a), b), c))
3. Proposed Methodology (1-2 paragraphs explaining the approach)

ANNEXURE II - MICRO PROJECT REPORT:
1. Rationale (1 paragraph explaining why this project is important)
2. Aims/Benefits of the Micro-Project (3-4 bullet points with detailed benefits)
3. Course Outcomes Achieved (2-3 bullet points starting with a), b), c))
4. Literature Review (1 paragraph introducing the topic, then 4-6 bullet points with key concepts)
5. Actual Methodology Followed (detailed explanation of implementation in 2-3 paragraphs)
6. Skills Developed / Learning (4-5 bullet points of skills gained)
7. Applications of this Micro-Project (4-5 bullet points of real-world applications)

Student Information:
Name: ${studentData.name}
Roll No: ${studentData.rollNumber}
Enrollment No: ${studentData.enrollmentNumber}
College: ${studentData.college}

Make the content technical, professional, relevant to ${studentData.topic}, and use formal academic language suitable for MSBTE diploma engineering.

Format your response with clear section markers:
## ANNEXURE_I_AIMS
## ANNEXURE_I_COURSE_OUTCOME
## ANNEXURE_I_METHODOLOGY
## ANNEXURE_II_RATIONALE
## ANNEXURE_II_AIMS
## ANNEXURE_II_COURSE_OUTCOME
## ANNEXURE_II_LITERATURE
## ANNEXURE_II_METHODOLOGY
## ANNEXURE_II_SKILLS
## ANNEXURE_II_APPLICATIONS`;

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

    // Parse AI generated content into MSBTE sections
    const msbteContent = parseMSBTEContent(generatedContent);
    
    // Create Word document with MSBTE formatting
    const docChildren: any[] = [];
    
    // Index Page
    docChildren.push(
      new Paragraph({
        text: "Index",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Sr. No.\tContents\t\t\t\t\tPage No.",
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "\tAnnexure I – Micro Project Proposal\t\t1-2",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "1\t1. Aims/Benefits of the Micro-Project\t\t1",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t2. Course Outcome Addressed\t\t\t1",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t3. Proposed Methodology\t\t\t\t1",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\tAnnexure II – Micro Project Report\t\t3-9",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "2\t1. Rationale\t\t\t\t\t3",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t2. Aims/Benefits of the Micro-Project\t\t3",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t3. Course Outcome Achieved\t\t\t3",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t4. Literature Review\t\t\t\t4",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t5. Actual Methodology Followed\t\t\t5",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t6. Skills Developed / Learning\t\t\t6",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "\t7. Applications of this Micro-Project\t\t7",
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      })
    );
    
    // Annexure I - Micro Project Proposal
    docChildren.push(
      new Paragraph({
        text: "Annexure I",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Micro Project Proposal",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: studentData.topic,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "1. Aims/Benefits of the Micro-Project:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: msbteContent.annexure1.aims,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: "2. Course Outcome Addressed:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...msbteContent.annexure1.courseOutcome.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        text: "3. Proposed Methodology:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: msbteContent.annexure1.methodology,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Name: ", bold: true }),
          new TextRun({ text: studentData.name }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Roll Number: ", bold: true }),
          new TextRun({ text: studentData.rollNumber }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Enrollment Number: ", bold: true }),
          new TextRun({ text: studentData.enrollmentNumber }),
        ],
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      })
    );
    
    // Annexure II - Micro Project Report
    docChildren.push(
      new Paragraph({
        text: "Annexure – II",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Micro-Project Report",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: studentData.topic,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "1. Rationale:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: msbteContent.annexure2.rationale,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: "2. Aims/Benefits of the Micro-Project:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...msbteContent.annexure2.aims.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        text: "3. Course Outcomes Achieved:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...msbteContent.annexure2.courseOutcome.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        text: "4. Literature Review:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: msbteContent.annexure2.literatureIntro,
        spacing: { after: 200 },
      }),
      ...msbteContent.annexure2.literaturePoints.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        text: "5. Actual Methodology Followed:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: msbteContent.annexure2.methodology,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: "6. Skills Developed / Learning out of this Micro-Project:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...msbteContent.annexure2.skills.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      ),
      new Paragraph({
        text: "7. Applications of this Micro-Project:",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...msbteContent.annexure2.applications.map((item: string) => 
        new Paragraph({
          text: item,
          spacing: { after: 100 },
        })
      )
    );

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

interface MSBTEContent {
  annexure1: {
    aims: string;
    courseOutcome: string[];
    methodology: string;
  };
  annexure2: {
    rationale: string;
    aims: string[];
    courseOutcome: string[];
    literatureIntro: string;
    literaturePoints: string[];
    methodology: string;
    skills: string[];
    applications: string[];
  };
}

function parseMSBTEContent(content: string): MSBTEContent {
  const result: MSBTEContent = {
    annexure1: {
      aims: '',
      courseOutcome: [],
      methodology: ''
    },
    annexure2: {
      rationale: '',
      aims: [],
      courseOutcome: [],
      literatureIntro: '',
      literaturePoints: [],
      methodology: '',
      skills: [],
      applications: []
    }
  };
  
  // Extract sections using markers
  const extractSection = (marker: string): string => {
    const pattern = new RegExp(`## ${marker}\\s*\\n([\\s\\S]*?)(?=##|$)`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  };
  
  // Parse Annexure I
  result.annexure1.aims = extractSection('ANNEXURE_I_AIMS');
  
  const courseOutcome1 = extractSection('ANNEXURE_I_COURSE_OUTCOME');
  result.annexure1.courseOutcome = courseOutcome1.split('\n')
    .filter(line => line.trim())
    .map(line => line.trim());
  
  result.annexure1.methodology = extractSection('ANNEXURE_I_METHODOLOGY');
  
  // Parse Annexure II
  result.annexure2.rationale = extractSection('ANNEXURE_II_RATIONALE');
  
  const aims2 = extractSection('ANNEXURE_II_AIMS');
  result.annexure2.aims = aims2.split('\n')
    .filter(line => line.trim() && (line.includes('•') || line.includes('-') || /^[a-z]\)/.test(line)))
    .map(line => line.trim());
  
  const courseOutcome2 = extractSection('ANNEXURE_II_COURSE_OUTCOME');
  result.annexure2.courseOutcome = courseOutcome2.split('\n')
    .filter(line => line.trim())
    .map(line => line.trim());
  
  const literature = extractSection('ANNEXURE_II_LITERATURE');
  const litLines = literature.split('\n').filter(l => l.trim());
  result.annexure2.literatureIntro = litLines[0] || '';
  result.annexure2.literaturePoints = litLines.slice(1)
    .filter(line => line.includes('•') || line.includes('-') || line.includes(':'))
    .map(line => line.trim());
  
  result.annexure2.methodology = extractSection('ANNEXURE_II_METHODOLOGY');
  
  const skills = extractSection('ANNEXURE_II_SKILLS');
  result.annexure2.skills = skills.split('\n')
    .filter(line => line.trim() && (line.includes('•') || line.includes('-')))
    .map(line => line.trim());
  
  const apps = extractSection('ANNEXURE_II_APPLICATIONS');
  result.annexure2.applications = apps.split('\n')
    .filter(line => line.trim() && (line.includes('•') || line.includes('-')))
    .map(line => line.trim());
  
  return result;
}

function mapToHeadingLevel(level: number) {
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
