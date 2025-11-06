import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface ProjectData {
  name: string;
  rollNumber: string;
  enrollmentNumber: string;
  college: string;
  topic: string;
  branch?: string;
  semester?: string;
  category?: string;
  complexity?: string;
}

export interface QualityMetrics {
  technicalDepth: number;
  academicQuality: number;
  completeness: number;
  relevance: number;
  complianceScore: number;
  overallScore: number;
}

export interface ComplianceInfo {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
}

export interface FileAnalysis {
  extractedText: string;
  keyTopics: string[];
  suggestedProjectTopics: string[];
  technicalComplexity: 'basic' | 'intermediate' | 'advanced';
  pageCount?: number;
  wordCount?: number;
  hasImages: boolean;
  hasTables: boolean;
  overallQuality: 'good' | 'fair' | 'needs_improvement';
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedContent: string | null;
  qualityMetrics: QualityMetrics | null;
  complianceInfo: ComplianceInfo | null;
  suggestions: string[];
  currentStage: 'idle' | 'analyzing' | 'generating' | 'enhancing' | 'validating' | 'completed';
  progress: number;
}

export interface UseProjectGenerationReturn {
  state: GenerationState;
  generateProject: (
    file: File,
    projectData: ProjectData,
    fileAnalysis?: FileAnalysis
  ) => Promise<void>;
  enhanceContent: (enhancementType: string) => Promise<void>;
  retryGeneration: () => Promise<void>;
  resetGeneration: () => void;
  updateStage: (stage: GenerationState['currentStage']) => void;
  updateProgress: (progress: number) => void;
}

