export interface UserReport {
  id: number;
  user_id: number;
  alert_id?: number;
  title: string;
  description: string;
  type: 'earthquake' | 'flood' | 'storm' | 'wildfire' | 'volcanic' | 'tsunami' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  location_name?: string;
  contact_info?: string;
  media_urls: string[];
  status: 'pending' | 'verified' | 'rejected' | 'duplicate';
  verified_by?: number;
  verified_at?: string;
  upvotes_count: number;
  comments_count: number;
  is_public: boolean;
  user_has_upvoted?: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  user?: any;
  alert?: any;
  verifiedBy?: any;
  comments?: ReportComment[];
  upvotes?: any[];
}

export interface ReportComment {
  id: number;
  user_id: number;
  report_id: number;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  user?: any;
}

export interface SafetyTip {
  id: number;
  disaster_type: string;
  severity_level: string;
  title: string;
  content: string;
  short_description: string;
  image_url?: string;
  video_url?: string;
  source: string;
  source_url?: string;
  is_active: boolean;
  order: number;
  tags: string[];
  created: string;
  updated_at: string;
}

export interface EmergencyResource {
  emergency_contacts: Array<{
    name: string;
    number: string;
    description: string;
    type: string;
  }>;
  important_websites: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  preparedness_guides: Array<{
    title: string;
    type: string;
    steps: string[];
  }>;
}