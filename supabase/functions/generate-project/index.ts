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

    // Get API key for enhanced AI processing
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced multi-stage AI processing pipeline
    const aiProcessingResult = await processWithEnhancedAI(studentData, extractedData, LOVABLE_API_KEY);

    // Validate and enhance content quality
    const validatedContent = await validateAndEnhanceContent(aiProcessingResult, studentData, LOVABLE_API_KEY);

    // Check MSBTE compliance
    const complianceCheck = await checkMSBTECompliance(validatedContent, studentData, LOVABLE_API_KEY);

    // Final formatting
    const finalContent = applyFinalFormatting(validatedContent, complianceCheck);

    console.log('Enhanced AI processing completed');
    console.log('Quality score:', complianceCheck.qualityScore);
    console.log('Compliance score:', complianceCheck.complianceScore);

    // Parse final enhanced content into MSBTE sections
    const msbteContent = parseMSBTEContent(finalContent);
    
    // Create Word document with MSBTE formatting
    const docChildren: any[] = [];
    
    // Cover Page with College Name
    docChildren.push(
      new Paragraph({
        text: studentData.college,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: "Micro Project Report",
        heading: HeadingLevel.HEADING_2,
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
        text: "",
        spacing: { after: 400 },
        pageBreakBefore: true,
      })
    );
    
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
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: "",
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: "_______________________",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Name and Signature of the Teacher",
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

    // Return the generated content as base64 DOCX with quality metrics
    return new Response(
      JSON.stringify({
        success: true,
        content: base64Doc,
        fileName: `AI_Project_${studentData.topic.replace(/\s+/g, '_')}.docx`,
        qualityMetrics: {
          technicalDepth: aiProcessingResult.qualityMetrics.technicalDepth,
          academicQuality: aiProcessingResult.qualityMetrics.academicQuality,
          completeness: aiProcessingResult.qualityMetrics.completeness,
          relevance: aiProcessingResult.qualityMetrics.relevance,
          complianceScore: complianceCheck.complianceScore,
          overallScore: complianceCheck.qualityScore
        },
        suggestions: aiProcessingResult.suggestions,
        complianceInfo: {
          isCompliant: complianceCheck.isCompliant,
          issues: complianceCheck.issues,
          recommendations: complianceCheck.recommendations
        }
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

// Enhanced AI processing functions
interface AIProcessingResult {
  content: string;
  qualityMetrics: {
    technicalDepth: number;
    academicQuality: number;
    completeness: number;
    relevance: number;
  };
  suggestions: string[];
}

interface ComplianceCheck {
  isCompliant: boolean;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
  qualityScore: number;
}

async function processWithEnhancedAI(studentData: any, extractedData: any, apiKey: string): Promise<AIProcessingResult> {
  console.log('Stage 1: Initial content generation with enhanced prompts');

  const enhancedPrompt = `You are an expert MSBTE diploma micro-project report generator with 10+ years of experience in engineering education.

Generate comprehensive, high-quality content for the topic: "${studentData.topic}".

Reference Context: Based on uploaded document analysis - Topic complexity: ${extractedData.structure.sections.length > 0 ? 'Advanced' : 'Basic'}

CRITICAL REQUIREMENTS:
1. Technical Accuracy: Ensure all technical information is current (2023-2024 standards)
2. Industry Relevance: Include recent industry practices and technologies
3. MSBTE Compliance: Follow exact diploma engineering standards
4. Practical Focus: Emphasize hands-on applications and real-world scenarios
5. Course Alignment: Map to specific diploma course outcomes

STRUCTURE - Follow this EXACT MSBTE format:

ANNEXURE I - MICRO PROJECT PROPOSAL:
1. Aims/Benefits of the Micro-Project (3-4 detailed bullet points with measurable outcomes)
2. Course Outcome Addressed (3-4 specific bullet points starting with a), b), c), d) mapping to course codes)
3. Proposed Methodology (2-3 detailed paragraphs with technical implementation steps)

ANNEXURE II - MICRO PROJECT REPORT:
1. Rationale (2 paragraphs explaining technical importance and industry relevance)
2. Aims/Benefits of the Micro-Project (4-5 detailed bullet points with technical and practical benefits)
3. Course Outcomes Achieved (3-4 specific bullet points with course outcome codes and demonstration)
4. Literature Review (1 introduction paragraph + 5-7 bullet points covering recent technologies, standards, and research)
5. Actual Methodology Followed (3-4 detailed paragraphs with technical specifications, tools, and implementation details)
6. Skills Developed / Learning (5-6 bullet points covering technical, analytical, and professional skills)
7. Applications of this Micro-Project (5-6 bullet points covering industrial, commercial, and academic applications)

Student Information:
Name: ${studentData.name}
Roll No: ${studentData.rollNumber}
Enrollment No: ${studentData.enrollmentNumber}
College: ${studentData.college}

CONTENT STANDARDS:
- Use formal academic engineering language
- Include specific technical details, measurements, and specifications where applicable
- Reference current industry standards (2023-2024)
- Focus on practical, implementable solutions
- Ensure content is technically sound and verifiable

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

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert MSBTE project evaluator and content generator with deep knowledge of diploma engineering education standards and industry requirements."
          },
          { role: "user", content: enhancedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.status}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices[0].message.content;

    // Calculate initial quality metrics
    const qualityMetrics = calculateInitialQualityMetrics(generatedContent, extractedData);

    // Generate improvement suggestions
    const suggestions = generateInitialSuggestions(generatedContent, studentData);

    return {
      content: generatedContent,
      qualityMetrics,
      suggestions
    };

  } catch (error) {
    console.error('Enhanced AI processing error:', error);
    throw new Error('Failed to process content with enhanced AI');
  }
}

async function validateAndEnhanceContent(result: AIProcessingResult, studentData: any, apiKey: string): Promise<string> {
  console.log('Stage 2: Content quality validation and enhancement');

  const enhancementPrompt = `You are an MSBTE project evaluator and improvement specialist with 15+ years of experience.

Review and enhance the following microproject content for:

CONTENT PROVIDED:
${result.content}

CURRENT QUALITY METRICS:
- Technical Depth: ${result.qualityMetrics.technicalDepth}/100
- Academic Quality: ${result.qualityMetrics.academicQuality}/100
- Completeness: ${result.qualityMetrics.completeness}/100
- Relevance: ${result.qualityMetrics.relevance}/100

IMPROVEMENT AREAS IDENTIFIED:
${result.suggestions.map(s => `- ${s}`).join('\n')}

ENHANCEMENT REQUIREMENTS:
1. Technical Accuracy: Verify and correct all technical information
2. MSBTE Compliance: Ensure strict adherence to diploma engineering standards
3. Academic Quality: Improve language, structure, and academic tone
4. Practical Relevance: Add real-world applications and current industry examples (2023-2024)
5. Course Alignment: Strengthen connection to diploma course outcomes
6. Content Depth: Enhance technical detail and implementation specifics

Student Information:
- Topic: ${studentData.topic}
- College: ${studentData.college}

Provide the enhanced version following the exact same format with section markers. Do not add explanations - just return the improved content.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert MSBTE content enhancement specialist. Your task is to improve academic project content while maintaining structure and format."
          },
          { role: "user", content: enhancementPrompt }
        ],
        temperature: 0.6,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Content enhancement failed: ${response.status}`);
    }

    const enhancedData = await response.json();
    return enhancedData.choices[0].message.content;

  } catch (error) {
    console.error('Content enhancement error:', error);
    // Return original content if enhancement fails
    return result.content;
  }
}

async function checkMSBTECompliance(content: string, studentData: any, apiKey: string): Promise<ComplianceCheck> {
  console.log('Stage 3: MSBTE compliance validation');

  const compliancePrompt = `You are an MSBTE compliance inspector with expertise in diploma engineering project standards.

Analyze the following microproject content for MSBTE compliance:

CONTENT:
${content}

EVALUATION CRITERIA:
1. Structure Compliance: All required sections present and properly formatted
2. Content Standards: Technical depth appropriate for diploma level
3. Academic Quality: Professional language and proper citations
4. Course Outcomes: Clear alignment with diploma educational objectives
5. Completeness: All required elements included with adequate detail
6. Formatting: Proper section organization and presentation

Provide analysis in this exact format:
COMPLIANCE_SCORE: [0-100]
IS_COMPLIANT: [true/false]
ISSUES: [list of compliance issues]
RECOMMENDATIONS: [list of specific improvements needed]
QUALITY_SCORE: [0-100]`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an MSBTE compliance expert. Provide precise, structured compliance analysis."
          },
          { role: "user", content: compliancePrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Compliance check failed: ${response.status}`);
    }

    const complianceData = await response.json();
    const analysis = complianceData.choices[0].message.content;

    // Parse the structured response
    const complianceScore = parseInt(analysis.match(/COMPLIANCE_SCORE: (\d+)/)?.[1] || '70');
    const isCompliant = analysis.match(/IS_COMPLIANT: (true|false)/)?.[1] === 'true';
    const issuesText = analysis.match(/ISSUES: \[([^\]]+)\]/)?.[1] || '';
    const recommendationsText = analysis.match(/RECOMMENDATIONS: \[([^\]]+)\]/)?.[1] || '';
    const qualityScore = parseInt(analysis.match(/QUALITY_SCORE: (\d+)/)?.[1] || '75');

    const issues = issuesText.split(',').map(issue => issue.trim()).filter(issue => issue);
    const recommendations = recommendationsText.split(',').map(rec => rec.trim()).filter(rec => rec);

    return {
      isCompliant,
      complianceScore,
      issues,
      recommendations,
      qualityScore
    };

  } catch (error) {
    console.error('Compliance check error:', error);
    // Return default compliance check if analysis fails
    return {
      isCompliant: false,
      complianceScore: 70,
      issues: ['Compliance check failed'],
      recommendations: ['Manual review required'],
      qualityScore: 75
    };
  }
}

