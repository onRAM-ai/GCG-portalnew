import { supabase } from '@/lib/supabase';
import { type Shift, type ShiftAssignment } from '@/types/shifts';

export async function createShift(shiftData: Omit<Shift, 'id'>) {
  const { data, error } = await supabase
    .from('shifts')
    .insert([shiftData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getShifts(filters?: {
  venueId?: string;
  status?: string;
  date?: string;
}) {
  let query = supabase.from('shifts').select(`
    *,
    venue:venues(name)
  `);

  if (filters?.venueId) {
    query = query.eq('venue_id', filters.venueId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.date) {
    query = query.eq('date', filters.date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function assignShift(shiftId: string, userId: string) {
  // Check availability first
  const { data: available } = await supabase
    .rpc('check_shift_availability', {
      p_shift_id: shiftId,
      p_user_id: userId
    });

  if (!available) {
    throw new Error('User is not available for this shift');
  }

  const { data, error } = await supabase
    .from('shift_assignments')
    .insert([{
      shift_id: shiftId,
      user_id: userId,
      status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateShiftStatus(
  shiftId: string,
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED'
) {
  const { data, error } = await supabase
    .from('shifts')
    .update({ status })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getShiftAssignments(shiftId: string) {
  const { data, error } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      user:profiles(name, email)
    `)
    .eq('shift_id', shiftId);

  if (error) throw error;
  return data;
}

export async function getUserShifts(userId: string) {
  const { data, error } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      shift:shifts(*),
      venue:shifts(venue:venues(name))
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}