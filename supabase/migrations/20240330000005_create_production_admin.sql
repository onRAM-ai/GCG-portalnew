-- Create production admin user
DO $$ 
DECLARE
  v_user_id UUID;
BEGIN
  -- Create auth user if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('Admin123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  -- Create admin profile
  INSERT INTO public.users (
    auth_id,
    email,
    role,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'admin@example.com',
    'admin',
    'System',
    'Administrator',
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO NOTHING;

  -- Grant necessary permissions
  PERFORM set_claim(v_user_id, 'role', 'admin');
END $$;