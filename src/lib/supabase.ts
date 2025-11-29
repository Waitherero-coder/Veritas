import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  anonymous_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
};

export type CaseFile = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'submitted' | 'archived';
  social_media_platforms: string[];
  created_at: string;
  updated_at: string;
};

export type EvidenceItem = {
  id: string;
  case_id: string;
  file_url: string;
  file_type: 'image' | 'audio' | 'document' | 'video';
  extracted_text: string;
  metadata: Record<string, unknown>;
  harm_detected: boolean;
  threat_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  uploaded_at: string;
};

export type SupportResource = {
  id: string;
  category: 'medical' | 'police' | 'counseling' | 'emergency' | 'legal';
  name: string;
  description: string;
  phone: string;
  website: string;
  location: string;
  country: string;
  available_24_7: boolean;
  coordinates: { lat?: number; lng?: number };
  verified: boolean;
  created_at: string;
};
