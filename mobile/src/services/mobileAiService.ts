const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface MobileChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  options?: string[];
  isEmergency?: boolean;
}

export function sanitizeClinicalText(text: string): string {
  // Strip markdown asterisks, bold/italic markers per HealthGrid zero-asterisk standard
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .trim();
}

export function extractOptions(text: string): { cleanText: string; options: string[] } {
  const optionsMatch = text.match(/<<<OPTIONS>>>([\s\S]*?)<<<END_OPTIONS>>>/);
  if (!optionsMatch) {
    return { cleanText: text, options: [] };
  }

  const cleanText = text.replace(/<<<OPTIONS>>>[\s\S]*?<<<END_OPTIONS>>>/, '').trim();
  const rawOptions = optionsMatch[1]
    .split('\n')
    .map((o) => o.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter((o) => o.length > 0 && o.length < 50);

  return { cleanText, options: rawOptions };
}

export async function askDocBot(
  prompt: string,
  history: MobileChatMessage[] = []
): Promise<{ text: string; options: string[]; isEmergency: boolean }> {
  const isEmergencyQuery = /chest pain|heart attack|stroke|breathing difficulty|severe bleeding|unconscious/i.test(
    prompt
  );

  const systemPrompt = `You are DocBot, HealthGrid's 24/7 AI Family Doctor.
You provide compassionate, clinically grounded triage in plain conversational language.
RULES:
1. STRICT ZERO-ASTERISK POLICY: NEVER use bold (**text**) or italic (*text*) formatting.
2. Bedside Empathy: Acknowledge discomfort warmly.
3. Diagnostic Gating: Ask 1-2 focused questions to understand symptoms better before concluding.
4. Always provide 2-3 short interactive choosing chips at the end wrapped in:
<<<OPTIONS>>>
Option 1
Option 2
<<<END_OPTIONS>>>
5. If acute emergency, advise immediate 108 ambulance dispatch.`;

  try {
    if (GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-6).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 450,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const { cleanText, options } = extractOptions(rawContent);
        return {
          text: sanitizeClinicalText(cleanText),
          options,
          isEmergency: isEmergencyQuery,
        };
      }
    }
  } catch (err) {
    console.warn('[mobileAiService] Groq failed, checking fallback:', err);
  }

  // Graceful Offline / Fallback Clinical Bedside response
  const sanitized = sanitizeClinicalText(
    isEmergencyQuery
      ? "I hear your concern. Severe symptoms like this require emergency medical evaluation right away. Please tap 108 Emergency below to dispatch help or proceed to the nearest casualty hospital."
      : "Thank you for sharing your symptoms. I am here to help you understand what might be causing this and guide your care. How long have you been feeling this way?"
  );

  return {
    text: sanitized,
    options: isEmergencyQuery
      ? ['Call 108 Ambulance', 'Find Casualty Hospital', 'Check Vitals']
      : ['Started today', '2 to 3 days', 'More than a week'],
    isEmergency: isEmergencyQuery,
  };
}
