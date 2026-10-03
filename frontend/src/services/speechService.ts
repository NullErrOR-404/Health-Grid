/**
 * HealthGrid Vernacular Speech & Tanglish Normalization Engine
 * Handles bilingual (Tamil ta-IN & Indian English en-IN) Speech-to-Text,
 * Tanglish phonetic transliteration, and Next-Gen Human AI Speech Synthesis
 * powered by Google Gemini Live Audio (Aoede / Charon) & Sarvam AI (Bulbul V3).
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
  'udambu soodu': { ta: 'உடம்பு சூடு', en: 'Feverish Body Heat' },
  'udambu vali': { ta: 'உடம்பு வலி', en: 'Body Ache' },
  'kai kaal vali': { ta: 'கை கால் வலி', en: 'Limb Pain' },
  'kai kaal kodaichal': { ta: 'கை கால் குடைச்சல்', en: 'Joint & Muscle Ache' },
  'asathi': { ta: 'அசதி', en: 'Fatigue / Weakness' },
  'vayiru perattuthu': { ta: 'குமட்டல்', en: 'Nausea' },
  'kumattal': { ta: 'குமட்டல்', en: 'Nausea' },
  'nenjerichal': { ta: 'நெஞ்செரிச்சல்', en: 'Heartburn / Acidity' },
  'thondai vali': { ta: 'தொண்டை வலி', en: 'Sore Throat' },
  'thondai kattu': { ta: 'தொண்டைக்கட்டு', en: 'Throat Congestion' },
  'mootu vali': { ta: 'மூட்டு வலி', en: 'Joint / Knee Pain' },
  'nadukkam': { ta: 'நடுக்கம்', en: 'Chills / Shivering' },
  'kuliru': { ta: 'குளிர்', en: 'Chills' },
  'paduthuthey': { ta: 'அசதி / பலவீனம்', en: 'Debilitating / Suffering' },
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
export type VoiceEngineType = 'gemini-live' | 'sarvam-ai' | 'browser-tts';
export type DoctorPersona = 'meera' | 'arvind'; // meera = warm female doctor, arvind = calm male physician

export interface VoiceSettings {
  engine: VoiceEngineType;
  persona: DoctorPersona;
  sarvamApiKey: string;
  speedRate: number; // 1.1 brisk natural conversational pace
  streamingQueue: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  engine: 'browser-tts',
  persona: 'meera',
  sarvamApiKey: '',
  speedRate: 1.1,
  streamingQueue: false,
};

/**
 * Strips markdown symbols, asterisks, URLs, headers, and bullet markers
 * so text-to-speech sounds like a warm, natural human doctor.
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/[*_#`~>]/g, '') // strip markdown asterisks/formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // keep link label only
    .replace(/^[•*\-\d.]+\s+/gm, '') // remove bullet points
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SpeechCallbacks {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onStateChange?: (state: SpeechState) => void;
  onError?: (error: string) => void;
}

// Convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Wraps raw 16-bit PCM little-endian audio in a standard RIFF WAV container header
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // "RIFF"
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + pcmData.length, true);
  // "WAVE"
  view.setUint32(8, 0x57415645, false);
  // "fmt "
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  // "data"
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, pcmData.length, true);

  const wavBytes = new Uint8Array(44 + pcmData.length);
  wavBytes.set(new Uint8Array(header), 0);
  wavBytes.set(pcmData, 44);
  return wavBytes.buffer;
}

// Split long clinical text into manageable sentence chunks for sub-second streaming speech
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Strip markdown formatting symbols and clinical citations that shouldn't be read out verbatim
  const cleaned = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/Protocol Citation:.*?$/gim, '')
    .replace(/Patient Health Vault #.*?$/gim, '')
    .trim();

  // Split on sentence terminals while keeping decimal points intact (e.g. 98.6°F)
  const rawSentences = cleaned.split(/(?<=[.!?\n])\s+/);
  const result: string[] = [];
  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (trimmed.length > 1) {
      result.push(trimmed);
    }
  }
  return result.length > 0 ? result : [cleaned];
}

export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private activeCallbacks: SpeechCallbacks | null = null;
  private currentListeningLang: 'ta' | 'en' = 'ta';
  private voiceSettings: VoiceSettings = DEFAULT_VOICE_SETTINGS;
  private settingsListeners: Array<(s: VoiceSettings) => void> = [];

  // Active audio playback state
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private abortController: AbortController | null = null;
  private isSpeaking = false;
  private sentenceQueue: string[] = [];
  private currentLang: 'ta' | 'en' = 'ta';
  private currentSpeedRate: number = 0.85;
  private onSpeakingStart?: () => void;
  private onSpeakingEnd?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load persisted settings
      try {
        const saved = localStorage.getItem('healthgrid_voice_settings');
        if (saved) {
          this.voiceSettings = { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
        }
      } catch (e) {
        // fallback
      }
    }
  }

  public getVoiceSettings(): VoiceSettings {
    return { ...this.voiceSettings };
  }

  public updateVoiceSettings(partial: Partial<VoiceSettings>): void {
    this.voiceSettings = { ...this.voiceSettings, ...partial };
    try {
      localStorage.setItem('healthgrid_voice_settings', JSON.stringify(this.voiceSettings));
    } catch (e) {
      // Ignored
    }
    this.settingsListeners.forEach((fn) => fn(this.getVoiceSettings()));
  }

  public subscribeSettings(fn: (s: VoiceSettings) => void): () => void {
    this.settingsListeners.push(fn);
    return () => {
      this.settingsListeners = this.settingsListeners.filter((l) => l !== fn);
    };
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      navigator.mediaDevices?.getUserMedia
    );
  }

  /**
   * Transcribe captured microphone audio via Groq Whisper AI (sub-400ms SOTA model)
   */
  public async transcribeAudioWithGroqWhisper(audioBlob: Blob, lang: 'ta' | 'en'): Promise<string> {
    const groqKey = (import.meta as any).env.VITE_GROQ_API_KEY || '';
    if (!groqKey) {
      throw new Error('Groq API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'speech_input.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    if (lang === 'ta') {
      formData.append('language', 'ta');
    }
    formData.append(
      'prompt',
      'Clinical medical symptoms in Tamil, Tanglish, and English: kaichal, thala vali, mandai idi, fever, headache, nenju vali, stomach pain, tablet, marunthu, udambu soodu, sali, irumal, nenjerichal, asathi'
    );

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq Whisper error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return (data.text || '').trim();
  }

  private latestTranscript: string = '';

  /**
   * Hybrid Ultra-Fast Speech Recognition (Real-Time Live Typing + SOTA Whisper Polish):
   * 1. Starts MediaRecorder to capture pristine background audio for Whisper Large-v3-Turbo.
   * 2. Simultaneously activates Web Speech API for 0ms instantaneous live interim word streaming.
   * 3. Upon stopping, Groq Whisper AI instantly refines any medical terms or Tanglish dialect with SOTA accuracy.
   */
  public async startListening(lang: 'ta' | 'en', callbacks: SpeechCallbacks): Promise<void> {
    this.stopSpeaking();

    // Stop any existing session cleanly
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
      this.recognition = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // Ignored
      }
      this.mediaRecorder = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.currentListeningLang = lang;
    this.activeCallbacks = callbacks;
    this.latestTranscript = '';
    this.audioChunks = [];

    // Pre-flight permission check when supported
    if (typeof navigator !== 'undefined' && (navigator as any).permissions?.query) {
      try {
        const permStatus = await (navigator as any).permissions.query({ name: 'microphone' });
        if (permStatus?.state === 'denied') {
          callbacks.onError?.(
            lang === 'en'
              ? 'Microphone is blocked in your browser settings. Tap the 🔒 lock icon in the address bar ➔ Site Settings ➔ Allow Microphone.'
              : 'உலாவியில் மைக்ரோஃபோன் தடுக்கப்பட்டுள்ளது. முகவரிப் பட்டியில் உள்ள 🔒 பூட்டைத் தட்டி அனுமதிக்கவும்.'
          );
          callbacks.onStateChange?.('error');
          return;
        }
      } catch {
        // Permissions query not supported for microphone on this platform, proceed
      }
    }

    // 1. Acquire microphone stream for Whisper audio recording
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (typeof MediaRecorder !== 'undefined') {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';
          const mr = new MediaRecorder(this.mediaStream, { mimeType });
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          mr.start(250);
          this.mediaRecorder = mr;
        }
      }
    } catch (permErr: any) {
      console.warn('Microphone stream access error:', permErr);
      if (permErr?.name === 'NotAllowedError') {
        callbacks.onError?.(
          lang === 'en'
            ? 'Microphone is blocked in your browser settings. Tap the 🔒 lock icon in the address bar ➔ Site Settings ➔ Allow Microphone.'
            : 'உலாவியில் மைக்ரோஃபோன் தடுக்கப்பட்டது. முகவரிப் பட்டியில் உள்ள 🔒 பூட்டைத் தட்டி அனுமதிக்கவும்.'
        );
        callbacks.onStateChange?.('error');
        return;
      }
    }

    this.isListening = true;
    callbacks.onStateChange?.('listening');

    // 2. Concurrently start Web Speech API for 0ms sub-second live word streaming
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

        rec.onresult = (event: any) => {
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

          const text = (final || interim).trim();
          if (text) {
            this.latestTranscript = text;
            callbacks.onTranscript?.(text, false);
          }
        };

        rec.onerror = (event: any) => {
          console.warn('Web Speech streaming note (Whisper recorder active):', event.error);
        };

        rec.onend = () => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (err) {
              // Already active or stopped
            }
          }
        };

        this.recognition = rec;
        try {
          rec.start();
        } catch {
          // Handled via Whisper recording
        }
      } catch (recErr: any) {
        console.warn('Web Speech start notice, relying on Whisper recorder:', recErr);
      }
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isListening && !this.mediaRecorder) return;
    this.isListening = false;

    // Terminate Web Speech recognition safely
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.stop();
        this.recognition = null;
      } catch (err) {
        // Ignored
      }
    }

    // Stop MediaRecorder and grab pristine buffered audio
    let recordedBlob: Blob | null = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!this.mediaRecorder) return resolve();
          this.mediaRecorder.onstop = () => resolve();
          this.mediaRecorder.stop();
        });
        if (this.audioChunks.length > 0) {
          recordedBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        }
      } catch (e) {
        console.warn('Error stopping mediaRecorder:', e);
      }
      this.mediaRecorder = null;
    }

    // Release microphone tracks immediately
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    const callbacks = this.activeCallbacks;
    const lang = this.currentListeningLang;
    this.activeCallbacks = null;

    // SOTA Whisper Polish: Instantly refine transcript with Whisper Large-v3-Turbo
    if (recordedBlob && recordedBlob.size > 800) {
      try {
        callbacks?.onStateChange?.('processing');
        const whisperText = await this.transcribeAudioWithGroqWhisper(recordedBlob, lang);
        if (whisperText && whisperText.trim()) {
          this.latestTranscript = whisperText.trim();
          callbacks?.onTranscript?.(whisperText.trim(), true);
        } else if (this.latestTranscript) {
          callbacks?.onTranscript?.(this.latestTranscript, true);
        }
      } catch (wErr: any) {
        console.warn('Groq Whisper polish notice, preserving live transcript:', wErr);
        if (this.latestTranscript) {
          callbacks?.onTranscript?.(this.latestTranscript, true);
        }
      }
    } else if (this.latestTranscript) {
      callbacks?.onTranscript?.(this.latestTranscript, true);
    }

    callbacks?.onStateChange?.('idle');
  }

  /**
   * Main Speak Entrypoint:
   * Uses Sentence-by-Sentence Streaming with Gemini Live Audio or Sarvam AI,
   * falling back seamlessly to browser speech synthesis if offline or error.
   */
  public speak(
    text: string,
    lang: 'ta' | 'en',
    speedRate: number = 1.1,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (typeof window === 'undefined') return;

    // Immediately halt previous audio if playing (barge-in)
    this.stopSpeaking();

    this.currentLang = lang;
    this.currentSpeedRate = speedRate || 1.1;
    this.onSpeakingStart = onStart;
    this.onSpeakingEnd = onEnd;

    // Zero-lag fast path: default to instant native browser speech synthesis unless Sarvam API key is active
    if (this.voiceSettings.engine === 'browser-tts' || !this.voiceSettings.sarvamApiKey) {
      this.speakWithBrowserFallback(text, lang, this.currentSpeedRate, onStart, onEnd);
      return;
    }

    // Split into sentences for sub-second streaming
    const sentences = this.voiceSettings.streamingQueue ? splitIntoSentences(text) : [text];
    this.sentenceQueue = sentences;
    this.isSpeaking = true;
    this.abortController = new AbortController();

    this.onSpeakingStart?.();
    this.processNextSentenceInQueue();
  }

  private async processNextSentenceInQueue(): Promise<void> {
    if (!this.isSpeaking || this.sentenceQueue.length === 0) {
      this.finishSpeaking();
      return;
    }

    const currentSentence = this.sentenceQueue.shift()!;
    const signal = this.abortController?.signal;

    try {
      let audioBlob: Blob;

      if (this.voiceSettings.engine === 'sarvam-ai' && this.voiceSettings.sarvamApiKey) {
        audioBlob = await this.fetchSarvamAudio(
          currentSentence,
          this.currentLang,
          this.voiceSettings.persona,
          this.currentSpeedRate,
          this.voiceSettings.sarvamApiKey,
          signal!
        );
      } else {
        // Default to Google Gemini Live Audio
        audioBlob = await this.fetchGeminiAudio(
          currentSentence,
          this.currentLang,
          this.voiceSettings.persona,
          signal!
        );
      }

      if (!this.isSpeaking || signal?.aborted) return;

      // Play audio blob
      await this.playAudioBlob(audioBlob);

      // Once finished playing this sentence, process next sentence
      if (this.isSpeaking) {
        this.processNextSentenceInQueue();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Barge-in interrupted
        return;
      }
      console.warn('AI Voice model error, falling back to browser speech synthesis:', err);
      // Fallback remainder of queue to browser TTS
      const remainingText = [currentSentence, ...this.sentenceQueue].join(' ');
      this.sentenceQueue = [];
      this.speakWithBrowserFallback(
        remainingText,
        this.currentLang,
        this.currentSpeedRate,
        undefined,
        () => this.finishSpeaking()
      );
    }
  }

  private playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }

      this.currentBlobUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.currentBlobUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.currentAudioElement = null;
        resolve();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        resolve();
      };

      audio.play().catch((e) => {
        console.warn('Audio play rejected:', e);
        this.currentAudioElement = null;
        resolve();
      });
    });
  }

  private audioCache = new Map<string, Blob>();

  private async fetchGeminiAudio(
    text: string,
    lang: 'ta' | 'en',
    persona: DoctorPersona,
    signal: AbortSignal
  ): Promise<Blob> {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const cleanSpeechText = text.replace(/^[•*\-\d.]+\s+/gm, '').replace(/https?:\/\/\S+/g, '').trim();
    if (!cleanSpeechText) {
      throw new Error('No readable speech text');
    }

    // Check memory cache to prevent redundant synthesis
    const cacheKey = `${persona}:${lang}:${cleanSpeechText}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Voice mapping: Aoede for warm female physician (Dr. Meera), Charon for calm male physician (Dr. Arvind)
    const voiceName = persona === 'meera' ? 'Aoede' : 'Charon';

    const ttsCandidateModels = [
      'gemini-3.8-flash-tts',
      'gemini-3.8-flash-lite-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-flash-preview-tts',
    ];

    let lastError: Error | null = null;

    for (const modelName of ttsCandidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: cleanSpeechText }]
                }
              ],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName
                    }
                  }
                }
              }
            })
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini Audio API error ${response.status} on ${modelName}: ${errText}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        const inlineData = part?.inlineData;

        if (!inlineData || !inlineData.data) {
          throw new Error(`No audio data received in Gemini ${modelName} response`);
        }

        const pcmOrWavBytes = base64ToUint8Array(inlineData.data);
        const mime = (inlineData.mimeType || '').toLowerCase();

        // If MIME is PCM, wrap in standard 24kHz WAV header
        let wavBuffer: ArrayBuffer;
        if (mime.includes('pcm') || !mime.includes('wav')) {
          wavBuffer = pcmToWav(pcmOrWavBytes, 24000, 1);
        } else {
          wavBuffer = pcmOrWavBytes.buffer as ArrayBuffer;
        }

        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        // Cache up to 100 recent spoken phrases
        if (this.audioCache.size > 100) {
          const firstKey = this.audioCache.keys().next().value;
          if (firstKey) this.audioCache.delete(firstKey);
        }
        this.audioCache.set(cacheKey, blob);
        return blob;
      } catch (err: any) {
        if (err.name === 'AbortError') throw err;
        lastError = err;
        console.warn(`[SpeechEngine] ${modelName} synthesis failed, trying next candidate:`, err.message);
      }
    }

    throw lastError || new Error('All Gemini TTS models exhausted');
  }

  private async fetchSarvamAudio(
    text: string,
    lang: 'ta' | 'en',
    persona: DoctorPersona,
    speedRate: number,
    apiKey: string,
    signal: AbortSignal
  ): Promise<Blob> {
    if (!apiKey) {
      throw new Error('Sarvam AI API key is not configured');
    }

    const speaker = persona === 'meera' ? 'meera' : 'arvind';
    const targetLanguage = lang === 'ta' ? 'ta-IN' : 'en-IN';

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      signal,
      body: JSON.stringify({
        inputs: [text],
        target_language_code: targetLanguage,
        speaker,
        pitch: 0,
        pace: speedRate || 0.85,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam AI API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const base64Audio = data.audios?.[0];
    if (!base64Audio) {
      throw new Error('No audio returned from Sarvam AI');
    }

    const audioBytes = base64ToUint8Array(base64Audio);
    return new Blob([audioBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
  }

  public stopSpeaking(): void {
    this.isSpeaking = false;
    this.sentenceQueue = [];

    // Abort active HTTP fetch
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // Stop HTML5 audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // Ignored
      }
      this.currentAudioElement = null;
    }

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    // Stop native browser synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.finishSpeaking();
  }

  private finishSpeaking(): void {
    this.isSpeaking = false;
    this.onSpeakingEnd?.();
  }

  private speakWithBrowserFallback(
    text: string,
    lang: 'ta' | 'en',
    speedRate: number = 1.1,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown, links, bullets, and symbols so voice sounds smooth and natural
    const clean = cleanTextForSpeech(text);
    if (!clean) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = speedRate || 1.1;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = lang === 'ta' ? 'ta' : 'en';
    const bestVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetLangCode) || v.name.toLowerCase().includes(targetLangCode)
    );
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
    };
    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechEngine = new SpeechEngine();
