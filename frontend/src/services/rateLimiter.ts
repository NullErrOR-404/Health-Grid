/**
 * HealthGrid Enterprise Security Rate Limiter & Circuit Breaker
 * 
 * Implements token bucket algorithms and automatic circuit breakers on the client side
 * to prevent API quota exhaustion, automated bot spam, and brute force attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
  consecutiveViolations: number;
  circuitBreakerTrippedUntil: number;
}

class ClientRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private onLimitExceededCallbacks: Array<(key: string, retryAfterSeconds: number) => void> = [];

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
      record = {
        timestamps: [],
        consecutiveViolations: 0,
        circuitBreakerTrippedUntil: 0,
      };
      this.records.set(key, record);
    }

    // Check if circuit breaker is actively tripped
    if (record.circuitBreakerTrippedUntil > now) {
      const waitSeconds = Math.ceil((record.circuitBreakerTrippedUntil - now) / 1000);
      this.emitViolation(key, waitSeconds);
      return {
        allowed: false,
        retryAfterSeconds: waitSeconds,
        remaining: 0,
      };
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      record.consecutiveViolations += 1;

      // If client attempts > 3 bursts while rate limited, trip circuit breaker for 30 seconds
      if (record.consecutiveViolations >= 3) {
        record.circuitBreakerTrippedUntil = now + 30_000;
        const waitSeconds = 30;
        this.emitViolation(key, waitSeconds);
        return {
          allowed: false,
          retryAfterSeconds: waitSeconds,
          remaining: 0,
        };
      }

      const oldestInWindow = record.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      this.emitViolation(key, retryAfterSeconds);
      return {
        allowed: false,
        retryAfterSeconds,
        remaining: 0,
      };
    }

    // Reset violations upon legitimate spaced requests
    if (record.timestamps.length === 0) {
      record.consecutiveViolations = 0;
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: maxRequests - record.timestamps.length,
    };
  }

  public onLimitExceeded(callback: (key: string, retryAfterSeconds: number) => void): () => void {
    this.onLimitExceededCallbacks.push(callback);
    return () => {
      this.onLimitExceededCallbacks = this.onLimitExceededCallbacks.filter((c) => c !== callback);
    };
  }

  private emitViolation(key: string, retryAfterSeconds: number) {
    this.onLimitExceededCallbacks.forEach((cb) => {
      try {
        cb(key, retryAfterSeconds);
      } catch (err) {
        console.error('Error in rate limit callback:', err);
      }
    });
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
  AUTH_SUBMISSION: { maxRequests: 5, windowMs: 300 * 1000 },    // 5 attempts per 5 minutes
  AI_CHAT: { maxRequests: 10, windowMs: 60 * 1000 },            // 10 prompts per minute
  PRESCRIPTION_OCR: { maxRequests: 5, windowMs: 60 * 1000 },    // 5 scans per minute
  CLINICAL_MUTATION: { maxRequests: 20, windowMs: 60 * 1000 },  // 20 state changes per minute
  EMERGENCY_DISPATCH: { maxRequests: 3, windowMs: 60 * 1000 },  // 3 dispatches per minute
  HAZARD_REPORT: { maxRequests: 5, windowMs: 60 * 1000 },        // 5 reports per minute
} as const;
