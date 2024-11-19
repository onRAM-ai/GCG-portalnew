-- Add role enum type
CREATE TYPE user_role AS ENUM ('manager', 'worker', 'venue');

-- Update profiles table with role and status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'worker',
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active';

-- Create venue_managers table
CREATE TABLE IF NOT EXISTS public.venue_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure unique user-venue pairs
  CONSTRAINT unique_venue_manager UNIQUE (user_id, venue_id)
);

-- Create worker_restrictions table
CREATE TABLE IF NOT EXISTS public.worker_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restriction_type TEXT CHECK (restriction_type IN ('blacklist', 'temporary')),
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique venue-worker pairs
  CONSTRAINT unique_worker_restriction UNIQUE (venue_id, worker_id)
);

-- Enable RLS
ALTER TABLE public.venue_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_restrictions ENABLE ROW LEVEL SECURITY;

-- Policies for venue_managers
CREATE POLICY "Managers can view venue managers"
  ON public.venue_managers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can manage venue managers"
  ON public.venue_managers
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Policies for worker_restrictions
CREATE POLICY "Venue managers can view restrictions"
  ON public.worker_restrictions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venue_managers
      WHERE venue_managers.user_id = auth.uid()
      AND venue_managers.venue_id = worker_restrictions.venue_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Venue managers can manage restrictions"
  ON public.worker_restrictions
  USING (
    EXISTS (
      SELECT 1 FROM venue_managers
      WHERE venue_managers.user_id = auth.uid()
      AND venue_managers.venue_id = worker_restrictions.venue_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
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
  -- Check user role
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND role = 'manager'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check venue manager permissions
  IF p_resource_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM venue_managers
    WHERE user_id = p_user_id
    AND venue_id = p_resource_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check worker permissions
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND role = 'worker'
    AND status = 'active'
  ) THEN
    -- Add specific worker permission checks here
    IF p_permission IN ('view_venues', 'submit_availability', 'book_shifts') THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$;