/**
 * HealthGrid Enterprise Security Rate Limiter
 * Implements sliding-window token bucket algorithms on the client side
 * to prevent API quota exhaustion, DoS attempts, and automated spamming.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class ClientRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Checks if an action is permitted within a sliding window.
   * @param key Unique key for the action (e.g. 'ai_chat', 'ocr_scan')
   * @param maxRequests Maximum allowed requests within the window
   * @param windowMs Window duration in milliseconds
   */
  public checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      return {
        allowed: false,
        retryAfterSeconds,
        remaining: 0,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: maxRequests - record.timestamps.length,
    };
  }

  /**
   * Reset limits for a specific key or all keys
   */
  public reset(key?: string): void {
    if (key) {
      this.records.delete(key);
    } else {
      this.records.clear();
    }
  }
}

export const rateLimiter = new ClientRateLimiter();

// Pre-configured rate limits for HealthGrid features
export const RATE_LIMIT_CONFIGS = {
  AI_CHAT: { maxRequests: 10, windowMs: 60 * 1000 },       // 10 prompts per minute
  PRESCRIPTION_OCR: { maxRequests: 5, windowMs: 60 * 1000 },// 5 scans per minute
  EMERGENCY_DISPATCH: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 dispatches per minute
  HAZARD_REPORT: { maxRequests: 5, windowMs: 60 * 1000 },   // 5 reports per minute
} as const;
