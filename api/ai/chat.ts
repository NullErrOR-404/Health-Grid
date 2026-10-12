import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeadersAndCors, checkRateLimit, sanitizeInputString, sendSafeError } from '../utils/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applySecurityHeadersAndCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] });
  }

  // Rate Limiting: 25 requests per minute per IP
  if (!checkRateLimit(req, res, 25, 60_000)) return;

  try {
    const { messages, systemPrompt, temperature = 0.2, maxTokens = 1024, provider = 'groq' } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid Payload', message: 'messages must be a non-empty array' });
    }

    // Input Sanitization
    const sanitizedMessages = messages.slice(-15).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: sanitizeInputString(m.content, 6000),
    }));

    const sanitizedSystem = systemPrompt ? sanitizeInputString(systemPrompt, 8000) : '';

    // Route to server-side provider using server-only environment variables
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (provider === 'groq' && groqKey) {
      const groqPayload = {
        model: 'openai/gpt-oss-120b',
        messages: sanitizedSystem
          ? [{ role: 'system', content: sanitizedSystem }, ...sanitizedMessages]
          : sanitizedMessages,
        temperature: Math.min(Math.max(temperature, 0), 1),
        max_tokens: Math.min(maxTokens, 2048),
      };

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify(groqPayload),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({
          content: text,
          provider: 'groq-lpu',
          model: data.model || 'openai/gpt-oss-120b',
        });
      }
    }

    // Fallback to Gemini Server-Side
    if (geminiKey) {
      const geminiContents = sanitizedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: sanitizedSystem ? { parts: [{ text: sanitizedSystem }] } : undefined,
          generationConfig: {
            temperature: Math.min(Math.max(temperature, 0), 1),
            maxOutputTokens: Math.min(maxTokens, 2048),
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({
          content: text,
          provider: 'gemini-server',
          model: 'gemini-2.5-flash',
        });
      }
    }

    // If no server keys are configured, return helpful sanitized notice
    return res.status(503).json({
      error: 'ServiceUnavailable',
      message: 'Clinical AI gateway server credentials not configured on host environment.',
    });
  } catch (error) {
    sendSafeError(res, 500, 'Failed to complete clinical AI inference request.', error);
  }
}
