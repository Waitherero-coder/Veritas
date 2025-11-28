/*
  # Veritas - Evidence & Justice Engine Schema

  ## Overview
  This migration creates the complete database schema for Veritas, a platform that helps
  survivors of digital violence organize evidence and find support resources.

  ## New Tables
  
  ### 1. `profiles`
  User profile information with privacy controls
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `anonymous_mode` (boolean) - Whether user prefers anonymous operation
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `case_files`
  Main case tracking - each represents one incident/situation
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `title` (text)
  - `description` (text)
  - `status` (text) - 'draft', 'active', 'submitted', 'archived'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `evidence_items`
  Individual pieces of evidence (screenshots, voice notes, etc.)
  - `id` (uuid, primary key)
  - `case_id` (uuid, FK to case_files)
  - `file_url` (text) - Supabase storage URL
  - `file_type` (text) - 'image', 'audio', 'document', 'video'
  - `extracted_text` (text) - OCR results
  - `metadata` (jsonb) - Timestamps, dimensions, etc.
  - `harm_detected` (boolean)
  - `threat_level` (text) - 'none', 'low', 'medium', 'high', 'critical'
  - `uploaded_at` (timestamptz)

  ### 4. `support_resources`
  Directory of helplines, hospitals, police units, therapists
  - `id` (uuid, primary key)
  - `category` (text) - 'medical', 'police', 'counseling', 'emergency', 'legal'
  - `name` (text)
  - `description` (text)
  - `phone` (text)
  - `website` (text)
  - `location` (text)
  - `country` (text)
  - `available_24_7` (boolean)
  - `coordinates` (jsonb) - {lat, lng} for proximity search
  - `verified` (boolean)
  - `created_at` (timestamptz)

  ### 5. `case_exports`
  Track PDF exports for court submission
  - `id` (uuid, primary key)
  - `case_id` (uuid, FK to case_files)
  - `file_url` (text)
  - `exported_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own case files and evidence
  - Support resources are publicly readable
  - Strict ownership checks on all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  anonymous_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create case_files table
CREATE TABLE IF NOT EXISTS case_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
  ON case_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cases"
  ON case_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON case_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON case_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create evidence_items table
CREATE TABLE IF NOT EXISTS evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL,
  extracted_text text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  harm_detected boolean DEFAULT false,
  threat_level text DEFAULT 'none',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evidence"
  ON evidence_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create evidence in own cases"
  ON evidence_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own evidence"
  ON evidence_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own evidence"
  ON evidence_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

-- Create support_resources table
CREATE TABLE IF NOT EXISTS support_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  phone text DEFAULT '',
  website text DEFAULT '',
  location text DEFAULT '',
  country text DEFAULT '',
  available_24_7 boolean DEFAULT false,
  coordinates jsonb DEFAULT '{}',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support resources are publicly readable"
  ON support_resources FOR SELECT
  TO authenticated
  USING (true);

-- Create case_exports table
CREATE TABLE IF NOT EXISTS case_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  exported_at timestamptz DEFAULT now()
);

ALTER TABLE case_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON case_exports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = case_exports.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exports for own cases"
  ON case_exports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = case_exports.case_id
      AND case_files.user_id = auth.uid()
    )
  );

-- Insert sample support resources for Kenya
INSERT INTO support_resources (category, name, description, phone, website, country, available_24_7, verified) VALUES
  ('emergency', 'Kenya National Police Emergency', 'General police emergency line', '999', '', 'Kenya', true, true),
  ('emergency', 'Gender Violence Recovery Centre', 'Nairobi Women''s Hospital GBV Centre', '116', 'https://nairobiwomenshospital.org', 'Kenya', true, true),
  ('counseling', 'Kenya Red Cross Psychosocial Support', 'Free counseling and trauma support', '1199', 'https://www.redcross.or.ke', 'Kenya', false, true),
  ('police', 'Cyber Crime Unit - DCI Kenya', 'Report cybercrimes and digital harassment', '0800722203', 'https://www.cid.go.ke', 'Kenya', false, true),
  ('counseling', 'LVCT Health Hotline', 'Mental health and trauma counseling', '1190', 'https://lvcthealth.org', 'Kenya', true, true),
  ('medical', 'Kenyatta National Hospital GBV Unit', 'Medical care for GBV survivors', '+254-20-2726300', '', 'Kenya', true, true),
  ('legal', 'FIDA Kenya', 'Free legal aid for women', '+254-20-3874608', 'https://fidakenya.org', 'Kenya', false, true),
  ('emergency', 'COVAW Crisis Line', 'Coalition on Violence Against Women', '0800720553', 'https://covaw.or.ke', 'Kenya', true, true);
