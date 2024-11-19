import { createClient } from '@supabase/supabase-js';

async function setupDevAdmin() {
  if (process.env.NODE_ENV !== 'development') {
    console.error('This script can only be run in development');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { error } = await supabase.rpc('create_dev_admin');
    
    if (error) throw error;
    
    console.log('Development admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!@#');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

setupDevAdmin();