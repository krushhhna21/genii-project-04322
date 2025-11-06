import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";

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

interface QualityIndicatorProps {
  qualityMetrics: QualityMetrics;
  complianceInfo: ComplianceInfo;
  showDetails?: boolean;
}

const QualityIndicator = ({
  qualityMetrics,
  complianceInfo,
  showDetails = false
}: QualityIndicatorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getQualityLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Improvement";
  };

  const getComplianceIcon = () => {
    if (complianceInfo.isCompliant && complianceInfo.complianceScore >= 90) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (complianceInfo.complianceScore >= 70) {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getOverallBadgeVariant = () => {
    if (qualityMetrics.overallScore >= 85) return "default";
    if (qualityMetrics.overallScore >= 70) return "secondary";
    return "destructive";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Quality Metrics
          <Badge variant={getOverallBadgeVariant()} className="ml-auto">
            {getQualityLevel(qualityMetrics.overallScore)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Quality Score</span>
            <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.overallScore)}`}>
              {qualityMetrics.overallScore}/100
            </span>
          </div>
          <Progress
            value={qualityMetrics.overallScore}
            className="h-2"
          />
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Technical Depth</span>
              <span className={`text-sm font-medium ${getScoreColor(qualityMetrics.technicalDepth)}`}>
                {qualityMetrics.technicalDepth}%
              </span>
            </div>
            <Progress
              value={qualityMetrics.technicalDepth}
              className="h-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Academic Quality</span>
              <span className={`text-sm font-medium ${getScoreColor(qualityMetrics.academicQuality)}`}>
                {qualityMetrics.academicQuality}%
              </span>
            </div>
            <Progress
              value={qualityMetrics.academicQuality}
              className="h-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completeness</span>
              <span className={`text-sm font-medium ${getScoreColor(qualityMetrics.completeness)}`}>
                {qualityMetrics.completeness}%
              </span>
            </div>
            <Progress
              value={qualityMetrics.completeness}
              className="h-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Relevance</span>
              <span className={`text-sm font-medium ${getScoreColor(qualityMetrics.relevance)}`}>
                {qualityMetrics.relevance}%
              </span>
            </div>
            <Progress
              value={qualityMetrics.relevance}
              className="h-1"
            />
          </div>
        </div>

        {/* MSBTE Compliance */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getComplianceIcon()}
              <span className="text-sm font-medium">MSBTE Compliance</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(complianceInfo.complianceScore)}`}>
              {complianceInfo.complianceScore}/100
            </span>
          </div>
          <Progress
            value={complianceInfo.complianceScore}
            className="h-2"
          />

          {complianceInfo.isCompliant && (
            <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
              MSBTE Compliant
            </Badge>
          )}
        </div>

        {/* Detailed Issues and Recommendations */}
        {showDetails && (complianceInfo.issues.length > 0 || complianceInfo.recommendations.length > 0) && (
          <div className="pt-2 border-t space-y-3">
            {complianceInfo.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Issues to Address</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {complianceInfo.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {complianceInfo.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {complianceInfo.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QualityIndicator;