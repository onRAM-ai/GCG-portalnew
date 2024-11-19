-- Create error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  stack TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage error logs"
  ON public.error_logs
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to analyze error patterns
CREATE OR REPLACE FUNCTION analyze_error_patterns(
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
) RETURNS TABLE (
  error_message TEXT,
  occurrence_count BIGINT,
  severity TEXT,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.message,
    COUNT(*) as occurrence_count,
    e.severity,
    MIN(e.created_at) as first_seen,
    MAX(e.created_at) as last_seen
  FROM error_logs e
  WHERE e.created_at >= NOW() - p_time_window
  GROUP BY e.message, e.severity
  ORDER BY occurrence_count DESC, last_seen DESC;
END;
$$;