import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const venueId = searchParams.get('venueId');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let query = supabase.from('documents').select(`
      *,
      venue:venues(name),
      creator:profiles(name)
    `);

    if (type) query = query.eq('type', type);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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

    const documentData = await request.json();

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...documentData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Notify relevant users
    if (documentData.venueId) {
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'DOCUMENT_SHARED',
        p_title: 'New Document Available',
        p_message: `A new document "${documentData.title}" has been shared`,
        p_metadata: { document_id: data.id }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}