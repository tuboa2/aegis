import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Shield, RefreshCw, BarChart3 } from 'lucide-react';
import { type DisasterAlert } from '@/types/disaster-alert';
import { type AiSummary as AiSummaryType } from '@/types/ai';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '@/lib/api';
import { useToast } from '../ui/use-toast';

interface AlertAISummaryProps {
  alert: DisasterAlert;
}

export function AlertAISummary({ alert }: AlertAISummaryProps) {
  const [summary, setSummary] = React.useState<AiSummaryType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const { toast } = useToast();

  const fetchSummary = React.useCallback(async () => {
    if (!alert.id) return;

    setLoading(true);
    try {
      const response = await api.get(`/ai/summary/alert/${alert.id}`);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      toast({
        title: 'Analysis unavailable',
        description: 'Could not load AI analysis for this alert.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [alert.id, toast, setLoading, setSummary]);

  const regenerateSummary = async () => {
    setRegenerating(true);
    try {
      const response = await api.post(`/ai/summary/alert/${alert.id}/regenerate`);
      setSummary(response.data.summary);
      toast({
        title: 'Analysis updated',
        description: 'AI analysis has been regenerated with latest data.'
      });
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast({
        title: 'Regeneration failed',
        description: 'Could not regenerate AI analysis.',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  React.useEffect(() => {
    if (alert.id) {
      fetchSummary();
    }
  }, [alert.id, fetchSummary]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Analysis
          </CardTitle>
          <CardDescription>Generating intelligent analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            </div>
            <div className="flex justify-center py-4">
              <Brain className="h-8 w-8 animate-pulse text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Analysis
          </CardTitle>
          <CardDescription>No analysis available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No AI analysis generated for this alert yet.</p>
            <Button onClick={fetchSummary} disabled={loading}>Generate Analysis</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Generated {new Date(summary.generated_at).toLocaleString()}
                <span className={`ml-2 ${getConfidenceColor(summary.confidence_score)}`}>
                  {Math.round(summary.confidence_score * 100)}% confidence
                </span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateSummary}
              disabled={regenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Assessment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Risk Assessment
              </h4>
              <Badge className={getRiskColor(summary.risk_assessment.overall_risk)}>
                {summary.risk_assessment.overall_risk.toUpperCase()} RISK
              </Badge>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Timeline: </span>
                <span className="text-sm text-muted-foreground">
                  {summary.risk_assessment.timeline}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Key Factors:</span>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                  {summary.risk_assessment.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-sm font-medium">Impact Areas:</span>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                  {summary.risk_assessment.impact_areas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="font-semibold mb-2">Situation Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary.summary_text}
            </p>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Key Findings
            </h4>
            <ul className="tet-sm text-muted-foreground space-y-1">
              {summary.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          {/* Predictive Insights */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictive Insights
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Next 24-48h: </span>
                <span className="text-muted-foreground">
                  {summary.predictive_insights.short_term}
                </span>
              </div>
              <div>
                <span className="font-medium">3-7 Day Outlook: </span>
                <span className="text-muted-foreground">
                  {summary.predictive_insights.medium_term}
                </span>
              </div>
              {summary.predictive_insights.escalation_triggers.length > 0 && (
                <div>
                  <span className="font-medium">Escalation Triggers:</span>
                  <ul className="text-muted-foreground list-disc list-inside mt-1">
                    {summary.predictive_insights.escalation_triggers.map((trigger, index) => (
                      <li key={index}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Safety Recommendations */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Safety Recommendations
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              {summary.safety_recommendations.map((recommendation, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1}}
                >
                  <Shield className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                  {recommendation}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Analysis sources: {summary.sources_used.join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}