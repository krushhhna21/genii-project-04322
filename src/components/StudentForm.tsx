import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentFormProps {
  formData: {
    name: string;
    rollNumber: string;
    enrollmentNumber: string;
    college: string;
    topic: string;
  };
  onChange: (field: string, value: string) => void;
}

const StudentForm = ({ formData, onChange }: StudentFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rollNumber">
          Roll Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="rollNumber"
          placeholder="Enter your roll number"
          value={formData.rollNumber}
          onChange={(e) => onChange('rollNumber', e.target.value)}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollmentNumber">
          Enrollment Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="enrollmentNumber"
          placeholder="Enter your enrollment number"
          value={formData.enrollmentNumber}
          onChange={(e) => onChange('enrollmentNumber', e.target.value)}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="college">
          College Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="college"
          placeholder="Enter your college name"
          value={formData.college}
          onChange={(e) => onChange('college', e.target.value)}
          className="border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="topic">
          Project Topic <span className="text-destructive">*</span>
        </Label>
        <Input
          id="topic"
          placeholder="Enter your project topic"
          value={formData.topic}
          onChange={(e) => onChange('topic', e.target.value)}
          className="border-border focus:border-primary"
        />
      </div>
    </div>
  );
};

export default StudentForm;
