import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { env } from '@/env';

// This endpoint should only be available in development
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { data, error } = await supabase.rpc('create_admin_user', {
      admin_email: 'admin@example.com',
      admin_password: 'Admin123!@#', // Change this in production
    });

    if (error) throw error;

    return NextResponse.json({
      message: 'Admin user created successfully',
      userId: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    );
  }
}