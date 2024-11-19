import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';
import { ApiError } from '@/lib/api-errors';
import { type AuthenticatedRequest } from '@/lib/api-middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        first_name,
        last_name,
        created_at,
        updated_at
      `);

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Regular users can only view their own profile
    if (req.user.role === 'user') {
      query = query.eq('id', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to fetch users');
  }
}, ['admin', 'venue', 'user']);

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { id, ...updates } = await req.json();

    // Users can only update their own profile
    if (req.user.role === 'user' && id !== req.user.id) {
      throw ApiError.forbidden('You can only update your own profile');
    }

    // Prevent role escalation
    if (updates.role && req.user.role !== 'admin') {
      throw ApiError.forbidden('Only admins can change user roles');
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to update user');
  }
}, ['admin', 'user']);