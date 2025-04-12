import { db } from '../lib/db';

const DEBUG = true;

const debug = (...args: any[]) => {
  if (DEBUG) {
    console.debug('[RateLimiter]', ...args);
  }
};

interface RateLimitRecord {
  limit_type: string;
  request_count: number;
  last_reset: Date;
}

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

  private static async initializeTable() {
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS rate_limits (
        limit_type VARCHAR(10) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        request_count INTEGER DEFAULT 0,
        last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (limit_type, identifier)
      )
    `;
  }

  private static async checkLimit(limitType: string, identifier: string, maxRequests: number, resetHours: number) {
    await DatabaseRateLimiter.initializeTable();

    const now = new Date();
    const result = await db.$queryRaw<RateLimitRecord[]>`
      SELECT request_count, last_reset
      FROM rate_limits
      WHERE limit_type = ${limitType} AND identifier = ${identifier}
    `;

    const record = result[0];
    
    if (!record) {
      await db.$executeRaw`
        INSERT INTO rate_limits (limit_type, identifier, request_count, last_reset)
        VALUES (${limitType}, ${identifier}, 1, ${now})
      `;
      return true;
    }

    const lastReset = new Date(record.last_reset);
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= resetHours) {
      await db.$executeRaw`
        UPDATE rate_limits
        SET request_count = 1, last_reset = ${now}
        WHERE limit_type = ${limitType} AND identifier = ${identifier}
      `;
      return true;
    }

    if (record.request_count >= maxRequests) {
      return false;
    }

    await db.$executeRaw`
      UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE limit_type = ${limitType} AND identifier = ${identifier}
    `;
    return true;
  }

  static async checkHourlyLimit(identifier: string, maxRequests: number = 10) {
    return DatabaseRateLimiter.checkLimit('hourly', identifier, maxRequests, 1);
  }

  static async checkDailyLimit(identifier: string, maxRequests: number = 100) {
    return DatabaseRateLimiter.checkLimit('daily', identifier, maxRequests, 24);
  }

  static async getRemainingRequests(identifier: string) {
    await DatabaseRateLimiter.initializeTable();

    const now = new Date();
    const result = await db.$queryRaw<RateLimitRecord[]>`
      SELECT limit_type, request_count, last_reset
      FROM rate_limits
      WHERE identifier = ${identifier}
    `;

    const hourlyRecord = result.find(r => r.limit_type === 'hourly');
    const dailyRecord = result.find(r => r.limit_type === 'daily');

    const getRemainingForRecord = (record: RateLimitRecord | undefined, maxRequests: number, resetHours: number) => {
      if (!record) return maxRequests;
      
      const lastReset = new Date(record.last_reset);
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= resetHours) return maxRequests;
      return Math.max(0, maxRequests - record.request_count);
    };

    return {
      hourly: getRemainingForRecord(hourlyRecord, 10, 1),
      daily: getRemainingForRecord(dailyRecord, 100, 24)
    };
  }
} 