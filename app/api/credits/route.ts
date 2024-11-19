import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';
import { type AuthenticatedRequest } from '@/lib/api-middleware';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch credits' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { amount, type } = await req.json();

    // Start a transaction
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    // Get current balance
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const currentBalance = credits?.balance || 0;
    const newBalance = type === 'topup' ? currentBalance + amount : currentBalance - amount;

    if (type === 'withdrawal' && newBalance < 0) {
      throw new Error('Insufficient credits');
    }

    // Update balance
    const { error: updateError } = await supabase
      .from('credits')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      });

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount,
        transaction_type: type,
        status: 'completed',
      });

    if (transactionError) throw transactionError;

    return NextResponse.json({ balance: newBalance });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process credits' },
      { status: 500 }
    );
  }
});