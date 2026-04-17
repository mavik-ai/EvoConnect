import { NextResponse } from 'next/server';
import { systemLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ logs: systemLogger.getLogs() });
}
