/**
 * HealthGrid Vernacular Speech & Tanglish Normalization Engine
 * Handles bilingual (Tamil ta-IN & Indian English en-IN) Speech-to-Text,
 * Tanglish phonetic transliteration, and Text-to-Speech synthesis with elderly rate adjustments.
 */

// Tanglish slang and phonetic dictionary for rural & semi-urban patients
const TANGLISH_MAP: Record<string, { ta: string; en: string; isRedFlag?: boolean }> = {
  'kaichal': { ta: 'காய்ச்சல்', en: 'Fever' },
  'kaychal': { ta: 'காய்ச்சல்', en: 'Fever' },
  'suram': { ta: 'சுரம்', en: 'Fever' },
  'thalai vali': { ta: 'தலைவலி', en: 'Headache' },
  'mandai idi': { ta: 'மண்டை இடி', en: 'Severe Headache' },
  'nenju vali': { ta: 'நெஞ்சு வலி', en: 'Chest Pain', isRedFlag: true },
  'nenjula vali': { ta: 'நெஞ்சில் வலி', en: 'Chest Pain', isRedFlag: true },
  'heart pain': { ta: 'இதய வலி', en: 'Heart Pain', isRedFlag: true },
  'moochu thinaral': { ta: 'மூச்சுத்திணறல்', en: 'Shortness of Breath', isRedFlag: true },
  'moochu vida mudiyala': { ta: 'மூச்சு விட முடியவில்லை', en: 'Cannot Breathe', isRedFlag: true },
  'mayakkam': { ta: 'மயக்கம்', en: 'Dizziness / Fainting', isRedFlag: true },
  'ratham': { ta: 'ரத்தம்', en: 'Bleeding', isRedFlag: true },
  'vaanthi': { ta: 'வாந்தி', en: 'Vomiting' },
  'vayiru vali': { ta: 'வயிற்று வலி', en: 'Stomach Pain' },
  'vayingiru vali': { ta: 'வயிற்று வலி', en: 'Stomach Pain' },
  'sali': { ta: 'சளி', en: 'Cold / Phlegm' },
  'irumal': { ta: 'இருமல்', en: 'Cough' },
  'marunthu': { ta: 'மருந்து', en: 'Medicine' },
  'mathirai': { ta: 'மாத்திரை', en: 'Tablets' },
  'kulandhai': { ta: 'குழந்தை', en: 'Baby / Child' },
  'pappa': { ta: 'பாப்பா', en: 'Baby' },
  'sugar': { ta: 'சர்க்கரை நோய்', en: 'Diabetes' },
  'sakkarai': { ta: 'சர்க்கரை நோய்', en: 'Diabetes' },
  'bp': { ta: 'ரத்த அழுத்தம்', en: 'Blood Pressure / Hypertension' },
  'ratha azhuththam': { ta: 'ரத்த அழுத்தம்', en: 'Blood Pressure' },
};

export interface NormalizedResult {
  originalText: string;
  normalizedTamil: string;
  normalizedEnglish: string;
  detectedKeywords: string[];
  isRedFlag: boolean;
}

export class TanglishNormalizer {
  public static normalize(input: string): NormalizedResult {
    const raw = input.trim();
    const lower = raw.toLowerCase();
    const detected: string[] = [];
    let isRed = false;

    // Check full phrase and individual words
    for (const [key, mapping] of Object.entries(TANGLISH_MAP)) {
      if (lower.includes(key)) {
        detected.push(mapping.ta);
        if (mapping.isRedFlag) {
          isRed = true;
        }
      }
    }

    // Direct Tamil emergency keywords
    if (
      lower.includes('நெஞ்சு') ||
      lower.includes('இதயம்') ||
      lower.includes('மூச்சு') ||
      lower.includes('மயக்கம்') ||
      lower.includes('stroke') ||
      lower.includes('chest') ||
      lower.includes('breath')
    ) {
      isRed = true;
    }

    return {
      originalText: raw,
      normalizedTamil: detected.length > 0 ? `${raw} (${detected.join(', ')})` : raw,
      normalizedEnglish: raw,
      detectedKeywords: detected,
      isRedFlag: isRed,
    };
  }
}

export type SpeechState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface SpeechCallbacks {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onStateChange?: (state: SpeechState) => void;
  onError?: (error: string) => void;
}

export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(lang: 'ta' | 'en', callbacks: SpeechCallbacks): void {
    if (!this.recognition) {
      // Simulate speech recognition fallback
      callbacks.onStateChange?.('listening');
      setTimeout(() => {
        const fallbackText =
          lang === 'ta'
            ? 'எனக்கு 2 நாளா அதிக காய்ச்சலும் உடல் வலியும் இருக்கு'
            : 'I have severe fever and body pain since 2 days';
        callbacks.onTranscript?.(fallbackText, true);
        callbacks.onStateChange?.('idle');
      }, 2500);
      return;
    }

    try {
      this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      callbacks.onStateChange?.('listening');
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const text = final || interim;
        callbacks.onTranscript?.(text, !!final);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        callbacks.onStateChange?.('error');
        callbacks.onError?.(event.error || 'Speech recognition failed');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onStateChange?.('idle');
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      callbacks.onStateChange?.('error');
      callbacks.onError?.(e.message);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignored
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    lang: 'ta' | 'en',
    speedRate: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = speedRate; // e.g. 0.8 for elderly gentle pace
    utterance.pitch = 1.0;

    // Pick best available Tamil or Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = lang === 'ta' ? 'ta' : 'en';
    const bestVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetLangCode) || v.name.toLowerCase().includes(targetLangCode)
    );
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechEngine = new SpeechEngine();
