import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';
import { type AuthenticatedRequest } from '@/lib/api-middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        emergency_contacts (*),
        certificates (*),
        location_preferences (*),
        notification_settings (*),
        availability_preferences (*)
      `)
      .eq('auth_id', req.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const updates = await req.json();

    // Update main profile
    const { error: profileError } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_id', req.user.id);

    if (profileError) throw profileError;

    // Update related tables if data is provided
    if (updates.emergency_contacts) {
      const { error: emergencyError } = await supabase
        .from('emergency_contacts')
        .upsert(updates.emergency_contacts.map((contact: any) => ({
          ...contact,
          user_id: req.user.id,
        })));

      if (emergencyError) throw emergencyError;
    }

    if (updates.location_preferences) {
      const { error: locationError } = await supabase
        .from('location_preferences')
        .upsert(updates.location_preferences.map((pref: any) => ({
          ...pref,
          user_id: req.user.id,
        })));

      if (locationError) throw locationError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
});