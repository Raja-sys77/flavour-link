import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PricingRecommendation {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  confidence: number;
  reasoning: string;
  marketPosition: 'premium' | 'competitive' | 'value';
  demandForecast: 'increasing' | 'decreasing' | 'stable';
  actions: string[];
}

interface SmartPricingWidgetProps {
  productId: string;
  currentPrice: number;
  category: string;
  className?: string;
}

const SmartPricingWidget: React.FC<SmartPricingWidgetProps> = ({
  productId,
  currentPrice,
  category,
  className
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const { toast } = useToast();

  const analyzePricing = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-pricing', {
        body: {
          productId,
          currentPrice,
          category,
          seasonality: 'normal', // Could be enhanced with real seasonality data
          demandHistory: [] // Could be enhanced with real demand data
        }
      });

      if (error) throw error;

      setRecommendation(data);
      toast({
        title: "Pricing Analysis Complete",
        description: `Recommendation generated with ${Math.round(data.confidence * 100)}% confidence`,
      });
    } catch (error) {
      console.error('Error analyzing pricing:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate pricing recommendation",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'competitive': return 'bg-blue-100 text-blue-800';
      case 'value': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandIcon = (forecast: string) => {
    switch (forecast) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const priceChange = recommendation ? 
    ((recommendation.recommendedPrice - currentPrice) / currentPrice * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Smart Pricing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Price:</span>
          <span className="font-bold">${currentPrice.toFixed(2)}/kg</span>
        </div>

        <Button 
          onClick={analyzePricing} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Market...
            </>
          ) : (
            'Get AI Pricing Recommendation'
          )}
        </Button>

        {recommendation && (
          <div className="space-y-4 mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Recommended Price:</span>
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${recommendation.recommendedPrice.toFixed(2)}/kg
                </div>
                <div className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Price Range</span>
                <span>${recommendation.priceRange.min} - ${recommendation.priceRange.max}</span>
              </div>
              <Progress value={
                ((recommendation.recommendedPrice - recommendation.priceRange.min) / 
                (recommendation.priceRange.max - recommendation.priceRange.min)) * 100
              } />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Confidence:</span>
              <span className="font-medium">{Math.round(recommendation.confidence * 100)}%</span>
            </div>

            <div className="flex items-center gap-4">
              <Badge className={getMarketPositionColor(recommendation.marketPosition)}>
                {recommendation.marketPosition.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1">
                {getDemandIcon(recommendation.demandForecast)}
                <span className="text-sm capitalize">{recommendation.demandForecast}</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">AI Reasoning:</span>
              <p className="text-sm text-muted-foreground mt-1">{recommendation.reasoning}</p>
            </div>

            {recommendation.actions.length > 0 && (
              <div>
                <span className="text-sm font-medium">Recommended Actions:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {recommendation.actions.map((action, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {action}
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

export default SmartPricingWidget;