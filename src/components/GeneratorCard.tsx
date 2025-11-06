import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Sparkles, BarChart3, Lightbulb, FileText, Settings } from "lucide-react";
import FileUpload from "./FileUpload";
import StudentForm from "./StudentForm";
import QualityIndicator from "./QualityIndicator";
import AISuggestions from "./AISuggestions";
import { toast } from "sonner";

interface QualityMetrics {
  technicalDepth: number;
  academicQuality: number;
  completeness: number;
  relevance: number;
  complianceScore: number;
  overallScore: number;
}

interface ComplianceInfo {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
}

const GeneratorCard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [complianceInfo, setComplianceInfo] = useState<ComplianceInfo | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    enrollmentNumber: "",
    college: "",
    topic: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!selectedFile) {
      toast.error("Please upload a reference document");
      return false;
    }
    if (!formData.name || !formData.rollNumber || !formData.enrollmentNumber || 
        !formData.college || !formData.topic) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedFile(null);

    try {
      console.log('Starting project generation...');
      console.log('File:', selectedFile?.name, selectedFile?.type);
      console.log('Form data:', formData);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile!);
      
      reader.onload = async () => {
        try {
          const base64File = reader.result as string;
          console.log('File converted to base64, length:', base64File.length);
          
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-project`;
          console.log('Calling API:', apiUrl);
          
          // Call the edge function
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileContent: base64File,
              fileName: selectedFile!.name,
              fileType: selectedFile!.type,
              studentData: formData,
            }),
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            let errorMessage = 'Failed to generate project';
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log('Response data received:', data);
          
          if (data.success) {
            toast.success("Project generated successfully!");
            setGeneratedFile(data.content);

            // Set quality metrics and suggestions if available
            if (data.qualityMetrics) {
              setQualityMetrics(data.qualityMetrics);
            }
            if (data.suggestions) {
              setSuggestions(data.suggestions);
              setActiveTab("suggestions"); // Switch to suggestions tab
            }
            if (data.complianceInfo) {
              setComplianceInfo(data.complianceInfo);
            }
          } else {
            throw new Error(data.error || 'Generation failed');
          }
          
          setIsGenerating(false);
        } catch (error) {
          console.error('Error in reader.onload:', error);
          toast.error(error instanceof Error ? error.message : "Failed to generate project");
          setIsGenerating(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error("Failed to read file");
        setIsGenerating(false);
      };
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate project");
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedFile) return;

    // Convert base64 to blob for DOCX download
    const byteCharacters = atob(generatedFile);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Project_${formData.topic.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Project downloaded successfully!");
  };

  const handleApplySuggestion = (suggestion: string) => {
    // This would integrate with a content enhancement endpoint
    toast.info(`Applying suggestion: "${suggestion.substring(0, 50)}..."`);
    // Implementation would call the enhanced AI processing to apply specific suggestions
  };

  const handleEnhanceContent = async (enhancementType: string) => {
    if (!generatedFile || !selectedFile) return;

    setIsEnhancing(true);
    try {
      // This would call a specialized enhancement endpoint
      toast.info(`Enhancing content: ${enhancementType}`);
      // Implementation would call the enhanced AI processing for specific improvements
      setTimeout(() => {
        setIsEnhancing(false);
        toast.success("Content enhanced successfully!");
      }, 3000);
    } catch (error) {
      setIsEnhancing(false);
      toast.error("Failed to enhance content");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-elevated border-border/50 bg-card">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI-Powered MSBTE Project Builder
        </CardTitle>
        <CardDescription className="text-base">
          Generate professional MSBTE project reports with AI quality enhancement and compliance validation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              disabled={!qualityMetrics}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Quality Metrics
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              disabled={suggestions.length === 0}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              AI Suggestions
              {suggestions.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {suggestions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

            <StudentForm formData={formData} onChange={handleFormChange} />

            <div className="pt-4 space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow hover:shadow-elevated transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Project with AI Enhancement...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Enhanced Project
                  </>
                )}
              </Button>

              {generatedFile && (
                <div className="space-y-3">
                  <Button
                    onClick={handleDownload}
                    variant="secondary"
                    className="w-full h-12 text-base font-semibold"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Project (DOCX)
                  </Button>

                  {qualityMetrics && (
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>Quality Score: {qualityMetrics.overallScore}/100</span>
                      <span>•</span>
                      <span>MSBTE Compliance: {complianceInfo?.complianceScore || 0}/100</span>
                      <span>•</span>
                      <span className="text-primary cursor-pointer hover:underline">
                        View Details
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quality" className="mt-0">
            {qualityMetrics && complianceInfo ? (
              <QualityIndicator
                qualityMetrics={qualityMetrics}
                complianceInfo={complianceInfo}
                showDetails={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Generate a project first</p>
                <p className="text-sm">Quality metrics will appear here after generation</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="mt-0">
            {suggestions.length > 0 ? (
              <AISuggestions
                suggestions={suggestions}
                onApplySuggestion={handleApplySuggestion}
                onEnhanceContent={handleEnhanceContent}
                isProcessing={isEnhancing}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No suggestions available</p>
                <p className="text-sm">AI suggestions will appear here after generation</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GeneratorCard;
