import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { type PredictiveInsights } from "@/types/ai";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";

export function PredictiveInsights() {
  const [insights, setInsights] = React.useState<PredictiveInsights | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchInsights = React.useCallback(async () => {
    try {
      const response = await api.get('/ai/predictive-insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
      toast({
        title: 'Insights unavailable',
        description: 'Could not loading predictive insights at this time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [setInsights, toast, setLoading]);

  React.useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 30000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchInsights]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2"/>
            Predictive Insights
          </CardTitle>
          <CardDescription>Analyzing disaster patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Predictive Insights
          </CardTitle>
          <CardDescription>No insights available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Unable to generate predictive insights.</p>
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
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Predictive Insights
          </CardTitle>
          <CardDescription>
            AI - Powered analysis of disaster patterns and future risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trend Analysis */}
          <div>
            <div className="flex items-center mb-3">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              <h4 className="font-semibold">Trend Analysis</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.trend_analysis}
            </p>
          </div>

          {/* Risk Hotspots */}
          {insights.risk_hotspots.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <h4 className="font-semibold">Risk Hotspots</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.risk_hotspots.map((hotspot, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {hotspot}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Emerging Threats */}
          {insights.emerging_threats.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <h4 className="font-semibold">Emerging Threats</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                {insights.emerging_threats.map((threat, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <AlertTriangle className="h-3 w-3 text-orange-500 mr-2 mt-0.5 shrink-0" />
                    {threat}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Preparedness Advice */}
          <div>
            <div className="flex items-center mb-3">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <h4 className="font-semibold">Preparedness Advice</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              {insights.preparedness_advice.map((advice, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start p-2 bg-green-50 rounded-lg"
                >
                  <Shield className="h-3 w-3 text-green-600 mr-2 mt-0.5 shrink-0" />
                  {advice}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Insights generated by AI. Always verify with official sources for critical decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}