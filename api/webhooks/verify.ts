import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { applySecurityHeadersAndCors, checkRateLimit, sendSafeError } from '../utils/security';

const WEBHOOK_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'healthgrid_webhook_secret_default_change_in_prod';

export function verifyWebhookSignature(payloadRaw: string, signatureHeader: string, timestampHeader: string): boolean {
  if (!signatureHeader || !timestampHeader) return false;

  const timestamp = parseInt(timestampHeader, 10);
  if (isNaN(timestamp)) return false;

  // Replay Attack Protection: Reject timestamps older or newer than 5 minutes (300,000 ms)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 300_000) {
    return false;
  }

  // Calculate HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(`${timestamp}.${payloadRaw}`);
  const expectedSignature = hmac.digest('hex');

  // Timing-safe buffer comparison to prevent timing side-channel attacks
  try {
    const signatureBuffer = Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applySecurityHeadersAndCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] });
  }

  // Rate Limiting: 60 webhook notifications per minute
  if (!checkRateLimit(req, res, 60, 60_000)) return;

  try {
    const signature = (req.headers['x-signature'] || req.headers['x-healthgrid-signature']) as string;
    const timestamp = (req.headers['x-timestamp'] || req.headers['x-healthgrid-timestamp']) as string;
    const rawPayload = JSON.stringify(req.body || {});

    const isValid = verifyWebhookSignature(rawPayload, signature, timestamp);

    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid cryptographic webhook signature or timestamp expired (replay attack defense).',
      });
    }

    // Process authenticated webhook event
    return res.status(200).json({
      success: true,
      verified: true,
      receivedAt: new Date().toISOString(),
      event: req.body?.event || 'generic',
    });
  } catch (error) {
    sendSafeError(res, 500, 'Webhook signature evaluation failed.', error);
  }
}
