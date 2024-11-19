import { NextResponse } from 'next/server';
import { setupDatabase } from '@/lib/database-setup';

export async function GET() {
  try {
    await setupDatabase();
    return NextResponse.json({ message: 'Database setup completed successfully' });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set up database' },
      { status: 500 }
    );
  }
}