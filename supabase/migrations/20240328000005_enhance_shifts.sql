-- Add new columns to shifts table
ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS shift_pattern TEXT CHECK (shift_pattern IN ('single', 'multi_day', 'series')),
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES shift_series(id),
  ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id),
  ADD COLUMN IF NOT EXISTS min_qualification TEXT[];

-- Create shift series table
CREATE TABLE IF NOT EXISTS public.shift_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  venue_id UUID REFERENCES venues(id),
  pattern_type TEXT CHECK (pattern_type IN ('daily', 'weekly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create venue operating hours table
CREATE TABLE IF NOT EXISTS public.venue_operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  
  CONSTRAINT valid_hours CHECK (close_time > open_time)
);

-- Create shift transfer requests table
CREATE TABLE IF NOT EXISTS public.shift_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id),
  requesting_worker_id UUID REFERENCES auth.users(id),
  target_worker_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create shift cancellation requests table
CREATE TABLE IF NOT EXISTS public.shift_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_assignment_id UUID REFERENCES shift_assignments(id),
  worker_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.shift_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification function
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_metadata
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;