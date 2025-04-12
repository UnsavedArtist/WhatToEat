import { NextResponse } from 'next/server';
import { DatabaseRateLimiter } from '@/services/rateLimiter';

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { action, identifier } = await request.json();

    if (!action || !identifier) {
      return NextResponse.json({ error: 'Action and identifier are required' }, { status: 400 });
    }

    console.log(`Rate limit check: ${action} for ${identifier}`);

    try {
      switch (action) {
        case 'checkHourly':
          const hourlyResult = await DatabaseRateLimiter.checkHourlyLimit(identifier);
          console.log(`Hourly check result for ${identifier}:`, hourlyResult);
          return NextResponse.json({ allowed: hourlyResult });

        case 'checkDaily':
          const dailyResult = await DatabaseRateLimiter.checkDailyLimit(identifier);
          console.log(`Daily check result for ${identifier}:`, dailyResult);
          return NextResponse.json({ allowed: dailyResult });

        case 'getRemainingRequests':
          const remaining = await DatabaseRateLimiter.getRemainingRequests(identifier);
          console.log(`Remaining requests for ${identifier}:`, remaining);
          return NextResponse.json(remaining);

        default:
          console.warn(`Invalid action requested: ${action}`);
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (dbError: any) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError?.message || 'Unknown database error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Rate limit error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 