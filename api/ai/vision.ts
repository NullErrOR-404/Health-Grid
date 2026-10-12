import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeadersAndCors, checkRateLimit, sanitizeInputString, sendSafeError } from '../utils/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applySecurityHeadersAndCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] });
  }

  // Rate Limiting: 15 vision analyses per minute per IP
  if (!checkRateLimit(req, res, 15, 60_000)) return;

  try {
    const { imageBase64, prompt, mimeType = 'image/jpeg' } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Invalid Payload', message: 'imageBase64 is required' });
    }

    // Security: Limit base64 payload size to ~12MB (representing ~9MB file)
    if (imageBase64.length > 12 * 1024 * 1024) {
      return res.status(413).json({ error: 'PayloadTooLarge', message: 'Image base64 exceeds maximum size limit (10MB)' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const sanitizedPrompt = sanitizeInputString(prompt || 'Analyze clinical symptoms or physical signs objectively.', 2000);

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(503).json({ error: 'ServiceUnavailable', message: 'Vision AI server credentials not configured.' });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: sanitizedPrompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    };

    const visionRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      return sendSafeError(res, visionRes.status, 'Vision analysis API error', errText);
    }

    const data = await visionRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      analysis: text,
      model: 'gemini-2.5-flash-server',
    });
  } catch (error) {
    sendSafeError(res, 500, 'Failed to process clinical vision request.', error);
  }
}
