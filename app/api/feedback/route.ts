import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let query = supabase.from('feedback').select(`
      *,
      venue:venues(name),
      user:profiles(name, email),
      reviewer:profiles(name)
    `);

    if (venueId) query = query.eq('venue_id', venueId);
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const feedbackData = await request.json();

    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        ...feedbackData,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;

    // If "may not return" flag is set, notify admins
    if (feedbackData.mayNotReturn) {
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'MAY_NOT_RETURN',
        p_title: 'Urgent Feedback Review Required',
        p_message: 'A venue has flagged an entertainer as "may not return"',
        p_metadata: { feedback_id: data.id }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}