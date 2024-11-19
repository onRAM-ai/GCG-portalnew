-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  shift_type shift_type NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  workers_needed INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_shift_period CHECK (end_time > start_time),
  CONSTRAINT valid_workers_needed CHECK (workers_needed > 0)
);

-- Create shift assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent double booking for the same shift
  CONSTRAINT unique_shift_worker UNIQUE (shift_id, worker_id)
);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for shifts
CREATE POLICY "Managers can manage shifts"
  ON public.shifts
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Workers can view shifts"
  ON public.shifts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'worker'
      AND profiles.status = 'active'
    )
  );

-- Policies for shift assignments
CREATE POLICY "Managers can manage assignments"
  ON public.shift_assignments
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Workers can view their assignments"
  ON public.shift_assignments
  FOR SELECT
  USING (
    auth.uid() = worker_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Function to check shift availability
CREATE OR REPLACE FUNCTION check_shift_availability(
  p_shift_id UUID,
  p_worker_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_shift_date DATE;
  v_shift_type shift_type;
BEGIN
  -- Get shift details
  SELECT date, shift_type INTO v_shift_date, v_shift_type
  FROM shifts
  WHERE id = p_shift_id;

  -- Check if worker is available on the date
  IF NOT EXISTS (
    SELECT 1 FROM availability_preferences
    WHERE user_id = p_worker_id
    AND v_shift_date = ANY(available_dates)
    AND v_shift_type = ANY(preferred_shift_types)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if worker is already assigned to another shift on the same date
  IF EXISTS (
    SELECT 1 FROM shift_assignments sa
    JOIN shifts s ON s.id = sa.shift_id
    WHERE sa.worker_id = p_worker_id
    AND s.date = v_shift_date
    AND sa.status NOT IN ('cancelled')
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;