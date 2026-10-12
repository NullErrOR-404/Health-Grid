import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeadersAndCors, checkRateLimit, sanitizeInputString, sendSafeError } from '../utils/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applySecurityHeadersAndCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] });
  }

  // Rate Limiting: 12 prescription OCR analyses per minute per IP
  if (!checkRateLimit(req, res, 12, 60_000)) return;

  try {
    const { imageBase64, patientAllergies = [] } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Invalid Payload', message: 'imageBase64 prescription image is required' });
    }

    if (imageBase64.length > 12 * 1024 * 1024) {
      return res.status(413).json({ error: 'PayloadTooLarge', message: 'Prescription document exceeds 10MB limit.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:(image\/[a-z]+|application\/pdf);base64,/, '');

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      return res.status(503).json({ error: 'ServiceUnavailable', message: 'Prescription OCR server credentials not configured.' });
    }

    const ocrPrompt = `You are a clinical pharmacologist and prescription recognition specialist. Analyze this prescription image. 
Extract:
1. Patient name, age, gender (if visible)
2. Prescribing physician and registration number (if visible)
3. Date of prescription
4. Detailed list of prescribed medications:
   - name: exact brand or chemical name
   - genericName: standard Indian Pharmacopoeia active ingredient
   - dosage: mg, ml, or units
   - frequency: e.g. 1-0-1, OD, BD, TDS
   - duration: days or weeks
   - instructions: before food, after food, etc.
5. Known allergy warnings if patient has allergies: [${patientAllergies.join(', ')}]

Respond strictly in valid JSON format matching this schema:
{
  "doctorName": "...",
  "registrationNumber": "...",
  "hospitalName": "...",
  "patientName": "...",
  "date": "...",
  "medicines": [
    {
      "name": "...",
      "genericName": "...",
      "dosage": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "...",
      "scheduleH": false
    }
  ],
  "confidenceScore": 0.95
}`;

    if (geminiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: ocrPrompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
        },
      };

      const ocrRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (ocrRes.ok) {
        const data = await ocrRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        try {
          const parsed = JSON.parse(text);
          return res.status(200).json({ success: true, data: parsed, engine: 'gemini-ocr-server' });
        } catch {
          return res.status(200).json({ success: true, raw: text, engine: 'gemini-ocr-server' });
        }
      }
    }

    sendSafeError(res, 502, 'Upstream OCR recognition provider unavailable.');
  } catch (error) {
    sendSafeError(res, 500, 'Failed to process prescription OCR request.', error);
  }
}
