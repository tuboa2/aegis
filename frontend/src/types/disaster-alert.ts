export interface DisasterAlert {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  type: 'earthquake' | 'flood' | 'wildfire' | 'volcanic' | 'tsunami';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  radius_km: number;
  source: 'openweather' | 'usgs' | 'phivolcs' | 'nasa' | 'user_report';
  external_id?: string;
  started_at: string;
  expires_at?:string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Relations
  user?: any;
  reports?: any[];
  ai_summary?: any;
}

export interface AlertStatistics {
  total_active: number;
  last_24_hours: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}