const useProjectGeneration = (): UseProjectGenerationReturn => {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    generatedContent: null,
    qualityMetrics: null,
    complianceInfo: null,
    suggestions: [],
    currentStage: 'idle',
    progress: 0,
  });

  const lastGenerationRef = useRef<{
    file: File;
    projectData: ProjectData;
    fileAnalysis?: FileAnalysis;
  } | null>(null);

  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStage = useCallback((stage: GenerationState['currentStage']) => {
    updateState({ currentStage: stage });
  }, [updateState]);

  const updateProgress = useCallback((progress: number) => {
    updateState({ progress: Math.max(0, Math.min(100, progress)) });
  }, [updateState]);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const generateProject = useCallback(async (
    file: File,
    projectData: ProjectData,
    fileAnalysis?: FileAnalysis
  ) => {
    try {
      // Reset state and start loading
      updateState({
        isLoading: true,
        error: null,
        generatedContent: null,
        qualityMetrics: null,
        complianceInfo: null,
        suggestions: [],
        currentStage: 'analyzing',
        progress: 0,
      });

      // Store for potential retry
      lastGenerationRef.current = { file, projectData, fileAnalysis };

      // Stage 1: Analyzing
      updateStage('analyzing');
      updateProgress(10);

      // Validate file and project data
      if (!file || !projectData.name || !projectData.rollNumber ||
          !projectData.enrollmentNumber || !projectData.college || !projectData.topic) {
        throw new Error('Missing required information. Please fill all required fields.');
      }

      updateProgress(20);

      // Stage 2: Preparing for generation
      updateStage('generating');
      updateProgress(30);

      // Convert file to base64
      const base64File = await convertFileToBase64(file);
      updateProgress(50);

      // Prepare API request with enhanced data
      const requestBody = {
        fileContent: base64File,
        fileName: file.name,
        fileType: file.type,
        studentData: {
          ...projectData,
          fileAnalysis: fileAnalysis ? {
            keyTopics: fileAnalysis.keyTopics,
            suggestedTopics: fileAnalysis.suggestedProjectTopics,
            complexity: fileAnalysis.technicalComplexity,
            quality: fileAnalysis.overallQuality,
            wordCount: fileAnalysis.wordCount,
            pageCount: fileAnalysis.pageCount,
          } : undefined
        },
      };

      updateProgress(60);

      // Stage 3: Calling AI service
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-project`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      updateProgress(80);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to generate project';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Stage 4: Processing response
      updateStage('enhancing');
      const data = await response.json();
      updateProgress(90);

      if (data.success) {
        // Update state with generation results
        updateState({
          generatedContent: data.content,
          qualityMetrics: data.qualityMetrics || null,
          complianceInfo: data.complianceInfo || null,
          suggestions: data.suggestions || [],
          currentStage: 'completed',
          progress: 100,
          isLoading: false,
        });

        toast.success('Project generated successfully with AI enhancements!');

        // Show quality summary if available
        if (data.qualityMetrics) {
          setTimeout(() => {
            toast.info(`Quality Score: ${data.qualityMetrics.overallScore}/100, MSBTE Compliance: ${data.complianceInfo?.complianceScore || 0}/100`);
          }, 1000);
        }
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate project';
      updateState({
        error: errorMessage,
        isLoading: false,
        currentStage: 'idle',
        progress: 0,
      });
      toast.error(errorMessage);
    }
  }, [updateState, updateStage, updateProgress, convertFileToBase64]);

  const enhanceContent = useCallback(async (enhancementType: string) => {
    if (!state.generatedContent || !lastGenerationRef.current) {
      toast.error('No project content available for enhancement');
      return;
    }

    try {
      updateState({ isLoading: true, currentStage: 'enhancing' });

      // This would call a specialized enhancement endpoint
      // For now, we'll simulate the enhancement
      toast.info(`Enhancing content: ${enhancementType}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real implementation, this would call the enhancement endpoint
      // and update the content with the enhanced version
      updateState({
        isLoading: false,
        currentStage: 'completed'
      });

      toast.success('Content enhanced successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance content';
      updateState({
        error: errorMessage,
        isLoading: false,
        currentStage: 'completed'
      });
      toast.error(errorMessage);
    }
  }, [state.generatedContent, updateState]);

  const retryGeneration = useCallback(async () => {
    if (!lastGenerationRef.current) {
      toast.error('No previous generation to retry');
      return;
    }

    const { file, projectData, fileAnalysis } = lastGenerationRef.current;
    await generateProject(file, projectData, fileAnalysis);
  }, [generateProject]);

  const resetGeneration = useCallback(() => {
    updateState({
      isLoading: false,
      error: null,
      generatedContent: null,
      qualityMetrics: null,
      complianceInfo: null,
      suggestions: [],
      currentStage: 'idle',
      progress: 0,
    });
    lastGenerationRef.current = null;
  }, [updateState]);

  // Helper functions for better UX
  const getStageMessage = useCallback(() => {
    switch (state.currentStage) {
      case 'analyzing':
        return 'Analyzing your document and requirements...';
      case 'generating':
        return 'Generating MSBTE-compliant content...';
      case 'enhancing':
        return 'Enhancing content with AI improvements...';
      case 'validating':
        return 'Validating MSBTE compliance...';
      case 'completed':
        return 'Project generation completed successfully!';
      default:
        return 'Preparing...';
    }
  }, [state.currentStage]);

  const getEstimatedTimeRemaining = useCallback(() => {
    const totalTime = 100;
    const remaining = totalTime - state.progress;
    // Rough estimate: 0.5 seconds per percent
    return Math.ceil(remaining * 0.5);
  }, [state.progress]);

  const canRetry = useCallback(() => {
    return !state.isLoading && !!state.error && !!lastGenerationRef.current;
  }, [state.isLoading, state.error]);

  const canEnhance = useCallback(() => {
    return !state.isLoading && !!state.generatedContent && state.currentStage === 'completed';
  }, [state.isLoading, state.generatedContent, state.currentStage]);

  return {
    state,
    generateProject,
    enhanceContent,
    retryGeneration,
    resetGeneration,
    updateStage,
    updateProgress,
    // Helper methods for UI components
    getStageMessage,
    getEstimatedTimeRemaining,
    canRetry,
    canEnhance,
  };
};

export default useProjectGeneration;