function applyFinalFormatting(content: string, complianceCheck: ComplianceCheck): string {
  console.log('Stage 4: Final formatting and quality improvements');

  let finalContent = content;

  // Apply formatting improvements based on compliance check
  if (complianceCheck.complianceScore < 80) {
    // Add formatting improvements for low compliance scores
    finalContent = enhanceFormatting(finalContent);
  }

  // Add quality improvements
  if (complianceCheck.qualityScore < 85) {
    finalContent = enhanceQuality(finalContent);
  }

  return finalContent;
}

function calculateInitialQualityMetrics(content: string, extractedData: any): AIProcessingResult['qualityMetrics'] {
  const wordCount = content.split(/\s+/).length;
  const sectionCount = (content.match(/## \w+/g) || []).length;
  const technicalTerms = (content.match(/\b(technical|engineering|implementation|methodology|algorithm|system|design|development|analysis)\b/gi) || []).length;

  return {
    technicalDepth: Math.min(100, Math.round((technicalTerms / wordCount) * 1000)),
    academicQuality: Math.min(100, Math.round((wordCount / 1000) * 100)),
    completeness: Math.min(100, Math.round((sectionCount / 10) * 100)),
    relevance: extractedData.structure.sections.length > 0 ? 85 : 70
  };
}

function generateInitialSuggestions(content: string, studentData: any): string[] {
  const suggestions: string[] = [];

  if (content.length < 2000) {
    suggestions.push('Content appears too brief - consider adding more technical details');
  }

  if (!content.includes('2023') && !content.includes('2024')) {
    suggestions.push('Include recent industry standards and practices (2023-2024)');
  }

  if (!content.match(/## ANNEXURE_\w+/g)) {
    suggestions.push('Ensure all required MSBTE sections are properly formatted');
  }

  return suggestions;
}

function enhanceFormatting(content: string): string {
  // Basic formatting enhancements
  return content
    .replace(/^(.+)$/gm, (match) => {
      // Ensure proper spacing after section headers
      if (match.startsWith('## ')) {
        return match + '\n';
      }
      return match;
    })
    .replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
}

function enhanceQuality(content: string): string {
  // Basic quality enhancements
  return content
    .replace(/\b(very|really|quite)\s+/g, '') // Remove weak adverbs
    .replace(/\b(good|nice|bad)\b/gi, (match) => {
      // Replace weak adjectives
      const replacements: { [key: string]: string } = {
        'good': 'effective',
        'nice': 'appropriate',
        'bad': 'inadequate'
      };
      return replacements[match.toLowerCase()] || match;
    });
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
