import { NextResponse } from 'next/server';
import { DatabaseRateLimiter } from '@/services/rateLimiter';

export async function POST(request: Request) {
  try {
    const { action, identifier } = await request.json();

    switch (action) {
      case 'checkHourly':
        const hourlyResult = await DatabaseRateLimiter.checkHourlyLimit(identifier);
        return NextResponse.json({ allowed: hourlyResult });

      case 'checkDaily':
        const dailyResult = await DatabaseRateLimiter.checkDailyLimit(identifier);
        return NextResponse.json({ allowed: dailyResult });

      case 'getRemainingRequests':
        const remaining = await DatabaseRateLimiter.getRemainingRequests(identifier);
        return NextResponse.json(remaining);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 