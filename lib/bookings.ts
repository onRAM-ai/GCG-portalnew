import { supabase } from './supabase';

export interface BookingRequest {
  venue_id: string;
  start_time: Date;
  end_time: Date;
}

export async function createBooking(booking: BookingRequest) {
  try {
    // Check for existing bookings in the time slot
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', booking.venue_id)
      .overlaps('start_time', booking.start_time.toISOString())
      .overlaps('end_time', booking.end_time.toISOString());

    if (checkError) throw checkError;

    if (existingBookings && existingBookings.length > 0) {
      throw new Error('This time slot is already booked');
    }

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        venue_id: booking.venue_id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    if (error.message.includes('no_overlapping_bookings')) {
      throw new Error('You already have a booking during this time slot');
    }
    throw error;
  }
}

export async function getBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venues:venue_id (
        name,
        address
      )
    `)
    .eq('entertainer_id', userId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
}