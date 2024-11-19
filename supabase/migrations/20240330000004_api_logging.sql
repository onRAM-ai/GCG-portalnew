-- Create API logs table
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers JSONB,
  status INTEGER,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Add index for request_id for faster lookups
  CONSTRAINT idx_api_logs_request_id UNIQUE (request_id)
);

-- Create index on created_at for time-based queries
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at DESC);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view API logs"
  ON api_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM api_logs
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND error IS NULL;

  -- Keep error logs for 90 days
  DELETE FROM api_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND error IS NOT NULL;
END;
$$;

-- Create a scheduled job to clean up logs daily
SELECT cron.schedule(
  'cleanup-api-logs',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT cleanup_old_api_logs()$$
);