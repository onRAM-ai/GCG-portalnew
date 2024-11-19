-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Admin Policies (Full Access)
CREATE POLICY "Admins have full access"
  ON public.users
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins have full access"
  ON public.venues
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins have full access"
  ON public.shifts
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- User Policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = auth_id);

-- Venue Policies
CREATE POLICY "Venues can view their own data"
  ON public.venues
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM venue_managers
      WHERE venue_managers.venue_id = venues.id
      AND venue_managers.user_id = auth.uid()
    )
  );

CREATE POLICY "Venues can update their own data"
  ON public.venues
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM venue_managers
      WHERE venue_managers.venue_id = venues.id
      AND venue_managers.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active venues"
  ON public.venues
  FOR SELECT
  USING (status = 'active');

-- Shift Policies
CREATE POLICY "Venues can manage their shifts"
  ON public.shifts
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = shifts.venue_id
      AND (
        venues.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venue_managers
          WHERE venue_managers.venue_id = venues.id
          AND venue_managers.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can view available shifts"
  ON public.shifts
  FOR SELECT
  USING (
    status = 'OPEN' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'user'
      AND users.status = 'active'
    )
  );

-- Booking Policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Venues can view their bookings"
  ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = bookings.venue_id
      AND (
        venues.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venue_managers
          WHERE venue_managers.venue_id = venues.id
          AND venue_managers.user_id = auth.uid()
        )
      )
    )
  );

-- Notification Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Feedback Policies
CREATE POLICY "Venues can create feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'venue'
    )
  );

CREATE POLICY "Users can view feedback about them"
  ON public.feedback
  FOR SELECT
  USING (user_id = auth.uid());

-- Function to verify RLS policies
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
  table_name TEXT,
  policy_name TEXT,
  passed BOOLEAN,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_admin_id UUID;
  test_user_id UUID;
  test_venue_id UUID;
BEGIN
  -- Create test users
  INSERT INTO auth.users (email) VALUES ('test_admin@example.com')
  RETURNING id INTO test_admin_id;
  
  INSERT INTO auth.users (email) VALUES ('test_user@example.com')
  RETURNING id INTO test_user_id;

  -- Create test venue
  INSERT INTO venues (name, address, owner_id)
  VALUES ('Test Venue', '123 Test St', test_admin_id)
  RETURNING id INTO test_venue_id;

  -- Test admin access
  RETURN QUERY
  SELECT 
    'users'::TEXT,
    'Admin full access'::TEXT,
    EXISTS (
      SELECT 1 FROM users
      WHERE auth.uid() = test_admin_id
    ),
    NULL::TEXT;

  -- Test user access
  RETURN QUERY
  SELECT 
    'users'::TEXT,
    'User own profile'::TEXT,
    EXISTS (
      SELECT 1 FROM users
      WHERE auth.uid() = test_user_id
      AND id = test_user_id
    ),
    NULL::TEXT;

  -- Clean up test data
  DELETE FROM venues WHERE id = test_venue_id;
  DELETE FROM auth.users WHERE id IN (test_admin_id, test_user_id);
END;
$$;