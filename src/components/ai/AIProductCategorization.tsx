import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AICategorization {
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
  suggestions: string[];
}

interface AIProductCategorizationProps {
  productName: string;
  description: string;
  onCategorization: (categorization: AICategorization) => void;
  existingCategories?: string[];
}

const AIProductCategorization: React.FC<AIProductCategorizationProps> = ({
  productName,
  description,
  onCategorization,
  existingCategories
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categorization, setCategorization] = useState<AICategorization | null>(null);
  const { toast } = useToast();

  const analyzePage = async () => {
    if (!productName || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide both product name and description",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-categorization', {
        body: {
          productName,
          description,
          existingCategories
        }
      });

      if (error) throw error;

      setCategorization(data);
      onCategorization(data);
      
      toast({
        title: "AI Analysis Complete",
        description: `Product categorized with ${Math.round(data.confidence * 100)}% confidence`,
      });
    } catch (error) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Product Categorization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzePage} 
          disabled={isAnalyzing || !productName || !description}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Product...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>

        {categorization && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Confidence Score:</span>
              <div className="flex items-center gap-2">
                {getConfidenceIcon(categorization.confidence)}
                <span className={`font-bold ${getConfidenceColor(categorization.confidence)}`}>
                  {Math.round(categorization.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Primary Category:</span>
                <p className="font-semibold">{categorization.category}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Subcategory:</span>
                <p className="font-semibold">{categorization.subcategory}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-muted-foreground">Suggested Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {categorization.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {categorization.suggestions.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">AI Suggestions:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {categorization.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {suggestion}
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

export default AIProductCategorization;