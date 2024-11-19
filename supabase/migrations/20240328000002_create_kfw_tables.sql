-- Create enum for shift types
CREATE TYPE shift_type AS ENUM ('day', 'night', 'special_event');

-- Create availability preferences table
CREATE TABLE IF NOT EXISTS public.availability_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  available_dates DATE[] NOT NULL,
  preferred_venues UUID[] REFERENCES venues(id),
  preferred_shift_types shift_type[] DEFAULT ARRAY['day', 'night']::shift_type[],
  max_shifts_per_week INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure user doesn't exceed maximum shifts
  CONSTRAINT valid_max_shifts CHECK (max_shifts_per_week BETWEEN 1 AND 7)
);

-- Create shift assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type shift_type NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent double booking
  CONSTRAINT no_double_booking UNIQUE (worker_id, shift_date, shift_type)
);

-- Enable RLS
ALTER TABLE public.availability_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for availability_preferences
CREATE POLICY "Users can view their own availability"
  ON public.availability_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own availability"
  ON public.availability_preferences
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all availability"
  ON public.availability_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Policies for shift_assignments
CREATE POLICY "Workers can view their own shifts"
  ON public.shift_assignments
  FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Managers can manage all shifts"
  ON public.shift_assignments
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Function to check shift availability
CREATE OR REPLACE FUNCTION check_shift_availability(
  p_worker_id UUID,
  p_shift_date DATE,
  p_shift_type shift_type
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if worker is available on the date
  IF NOT EXISTS (
    SELECT 1 FROM availability_preferences
    WHERE user_id = p_worker_id
    AND p_shift_date = ANY(available_dates)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if worker hasn't exceeded weekly shift limit
  IF (
    SELECT COUNT(*)
    FROM shift_assignments
    WHERE worker_id = p_worker_id
    AND shift_date >= date_trunc('week', p_shift_date)
    AND shift_date < date_trunc('week', p_shift_date) + INTERVAL '1 week'
  ) >= (
    SELECT max_shifts_per_week
    FROM availability_preferences
    WHERE user_id = p_worker_id
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;