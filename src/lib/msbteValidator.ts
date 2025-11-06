export interface MSBTERequirement {
  id: string;
  section: string;
  title: string;
  description: string;
  required: boolean;
  validator: (content: string) => boolean;
  weight: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
  sectionScores: Record<string, number>;
  overallCompliance: number;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  section: string;
  message: string;
  suggestion?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface StudentData {
  name: string;
  rollNumber: string;
  enrollmentNumber: string;
  college: string;
  topic: string;
  branch?: string;
  semester?: string;
}

export interface QualityMetrics {
  technicalDepth: number;
  academicQuality: number;
  completeness: number;
  relevance: number;
  complianceScore: number;
  overallScore: number;
}

class MSBTEValidator {
  private requirements: MSBTERequirement[];
  private readonly MSBTE_SECTIONS = [
    'ANNEXURE_I_AIMS',
    'ANNEXURE_I_COURSE_OUTCOME',
    'ANNEXURE_I_METHODOLOGY',
    'ANNEXURE_II_RATIONALE',
    'ANNEXURE_II_AIMS',
    'ANNEXURE_II_COURSE_OUTCOME',
    'ANNEXURE_II_LITERATURE',
    'ANNEXURE_II_METHODOLOGY',
    'ANNEXURE_II_SKILLS',
    'ANNEXURE_II_APPLICATIONS'
  ];

  constructor() {
    this.requirements = this.initializeRequirements();
  }

  private initializeRequirements(): MSBTERequirement[] {
    return [
      // Annexure I Requirements
      {
        id: 'annexure_i_aims',
        section: 'ANNEXURE_I_AIMS',
        title: 'Aims and Benefits (Annexure I)',
        description: 'Clear description of project aims and expected benefits (2-3 paragraphs)',
        required: true,
        weight: 10,
        validator: (content) => this.validateSection(content, 'ANNEXURE_I_AIMS', 50, 2)
      },
      {
        id: 'annexure_i_course_outcome',
        section: 'ANNEXURE_I_COURSE_OUTCOME',
        title: 'Course Outcomes Addressed (Annexure I)',
        description: 'Specific course outcomes with proper formatting (2-3 bullet points)',
        required: true,
        weight: 10,
        validator: (content) => this.validateSection(content, 'ANNEXURE_I_COURSE_OUTCOME', 100, 2)
      },
      {
        id: 'annexure_i_methodology',
        section: 'ANNEXURE_I_METHODOLOGY',
        title: 'Proposed Methodology (Annexure I)',
        description: 'Detailed methodology explanation (1-2 paragraphs)',
        required: true,
        weight: 10,
        validator: (content) => this.validateSection(content, 'ANNEXURE_I_METHODOLOGY', 80, 1)
      },

      // Annexure II Requirements
      {
        id: 'annexure_ii_rationale',
        section: 'ANNEXURE_II_RATIONALE',
        title: 'Rationale (Annexure II)',
        description: 'Clear explanation of project importance and relevance (1 paragraph)',
        required: true,
        weight: 8,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_RATIONALE', 40, 1)
      },
      {
        id: 'annexure_ii_aims',
        section: 'ANNEXURE_II_AIMS',
        title: 'Aims and Benefits (Annexure II)',
        description: 'Detailed aims and benefits (3-4 bullet points)',
        required: true,
        weight: 8,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_AIMS', 120, 3)
      },
      {
        id: 'annexure_ii_course_outcome',
        section: 'ANNEXURE_II_COURSE_OUTCOME',
        title: 'Course Outcomes Achieved (Annexure II)',
        description: 'Specific course outcomes achieved (2-3 bullet points)',
        required: true,
        weight: 8,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_COURSE_OUTCOME', 100, 2)
      },
      {
        id: 'annexure_ii_literature',
        section: 'ANNEXURE_II_LITERATURE',
        title: 'Literature Review (Annexure II)',
        description: 'Comprehensive literature review with introduction and bullet points',
        required: true,
        weight: 12,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_LITERATURE', 200, 4)
      },
      {
        id: 'annexure_ii_methodology',
        section: 'ANNEXURE_II_METHODOLOGY',
        title: 'Actual Methodology Followed (Annexure II)',
        description: 'Detailed methodology implementation (2-3 paragraphs)',
        required: true,
        weight: 12,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_METHODOLOGY', 120, 2)
      },
      {
        id: 'annexure_ii_skills',
        section: 'ANNEXURE_II_SKILLS',
        title: 'Skills Developed (Annexure II)',
        description: 'Comprehensive list of skills developed (4-5 bullet points)',
        required: true,
        weight: 8,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_SKILLS', 100, 4)
      },
      {
        id: 'annexure_ii_applications',
        section: 'ANNEXURE_II_APPLICATIONS',
        title: 'Applications of Project (Annexure II)',
        description: 'Real-world applications (4-5 bullet points)',
        required: true,
        weight: 8,
        validator: (content) => this.validateSection(content, 'ANNEXURE_II_APPLICATIONS', 100, 4)
      }
    ];
  }

  private validateSection(
    content: string,
    sectionMarker: string,
    minWordCount: number,
    minBulletPoints: number
  ): boolean {
    const sectionContent = this.extractSection(content, sectionMarker);
    if (!sectionContent) return false;

    const wordCount = sectionContent.split(/\s+/).length;
    const bulletPoints = sectionContent.match(/^[•\-\*]\s+/gm) || [];

    return wordCount >= minWordCount && bulletPoints.length >= minBulletPoints;
  }

  private extractSection(content: string, sectionMarker: string): string | null {
    const pattern = new RegExp(`## ${sectionMarker}\\s*\\n([\\s\\S]*?)(?=##|$)`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
  }

  private checkFormatRequirements(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for proper section markers
    const missingSections = this.MSBTE_SECTIONS.filter(section =>
      !content.includes(`## ${section}`)
    );

    missingSections.forEach(section => {
      issues.push({
        id: `missing_section_${section}`,
        type: 'error',
        section: 'structure',
        message: `Missing required MSBTE section: ${section.replace(/_/g, ' ')}`,
        suggestion: `Add the ${section.replace(/_/g, ' ')} section with appropriate content`,
        severity: 'high'
      });
    });

    // Check for bullet point formatting
    const bulletPointIssues = this.validateBulletPoints(content);
    issues.push(...bulletPointIssues);

    // Check for academic language
    const languageIssues = this.validateAcademicLanguage(content);
    issues.push(...languageIssues);

    return issues;
  }

  private validateBulletPoints(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for consistent bullet point formatting
    const bulletPatterns = [
      /^[a-z]\)/gm,           // a), b), c)
      /^[•\-\*]\s+/gm,       // •, -, *
      /^\d+\.\s+/gm          // 1., 2., 3.
    ];

    const bulletCounts = bulletPatterns.map(pattern =>
      (content.match(pattern) || []).length
    );

    const hasInconsistentBullets = bulletCounts.some(count => count > 0) &&
      bulletCounts.filter(count => count > 0).length > 1;

    if (hasInconsistentBullets) {
      issues.push({
        id: 'inconsistent_bullets',
        type: 'warning',
        section: 'formatting',
        message: 'Inconsistent bullet point formatting detected',
        suggestion: 'Use consistent bullet point formatting throughout the document',
        severity: 'medium'
      });
    }

    return issues;
  }

  private validateAcademicLanguage(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for informal language
    const informalWords = [
      'gonna', 'wanna', ' kinda', 'sorta', 'yeah', 'cool', 'awesome',
      'like', 'you know', 'I mean', 'stuff', 'things', 'good', 'bad'
    ];

    const foundInformal = informalWords.filter(word =>
      content.toLowerCase().includes(word)
    );

    if (foundInformal.length > 0) {
      issues.push({
        id: 'informal_language',
        type: 'warning',
        section: 'language',
        message: `Informal language detected: ${foundInformal.join(', ')}`,
        suggestion: 'Replace informal words with academic alternatives',
        severity: 'low'
      });
    }

    return issues;
  }

  private checkTechnicalRequirements(content: string, studentData: StudentData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check if student information is mentioned
    if (!content.includes(studentData.name)) {
      issues.push({
        id: 'missing_student_name',
        type: 'warning',
        section: 'content',
        message: 'Student name not mentioned in the document',
        suggestion: 'Include student information in the document',
        severity: 'low'
      });
    }

    // Check for technical depth
    const technicalTerms = [
      'implementation', 'methodology', 'analysis', 'design', 'development',
      'algorithm', 'system', 'process', 'technique', 'framework'
    ];

    const technicalTermCount = technicalTerms.filter(term =>
      content.toLowerCase().includes(term)
    ).length;

    if (technicalTermCount < 3) {
      issues.push({
        id: 'low_technical_depth',
        type: 'warning',
        section: 'content',
        message: 'Technical depth appears to be insufficient',
        suggestion: 'Include more technical terminology and implementation details',
        severity: 'medium'
      });
    }

    return issues;
  }

  private calculateQualityMetrics(content: string, validationResult: ValidationResult): QualityMetrics {
    const wordCount = content.split(/\s+/).length;
    const sectionCount = this.MSBTE_SECTIONS.filter(section =>
      content.includes(`## ${section}`)
    ).length;

    const technicalTerms = [
      'implementation', 'methodology', 'analysis', 'design', 'development',
      'algorithm', 'system', 'process', 'technique', 'framework'
    ];

    const technicalTermCount = technicalTerms.filter(term =>
      content.toLowerCase().includes(term)
    ).length;

    const technicalDepth = Math.min(100, Math.round((technicalTermCount / wordCount) * 1000));
    const completeness = Math.min(100, Math.round((sectionCount / this.MSBTE_SECTIONS.length) * 100));
    const academicQuality = Math.min(100, Math.round((wordCount / 1000) * 100));
    const relevance = validationResult.score; // Use compliance score as relevance metric

    const overallScore = Math.round(
      (technicalDepth * 0.25 + academicQuality * 0.25 + completeness * 0.25 + relevance * 0.25)
    );

    return {
      technicalDepth,
      academicQuality,
      completeness,
      relevance,
      complianceScore: validationResult.overallCompliance,
      overallScore
    };
  }

  public validateDocument(content: string, studentData: StudentData): ValidationResult {
    const issues: ValidationIssue[] = [];
    const sectionScores: Record<string, number> = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Check format requirements
    const formatIssues = this.checkFormatRequirements(content);
    issues.push(...formatIssues);

    // Check technical requirements
    const technicalIssues = this.checkTechnicalRequirements(content, studentData);
    issues.push(...technicalIssues);

    // Validate each MSBTE requirement
    this.requirements.forEach(requirement => {
      const isValid = requirement.validator(content);
      const score = isValid ? 100 : 0;

      sectionScores[requirement.section] = score;
      totalScore += score * requirement.weight;
      totalWeight += requirement.weight;

      if (!isValid && requirement.required) {
        issues.push({
          id: requirement.id,
          type: 'error',
          section: requirement.section,
          message: `${requirement.title} is missing or incomplete`,
          suggestion: requirement.description,
          severity: 'high'
        });
      }
    });

    // Calculate overall scores
    const overallCompliance = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const isValid = issues.filter(issue => issue.type === 'error').length === 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, sectionScores);

    return {
      isValid,
      score: overallCompliance,
      issues,
      recommendations,
      sectionScores,
      overallCompliance
    };
  }

  private generateRecommendations(issues: ValidationIssue[], sectionScores: Record<string, number>): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on issues
    const errorIssues = issues.filter(issue => issue.type === 'error');
    const warningIssues = issues.filter(issue => issue.type === 'warning');

    if (errorIssues.length > 0) {
      recommendations.push('Address all critical MSBTE compliance issues');
      recommendations.push('Ensure all required sections are present with adequate content');
    }

    if (warningIssues.length > 0) {
      recommendations.push('Review and improve formatting and language quality');
    }

    // Generate recommendations based on section scores
    const lowScoringSections = Object.entries(sectionScores)
      .filter(([_, score]) => score < 70)
      .map(([section, _]) => section);

    if (lowScoringSections.length > 0) {
      recommendations.push('Enhance content in sections with low scores');
    }

    // General recommendations
    recommendations.push('Include more technical details and implementation specifics');
    recommendations.push('Add real-world applications and industry examples');
    recommendations.push('Ensure consistent academic language and tone');

    return recommendations;
  }

  public getMSBTETemplate(): string {
    return `
## ANNEXURE_I_AIMS
[Describe the aims and benefits of the micro-project in 2-3 paragraphs]

## ANNEXURE_I_COURSE_OUTCOME
a) [Course outcome with code and description]
b) [Course outcome with code and description]
c) [Course outcome with code and description]

## ANNEXURE_I_METHODOLOGY
[Describe the proposed methodology in 1-2 paragraphs]

## ANNEXURE_II_RATIONALE
[Explain the rationale for this project in 1 paragraph]

## ANNEXURE_II_AIMS
• [Aim/Benefit 1]
• [Aim/Benefit 2]
• [Aim/Benefit 3]
• [Aim/Benefit 4]

## ANNEXURE_II_COURSE_OUTCOME
a) [Course outcome achieved with evidence]
b) [Course outcome achieved with evidence]
c) [Course outcome achieved with evidence]

## ANNEXURE_II_LITERATURE
[Introduction to the topic]
• [Key concept 1]
• [Key concept 2]
• [Key concept 3]
• [Key concept 4]
• [Key concept 5]

## ANNEXURE_II_METHODOLOGY
[Describe the actual methodology followed in 2-3 paragraphs]

## ANNEXURE_II_SKILLS
• [Technical skill 1]
• [Technical skill 2]
• [Technical skill 3]
• [Technical skill 4]
• [Technical skill 5]

## ANNEXURE_II_APPLICATIONS
• [Real-world application 1]
• [Real-world application 2]
• [Real-world application 3]
• [Real-world application 4]
• [Real-world application 5]
    `.trim();
  }

  public validateFormData(data: Partial<StudentData>): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!data.name || data.name.length < 3) {
      issues.push({
        id: 'invalid_name',
        type: 'error',
        section: 'student_data',
        message: 'Valid student name is required',
        suggestion: 'Enter full name as per academic records',
        severity: 'high'
      });
    }

    if (!data.rollNumber || data.rollNumber.length < 4) {
      issues.push({
        id: 'invalid_roll_number',
        type: 'error',
        section: 'student_data',
        message: 'Valid roll number is required',
        suggestion: 'Enter correct roll number',
        severity: 'high'
      });
    }

    if (!data.enrollmentNumber || data.enrollmentNumber.length < 8) {
      issues.push({
        id: 'invalid_enrollment',
        type: 'error',
        section: 'student_data',
        message: 'Valid enrollment number is required',
        suggestion: 'Enter correct enrollment number',
        severity: 'high'
      });
    }

    if (!data.college || data.college.length < 5) {
      issues.push({
        id: 'invalid_college',
        type: 'error',
        section: 'student_data',
        message: 'Valid college name is required',
        suggestion: 'Enter complete college name',
        severity: 'high'
      });
    }

    if (!data.topic || data.topic.length < 10) {
      issues.push({
        id: 'invalid_topic',
        type: 'error',
        section: 'student_data',
        message: 'Valid project topic is required',
        suggestion: 'Enter detailed project topic',
        severity: 'high'
      });
    }

    return issues;
  }
}

export default MSBTEValidator;