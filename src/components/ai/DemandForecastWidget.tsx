import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Brain, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DemandForecast {
  forecast: Array<{ day: number; demand: number; confidence: number }>;
  confidence: number;
  trendDirection: 'up' | 'down' | 'stable';
  seasonalFactors: string[];
  riskFactors: string[];
  recommendations: string[];
  keyInsights: string[];
}

interface DemandForecastWidgetProps {
  productId: string;
  category: string;
  className?: string;
}

const DemandForecastWidget: React.FC<DemandForecastWidgetProps> = ({
  productId,
  category,
  className
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [timeframe, setTimeframe] = useState('30');
  const { toast } = useToast();

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('demand-forecasting', {
        body: {
          productId,
          category,
          timeframe,
          includeSeasonality: true
        }
      });

      if (error) throw error;

      setForecast(data);
      toast({
        title: "Forecast Generated",
        description: `Demand forecast created for ${timeframe} days`,
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Forecast Failed",
        description: "Failed to generate demand forecast",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <div className="h-4 w-4 bg-blue-600 rounded-full" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Demand Forecasting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={generateForecast} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Forecast...
              </>
            ) : (
              'Generate AI Forecast'
            )}
          </Button>
        </div>

        {forecast && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(forecast.trendDirection)}
                <span className={`font-medium ${getTrendColor(forecast.trendDirection)}`}>
                  {forecast.trendDirection.toUpperCase()} Trend
                </span>
              </div>
              <Badge variant={forecast.confidence > 0.7 ? 'default' : 'secondary'}>
                {Math.round(forecast.confidence * 100)}% Confidence
              </Badge>
            </div>

            {forecast.forecast && forecast.forecast.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast.forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Demand', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value} units`,
                        name === 'demand' ? 'Predicted Demand' : name
                      ]}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="demand" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {forecast.seasonalFactors.length > 0 && (
              <div>
                <span className="text-sm font-medium">Seasonal Factors:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {forecast.seasonalFactors.map((factor, index) => (
                    <Badge key={index} variant="outline">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {forecast.riskFactors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Risk Factors:</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {forecast.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {forecast.recommendations.length > 0 && (
              <div>
                <span className="text-sm font-medium">AI Recommendations:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {forecast.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {forecast.keyInsights.length > 0 && (
              <div>
                <span className="text-sm font-medium">Key Insights:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {forecast.keyInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {insight}
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

export default DemandForecastWidget;