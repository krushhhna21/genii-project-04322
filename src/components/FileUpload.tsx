import { Upload, FileText, X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onFileAnalysis?: (analysis: FileAnalysis) => void;
}

interface FileAnalysis {
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

const FileUpload = ({ onFileSelect, selectedFile, onFileAnalysis }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    // Check file type
    if (!validTypes.includes(file.type)) {
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const getFileValidationMessage = (file: File) => {
    const validTypes = [
      { type: 'application/pdf', name: 'PDF' },
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'DOCX' },
      { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PPTX' }
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.some(vt => vt.type === file.type)) {
      return 'Invalid file type. Please upload PDF, DOCX, or PPTX files only.';
    }

    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit. Please compress or choose a smaller file.';
    }

    return null;
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate file analysis progress
      const progressSteps = [
        { progress: 20, message: 'Reading file content...' },
        { progress: 40, message: 'Extracting text...' },
        { progress: 60, message: 'Analyzing structure...' },
        { progress: 80, message: 'Identifying key topics...' },
        { progress: 100, message: 'Generating suggestions...' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnalysisProgress(step.progress);
      }

      // Simulate file analysis results
      const analysis: FileAnalysis = {
        extractedText: 'Sample extracted text from the document...',
        keyTopics: generateKeyTopics(file.name, file.type),
        suggestedProjectTopics: generateProjectSuggestions(file.name, file.type),
        technicalComplexity: file.size > 2 * 1024 * 1024 ? 'intermediate' : 'basic',
        pageCount: file.type === 'application/pdf' ? Math.floor(Math.random() * 20) + 5 : undefined,
        wordCount: Math.floor(file.size / 10),
        hasImages: file.size > 1024 * 1024,
        hasTables: file.type.includes('wordprocessingml'),
        overallQuality: file.size > 500 * 1024 ? 'good' : 'fair'
      };

      setFileAnalysis(analysis);
      if (onFileAnalysis) {
        onFileAnalysis(analysis);
      }
    } catch (error) {
      console.error('File analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateKeyTopics = (fileName: string, fileType: string): string[] => {
    const topics = [
      'Software Development',
      'Data Structures',
      'Web Technologies',
      'Database Management',
      'Network Security',
      'Machine Learning',
      'Cloud Computing',
      'Mobile Development',
      'IoT Systems',
      'Cybersecurity'
    ];

    // Return random 3-5 topics based on file characteristics
    const topicCount = Math.floor(Math.random() * 3) + 3;
    return topics.slice(0, topicCount);
  };

  const generateProjectSuggestions = (fileName: string, fileType: string): string[] => {
    const suggestions = [
      'Student Management System',
      'E-Learning Platform',
      'Inventory Management System',
      'Real-time Chat Application',
      'Weather Forecasting System',
      'Online Examination Portal',
      'Library Management System',
      'Hospital Management System',
      'Bank Management System',
      'E-Commerce Website'
    ];

    // Return random 2-4 suggestions
    const suggestionCount = Math.floor(Math.random() * 3) + 2;
    return suggestions.slice(0, suggestionCount);
  };

  const handleFileSelect = async (file: File) => {
    const validationError = getFileValidationMessage(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    onFileSelect(file);
    setFileAnalysis(null);
    await analyzeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setFileAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">
        Reference Document <span className="text-destructive">*</span>
      </label>
      
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 border-2 border-primary bg-gradient-card rounded-lg">
          <FileText className="w-10 h-10 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-primary bg-gradient-card scale-105' 
              : 'border-border hover:border-primary hover:bg-gradient-card'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
          <p className="text-foreground font-medium mb-1">
            Drop your file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports DOCX, PPTX, and PDF (Max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
