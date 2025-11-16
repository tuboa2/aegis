export interface AiSummary {
  id: number;
  alert_id: number;
  summary_text: string;
  risk_assessment: {
    overall_risk: string;
    factors: string[];
    timeline: string;
    impact_areas: string[];
  };
  sources_used: string[];
  key_findings: string[];
  predictive_insights: {
    short_term: string;
    medium_term: string;
    escalation_triggers: string[];
  };
  safety_recommendations: string[];
  confidence_score: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PredictiveInsights {
  trend_analysis: string;
  risk_hotspots: string[];
  emerging_threats: string[];
  preparedness_advice: string[];
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export interface AiStats {
  total_analyses: number;
  average_confidence: number;
  analyses_by_risk_level: Record<string, number>;
  recent_analysis: AiSummary[];
}
