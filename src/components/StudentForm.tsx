import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  School,
  Target,
  BookOpen,
  HelpCircle
} from "lucide-react";

interface StudentFormProps {
  formData: {
    name: string;
    rollNumber: string;
    enrollmentNumber: string;
    college: string;
    topic: string;
    branch?: string;
    semester?: string;
    category?: string;
    complexity?: string;
  };
  onChange: (field: string, value: string) => void;
}

const StudentForm = ({ formData, onChange }: StudentFormProps) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldSuggestions, setFieldSuggestions] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});

  // MSBTE colleges list for autocomplete
  const msbteColleges = [
    "Government Polytechnic, Mumbai",
    "Government Polytechnic, Pune",
    "Veermata Jijabai Technological Institute (VJTI), Mumbai",
    "College of Engineering, Pune",
    "Sardar Patel Institute of Technology, Mumbai",
    "K. J. Somaiya College of Engineering, Mumbai",
    "Dwarkadas J. Sanghvi College of Engineering, Mumbai",
    "Rajiv Gandhi Institute of Technology, Mumbai",
    "Fr. Conceicao Rodrigues College of Engineering, Mumbai",
    "St. Francis Institute of Technology, Mumbai",
    "Atharva College of Engineering, Mumbai",
    "Thakur College of Engineering and Technology, Mumbai",
    "Don Bosco Institute of Technology, Mumbai",
    "Vivekanand Education Society's Institute of Technology, Mumbai",
    "S.I.E.S. Graduate School of Technology, Mumbai",
    "Other"
  ];

  const engineeringBranches = [
    { value: "computer", label: "Computer Engineering" },
    { value: "electronics", label: "Electronics and Telecommunication" },
    { value: "electrical", label: "Electrical Engineering" },
    { value: "mechanical", label: "Mechanical Engineering" },
    { value: "civil", label: "Civil Engineering" },
    { value: "chemical", label: "Chemical Engineering" },
    { value: "production", label: "Production Engineering" },
    { value: "it", label: "Information Technology" }
  ];

  const projectCategories = [
    { value: "software", label: "Software Development" },
    { value: "hardware", label: "Hardware Projects" },
    { value: "research", label: "Research & Analysis" },
    { value: "design", label: "Design Projects" },
    { value: "automation", label: "Automation & Control" },
    { value: "iot", label: "IoT Projects" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "web", label: "Web Applications" },
    { value: "mobile", label: "Mobile Applications" },
    { value: "other", label: "Other" }
  ];

  const complexityLevels = [
    { value: "basic", label: "Basic (Beginner Level)" },
    { value: "intermediate", label: "Intermediate (Moderate Complexity)" },
    { value: "advanced", label: "Advanced (Complex Project)" }
  ];

  const topicSuggestions = {
    computer: [
      "Student Attendance Management System",
      "Online Examination System",
      "Library Management System",
      "E-Commerce Website Development",
      "Weather Forecasting Application",
      "Chatbot for Customer Service",
      "Face Recognition System",
      "Network Security Monitoring Tool"
    ],
    electronics: [
      "Arduino-based Home Automation System",
      "Smart Traffic Light Controller",
      "RFID-based Attendance System",
      "Solar Power Monitoring System",
      "PCB Design for Power Supply",
      "Smart Water Quality Monitoring",
      "Automated Irrigation System",
      "IoT-based Health Monitoring System"
    ],
    mechanical: [
      "Design of Solar-Powered Vehicle",
      "Automated Sorting System",
      "3D Printer Design and Fabrication",
      "Wind Turbine Design",
      "Hydraulic Press Design",
      "Automated Packaging Machine",
      "Solar Water Heater Design",
      "Bicycle Transmission System Design"
    ]
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};
    const suggestions: Record<string, string> = {};

    switch (field) {
      case 'name':
        if (value.length < 3) {
          errors.name = 'Name must be at least 3 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = 'Name should only contain letters and spaces';
        } else if (value.length < 5) {
          suggestions.name = 'Consider including your full name for academic records';
        }
        break;

      case 'rollNumber':
        if (value.length < 4) {
          errors.rollNumber = 'Roll number seems too short';
        } else if (!/^[A-Za-z0-9\-]+$/.test(value)) {
          errors.rollNumber = 'Roll number should only contain letters, numbers, and hyphens';
        }
        break;

      case 'enrollmentNumber':
        if (value.length < 8) {
          errors.enrollmentNumber = 'Enrollment number seems incomplete';
        } else if (!/^\d+$/.test(value)) {
          errors.enrollmentNumber = 'Enrollment number should typically be numeric';
        }
        break;

      case 'topic':
        if (value.length < 10) {
          errors.topic = 'Project topic seems too brief';
        } else if (value.length > 100) {
          suggestions.topic = 'Consider shortening the topic title for clarity';
        } else if (formData.branch && topicSuggestions[formData.branch as keyof typeof topicSuggestions]) {
          const branchTopics = topicSuggestions[formData.branch as keyof typeof topicSuggestions];
          const isRelated = branchTopics.some(topic =>
            topic.toLowerCase().includes(value.toLowerCase().split(' ')[0])
          );
          if (!isRelated) {
            suggestions.topic = 'Ensure the topic aligns with your branch curriculum';
          }
        }
        break;
    }

    setFieldErrors(prev => ({ ...prev, ...errors }));
    setFieldSuggestions(prev => ({ ...prev, ...suggestions }));
  };

  const handleFieldChange = (field: string, value: string) => {
    onChange(field, value);
    validateField(field, value);

    // Show suggestions for topic based on branch
    if (field === 'branch' && value) {
      const branchTopicSuggestions = topicSuggestions[value as keyof typeof topicSuggestions];
      if (branchTopicSuggestions) {
        setFieldSuggestions(prev => ({
          ...prev,
          topic: `Suggested topics: ${branchTopicSuggestions.slice(0, 3).join(', ')}`
        }));
        setShowSuggestions(prev => ({ ...prev, topic: true }));
      }
    }
  };

  const toggleSuggestions = (field: string) => {
    setShowSuggestions(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getFieldStatus = (field: string) => {
    const value = formData[field as keyof typeof formData];
    if (!value) return null;
    if (fieldErrors[field]) return 'error';
    if (fieldSuggestions[field]) return 'suggestion';
    return 'success';
  };

  const getFieldIcon = (field: string) => {
    const status = getFieldStatus(field);
    switch (status) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Basic Information Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              Student Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  Full Name <span className="text-destructive">*</span>
                  {getFieldIcon('name')}
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name as per academic records"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`border-border focus:border-primary ${
                    fieldErrors.name ? 'border-red-500' : fieldSuggestions.name ? 'border-yellow-500' : ''
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="flex items-center gap-2">
                  Roll Number <span className="text-destructive">*</span>
                  {getFieldIcon('rollNumber')}
                </Label>
                <Input
                  id="rollNumber"
                  placeholder="Enter your roll number (e.g., CO-2023-001)"
                  value={formData.rollNumber}
                  onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                  className={`border-border focus:border-primary ${
                    fieldErrors.rollNumber ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.rollNumber && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.rollNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentNumber" className="flex items-center gap-2">
                  Enrollment Number <span className="text-destructive">*</span>
                  {getFieldIcon('enrollmentNumber')}
                </Label>
                <Input
                  id="enrollmentNumber"
                  placeholder="Enter your enrollment number (e.g., 202301234567)"
                  value={formData.enrollmentNumber}
                  onChange={(e) => handleFieldChange('enrollmentNumber', e.target.value)}
                  className={`border-border focus:border-primary ${
                    fieldErrors.enrollmentNumber ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.enrollmentNumber && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.enrollmentNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="college" className="flex items-center gap-2">
                  College Name <span className="text-destructive">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select from MSBTE affiliated colleges or enter your college name</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={formData.college}
                  onValueChange={(value) => handleFieldChange('college', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or enter your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {msbteColleges.map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Details Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Academic Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="branch">Engineering Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => handleFieldChange('branch', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineeringBranches.map((branch) => (
                      <SelectItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleFieldChange('semester', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">Project Complexity</Label>
                <Select
                  value={formData.complexity}
                  onValueChange={(value) => handleFieldChange('complexity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Project Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  Project Category
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Helps AI provide better project suggestions</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleFieldChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="flex items-center gap-2">
                  Project Topic <span className="text-destructive">*</span>
                  {getFieldIcon('topic')}
                  {fieldSuggestions.topic && (
                    <button
                      type="button"
                      onClick={() => toggleSuggestions('topic')}
                      className="text-xs text-primary hover:underline"
                    >
                      {showSuggestions.topic ? 'Hide' : 'Show'} suggestions
                    </button>
                  )}
                </Label>
                <Input
                  id="topic"
                  placeholder="Enter your detailed project topic (e.g., 'IoT-based Smart Home Automation System')"
                  value={formData.topic}
                  onChange={(e) => handleFieldChange('topic', e.target.value)}
                  className={`border-border focus:border-primary ${
                    fieldErrors.topic ? 'border-red-500' : fieldSuggestions.topic ? 'border-yellow-500' : ''
                  }`}
                />
                {fieldErrors.topic && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.topic}
                  </p>
                )}
                {fieldSuggestions.topic && showSuggestions.topic && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800">
                            {fieldSuggestions.topic}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default StudentForm;
