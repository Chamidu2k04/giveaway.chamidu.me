import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory sliding window fallback rate limiter
// Ensures the application remains fast and operational even during sudden 10k spikes
// or if Upstash Redis free tier daily quota (10k requests) is exhausted.
class MemoryRateLimiter {
  private records = new Map<string, { count: number; expiresAt: number }>();

  limit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.records.get(key);

    // Garbage collect periodically to avoid memory growth in serverless warm containers
    if (this.records.size > 5000) {
      for (const [k, v] of this.records.entries()) {
        if (v.expiresAt < now) this.records.delete(k);
      }
    }

    if (!record || record.expiresAt < now) {
      this.records.set(key, { count: 1, expiresAt: now + windowMs });
      return {
        success: true,
        remaining: maxRequests - 1,
        reset: Math.ceil((now + windowMs) / 1000),
      };
    }

    if (record.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: Math.ceil(record.expiresAt / 1000),
      };
    }

    record.count += 1;
    return {
      success: true,
      remaining: maxRequests - record.count,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

let upstashEntryLimiter: Ratelimit | null = null;
let upstashLoginLimiter: Ratelimit | null = null;
let initialized = false;

function getUpstashLimiter() {
  if (initialized) return { entry: upstashEntryLimiter, login: upstashLoginLimiter };
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstashEntryLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        analytics: true,
        prefix: "giveaway:entry",
      });
      upstashLoginLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "admin:login",
      });
    } catch (e) {
      console.warn("[RateLimit] Failed to initialize Upstash Redis client; will use in-memory fallback:", e);
    }
  }

  return { entry: upstashEntryLimiter, login: upstashLoginLimiter };
}

export async function checkEntryRateLimit(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { entry } = getUpstashLimiter();
  if (entry) {
    try {
      const res = await entry.limit(ip);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (error) {
      console.warn("[RateLimit] Upstash entry limit error (falling back to memory limiter):", error);
    }
  }

  // Graceful in-memory fallback: 5 submissions per IP per hour
  const res = memoryLimiter.limit(`entry:${ip}`, 5, 3600000);
  return {
    success: res.success,
    limit: 5,
    remaining: res.remaining,
    reset: res.reset,
  };
}

export async function checkLoginRateLimit(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { login } = getUpstashLimiter();
  if (login) {
    try {
      const res = await login.limit(ip);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (error) {
      console.warn("[RateLimit] Upstash login limit error (falling back to memory limiter):", error);
    }
  }

  // Graceful in-memory fallback: 5 attempts per IP per 15 minutes
  const res = memoryLimiter.limit(`login:${ip}`, 5, 900000);
  return {
    success: res.success,
    limit: 5,
    remaining: res.remaining,
    reset: res.reset,
  };
}
