-- In supabase/migrations/ (add to a new migration file, then supabase db push)
-- -- WARNING: This schema is for context only and is not meant to be run.
-- -- Table order and constraints may not be valid for execution.

-- CREATE TABLE public.case_files (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL,
--   case_name text,
--   created_at timestamp with time zone DEFAULT now(),
--   description text DEFAULT ''::text,
--   social_media_platforms ARRAY DEFAULT '{}'::text[],
--   status text DEFAULT 'draft'::text,
--   title text NOT NULL,
--   CONSTRAINT case_files_pkey PRIMARY KEY (id)
-- );
-- CREATE TABLE public.evidence (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   file_path text NOT NULL,
--   uploaded_by uuid,
--   created_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT evidence_pkey PRIMARY KEY (id)
-- );
-- CREATE TABLE public.evidence_analysis (
--   id uuid NOT NULL DEFAULT gen_random_uuid(),
--   evidence_id uuid,
--   extracted_text text,
--   abuse_labels ARRAY,
--   severity numeric,
--   summary text,
--   participants jsonb,
--   analysis_meta jsonb,
--   created_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT evidence_analysis_pkey PRIMARY KEY (id),
--   CONSTRAINT evidence_analysis_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES public.evidence(id)
-- );
-- CREATE TABLE public.evidence_items (
--   id bigint NOT NULL DEFAULT nextval('evidence_items_id_seq'::regclass),
--   case_id uuid,
--   evidence_text text,
--   created_at timestamp without time zone DEFAULT now(),
--   ocr_text text,
--   language text,
--   abuse_score double precision,
--   threat_level text CHECK (threat_level = ANY (ARRAY['none'::text, 'low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
--   abuse_categories ARRAY,
--   emotion_tags ARRAY,
--   incident_timestamp timestamp with time zone,
--   participants jsonb,
--   ai_processed boolean DEFAULT false,
--   ai_raw jsonb,
--   ai_version text,
--   uploaded_at timestamp with time zone DEFAULT now(),
--   extracted_text text,
--   file_type text,
--   file_url text,
--   harm_detected boolean,
--   metadata jsonb,
--   CONSTRAINT evidence_items_pkey PRIMARY KEY (id)
-- );
-- CREATE TABLE public.resources (
--   id uuid NOT NULL DEFAULT uuid_generate_v4(),
--   category text NOT NULL,
--   name text NOT NULL,
--   hotline text,
--   location text,
--   lat double precision,
--   long double precision,
--   url text,
--   CONSTRAINT resources_pkey PRIMARY KEY (id)
-- );
-- CREATE TABLE public.support_resources (
--   id bigint NOT NULL DEFAULT nextval('support_resources_id_seq'::regclass),
--   resource_name text NOT NULL,
--   resource_url text,
--   created_at timestamp without time zone DEFAULT now(),
--   country_code text,
--   region text,
--   channel_type text CHECK (channel_type = ANY (ARRAY['phone'::text, 'chat'::text, 'email'::text, 'website'::text, 'in_person'::text])),
--   link text,
--   notes text,
--   priority_level integer CHECK (priority_level >= 1 AND priority_level <= 5),
--   updated_at timestamp with time zone DEFAULT now(),
--   CONSTRAINT support_resources_pkey PRIMARY KEY (id)
-- );
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

ALTER TABLE case_files
ADD COLUMN description text DEFAULT '';

ALTER TABLE case_files
ADD COLUMN social_media_platforms text[] DEFAULT '{}';


ALTER TABLE case_files
ADD COLUMN status text DEFAULT 'draft';

ALTER TABLE case_files
ADD COLUMN title text NOT NULL;

ALTER TABLE public.evidence_items
ADD COLUMN extracted_text text;

ALTER TABLE public.evidence_items
ADD COLUMN file_type text;

ALTER TABLE public.evidence_items
ADD COLUMN file_url text;

ALTER TABLE public.evidence_items
ADD COLUMN harm_detected boolean;

ALTER TABLE public.evidence_items
ADD COLUMN metadata jsonb;

TRUNCATE TABLE public.evidence_items RESTART IDENTITY CASCADE;

ALTER TABLE public.evidence_items 
ALTER COLUMN case_id TYPE uuid USING NULL;

ALTER TABLE public.evidence_items 
ALTER COLUMN evidence_text DROP NOT NULL;