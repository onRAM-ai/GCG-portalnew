-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create health_checks table
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'unhealthy')),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create availability_preferences table
CREATE TABLE IF NOT EXISTS public.availability_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  available_dates DATE[] DEFAULT ARRAY[]::DATE[],
  preferred_suburbs TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_venues TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_shift_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for health_checks
CREATE POLICY "Admins can manage health checks"
  ON public.health_checks
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can view health status"
  ON public.health_checks
  FOR SELECT
  USING (true);

-- Create policies for availability_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.availability_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.availability_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.availability_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_checks_last_checked
  ON public.health_checks(last_checked DESC);

CREATE INDEX IF NOT EXISTS idx_availability_preferences_user_id
  ON public.availability_preferences(user_id);

-- Create database initialization function
CREATE OR REPLACE FUNCTION initialize_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Run initial schema
  PERFORM setup_schema();
  
  -- Grant permissions
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
END;
$$;

-- Create schema setup function
CREATE OR REPLACE FUNCTION setup_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add any additional schema setup here
  NULL;
END;
$$;