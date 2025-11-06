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
    <TooltipProvider>
      <div className="w-full space-y-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Reference Document <span className="text-destructive">*</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground ml-1 inline" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload reference materials for better AI-generated content</p>
            </TooltipContent>
          </Tooltip>
        </label>

        {!selectedFile ? (
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
            <p className="text-sm text-muted-foreground mb-2">
              Supports DOCX, PPTX, and PDF (Max 10MB)
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>AI will analyze your document for better suggestions</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Card */}
            <Card className="border-2 border-primary bg-gradient-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/').pop()?.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Ready for AI Analysis
                        </Badge>
                        {fileAnalysis && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
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
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium">AI Analysis in Progress</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {analysisProgress < 20 && 'Validating file...'}
                    {analysisProgress >= 20 && analysisProgress < 40 && 'Reading file content...'}
                    {analysisProgress >= 40 && analysisProgress < 60 && 'Extracting text...'}
                    {analysisProgress >= 60 && analysisProgress < 80 && 'Analyzing structure...'}
                    {analysisProgress >= 80 && analysisProgress < 100 && 'Generating insights...'}
                    {analysisProgress === 100 && 'Analysis complete!'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {fileAnalysis && !isAnalyzing && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-sm">AI Analysis Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-primary">
                        {fileAnalysis.wordCount?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">
                        {fileAnalysis.pageCount || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Pages</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {fileAnalysis.keyTopics.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Key Topics</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">
                        {fileAnalysis.overallQuality === 'good' ? 'A' :
                         fileAnalysis.overallQuality === 'fair' ? 'B' : 'C'}
                      </div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                    </div>
                  </div>

                  {/* Key Topics */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-blue-500" />
                      Key Topics Identified
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {fileAnalysis.keyTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Project Topics */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      Suggested Project Topics
                    </h5>
                    <ul className="text-sm space-y-1">
                      {fileAnalysis.suggestedProjectTopics.map((topic, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-muted-foreground">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Complexity */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Technical Complexity</h5>
                    <Badge
                      variant={fileAnalysis.technicalComplexity === 'advanced' ? 'default' :
                               fileAnalysis.technicalComplexity === 'intermediate' ? 'secondary' : 'outline'}
                    >
                      {fileAnalysis.technicalComplexity.charAt(0).toUpperCase() +
                       fileAnalysis.technicalComplexity.slice(1)}
                    </Badge>
                  </div>

                  {/* Content Features */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Content Features</h5>
                    <div className="flex gap-2">
                      {fileAnalysis.hasImages && (
                        <Badge variant="outline" className="text-xs">Contains Images</Badge>
                      )}
                      {fileAnalysis.hasTables && (
                        <Badge variant="outline" className="text-xs">Contains Tables</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span>This analysis helps AI generate better, more relevant content for your project</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FileUpload;
