import { supabase } from '@/lib/supabase';
import { type Feedback, type FeedbackStats } from '@/types/feedback';

export async function submitFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'status'>) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{
      ...feedbackData,
      status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFeedback(filters?: {
  venueId?: string;
  userId?: string;
  status?: string;
}) {
  let query = supabase.from('feedback').select(`
    *,
    venue:venues(name),
    user:profiles(name, email),
    reviewer:profiles(name)
  `);

  if (filters?.venueId) {
    query = query.eq('venue_id', filters.venueId);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: 'REVIEWED' | 'RESOLVED',
  reviewNotes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('feedback')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes
    })
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFeedbackStats(userId: string): Promise<FeedbackStats> {
  const { data, error } = await supabase
    .rpc('get_feedback_stats', {
      p_user_id: userId
    });

  if (error) throw error;
  return {
    averageRating: data.average_rating || 0,
    totalFeedback: data.total_feedback || 0,
    mayNotReturnCount: data.may_not_return_count || 0,
    pendingReviewCount: data.pending_review_count || 0
  };
}