-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('OPEN', 'ASSIGNED', 'COMPLETED')) DEFAULT 'OPEN',
  positions INTEGER NOT NULL DEFAULT 1,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  hourly_rate DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_shift_time CHECK (end_time > start_time),
  CONSTRAINT valid_positions CHECK (positions > 0)
);

-- Create shift assignments table
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')) DEFAULT 'PENDING',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent double booking for the same shift
  CONSTRAINT unique_shift_assignment UNIQUE (shift_id, user_id)
);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for shifts
CREATE POLICY "Admins can manage all shifts"
  ON public.shifts
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Venues can manage their own shifts"
  ON public.shifts
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view available shifts"
  ON public.shifts
  FOR SELECT
  USING (
    status = 'OPEN' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'user'
    )
  );

-- Policies for shift assignments
CREATE POLICY "Users can view their assignments"
  ON public.shift_assignments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
  ON public.shift_assignments
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to check for double bookings
CREATE OR REPLACE FUNCTION check_shift_availability(
  p_shift_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_shift_date DATE;
  v_shift_start TIME;
  v_shift_end TIME;
BEGIN
  -- Get shift details
  SELECT date, start_time, end_time INTO v_shift_date, v_shift_start, v_shift_end
  FROM shifts WHERE id = p_shift_id;
  
  -- Check for existing assignments on the same date
  RETURN NOT EXISTS (
    SELECT 1
    FROM shift_assignments sa
    JOIN shifts s ON s.id = sa.shift_id
    WHERE sa.user_id = p_user_id
    AND s.date = v_shift_date
    AND sa.status != 'CANCELLED'
    AND (
      (s.start_time, s.end_time) OVERLAPS (v_shift_start, v_shift_end)
    )
  );
END;
$$;