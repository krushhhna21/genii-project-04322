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

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-elevated border-border/50 bg-card">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Generate Your Project
        </CardTitle>
        <CardDescription className="text-base">
          Upload your reference document and fill in your details to generate a professional project report
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
                Generating Your Project...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Project
              </>
            )}
          </Button>

          {generatedFile && (
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="w-full h-12 text-base font-semibold animate-fade-in"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Project
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratorCard;
