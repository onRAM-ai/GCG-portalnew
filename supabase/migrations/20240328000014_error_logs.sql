-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL CHECK (source IN ('AUTH', 'DATABASE', 'API', 'VALIDATION')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  message TEXT NOT NULL,
  error TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view error logs"
  ON public.error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for timestamp
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp
  ON public.error_logs(timestamp DESC);

-- Create function to clean up old error logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.error_logs
  WHERE timestamp < NOW() - INTERVAL '30 days'
  AND severity NOT IN ('HIGH', 'CRITICAL')
  AND resolved = true;
END;
$$;

-- Create scheduled task to clean up old logs (runs daily)
SELECT cron.schedule(
  'cleanup-error-logs',
  '0 0 * * *',
  $$SELECT cleanup_old_error_logs()$$
);