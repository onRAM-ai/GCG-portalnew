import { supabase } from './supabase';

interface ApiLog {
  id: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  status?: number;
  error?: string;
  duration?: number;
  timestamp: string;
}

export async function logApiRequest(log: ApiLog) {
  try {
    const { error } = await supabase
      .from('api_logs')
      .insert({
        request_id: log.id,
        method: log.method,
        url: log.url,
        headers: log.headers,
        status: log.status,
        error: log.error,
        duration_ms: log.duration,
        created_at: log.timestamp,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging API request:', error);
  }
}