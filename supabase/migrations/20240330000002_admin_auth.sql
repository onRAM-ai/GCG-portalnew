-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create secure password storage function
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;

-- Create admin role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'manager');
  END IF;
END $$;

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_audit_log (
    user_id,
    action,
    details,
    ip_address
  )
  VALUES (
    p_user_id,
    p_action,
    p_details,
    p_ip_address
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to create initial admin user (development only)
CREATE OR REPLACE FUNCTION create_dev_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run in development
  IF current_setting('app.environment', TRUE) != 'development' THEN
    RAISE EXCEPTION 'This function can only be run in development';
  END IF;

  -- Create admin user if it doesn't exist
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    created_at,
    updated_at
  )
  VALUES (
    'admin@example.com',
    hash_password('Admin123!@#'),
    NOW(),
    'authenticated',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Create admin profile
  INSERT INTO public.users (
    auth_id,
    email,
    role,
    access_level,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  SELECT
    id,
    'admin@example.com',
    'admin',
    'level_3',
    'System',
    'Administrator',
    NOW(),
    NOW()
  FROM auth.users
  WHERE email = 'admin@example.com'
  ON CONFLICT (auth_id) DO NOTHING;
END;
$$;