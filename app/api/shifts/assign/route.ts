import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { shiftId, userId } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user is available
    const { data: available } = await supabase
      .rpc('check_shift_availability', {
        p_shift_id: shiftId,
        p_user_id: userId
      });

    if (!available) {
      return NextResponse.json(
        { error: 'User is not available for this shift' },
        { status: 400 }
      );
    }

    // Create assignment
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

    // Create notification
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: 'SHIFT_CONFIRMATION',
      p_title: 'New Shift Assignment',
      p_message: 'You have been assigned to a new shift',
      p_metadata: { shift_id: shiftId }
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign shift' },
      { status: 500 }
    );
  }
}