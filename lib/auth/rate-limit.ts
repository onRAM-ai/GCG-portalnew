import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RateLimitConfig {
  key: string;
  limit: number;
  window: number; // in seconds
}

export async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.window * 1000);

  try {
    // Count attempts within window
    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact' })
      .eq('key', config.key)
      .gte('timestamp', windowStart.toISOString());

    if (error) throw error;

    // Check if limit exceeded
    if (count >= config.limit) {
      return false;
    }

    // Log attempt
    await supabase
      .from('rate_limits')
      .insert({
        key: config.key,
        timestamp: now.toISOString(),
      });

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open to prevent blocking legitimate requests
    return true;
  }
}