-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'skimpy', 'venue');

-- Enhance profiles table with role and status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'skimpy',
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create venues table
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create venue_managers table (for multiple managers per venue)
CREATE TABLE IF NOT EXISTS public.venue_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(venue_id, user_id)
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  workers_needed INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT CHECK (status IN ('open', 'filled', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_shift_time CHECK (end_time > start_time),
  CONSTRAINT valid_workers_needed CHECK (workers_needed > 0)
);

-- Create shift_assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(shift_id, worker_id)
);

-- Enable Row Level Security
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for venues
CREATE POLICY "Public can view active venues"
  ON public.venues
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Venue owners can manage their venues"
  ON public.venues
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all venues"
  ON public.venues
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for shifts
CREATE POLICY "Public can view open shifts"
  ON public.shifts
  FOR SELECT
  USING (status = 'open');

CREATE POLICY "Venue managers can manage shifts"
  ON public.shifts
  USING (
    EXISTS (
      SELECT 1 FROM venue_managers
      WHERE venue_managers.venue_id = shifts.venue_id
      AND venue_managers.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = shifts.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

-- Policies for shift assignments
CREATE POLICY "Workers can view their assignments"
  ON public.shift_assignments
  FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can create assignments"
  ON public.shift_assignments
  FOR INSERT
  WITH CHECK (
    worker_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'skimpy'
      AND profiles.status = 'active'
    )
  );

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_resource_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin role
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check venue owner/manager permissions
  IF p_resource_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM venues
    WHERE id = p_resource_id
    AND (
      owner_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM venue_managers
        WHERE venue_id = p_resource_id
        AND user_id = p_user_id
      )
    )
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check skimpy permissions
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND role = 'skimpy'
    AND status = 'active'
  ) THEN
    -- Add specific skimpy permission checks here
    IF p_permission IN ('view_shifts', 'book_shifts', 'manage_profile') THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$;