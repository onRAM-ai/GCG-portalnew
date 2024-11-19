import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/health';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();

    return NextResponse.json({
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      lastChecked: health.lastChecked,
      error: health.error
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}