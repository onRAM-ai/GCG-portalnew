-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  auth_user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    created_at,
    updated_at
  )
  VALUES (
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    'authenticated',
    NOW(),
    NOW()
  )
  RETURNING id INTO auth_user_id;

  -- Create user profile
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
  VALUES (
    auth_user_id,
    admin_email,
    'admin',
    'level_3',
    'System',
    'Administrator',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;

  RETURN new_user_id;
END;
$$;