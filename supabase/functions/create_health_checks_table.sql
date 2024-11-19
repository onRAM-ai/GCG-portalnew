-- Create health_checks table function
CREATE OR REPLACE FUNCTION create_health_checks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create health_checks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'unhealthy')),
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Enable RLS
  ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

  -- Create policy for admins
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'health_checks' 
      AND policyname = 'Admins can manage health checks'
    ) THEN
      CREATE POLICY "Admins can manage health checks"
        ON public.health_checks
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
          )
        );
    END IF;
  END $$;

  -- Create policy for reading health status
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'health_checks' 
      AND policyname = 'Anyone can view health status'
    ) THEN
      CREATE POLICY "Anyone can view health status"
        ON public.health_checks
        FOR SELECT
        USING (true);
    END IF;
  END $$;

  -- Create index on last_checked
  CREATE INDEX IF NOT EXISTS idx_health_checks_last_checked
    ON public.health_checks(last_checked DESC);

  -- Grant necessary permissions
  GRANT ALL ON public.health_checks TO authenticated;
  GRANT USAGE ON SCHEMA public TO authenticated;
END;
$$;