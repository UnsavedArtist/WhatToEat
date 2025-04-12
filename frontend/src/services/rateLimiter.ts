export class RateLimiter {
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private readonly maxRequestsPerDay: number;
  private readonly resetIntervalMs: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(maxRequestsPerDay: number = 1000) { // Default to 1000 requests per day
    this.maxRequestsPerDay = maxRequestsPerDay;
  }

  async waitForAvailability(): Promise<void> {
    // Reset counter if 24 hours have passed
    const now = Date.now();
    if (now - this.lastResetTime >= this.resetIntervalMs) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if we've hit the limit
    if (this.requestCount >= this.maxRequestsPerDay) {
      const timeUntilReset = this.resetIntervalMs - (now - this.lastResetTime);
      throw new Error(`API rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / (60 * 60 * 1000))} hours`);
    }

    this.requestCount++;
  }

  getRemainingRequests(): number {
    // Reset counter if 24 hours have passed
    const now = Date.now();
    if (now - this.lastResetTime >= this.resetIntervalMs) {
      this.requestCount = 0;
      this.lastResetTime = now;
      return this.maxRequestsPerDay;
    }

    return Math.max(0, this.maxRequestsPerDay - this.requestCount);
  }
} 