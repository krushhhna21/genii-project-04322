import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  BookOpen,
  Target,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface SuggestionCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  suggestions: {
    id: string;
    text: string;
    type: 'improvement' | 'enhancement' | 'compliance';
    actionable?: boolean;
    impact: 'high' | 'medium' | 'low';
  }[];
}

interface AISuggestionsProps {
  suggestions: string[];
  onApplySuggestion?: (suggestion: string) => void;
  onEnhanceContent?: (enhancementType: string) => void;
  isProcessing?: boolean;
}

const AISuggestions = ({
  suggestions,
  onApplySuggestion,
  onEnhanceContent,
  isProcessing = false
}: AISuggestionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Categorize suggestions based on content
  const categorizedSuggestions: SuggestionCategory[] = [
    {
      id: 'content-enhancement',
      title: 'Content Enhancement',
      icon: <Sparkles className="w-4 h-4" />,
      suggestions: suggestions
        .filter(s =>
          s.toLowerCase().includes('detail') ||
          s.toLowerCase().includes('technical') ||
          s.toLowerCase().includes('depth') ||
          s.toLowerCase().includes('improve')
        )
        .map((s, i) => ({
          id: `content-${i}`,
          text: s,
          type: 'enhancement' as const,
          actionable: true,
          impact: 'high' as const
        }))
    },
    {
      id: 'structure-improvement',
      title: 'Structure & Formatting',
      icon: <Target className="w-4 h-4" />,
      suggestions: suggestions
        .filter(s =>
          s.toLowerCase().includes('format') ||
          s.toLowerCase().includes('structure') ||
          s.toLowerCase().includes('section') ||
          s.toLowerCase().includes('organized')
        )
        .map((s, i) => ({
          id: `structure-${i}`,
          text: s,
          type: 'improvement' as const,
          actionable: true,
          impact: 'medium' as const
        }))
    },
    {
      id: 'compliance-msbte',
      title: 'MSBTE Compliance',
      icon: <BookOpen className="w-4 h-4" />,
      suggestions: suggestions
        .filter(s =>
          s.toLowerCase().includes('msbte') ||
          s.toLowerCase().includes('compliance') ||
          s.toLowerCase().includes('standard') ||
          s.toLowerCase().includes('required')
        )
        .map((s, i) => ({
          id: `compliance-${i}`,
          text: s,
          type: 'compliance' as const,
          actionable: true,
          impact: 'high' as const
        }))
    },
    {
      id: 'general-recommendations',
      title: 'General Recommendations',
      icon: <Lightbulb className="w-4 h-4" />,
      suggestions: suggestions
        .filter(s =>
          !categorizedSuggestions.some(cat =>
            cat.suggestions.some(cs => cs.text === s)
          )
        )
        .map((s, i) => ({
          id: `general-${i}`,
          text: s,
          type: 'improvement' as const,
          actionable: false,
          impact: 'medium' as const
        }))
    }
  ].filter(category => category.suggestions.length > 0);

  const handleApplySuggestion = (suggestion: string, suggestionId: string) => {
    if (appliedSuggestions.has(suggestionId)) {
      toast.info("This suggestion has already been applied");
      return;
    }

    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
      toast.success("Suggestion applied successfully!");
    }
  };

  const handleEnhanceContent = (type: string) => {
    if (onEnhanceContent && !isProcessing) {
      onEnhanceContent(type);
      toast.info("Content enhancement in progress...");
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'enhancement':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'compliance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const quickEnhancements = [
    {
      id: 'technical-content',
      title: 'Enhance Technical Content',
      description: 'Add more technical details and specifications',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'practical-examples',
      title: 'Add Practical Examples',
      description: 'Include real-world applications and case studies',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'improve-structure',
      title: 'Improve Structure',
      description: 'Better organization and flow of content',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  if (suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Great job!</p>
            <p className="text-sm">Your project looks excellent with no improvement suggestions needed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-primary" />
          AI Improvement Suggestions
          <Badge variant="secondary" className="ml-auto">
            {suggestions.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Enhancement Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Quick Enhancements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {quickEnhancements.map((enhancement) => (
              <Button
                key={enhancement.id}
                variant="outline"
                size="sm"
                onClick={() => handleEnhanceContent(enhancement.id)}
                disabled={isProcessing}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                {enhancement.icon}
                <span className="text-xs font-medium">{enhancement.title}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {enhancement.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Categorized Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Detailed Suggestions
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 mr-1" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-1" />
              )}
              {isExpanded ? "Show Less" : "Show All"}
            </Button>
          </div>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="space-y-3">
              {categorizedSuggestions.map((category) => (
                <div key={category.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    {category.icon}
                    <h5 className="text-sm font-medium">{category.title}</h5>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {category.suggestions.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {category.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border ${
                          appliedSuggestions.has(suggestion.id)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-background border-border'
                        }`}
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground break-words">
                            {suggestion.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={getImpactBadgeColor(suggestion.impact)}
                              className="text-xs"
                            >
                              {suggestion.impact} impact
                            </Badge>
                            {appliedSuggestions.has(suggestion.id) && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>
                        {suggestion.actionable && onApplySuggestion && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApplySuggestion(suggestion.text, suggestion.id)}
                            disabled={appliedSuggestions.has(suggestion.id) || isProcessing}
                            className="flex-shrink-0"
                          >
                            {appliedSuggestions.has(suggestion.id) ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Summary Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {categorizedSuggestions.reduce((sum, cat) =>
                  sum + cat.suggestions.filter(s => s.impact === 'high').length, 0
                )}
              </div>
              <div className="text-xs text-muted-foreground">High Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {categorizedSuggestions.reduce((sum, cat) =>
                  sum + cat.suggestions.filter(s => s.impact === 'medium').length, 0
                )}
              </div>
              <div className="text-xs text-muted-foreground">Medium Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {appliedSuggestions.size}
              </div>
              <div className="text-xs text-muted-foreground">Applied</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {categorizedSuggestions.reduce((sum, cat) =>
                  sum + cat.suggestions.filter(s => s.actionable).length, 0
                ) - appliedSuggestions.size}
              </div>
              <div className="text-xs text-muted-foreground">Actionable</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestions;