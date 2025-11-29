/*
  # Create User Settings Schema

  ## Overview
  This migration creates the complete database schema for the Veritas application,
  including user profiles, case files, evidence items, support resources, and
  user settings/preferences.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User's email address
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `anonymous_mode` (boolean) - Toggle for anonymous identity
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. user_preferences
  - `id` (uuid, primary key) - Auto-generated ID
  - `user_id` (uuid) - References profiles.id
  - `theme` (text) - UI theme preference (light/dark)
  - `email_notifications` (boolean) - Email alert preferences
  - `sms_notifications` (boolean) - SMS alert preferences
  - `notification_frequency` (text) - How often to receive notifications
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. case_files
  - `id` (uuid, primary key) - Auto-generated ID
  - `user_id` (uuid) - References profiles.id
  - `title` (text) - Case title
  - `description` (text) - Case description
  - `status` (text) - Case status (draft/active/submitted/archived)
  - `social_media_platforms` (text[]) - Platforms involved
  - `created_at` (timestamptz) - Case creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. evidence_items
  - `id` (uuid, primary key) - Auto-generated ID
  - `case_id` (uuid) - References case_files.id
  - `file_url` (text) - Storage URL for evidence file
  - `file_type` (text) - Type of evidence (image/audio/document/video)
  - `extracted_text` (text) - OCR/transcribed text
  - `metadata` (jsonb) - Additional file metadata
  - `harm_detected` (boolean) - AI-detected harm flag
  - `threat_level` (text) - Severity level (none/low/medium/high/critical)
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 5. support_resources
  - `id` (uuid, primary key) - Auto-generated ID
  - `category` (text) - Resource type (medical/police/counseling/emergency/legal)
  - `name` (text) - Organization name
  - `description` (text) - Service description
  - `phone` (text) - Contact phone
  - `website` (text) - Website URL
  - `location` (text) - Physical address
  - `country` (text) - Country code
  - `available_24_7` (boolean) - 24/7 availability
  - `coordinates` (jsonb) - Geographic coordinates
  - `verified` (boolean) - Verification status
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Support resources are publicly readable
  
  ### Policies Created
  1. **profiles** - Users can view and update their own profile
  2. **user_preferences** - Users can view and update their own preferences
  3. **case_files** - Users can manage their own cases
  4. **evidence_items** - Users can manage evidence for their cases
  5. **support_resources** - Public read access, admin write access

  ## Important Notes
  1. All user data is isolated by user_id
  2. Cascading deletes protect data integrity
  3. Default values ensure smooth user experience
  4. Timestamps track all data changes
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
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

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme text DEFAULT 'light',
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  notification_frequency text DEFAULT 'immediate',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create case_files table
CREATE TABLE IF NOT EXISTS case_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft',
  social_media_platforms text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
  ON case_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
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
  case_id uuid REFERENCES case_files(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  extracted_text text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  harm_detected boolean DEFAULT false,
  threat_level text DEFAULT 'none',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence for own cases"
  ON evidence_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert evidence for own cases"
  ON evidence_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM case_files
      WHERE case_files.id = evidence_items.case_id
      AND case_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update evidence for own cases"
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

CREATE POLICY "Users can delete evidence for own cases"
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

CREATE POLICY "Support resources are publicly viewable"
  ON support_resources FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_files_user_id ON case_files(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_case_id ON evidence_items(case_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_support_resources_category ON support_resources(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_files_updated_at BEFORE UPDATE ON case_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();