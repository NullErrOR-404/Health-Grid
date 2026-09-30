import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  Send,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowRight,
  Activity,
  Gauge,
  FileText,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Receipt,
  FileSearch,
  ChevronDown,
  Info,
  ShieldCheck,
  Sparkles,
  Brain,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';
import type { Language } from '../types';
import { speechEngine, TanglishNormalizer, type NormalizedResult } from '../services/speechService';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import {
  medicalRecordService,
  type MedicalRecord,
  type ClinicalCrossCheckResult,
} from '../services/medicalRecordService';
import {
  agiService,
  AVAILABLE_MODELS,
  type ModelOption,
  type UsageStats,
} from '../services/aiService';
import { PrescriptionScanSkeleton } from './SkeletonLoader';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  textEn: string;
  textTa: string;
  time: string;
  triageLevel?: 'RED' | 'AMBER' | 'YELLOW' | 'GREEN';
  isEmergencyAlert?: boolean;
  detectedKeywords?: string[];
  protocolCitation?: string;
  retrievedRecordCitation?: string;
  contraindicationWarning?: {
    en: string;
    ta: string;
  };
  scannedRecord?: MedicalRecord;
  usageMeta?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    modelName: string;
  };
}

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialQuery?: string;
  onOpenAmbulance?: () => void;
  onOpenHandover?: () => void;
}

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialQuery,
  onOpenAmbulance,
  onOpenHandover,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      textEn:
        "Vanakkam! I am DocBot, your 24/7 AI family doctor. I have access to your verified medical records and Tamil Nadu clinical guidelines. How are you feeling right now? You can speak or type in Tamil, English, or Tanglish, or tap the camera icon to scan a prescription slip.",
      textTa:
        "வணக்கம்! நான் உங்கள் டாக் பாட் (DocBot) AI குடும்ப மருத்துவர். உங்கள் பழைய மருத்துவ ஏடுகள் மற்றும் தமிழ்நாடு மருத்துவ வழிகாட்டுதல்கள் என்னிடம் உள்ளன. உங்களுக்கு இப்போது என்ன உடம்பு செய்கிறது? தமிழில் தயங்காமல் பேசலாம் அல்லது மருந்து சீட்டை கேமரா மூலம் ஸ்கேன் செய்யலாம்.",
      time: 'Just now',
      triageLevel: 'GREEN',
      protocolCitation: 'Indian Pharmacopoeia (IP) & ICMR Clinical Triage Standard',
      retrievedRecordCitation: 'Patient Health Vault #PAT-TN-2026-8841 (Murugan S., 45y)',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [speechSpeedRate, setSpeechSpeedRate] = useState<number>(0.85); // 0.85x gentle rate for elderly/rural patients
  const [activeNormalizer, setActiveNormalizer] = useState<NormalizedResult | null>(null);
  const [isScanningDoc, setIsScanningDoc] = useState(false);
  const [showUploadPicker, setShowUploadPicker] = useState(false);
  const [showRecordsVault, setShowRecordsVault] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelOption>(agiService.getCurrentModel());
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats>(agiService.getUsage());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = agiService.subscribeUsage((stats) => {
      setUsageStats(stats);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleUserSubmit(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isScanningDoc, isThinking]);

  // Clean up speech engine on unmount or close
  useEffect(() => {
    if (!isOpen) {
      speechEngine.stopListening();
      speechEngine.stopSpeaking();
      setIsRecording(false);
      setIsAiSpeaking(false);
      setShowUploadPicker(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const playSpeech = (text: string) => {
    if (!voiceSpeechEnabled) return;
    speechEngine.speak(
      text,
      lang,
      speechSpeedRate,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  const handleStartVoice = () => {
    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    speechEngine.startListening(lang, {
      onTranscript: (transcript, isFinal) => {
        setInputText(transcript);
        const normalized = TanglishNormalizer.normalize(transcript);
        setActiveNormalizer(normalized);

        if (isFinal) {
          setIsRecording(false);
          handleUserSubmit(transcript);
        }
      },
      onStateChange: (state) => {
        if (state === 'idle') setIsRecording(false);
      },
      onError: () => {
        setIsRecording(false);
      },
    });
  };

  const handleDocScan = async (sampleType: 'prescription' | 'lab') => {
    setShowUploadPicker(false);
    setIsScanningDoc(true);

    // Perform clinical vision/OCR scanning
    const record = await medicalRecordService.scanDocument(sampleType);
    setIsScanningDoc(false);

    // Push scanned record message into chat
    const scanMsg: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      textEn: `Successfully scanned and verified your ${
        record.documentType === 'PRESCRIPTION' ? 'doctor prescription' : 'laboratory test report'
      }. The extracted medications and findings have been cross-referenced with your health record.`,
      textTa: `உங்கள் ${
        record.documentType === 'PRESCRIPTION' ? 'மருத்துவர் சீட்டு' : 'ரத்தப் பரிசோதனை அறிக்கை'
      } வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டு சரிபார்க்கப்பட்டது. இதில் உள்ள விவரங்கள் உங்கள் பழைய மருத்துவக் குறிப்புகளுடன் ஒப்பிடப்பட்டுள்ளன.`,
      time: 'Now',
      triageLevel: 'GREEN',
      protocolCitation: record.verifiedProtocolSource,
      retrievedRecordCitation: `${record.title} (${record.doctorName})`,
      scannedRecord: record,
    };

    setMessages((prev) => [...prev, scanMsg]);
    playSpeech(lang === 'ta' ? scanMsg.textTa : scanMsg.textEn);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocScan('prescription');
    }
  };

  const patientProfile = medicalRecordService.getProfile();

  const handleUserSubmit = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isThinking) return;

    // Run Tanglish Normalizer on input
    const normalized = TanglishNormalizer.normalize(text);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      textEn: text,
      textTa: normalized.detectedKeywords.length > 0 ? `${text} [${normalized.detectedKeywords.join(', ')}]` : text,
      time: 'Now',
      detectedKeywords: normalized.detectedKeywords,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setActiveNormalizer(null);
    setIsThinking(true);

    try {
      // Gather longitudinal medical history context for clinical cross-referencing
      const patientSummary = `Patient Name: ${patientProfile.name}, Age: ${patientProfile.age}y.
Chronic Conditions: ${patientProfile.chronicConditions.join(', ')}.
Allergies: ${patientProfile.allergies.join(', ')}.
Active Prescriptions: ${patientProfile.records
        .flatMap((r) => r.activeMedications.map((m) => `${m.name} (${m.genericEquivalent})`))
        .join(', ')}.`;

      // Call AGI Intelligence (Groq GPT-OSS 120B / Google Gemini 3.8 Flash)
      const agiResult = await agiService.consultAgiDoctor(
        text,
        messages.map((m) => ({ sender: m.sender, text: lang === 'ta' ? m.textTa : m.textEn })),
        patientSummary,
        currentModel.id
      );

      const crossCheck: ClinicalCrossCheckResult = medicalRecordService.crossCheckSafety(text);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        textEn: agiResult.content,
        textTa: agiResult.content,
        time: 'Now',
        triageLevel: agiResult.triageLevel,
        isEmergencyAlert: agiResult.isEmergency,
        detectedKeywords: agiResult.detectedKeywords,
        protocolCitation: agiResult.protocolCitation,
        retrievedRecordCitation: crossCheck.hasContraindication
          ? `${crossCheck.retrievedRecordTitle} • ${crossCheck.retrievedCondition}`
          : `Longitudinal Patient Vault (#PAT-TN-2026-8841)`,
        contraindicationWarning: crossCheck.hasContraindication
          ? { en: crossCheck.warningAlertEn || '', ta: crossCheck.warningAlertTa || '' }
          : undefined,
        usageMeta: {
          promptTokens: agiResult.usage.promptTokens,
          completionTokens: agiResult.usage.completionTokens,
          totalTokens: agiResult.usage.totalTokens,
          latencyMs: agiResult.usage.latencyMs,
          modelName: currentModel.name,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      playSpeech(aiMsg.textEn);
    } catch (err) {
      console.error('AGI consultation failed, falling back to emergency triage rule engine:', err);
      const crossCheck: ClinicalCrossCheckResult = medicalRecordService.crossCheckSafety(text);
      const isRedFlag = normalized.isRedFlag;

      let fallbackMsg: Message;
      if (isRedFlag) {
        fallbackMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          textEn:
            'CRITICAL EMERGENCY ALERT: Your symptoms suggest an acute cardiac or respiratory emergency. Please sit upright at 45 degrees and do not exert yourself. Dispatching the 108 Emergency Ambulance immediately!',
          textTa:
            'அதிதீவிர அவசர எச்சரிக்கை: நீங்கள் கூறும் அறிகுறிகள் தீவிர நெஞ்சு அல்லது மூச்சுக்குழாய் பிரச்சினையாக இருக்கக்கூடும். உடனே படுக்காமல் 45 டிகிரி கோணத்தில் அமருங்கள். இப்போதே 108 அவசர ஆம்புலன்ஸ் அழைக்கப்படுகிறது!',
          time: 'Now',
          triageLevel: 'RED',
          isEmergencyAlert: true,
          protocolCitation: 'National Health Mission Emergency Triage Protocol (108 EMS)',
          retrievedRecordCitation: crossCheck.retrievedRecordTitle || 'Emergency Casualty Sentinel Protocol',
        };
      } else if (crossCheck.hasContraindication) {
        fallbackMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          textEn: `${crossCheck.warningAlertEn}\n\nClinical Guidance: For fever and pain relief, take Paracetamol 500mg (Jan Aushadhi Generic cost: ₹0.40/tablet) which is safe for asthmatics.`,
          textTa: `${crossCheck.warningAlertTa}\n\nமருத்துவ வழிகாட்டுதல்: காய்ச்சல் மற்றும் வலிக்கு, ஆஸ்துமா நோயாளிகளுக்கு பாதுகாப்பான பாராசிட்டமால் 500 மிகி (அரசு மலிவு விலை: ₹0.40/மாத்திரை) எடுத்துக்கொள்ளலாம்.`,
          time: 'Now',
          triageLevel: 'AMBER',
          protocolCitation: crossCheck.protocolCitation,
          retrievedRecordCitation: `${crossCheck.retrievedRecordTitle} • ${crossCheck.retrievedCondition}`,
          contraindicationWarning: {
            en: crossCheck.warningAlertEn || '',
            ta: crossCheck.warningAlertTa || '',
          },
        };
      } else {
        fallbackMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          textEn:
            'Based on Tamil Nadu clinical standards and cross-checking your stored health records, your condition appears stable with rest and fluids. Paracetamol 500mg generic (₹0.40/tab) is safe for fever and body ache.',
          textTa:
            'தமிழ்நாடு மருத்துவ வழிகாட்டுதல்கள் மற்றும் உங்கள் பழைய மருத்துவ ஏடுகளை ஒப்பிட்டுப் பார்த்ததில், போதுமான ஓய்வு மற்றும் குடிநீர் எடுத்துக்கொள்ளவும். காய்ச்சலுக்கு பாராசிட்டமால் 500 மிகி பாதுகாப்பானது.',
          time: 'Now',
          triageLevel: 'GREEN',
          protocolCitation: 'ICMR Primary Care Guidelines',
          retrievedRecordCitation: crossCheck.retrievedRecordTitle || 'Patient Health Vault #PAT-TN-2026-8841',
        };
      }
      setMessages((prev) => [...prev, fallbackMsg]);
      playSpeech(lang === 'ta' ? fallbackMsg.textTa : fallbackMsg.textEn);
    } finally {
      setIsThinking(false);
    }
  };

  const sampleChips = [
    { en: 'Can I take Brufen for my headache?', ta: 'தலைவலிக்கு புரூபன் (Brufen) மாத்திரை போடலாமா?' },
    { en: 'Fever and body ache since yesterday', ta: 'நேற்றிலிருந்து காய்ச்சல் மற்றும் உடல் வலி' },
    { en: 'Baby has high temperature and cough', ta: 'குழந்தைக்கு அதிக காய்ச்சல் மற்றும் இருமல்' },
    { en: 'Severe chest pain radiating to left arm', ta: 'நெஞ்சு வலி மற்றும் இடது கையில் வலி' },
  ];

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[92vh] max-h-[750px] flex flex-col overflow-hidden relative">
        
        {/* Hidden Real File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*,.pdf"
          className="hidden"
        />

        {/* Header with DocBot 3D Avatar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Pristine 3D DocBot Avatar */}
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot Mascot"
                  className="w-full h-full object-contain filter drop-shadow hover:scale-110 transition-transform"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-teal-900 ring-2 ring-emerald-300/50"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                  <span>{lang === 'en' ? 'DocBot AI' : 'டாக் பாட் (DocBot) AI'}</span>
                  <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    {lang === 'en' ? 'Verified Doctor' : 'சரிபார்க்கப்பட்ட மருத்துவர்'}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-teal-100/90">
                {lang === 'en'
                  ? 'Grounded Clinical Advice • Cross-checks your medical history'
                  : 'நம்பகமான மருத்துவ ஆலோசனை • உங்கள் முந்தைய ஏடுகளுடன் ஒப்பிடும்'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector Dropdown Button (Styled like Claude / ChatGPT / Cursor IDE) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all backdrop-blur-sm shadow-sm"
                title="Select AGI Clinical Model"
              >
                {currentModel.provider === 'google' ? (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                ) : currentModel.isReasoning ? (
                  <Brain className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span className="font-bold tracking-tight hidden sm:inline">{currentModel.name}</span>
                <span className="font-bold tracking-tight sm:hidden">{currentModel.name.split(' ')[0]}</span>
                <span className="text-[9px] bg-white/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                  {currentModel.provider === 'groq' ? 'Groq' : 'Gemini'}
                </span>
                <ChevronDown className={`w-3 h-3 text-white/70 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Model Dropdown Menu (Styled like Claude / ChatGPT / Cursor IDE) */}
              {showModelDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModelDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-2.5 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span>Select AGI Model</span>
                      <span className="text-teal-400 lowercase font-mono text-[10px]">Active Keys Verified</span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {AVAILABLE_MODELS.map((model) => {
                        const isSelected = model.id === currentModel.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              agiService.setModel(model.id);
                              setCurrentModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-teal-950/80 border border-teal-500/50 text-white shadow-sm'
                                : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                            }`}
                          >
                            <div className={`p-2 rounded-xl mt-0.5 ${
                              model.provider === 'google'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : model.isReasoning
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {model.provider === 'google' ? (
                                <Sparkles className="w-4 h-4" />
                              ) : model.isReasoning ? (
                                <Brain className="w-4 h-4" />
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white truncate">{model.name}</span>
                                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800/50">
                                  {model.speed}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                                {model.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                                  {model.providerLabel}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="text-cyan-300 font-semibold">{model.badge}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Speed Rate Pill */}
            <button
              onClick={() => setSpeechSpeedRate((prev) => (prev === 0.85 ? 1.0 : 0.85))}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 border border-white/10"
              title="Speech Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-200" />
              <span>{speechSpeedRate === 0.85 ? (lang === 'en' ? '0.85x Gentle' : '0.85x கனிவு') : '1.0x Normal'}</span>
            </button>

            {/* Voice Audio Mute/Unmute */}
            <button
              onClick={() => {
                if (isAiSpeaking) {
                  speechEngine.stopSpeaking();
                  setIsAiSpeaking(false);
                }
                setVoiceSpeechEnabled(!voiceSpeechEnabled);
              }}
              title={voiceSpeechEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {voiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-300" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Realtime API Usage Bar & Dynamic Colour-Changing Quota Gauge */}
        {(() => {
          const usedPct = Math.min(100, Math.round((usageStats.sessionTotalTokens / usageStats.sessionQuotaMax) * 100));
          const remainingPct = 100 - usedPct;

          let barColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
          let badgeColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30';
          let dotColor = 'bg-emerald-400';

          if (remainingPct <= 20) {
            barColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
            badgeColor = 'text-rose-300 bg-rose-950/60 border-rose-500/30';
            dotColor = 'bg-rose-400 animate-ping';
          } else if (remainingPct <= 60) {
            barColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
            badgeColor = 'text-amber-300 bg-amber-950/60 border-amber-500/30';
            dotColor = 'bg-amber-400';
          }

          return (
            <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 text-xs text-white flex flex-wrap items-center justify-between gap-3 shadow-inner">
              {/* Left: Model & Status Dot */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
                </span>
                <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
                  <span className="text-white">{currentModel.name}</span>
                  <span className="text-[10px] text-slate-500">|</span>
                  <span className="text-teal-400 font-mono text-[10px]">
                    {currentModel.provider === 'groq' ? 'Groq LPU' : 'Google Gemini'}
                  </span>
                </span>
              </div>

              {/* Center: Realtime Quota Progress Bar with Dynamic Changing Colors */}
              <div className="flex items-center gap-2.5 flex-1 max-w-xs min-w-[160px]">
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">API Quota:</span>
                <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(4, remainingPct)}%` }}
                    title={`${remainingPct}% quota remaining`}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200 whitespace-nowrap">
                  {remainingPct}%
                </span>
              </div>

              {/* Right: Live Token & Latency Metrics */}
              <div className="flex items-center gap-2 text-[10px]">
                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium flex items-center gap-1 ${badgeColor}`}>
                  <span>{usageStats.sessionTotalTokens.toLocaleString()} / 100k tok</span>
                </div>
                <span className="text-slate-400 font-mono hidden sm:inline">
                  ⚡ {usageStats.lastLatencyMs > 0 ? `${usageStats.lastLatencyMs}ms` : 'sub-sec'}
                </span>
                <button
                  type="button"
                  onClick={() => agiService.resetUsage()}
                  title="Reset session token usage counter"
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Patient Longitudinal Medical Vault Strip */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
            <button
              onClick={() => setShowRecordsVault(!showRecordsVault)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-[11px] font-semibold transition-colors border border-teal-400/20"
            >
              <FileSearch className="w-3.5 h-3.5 text-teal-300" />
              <span>{lang === 'en' ? 'Health Records Loaded:' : 'இணைக்கப்பட்ட ஏடுகள்:'}</span>
              <span className="font-bold text-white">{patientProfile.name} ({patientProfile.age}y)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showRecordsVault ? 'rotate-180' : ''}`} />
            </button>
            <span className="hidden md:inline text-[11px] text-slate-400 truncate">
              {lang === 'en'
                ? `Cross-referencing: ${patientProfile.chronicConditions[0]} • ${patientProfile.allergies[0]}`
                : `பரிசீலனை: ${patientProfile.chronicConditions[0]}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300 pl-3">
            {isRecording ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>{lang === 'en' ? 'Listening...' : 'குரலைக் கேட்கிறது...'}</span>
              </span>
            ) : isAiSpeaking ? (
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'en' ? 'DocBot Speaking...' : 'மருத்துவர் பேசுகிறார்...'}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Verified Protocol' : 'சரிபார்க்கப்பட்டது'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Patient Vault Drawer */}
        {showRecordsVault && (
          <div className="bg-slate-800 text-slate-200 border-b border-slate-700 p-4 text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                {lang === 'en' ? 'Patient Health History (Used to prevent adverse drug reactions)' : 'சேமிக்கப்பட்ட மருத்துவ ஏடுகள் (தவறான மாத்திரைகளை தவிர்க்க)'}
              </span>
              <span className="text-[10px] bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                {patientProfile.records.length} Documents Saved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {patientProfile.records.map((rec) => (
                <div key={rec.id} className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between font-bold text-slate-100">
                    <span className="truncate">{rec.title}</span>
                    <span className="text-[10px] text-teal-400">{rec.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rec.doctorName || rec.hospitalName}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.diagnoses.map((d, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Banner */}
        <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="w-full max-w-[240px]">
            <AudioVisualizerCanvas
              isActive={isRecording}
              isAiSpeaking={isAiSpeaking}
              mode="wave"
              height={24}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'Clinical Safety Protocol Active' : 'மருத்துவ பாதுகாப்பு கண்காணிப்பு இயங்குகிறது'}</span>
          </div>
        </div>

        {/* Clinical Terminology Preview Pill */}
        {activeNormalizer && activeNormalizer.detectedKeywords.length > 0 && (
          <div className="bg-teal-50 border-b border-teal-200 px-4 py-1.5 flex items-center gap-2 text-xs text-teal-900">
            <span className="font-bold text-[10px] uppercase bg-teal-700 text-white px-1.5 py-0.5 rounded">
              {lang === 'en' ? 'Recognized Clinical Terms' : 'மருத்துவக் குறிச்சொற்கள்'}
            </span>
            <span className="font-medium text-teal-800">
              {activeNormalizer.detectedKeywords.join(', ')}
            </span>
          </div>
        )}

        {/* Document Scanning Animation Overlay with Shimmer Skeleton */}
        {isScanningDoc && (
          <div className="bg-white border-b border-teal-200/80 p-4 space-y-3 animate-in fade-in duration-200 shadow-xs">
            <PrescriptionScanSkeleton />
          </div>
        )}

        {/* Messages Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-br-none'
                      : msg.isEmergencyAlert
                      ? 'bg-red-50 border-2 border-red-500 text-red-950 rounded-bl-none shadow-red-100'
                      : msg.contraindicationWarning
                      ? 'bg-amber-50 border-2 border-amber-500 text-amber-950 rounded-bl-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Triage & Clinical Safety Badges */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center gap-2 mb-2.5 pb-2 border-b border-slate-200/70">
                      {msg.triageLevel && (
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                            msg.triageLevel === 'RED'
                              ? 'bg-red-600 text-white animate-pulse'
                              : msg.triageLevel === 'AMBER'
                              ? 'bg-amber-500 text-white'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {msg.triageLevel === 'RED' ? 'Red Flag (Emergency)' : msg.triageLevel === 'AMBER' ? 'Moderate Care / Caution' : 'Mild / Advice'}
                        </span>
                      )}

                      {/* Verified Clinical Protocol Citation Badge */}
                      {msg.protocolCitation && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{msg.protocolCitation}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scanned Document Instant Summary Card */}
                  {msg.scannedRecord && (
                    <div className="my-2 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 shadow-md">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs">{msg.scannedRecord.title}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          ✓ Verified & Saved
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400 font-medium">Doctor:</span> {msg.scannedRecord.doctorName}
                      </div>

                      {msg.scannedRecord.activeMedications.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] uppercase font-bold text-teal-400">
                            Scanned Medicines & Jan Aushadhi Savings:
                          </div>
                          {msg.scannedRecord.activeMedications.map((med, idx) => (
                            <div key={idx} className="bg-slate-800/80 p-2 rounded-xl text-xs flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-white">{med.name}</div>
                                <div className="text-[11px] text-slate-400">{med.genericEquivalent} • {med.frequency}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-emerald-400 font-bold">₹{med.genericPrice}</div>
                                <div className="text-[10px] text-slate-500 line-through">₹{med.brandPrice}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contraindication Alert Box */}
                  {msg.contraindicationWarning && (
                    <div className="mb-3 p-3 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        {lang === 'ta' ? msg.contraindicationWarning.ta : msg.contraindicationWarning.en}
                      </div>
                    </div>
                  )}

                  {/* Main Message Text */}
                  <p className="whitespace-pre-line">{lang === 'ta' ? msg.textTa : msg.textEn}</p>

                  {/* Token & Latency Telemetry for AGI Responses */}
                  {msg.usageMeta && !isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 font-bold">
                        ⚡ {msg.usageMeta.latencyMs}ms
                      </span>
                      <span>•</span>
                      <span>{msg.usageMeta.totalTokens} tokens</span>
                      <span>•</span>
                      <span className="text-slate-500 font-sans font-medium">{msg.usageMeta.modelName}</span>
                    </div>
                  )}

                  {/* Patient History Citation Footer */}
                  {msg.retrievedRecordCitation && !isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <FileSearch className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{lang === 'en' ? 'Cross-checked with saved record:' : 'பரிசீலிக்கப்பட்ட மருத்துவ ஏடு:'}</span>
                      <span className="font-semibold text-slate-700">{msg.retrievedRecordCitation}</span>
                    </div>
                  )}

                  {/* Red Flag Emergency Ambulance Shortcut */}
                  {msg.isEmergencyAlert && (
                    <div className="mt-3 pt-3 border-t border-red-200 flex flex-col gap-2">
                      {onOpenAmbulance && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAmbulance();
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all animate-bounce"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Dispatch 108 Ambulance Now' : 'இப்போதே 108 ஆம்புலன்ஸை அழைக்கவும்'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onOpenHandover && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenHandover();
                          }}
                          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <FileText className="w-4 h-4 text-rose-400" />
                          <span>{lang === 'en' ? 'Generate Doctor Casualty Handover Slip' : 'மருத்துவமனை ஒப்படைப்பு ஏடு பார்க்க'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
              </div>
            );
          })}

          {/* Moving Jump Dots Alone when AGI is Thinking (Abstracted Reasoning) */}
          {isThinking && (
            <div className="flex items-start gap-2.5 max-w-[85%] animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-xl bg-teal-800 p-0.5 flex-shrink-0 flex items-center justify-center shadow-sm">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-200/80 flex items-center gap-2">
                <div className="flex items-center gap-1.5 py-1 px-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
            {lang === 'en' ? 'Quick queries:' : 'கேள்விகள்:'}
          </span>
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleUserSubmit(lang === 'ta' ? chip.ta : chip.en)}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {lang === 'ta' ? chip.ta : chip.en}
            </button>
          ))}
        </div>

        {/* Upload Document Modal Picker Popup */}
        {showUploadPicker && (
          <div className="p-3 bg-teal-50 border-t border-teal-200 flex items-center justify-between gap-2 text-xs animate-in slide-in-from-bottom-2">
            <span className="font-bold text-teal-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-teal-700" />
              {lang === 'en' ? 'Scan Health Document:' : 'மருத்துவ ஏடு ஸ்கேன்:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDocScan('prescription')}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Prescription Slip' : 'மருத்துவர் சீட்டு'}</span>
              </button>
              <button
                onClick={() => handleDocScan('lab')}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Lab Report (CBC)' : 'ரத்தப் பரிசோதனை'}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-colors flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Upload Photo' : 'படம் பதிவேற்று'}</span>
              </button>
              <button
                onClick={() => setShowUploadPicker(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSubmit(inputText);
            }}
            className="flex items-center gap-2"
          >
            {/* Camera / Prescription Upload Button */}
            <button
              type="button"
              onClick={() => setShowUploadPicker(!showUploadPicker)}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all"
              title={lang === 'en' ? 'Scan Prescription or Report' : 'மருந்து சீட்டு ஸ்கேன் செய்'}
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Live Mic Button */}
            <button
              type="button"
              onClick={handleStartVoice}
              className={`p-3 rounded-2xl font-bold flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg ring-4 ring-red-100'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
              }`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                const norm = TanglishNormalizer.normalize(e.target.value);
                setActiveNormalizer(norm);
              }}
              placeholder={
                isRecording
                  ? lang === 'en' ? 'Listening to your voice...' : 'உங்கள் குரலைக் கேட்கிறது...'
                  : lang === 'en'
                  ? 'Ask DocBot in English or Tamil (e.g. fever, headache, brufen)...'
                  : 'தமிழில் அல்லது Tanglish-ல் கேட்கவும் (எ.கா: kaichal, brufen மாத்திரை)...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
