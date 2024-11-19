-- Enhance availability_preferences table
ALTER TABLE public.availability_preferences
  ADD COLUMN IF NOT EXISTS preferred_suburbs TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS preferred_venues UUID[] DEFAULT ARRAY[]::UUID[];

-- Create function to check venue availability
CREATE OR REPLACE FUNCTION check_venue_availability(
  p_worker_id UUID,
  p_venue_id UUID,
  p_date DATE
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if worker has set this venue as preferred
  IF NOT EXISTS (
    SELECT 1 FROM availability_preferences
    WHERE user_id = p_worker_id
    AND (
      p_venue_id = ANY(preferred_venues)
      OR array_length(preferred_venues, 1) IS NULL
    )
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if worker is available on the date
  IF NOT EXISTS (
    SELECT 1 FROM availability_preferences
    WHERE user_id = p_worker_id
    AND p_date = ANY(available_dates)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if worker is not restricted from this venue
  IF EXISTS (
    SELECT 1 FROM worker_restrictions
    WHERE worker_id = p_worker_id
    AND venue_id = p_venue_id
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;