import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';
import { ApiError } from '@/lib/api-errors';
import { type AuthenticatedRequest } from '@/lib/api-middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = supabase
      .from('shifts')
      .select(`
        *,
        venue:venues (
          name,
          address
        )
      `);

    if (date) {
      query = query.eq('date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Filter based on user role
    if (req.user.role === 'venue') {
      query = query.eq('venue_id', req.user.id);
    } else if (req.user.role === 'user') {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to fetch shifts');
  }
}, ['admin', 'venue', 'user']);

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const shiftData = await req.json();

    // Validate required fields
    if (!shiftData.start_time || !shiftData.end_time || !shiftData.venue_id) {
      throw ApiError.badRequest('Missing required fields');
    }

    // Ensure venue exists and user has permission
    if (req.user.role === 'venue') {
      const { data: venue } = await supabase
        .from('venues')
        .select('id')
        .eq('id', shiftData.venue_id)
        .eq('owner_id', req.user.id)
        .single();

      if (!venue) {
        throw ApiError.forbidden('You do not have permission to create shifts for this venue');
      }
    }

    const { data, error } = await supabase
      .from('shifts')
      .insert([{
        ...shiftData,
        created_by: req.user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to create shift');
  }
}, ['admin', 'venue']);