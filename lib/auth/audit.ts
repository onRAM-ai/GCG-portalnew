import { createServerSupabaseClient } from '@/lib/supabase/server';

interface AuditLogEntry {
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export async function logAuditEvent(entry: AuditLogEntry) {
  const supabase = createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const supabase = createServerSupabaseClient();

  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}