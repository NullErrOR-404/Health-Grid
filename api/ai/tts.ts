import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeadersAndCors, checkRateLimit, sanitizeInputString } from '../utils/security';

// In-Memory Audio Cache for instant playback of repeated clinical prompts
const audioCache = new Map<string, { buffer: Buffer; mimeType: string }>();
const MAX_CACHE_ITEMS = 150;

/**
 * Cleans text of markdown syntax, bullet points, citations, and URLs
 * so the voice agent speaks naturally without reading formatting artifacts.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#`~>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[•*\-\d.]+\s+/gm, '')
    .replace(/<[^>]*>/g, '')
    .replace(/Protocol Citation:.*?$/gim, '')
    .replace(/Patient Health Vault #.*?$/gim, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Wraps raw 16-bit PCM little-endian audio in a standard RIFF WAV container header (24kHz, 1 channel).
 */
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Buffer {
  const header = Buffer.alloc(44);

  // "RIFF"
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  // "WAVE"
  header.write('WAVE', 8);
  // "fmt "
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28); // Byte rate
  header.writeUInt16LE(numChannels * 2, 32); // Block align
  header.writeUInt16LE(16, 34); // Bits per sample
  // "data"
  header.write('data', 36);
  header.writeUInt32LE(pcmData.length, 40);

  return Buffer.concat([header, Buffer.from(pcmData)]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applySecurityHeadersAndCors(req, res)) return;

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] });
  }

  // Rate Limiting: 40 voice requests per minute per IP
  if (!checkRateLimit(req, res, 40, 60_000)) return;

  try {
    const rawText = req.method === 'POST' ? req.body?.text : req.query?.text;
    const rawLang = req.method === 'POST' ? req.body?.lang : req.query?.lang;

    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Invalid Payload', message: 'text parameter is required' });
    }

    const cleanText = cleanTextForSpeech(sanitizeInputString(rawText, 1500));
    if (!cleanText) {
      return res.status(400).json({ error: 'Empty Text', message: 'No readable speech text after sanitization' });
    }

    const lang = rawLang === 'ta' ? 'ta' : 'en';
    const cacheKey = `${lang}:${cleanText.slice(0, 100)}`;

    // Check in-memory cache
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.setHeader('X-HealthGrid-Voice-Source', 'memory-cache');
      return res.status(200).send(cached.buffer);
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    const sarvamKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY || '';

    // Universal Humane Voice Engine: Aoede (warm, empathetic female clinician)
    const candidateModels = [
      'gemini-3.8-flash-tts',
      'gemini-3.8-flash-lite-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-flash-preview-tts',
    ];

    let wavBuffer: Buffer | null = null;
    let mimeType = 'audio/wav';

    // Tier 1: Gemini Live Audio Generation
    if (geminiKey) {
      for (const model of candidateModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: cleanText }] }],
                generationConfig: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: 'Aoede',
                      },
                    },
                  },
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const part = data.candidates?.[0]?.content?.parts?.[0];
            const inlineData = part?.inlineData;

            if (inlineData?.data) {
              const rawBytes = Buffer.from(inlineData.data, 'base64');
              const receivedMime = (inlineData.mimeType || '').toLowerCase();

              if (receivedMime.includes('wav')) {
                wavBuffer = rawBytes;
              } else {
                wavBuffer = pcmToWav(new Uint8Array(rawBytes), 24000, 1);
              }
              break;
            }
          }
        } catch (err) {
          console.warn(`[EdgeTTS] Model ${model} failed, attempting fallback:`, err);
        }
      }
    }

    // Tier 2: Sarvam AI Bulbul V3 (India-first vernacular Tamil fallback)
    if (!wavBuffer && sarvamKey && lang === 'ta') {
      try {
        const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'api-subscription-key': sarvamKey.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: [cleanText],
            target_language_code: 'ta-IN',
            speaker: 'meera',
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: 'bulbul:v3',
          }),
        });

        if (sarvamRes.ok) {
          const sData = await sarvamRes.json();
          const base64Audio = sData.audios?.[0];
          if (base64Audio) {
            wavBuffer = Buffer.from(base64Audio, 'base64');
          }
        }
      } catch (err) {
        console.warn('[EdgeTTS] Sarvam fallback failed:', err);
      }
    }

    if (!wavBuffer) {
      // Pure Silent Failure Policy: never synthesize robotic browser voices
      return res.status(503).json({
        error: 'VoiceUnavailable',
        message: 'Humane neural voice streaming temporarily unavailable. Silent fallback applied.',
      });
    }

    // Add to in-memory cache
    if (audioCache.size >= MAX_CACHE_ITEMS) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, { buffer: wavBuffer, mimeType });

    // Respond based on Accept header
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json')) {
      return res.status(200).json({
        audio: wavBuffer.toString('base64'),
        mimeType,
        voice: 'Aoede',
        provider: 'gemini-live-audio',
      });
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', wavBuffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('X-HealthGrid-Voice', 'Aoede-Humane-Universal');
    return res.status(200).send(wavBuffer);
  } catch (error: any) {
    console.error('[EdgeTTS] Fatal handler error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to synthesize humane voice stream.',
    });
  }
}
