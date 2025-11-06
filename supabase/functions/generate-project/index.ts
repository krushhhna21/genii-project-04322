import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "https://esm.sh/docx@8.5.0";

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

    // Extract text from the file based on type
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      // For PDF files - basic text extraction
      extractedText = await extractTextFromPDF(fileContent);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files
      extractedText = await extractTextFromDOCX(fileContent);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // For PPTX files
      extractedText = await extractTextFromPPTX(fileContent);
    } else {
      throw new Error('Unsupported file type');
    }

    console.log('Extracted text length:', extractedText.length);

    // Call Lovable AI to generate the project content
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiPrompt = `You are an MSBTE diploma project generator AI. 
Generate a complete mini project report for the topic: "${studentData.topic}".

Use this reference content as structure and inspiration: ${extractedText.substring(0, 5000)}

Create a professional project report with these sections:
1. Cover Page with project title
2. Abstract (150-200 words)
3. Introduction (explaining the project purpose and scope)
4. Methodology (technical approach and implementation)
5. Results (expected outcomes and benefits)
6. Conclusion (summary and future scope)
7. References (at least 5 relevant references)

Student Information:
Name: ${studentData.name}
Roll No: ${studentData.rollNumber}
Enrollment No: ${studentData.enrollmentNumber}
College: ${studentData.college}

Make the content technical, professional, and relevant to the topic. Use formal academic language.`;

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

    // Create a Word document with proper formatting
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Cover Page
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
              new TextRun({ text: "Submitted by:", bold: true, size: 24 }),
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
          
          // Add the AI-generated content paragraphs
          ...generatedContent.split('\n\n').map((para: string) => {
            const trimmedPara = para.trim();
            if (!trimmedPara) return null;
            
            // Check if it's a heading (starts with # or is all caps and short)
            const isHeading = trimmedPara.startsWith('#') || 
                             (trimmedPara === trimmedPara.toUpperCase() && trimmedPara.length < 100);
            
            const text = trimmedPara.replace(/^#+\s*/, '');
            
            return new Paragraph({
              text: text,
              heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
              spacing: { before: 200, after: 200 },
            });
          }).filter((p: any) => p !== null),
        ],
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

// Helper functions for text extraction
async function extractTextFromPDF(base64Content: string): Promise<string> {
  // Basic PDF text extraction
  // In a production environment, you'd use a proper PDF parsing library
  const content = atob(base64Content.split(',')[1] || base64Content);
  // Simple text extraction - looking for readable text patterns
  const textMatch = content.match(/[A-Za-z0-9\s.,;:!?()-]+/g);
  return textMatch ? textMatch.join(' ').substring(0, 10000) : 'No text extracted from PDF';
}

async function extractTextFromDOCX(base64Content: string): Promise<string> {
  // Basic DOCX text extraction
  // DOCX files are ZIP archives containing XML
  const content = atob(base64Content.split(',')[1] || base64Content);
  // Simple text extraction from XML content
  const textMatch = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (textMatch) {
    return textMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' ').substring(0, 10000);
  }
  return 'No text extracted from DOCX';
}

async function extractTextFromPPTX(base64Content: string): Promise<string> {
  // Basic PPTX text extraction
  // PPTX files are also ZIP archives containing XML
  const content = atob(base64Content.split(',')[1] || base64Content);
  // Simple text extraction from XML content
  const textMatch = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
  if (textMatch) {
    return textMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' ').substring(0, 10000);
  }
  return 'No text extracted from PPTX';
}
