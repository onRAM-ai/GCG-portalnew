-- Create availability_preferences table if it doesn't exist
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
ALTER TABLE public.availability_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
  ON public.availability_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.availability_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.availability_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.availability_preferences TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;