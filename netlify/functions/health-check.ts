import { Handler } from '@netlify/functions';
import { getSupabaseClient } from '@/lib/supabase/client';

export const handler: Handler = async () => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('health_checks')
      .insert({
        status: 'healthy',
        last_checked: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: data.last_checked,
      }),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}