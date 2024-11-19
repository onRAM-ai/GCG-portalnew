import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/server-auth';
import type { ErrorSource, ErrorSeverity } from '@/lib/error-handler';

interface ErrorLogRequest {
  source: ErrorSource;
  severity: ErrorSeverity;
  message: string;
  error: unknown;
  context?: Record<string, unknown>;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const errorData: ErrorLogRequest = await request.json();

    const { error } = await supabase
      .from('error_logs')
      .insert([{
        source: errorData.source,
        severity: errorData.severity,
        message: errorData.message,
        error: JSON.stringify(errorData.error),
        context: errorData.context,
        timestamp: errorData.timestamp,
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}