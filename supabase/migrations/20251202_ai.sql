-- Create tables in the correct order (parent tables first)

-- Resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,  -- e.g., 'police', 'medical', 'counseling'
  name TEXT NOT NULL,
  hotline TEXT,
  location TEXT,  -- e.g., 'Nairobi'
  lat FLOAT,      -- For geospatial filtering (optional PostGIS extension)
  long FLOAT,
  url TEXT        -- e.g., website or chat link
);

-- Case files table (corresponds to case_mes in the image)
CREATE TABLE case_files (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  case_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT DEFAULT ''::text,
  social_media_platforms TEXT[] DEFAULT '{}'::text[],
  status TEXT DEFAULT 'draft'::text,
  title TEXT NOT NULL,
  CONSTRAINT case_files_pkey PRIMARY KEY (id)
);

-- Evidence table
CREATE TABLE evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT evidence_pkey PRIMARY KEY (id)
);

-- Evidence items table
CREATE TABLE evidence_items (
  id BIGINT NOT NULL DEFAULT nextval('evidence_items_id_seq'::regclass),
  case_id UUID,
  evidence_text TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  ocr_text TEXT,
  language TEXT,
  abuse_score DOUBLE PRECISION,
  threat_level TEXT CHECK (threat_level = ANY (ARRAY['none'::text, 'low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  abuse_categories TEXT[],
  emotion_tags TEXT[],
  incident_timestamp TIMESTAMP WITH TIME ZONE,
  participants JSONB,
  ai_processed BOOLEAN DEFAULT false,
  ai_raw JSONB,
  ai_version TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  extracted_text TEXT,
  file_type TEXT,
  file_url TEXT,
  harm_detected BOOLEAN,
  metadata JSONB,
  CONSTRAINT evidence_items_pkey PRIMARY KEY (id),
  CONSTRAINT evidence_items_case_id_fkey FOREIGN KEY (case_id) REFERENCES case_files(id)
);

-- Evidence analysis table
CREATE TABLE evidence_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  evidence_id UUID,
  extracted_text TEXT,
  abuse_labels TEXT[],
  severity NUMERIC,
  summary TEXT,
  participants JSONB,
  analysis_meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT evidence_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT evidence_analysis_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES evidence(id)
);

-- Support resources table
CREATE TABLE support_resources (
  id BIGINT NOT NULL DEFAULT nextval('support_resources_id_seq'::regclass),
  resource_name TEXT NOT NULL,
  resource_url TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  country_code TEXT,
  region TEXT,
  channel_type TEXT CHECK (channel_type = ANY (ARRAY['phone'::text, 'chat'::text, 'email'::text, 'website'::text, 'in_person'::text])),
  link TEXT,
  notes TEXT,
  priority_level INTEGER CHECK (priority_level >= 1 AND priority_level <= 5),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT support_resources_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints for relationships shown in the image

-- Link evidence_items to case_files (already added above)

-- Link evidence to evidence_items (if this relationship exists in the schema)
-- Note: This relationship isn't clear from the provided SQL, but might be needed based on the image

-- Link evidence_analysis to evidence (already added above)

-- Link support_resources to evidence_analysis (if this relationship exists)
-- Note: This relationship isn't clear from the provided SQL, but might be needed based on the image

-- Create sequences if they don't exist
CREATE SEQUENCE IF NOT EXISTS evidence_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS support_resources_id_seq;