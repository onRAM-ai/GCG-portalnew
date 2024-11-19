CREATE OR REPLACE FUNCTION setup_health_checks()
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
  CREATE POLICY "Admins can manage health checks"
    ON public.health_checks
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Create policy for reading health status
  CREATE POLICY "Anyone can view health status"
    ON public.health_checks
    FOR SELECT
    USING (true);

  -- Create index on last_checked
  CREATE INDEX IF NOT EXISTS idx_health_checks_last_checked
    ON public.health_checks(last_checked DESC);

  -- Clean up old health checks
  CREATE OR REPLACE FUNCTION cleanup_old_health_checks()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  BEGIN
    DELETE FROM public.health_checks
    WHERE last_checked < NOW() - INTERVAL '7 days';
    RETURN NEW;
  END;
  $func$;

  -- Create trigger for cleanup
  DROP TRIGGER IF EXISTS trg_cleanup_health_checks ON public.health_checks;
  CREATE TRIGGER trg_cleanup_health_checks
    AFTER INSERT ON public.health_checks
    EXECUTE FUNCTION cleanup_old_health_checks();
END;
$$;