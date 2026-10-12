import type { VercelRequest, VercelResponse } from '@vercel/node';

// Whitelisted origins for strict CORS
const ALLOWED_ORIGINS = [
  'https://healthgrid-app.vercel.app',
  'https://healthgrid-nu.vercel.app',
  'https://healthgrid-live.vercel.app',
  'https://healthgrid-network.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// In-Memory Sliding-Window Rate Limiter per Client IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function applySecurityHeadersAndCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || '';
  
  if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://healthgrid-app.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-HealthGrid-Client, X-Signature, X-Timestamp');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OWASP Defense-in-Depth Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false; // Handled preflight
  }
  return true;
}

export function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  maxRequests = 30,
  windowMs = 60_000
): boolean {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown-client';
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for clinical API endpoint. Please wait before retrying.',
      retryAfterSeconds: retryAfter,
    });
    return false;
  }

  record.count += 1;
  return true;
}

export function sanitizeInputString(input: unknown, maxLen = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    .slice(0, maxLen)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script injection
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Strip control chars
    .trim();
}

export function sendSafeError(res: VercelResponse, statusCode: number, message: string, error?: unknown) {
  const errorRef = `SEC-ERR-${Date.now().toString(36).toUpperCase()}`;
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${errorRef}] Internal Error:`, error);
  }
  res.status(statusCode).json({
    error: 'SecuritySafeError',
    reference: errorRef,
    message,
    timestamp: new Date().toISOString(),
  });
}
