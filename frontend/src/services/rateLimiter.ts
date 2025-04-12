import { db } from '@/lib/db';
import { sql } from '@vercel/postgres';

const DEBUG = true;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[RateLimiter]', ...args);
  }
};

export class DatabaseRateLimiter {
  private static instance: DatabaseRateLimiter;
  private readonly hourlyLimit = 5;
  private readonly dailyLimit = 1000;
  private readonly hourInMs = 60 * 60 * 1000;
  private readonly dayInMs = 24 * 60 * 60 * 1000;

  private constructor() {
    this.initializeTable().catch(console.error);
  }

  static getInstance(): DatabaseRateLimiter {
    if (!DatabaseRateLimiter.instance) {
      DatabaseRateLimiter.instance = new DatabaseRateLimiter();
    }
    return DatabaseRateLimiter.instance;
  }

  private async initializeTable() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id SERIAL PRIMARY KEY,
          limit_type VARCHAR(50) NOT NULL,
          identifier VARCHAR(255),
          request_count INTEGER DEFAULT 0,
          last_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(limit_type, identifier)
        )
      `;
      debug('Rate limits table initialized');
    } catch (error) {
      console.error('Error initializing rate limits table:', error);
    }
  }

  async checkHourlyLimit(userId: string): Promise<void> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - this.hourInMs);

    // Get or create hourly limit record
    const result = await sql`
      INSERT INTO rate_limits (limit_type, identifier, request_count, last_reset)
      VALUES ('hourly_user', ${userId}, 1, ${now})
      ON CONFLICT (limit_type, identifier)
      DO UPDATE SET
        request_count = CASE
          WHEN rate_limits.last_reset < ${hourAgo}
          THEN 1
          ELSE rate_limits.request_count + 1
        END,
        last_reset = CASE
          WHEN rate_limits.last_reset < ${hourAgo}
          THEN ${now}
          ELSE rate_limits.last_reset
        END
      RETURNING request_count, last_reset
    `;

    const { request_count, last_reset } = result.rows[0];
    debug(`User ${userId} has made ${request_count} requests in the last hour`);

    if (request_count > this.hourlyLimit) {
      const resetTime = new Date(last_reset).getTime() + this.hourInMs;
      const minutesUntilReset = Math.ceil((resetTime - now.getTime()) / (60 * 1000));
      throw new Error(`Rate limit exceeded. Please try again in ${minutesUntilReset} minutes.`);
    }
  }

  async checkDailyLimit(): Promise<void> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Get or create daily limit record
    const result = await sql`
      INSERT INTO rate_limits (limit_type, identifier, request_count, last_reset)
      VALUES ('daily_global', 'global', 1, ${startOfDay})
      ON CONFLICT (limit_type, identifier)
      DO UPDATE SET
        request_count = CASE
          WHEN rate_limits.last_reset < ${startOfDay}
          THEN 1
          ELSE rate_limits.request_count + 1
        END,
        last_reset = CASE
          WHEN rate_limits.last_reset < ${startOfDay}
          THEN ${startOfDay}
          ELSE rate_limits.last_reset
        END
      RETURNING request_count, last_reset
    `;

    const { request_count } = result.rows[0];
    debug(`Global daily requests: ${request_count}/${this.dailyLimit}`);

    if (request_count > this.dailyLimit) {
      const minutesUntilMidnight = Math.ceil(
        (new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()) / (60 * 1000)
      );
      throw new Error(`Daily request limit reached for the website. Please try again in ${minutesUntilMidnight} minutes.`);
    }
  }

  async getRemainingRequests(userId: string): Promise<{ hourly: number; daily: number }> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - this.hourInMs);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Get hourly requests
    const hourlyResult = await sql`
      SELECT request_count, last_reset
      FROM rate_limits
      WHERE limit_type = 'hourly_user'
      AND identifier = ${userId}
    `;

    const hourlyCount = hourlyResult.rows.length > 0 && 
      new Date(hourlyResult.rows[0].last_reset) > hourAgo ? 
      hourlyResult.rows[0].request_count : 0;

    // Get daily requests
    const dailyResult = await sql`
      SELECT request_count, last_reset
      FROM rate_limits
      WHERE limit_type = 'daily_global'
      AND identifier = 'global'
    `;

    const dailyCount = dailyResult.rows.length > 0 && 
      new Date(dailyResult.rows[0].last_reset) > startOfDay ? 
      dailyResult.rows[0].request_count : 0;

    const remaining = {
      hourly: Math.max(0, this.hourlyLimit - hourlyCount),
      daily: Math.max(0, this.dailyLimit - dailyCount)
    };

    debug(`Remaining requests - hourly: ${remaining.hourly}, daily: ${remaining.daily}`);
    return remaining;
  }
} 