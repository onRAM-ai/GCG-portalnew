-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Index for efficient querying
  CONSTRAINT idx_rate_limits_key_timestamp UNIQUE (key, timestamp)
);

-- Create user_permissions table for custom permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT unique_user_permission UNIQUE (user_id, permission_id)
);

-- Create session_logs table
CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  logout_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_session UNIQUE (user_id, session_id)
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own session logs"
  ON public.session_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to log session activity
CREATE OR REPLACE FUNCTION log_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.session_logs (
      user_id,
      session_id,
      ip_address,
      user_agent
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.ip::inet,
      NEW.user_agent
    );
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.session_logs
    SET logout_at = NOW()
    WHERE session_id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for session logging
CREATE TRIGGER on_session_change
  AFTER INSERT OR DELETE ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_activity();