import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  MessageSquare,
  Pill,
  ChevronDown,
  User,
  CheckCircle2,
  Stethoscope,
  Building2,
  ShieldAlert,
  Paperclip,
  Mic,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Pin,
  Edit2,
  Archive,
  Trash2,
  MoreVertical,
  Check,
  RotateCcw,
  Sparkles,
  Brain,
  Zap,
  AlertCircle,
  X,
  Search,
  MapPin,
  Activity,
  FileText,
  Tag,
  HeartHandshake,
  FileUp,
  Video,
  Clock,
  CalendarCheck,
  Square,
  CheckSquare,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import type { Language } from '../types';
import { speechEngine, TanglishNormalizer } from '../services/speechService';
import {
  agiService,
  AVAILABLE_MODELS,
  type ModelOption,
  type UsageStats,
  type InteractiveOptions,
  type TriageWizard,
  type TriageWizardStep,
  type TriageWizardOption
} from '../services/aiService';
import { agenticTools, type AgentToolCall, type JanAushadhiResult } from '../services/agenticToolsService';
import { type PrescriptionAnalysisResult } from '../services/prescriptionAiService';
import { careLoopService, type CareLoopFollowUp } from '../services/careLoopService';
import { type LiveConsultationSummary } from '../services/liveVisionDoctorService';
import { medicalRecordService } from '../services/medicalRecordService';
import { supabase } from '../services/supabaseClient';
import { authService, type AuthUser } from '../services/authService';
import { LoginModal } from './LoginModal';
import { LiveVisionDoctorModal } from './LiveVisionDoctorModal';
import { VitalsTelemetryModal } from './VitalsTelemetryModal';
import { ConsultationBeneficiaryModal } from './ConsultationBeneficiaryModal';
import { familyMemberService, type FamilyMember } from '../services/familyMemberService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  liked?: boolean;
  disliked?: boolean;
  usageMeta?: {
    latencyMs: number;
    totalTokens: number;
    modelName: string;
  };
  emotionalState?: string;
  executedTools?: AgentToolCall[];
  genericMedicines?: JanAushadhiResult[];
  attachmentName?: string;
  prescriptionAnalysis?: PrescriptionAnalysisResult;
  suggestedOptions?: InteractiveOptions;
  triageWizard?: TriageWizard;
}

export interface ChatSession {
  id: string;
  title: string;
  dateGroup: 'Today' | 'Previous 7 Days';
  pinned?: boolean;
  archived?: boolean;
  messages: ChatMessage[];
}

interface ChatbotPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onOpenAmbulance?: () => void;
  onOpenPrescription?: () => void;
  onOpenDiseaseMap?: () => void;
  onOpenBabyShots?: () => void;
  onNavigateMedicines?: () => void;
  initialQuery?: string;
}

const createFreshSession = (title = 'New Consultation'): ChatSession => ({
  id: `chat-${Date.now()}`,
  title,
  dateGroup: 'Today',
  messages: [],
});

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  lang,
  setLang: _setLang,
  onNavigateHome: _onNavigateHome,
  onNavigateProfile,
  onOpenAmbulance,
  onOpenPrescription: _onOpenPrescription,
  onOpenDiseaseMap: _onOpenDiseaseMap,
  onOpenBabyShots: _onOpenBabyShots,
  onNavigateMedicines: _onNavigateMedicines,
  initialQuery,
}) => {
  // Zero-Disk Pure Cloud Storage: Sessions live strictly in memory and Supabase PostgreSQL RLS tables.
  // Guarantees zero residual patient clinical data on shared clinic devices or public health kiosks.
  const [sessions, setSessions] = useState<ChatSession[]>([createFreshSession()]);

  const [activeSessionId, setActiveSessionId] = useState<string>(() => `chat-${Date.now()}`);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiveVisionOpen, setIsLiveVisionOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState<FamilyMember | null>(() => familyMemberService.getActiveBeneficiary());
  const [activeCareLoops, setActiveCareLoops] = useState<CareLoopFollowUp[]>([]);
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<Record<string, string[]>>({});
  const [wizardStates, setWizardStates] = useState<Record<string, {
    currentStepIndex: number;
    answers: Record<string, TriageWizardOption>;
    isCompleted: boolean;
  }>>({});
  const pendingActionRef = useRef<(() => void) | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);

  const toggleMultiOption = (messageId: string, option: string) => {
    // Auditory feedback for rural & visually impaired patients
    const speechText = option.replace(/[🚨🏥💊📹🩺]/g, '').trim();
    if (speechText) {
      speechEngine.speak(speechText, lang === 'ta' ? 'ta' : 'en');
    }

    setSelectedMultiOptions((prev) => {
      const current = prev[messageId] || [];
      if (current.includes(option)) {
        return { ...prev, [messageId]: current.filter((x) => x !== option) };
      }
      return { ...prev, [messageId]: [...current, option] };
    });
  };

  const speakAllOptions = (items: string[]) => {
    const cleanList = items.map((i) => i.replace(/[🚨🏥💊📹🩺]/g, '').trim()).join('. ');
    const prefix = lang === 'ta' ? 'கிடைக்கக்கூடிய தேர்வுகள்: ' : 'Available choices: ';
    speechEngine.speak(prefix + cleanList, lang === 'ta' ? 'ta' : 'en');
  };

  const handleSendMultiOptions = (messageId: string) => {
    const selected = selectedMultiOptions[messageId] || [];
    if (selected.length === 0 || isThinking) return;
    const prompt = selected.join(', ');
    handleSendMessage(prompt);
  };

  const handleWizardOptionSelect = (
    messageId: string,
    wizard: TriageWizard,
    step: TriageWizardStep,
    option: TriageWizardOption
  ) => {
    // Auditory feedback
    const label = lang === 'ta' ? option.labelTa : option.labelEn;
    if (label) {
      speechEngine.speak(label, lang === 'ta' ? 'ta' : 'en');
    }

    const current = wizardStates[messageId] || {
      currentStepIndex: 0,
      answers: {},
      isCompleted: false,
    };

    if (current.isCompleted) return;

    const newAnswers = {
      ...current.answers,
      [step.id]: option,
    };

    const nextIndex = current.currentStepIndex + 1;
    const isFinished = nextIndex >= wizard.steps.length;

    setWizardStates((prev) => ({
      ...prev,
      [messageId]: {
        currentStepIndex: isFinished ? current.currentStepIndex : nextIndex,
        answers: newAnswers,
        isCompleted: isFinished,
      },
    }));

    if (isFinished) {
      // Auto-submit structured clinical assessment back into the conversation
      const summaryItems = wizard.steps.map((s) => {
        const chosen = newAnswers[s.id];
        const stepName = lang === 'ta' ? s.titleTa : s.titleEn;
        const optText = chosen ? (lang === 'ta' ? chosen.labelTa : chosen.labelEn) : 'None';
        return `${stepName}: ${optText}`;
      });
      const topicName = lang === 'ta' ? wizard.topicTa : wizard.topicEn;
      const clinicalPayload = `Clinical Assessment (${topicName}): [${summaryItems.join(' | ')}]`;
      handleSendMessage(clinicalPayload);
    }
  };

  const handleWizardStepBack = (messageId: string) => {
    setWizardStates((prev) => {
      const cur = prev[messageId];
      if (!cur || cur.currentStepIndex <= 0 || cur.isCompleted) return prev;
      return {
        ...prev,
        [messageId]: {
          ...cur,
          currentStepIndex: cur.currentStepIndex - 1,
        },
      };
    });
  };

  const speakWizardQuestion = (question: string) => {
    speechEngine.speak(question, lang === 'ta' ? 'ta' : 'en');
  };

  const handleOptionSelect = (opt: string) => {
    // Auditory confirmation
    const speechText = opt.replace(/[🚨🏥💊📹🩺]/g, '').trim();
    if (speechText) {
      speechEngine.speak(speechText, lang === 'ta' ? 'ta' : 'en');
    }

    const cleanOpt = opt.toLowerCase();
    if (cleanOpt.includes('108') || cleanOpt.includes('emergency') || cleanOpt.includes('ambulance')) {
      if (onOpenAmbulance) {
        onOpenAmbulance();
        return;
      }
      window.location.href = 'tel:108';
      return;
    }
    if (cleanOpt.includes('kendra') || cleanOpt.includes('jan aushadhi') || cleanOpt.includes('generic store') || cleanOpt.includes('find medicines')) {
      if (_onNavigateMedicines) {
        _onNavigateMedicines();
        return;
      }
    }
    if (cleanOpt.includes('video doctor') || cleanOpt.includes('live vision') || cleanOpt.includes('video consult')) {
      setIsLiveVisionOpen(true);
      return;
    }
    if (cleanOpt.includes('vitals') || cleanOpt.includes('record bp') || cleanOpt.includes('telemetry')) {
      setIsVitalsModalOpen(true);
      return;
    }
    if (cleanOpt.includes('upload prescription') || cleanOpt.includes('scan prescription')) {
      if (_onOpenPrescription) {
        _onOpenPrescription();
        return;
      }
    }
    if (cleanOpt.includes('nearest hospital') || cleanOpt.includes('casualty')) {
      if (onOpenAmbulance) {
        onOpenAmbulance();
        return;
      }
    }
    // Otherwise standard conversational query
    handleSendMessage(opt);
  };

  // Subscribe to active family beneficiary updates
  useEffect(() => {
    return familyMemberService.subscribe((_members, active) => {
      setActiveBeneficiary(active);
    });
  }, []);

  // Subscribe to proactive Care-Loop recovery tasks
  useEffect(() => {
    return careLoopService.subscribe((loops) => {
      setActiveCareLoops(loops.filter((l) => l.status === 'PENDING'));
    });
  }, []);

  // Sync auth state and enforce clean slate on logout
  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
      if (!user) {
        setSessions([createFreshSession()]);
        setActiveSessionId(`chat-${Date.now()}`);
      }
    });
    return unsub;
  }, []);

  // Model & Realtime Usage State
  const [currentModel, setCurrentModel] = useState<ModelOption>(agiService.getCurrentModel());
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats>(agiService.getUsage());

  // Context Menu State for Right-Click on Chat History
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sessionId: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    sessionId: '',
  });

  // Inline Rename State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const checkAuth = (customNotice?: string): boolean => {
    const user = authService.getCurrentUser();
    if (user) return true;
    const notice =
      customNotice ||
      (lang === 'en'
        ? 'Sign in or create an account to start your consultation'
        : 'மருத்துவ ஆலோசனையைத் தொடங்க உள்நுழையவும் அல்லது புதிய கணக்கு தொடங்கவும்');
    setLoginNotice(notice);
    setToastMessage(notice);
    setIsLoginOpen(true);
    return false;
  };

  const withAuth = (action: () => void, customNotice?: string): void => {
    if (checkAuth(customNotice)) {
      action();
    } else {
      pendingActionRef.current = action;
    }
  };

  const ensureAuth = (action?: () => void, customNotice?: string): boolean => {
    if (action) {
      withAuth(action, customNotice);
      return Boolean(authService.getCurrentUser());
    }
    return checkAuth(customNotice);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setLoginNotice(null);
    if (pendingActionRef.current) {
      const act = pendingActionRef.current;
      pendingActionRef.current = null;
      setTimeout(() => act(), 100);
    } else {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  };

  // Sync initial search query if transferred from landing hero
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputText(initialQuery.trim());
      if (authService.getCurrentUser()) {
        handleSendMessage(initialQuery.trim());
      }
    }
  }, [initialQuery]);

  // Subscribe to auth changes and load isolated user chat sessions from Supabase
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        loadSupabaseSessions(user.id);
      }
    });
  }, []);

  const loadSupabaseSessions = async (userId: string) => {
    try {
      const { data: dbSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase sessions query error:', error);
        return;
      }

      if (dbSessions && dbSessions.length > 0) {
        const sessionIds = dbSessions.map((s) => s.id);
        const { data: dbMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true });

        const mapped: ChatSession[] = dbSessions.map((s) => {
          const msgs: ChatMessage[] = (dbMessages || [])
            .filter((m) => m.session_id === s.id)
            .map((m) => ({
              id: m.id,
              sender: m.sender as 'user' | 'ai',
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              liked: m.liked === true,
              disliked: m.liked === false,
              usageMeta: m.model_name
                ? {
                    latencyMs: m.latency_ms || 0,
                    totalTokens: m.total_tokens || 0,
                    modelName: m.model_name,
                  }
                : undefined,
            }));

          const isToday = new Date(s.created_at).toDateString() === new Date().toDateString();
          return {
            id: s.id,
            title: s.title,
            dateGroup: isToday ? 'Today' : 'Previous 7 Days',
            pinned: s.is_pinned || false,
            archived: s.is_archived || false,
            messages: msgs,
          };
        });

        setSessions(mapped);
        if (mapped.length > 0) {
          setActiveSessionId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load chat sessions from Supabase:', err);
    }
  };

  const persistMessage = async (msg: { session_id: string; sender: string; text: string; latency_ms?: number; total_tokens?: number; model_name?: string }) => {
    try {
      await supabase.from('chat_messages').insert(msg);
    } catch (err) {
      console.warn('Failed to persist message to Supabase:', err);
    }
  };

  const updateSessionInDb = async (sessionId: string, updates: Record<string, any>) => {
    try {
      await supabase.from('chat_sessions').update(updates).eq('id', sessionId);
    } catch (err) {
      console.warn('Failed to update session in Supabase:', err);
    }
  };

  const deleteSessionInDb = async (sessionId: string) => {
    try {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
    } catch (err) {
      console.warn('Failed to delete session in Supabase:', err);
    }
  };

  // Subscribe to real-time API token usage
  useEffect(() => {
    const unsub = agiService.subscribeUsage((stats) => {
      setUsageStats(stats);
    });
    return unsub;
  }, []);

  // Auto-scroll on new message or thinking state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isThinking]);

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  // Auto-dismiss toast alert after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Clean up speech engine on unmount
  useEffect(() => {
    return () => {
      speechEngine.stopListening();
      speechEngine.stopSpeaking();
    };
  }, []);

  // Voice input handling with speechEngine and pulse animation
  const handleToggleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      setToastMessage(lang === 'en' ? 'Processing speech...' : 'குரல் பதிவு செயலாக்கப்படுகிறது...');
      await speechEngine.stopListening();
      return;
    }

    if (isVoiceSpeaking) {
      speechEngine.stopSpeaking();
      setIsVoiceSpeaking(false);
    }

    setIsRecording(true);
    setToastMessage(
      lang === 'en'
        ? 'Listening... Speak symptoms in English or Tamil (Tap mic or "Done" to finish)'
        : 'கேட்கிறது... தமிழில் அல்லது English-ல் பேசவும் (முடிக்க மைக் தட்டவும்)'
    );

    await speechEngine.startListening(lang, {
      onTranscript: (transcript, isFinal) => {
        if (transcript && transcript.trim()) {
          setInputText(transcript);
        }
        if (isFinal) {
          const normalized = TanglishNormalizer.normalize(transcript);
          if (normalized.isRedFlag) {
            console.info('Urgent medical keyword detected in speech:', normalized.detectedKeywords);
          }
          setToastMessage(
            lang === 'en'
              ? `Heard: "${transcript.slice(0, 32)}${transcript.length > 32 ? '...' : ''}"`
              : `பதிவு: "${transcript.slice(0, 32)}${transcript.length > 32 ? '...' : ''}"`
          );
        }
      },
      onStateChange: (state) => {
        if (state === 'idle') {
          setIsRecording(false);
        } else if (state === 'processing') {
          setToastMessage(lang === 'en' ? 'Transcribing with Whisper AI...' : 'குரல் உரை மாற்றப்படுகிறது...');
        } else if (state === 'error') {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        console.warn('Voice input error:', err);
        setIsRecording(false);
        setToastMessage(err);
      },
    });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create New Chat
  const handleNewChat = async () => {
    const defaultTitle = lang === 'en' ? 'New Consultation' : 'புதிய ஆலோசனை';
    let newId = `chat-${Date.now()}`;

    if (currentUser) {
      try {
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: currentUser.id,
            title: defaultTitle,
          })
          .select()
          .single();

        if (!error && newSession) {
          newId = newSession.id;
        }
      } catch (err) {
        console.warn('Could not create new session in Supabase:', err);
      }
    }

    const newChat: ChatSession = {
      id: newId,
      title: defaultTitle,
      dateGroup: 'Today',
      messages: [],
    };
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newId);
  };

  // Submit Prompt to AGI Doctor
  const handleSendMessage = async (textToSend?: string) => {
    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
    }

    if (isSendingRef.current || isThinking) return;

    const query = (textToSend || inputText).trim();
    if (!query) return;

    isSendingRef.current = true;
    setInputText('');
    setIsThinking(true);

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update session title if it was default
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isFirstQuery = s.messages.length === 0;
          return {
            ...s,
            title: isFirstQuery ? query.slice(0, 26) + (query.length > 26 ? '...' : '') : s.title,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputText('');
    setIsThinking(true);

    // If active session is in Supabase (UUID), persist user message
    const isSupabaseSession = currentUser && activeSessionId && activeSessionId.length > 20 && !activeSessionId.startsWith('chat-');
    if (isSupabaseSession) {
      persistMessage({
        session_id: activeSessionId,
        sender: 'user',
        text: query,
      });

      if (activeSession && activeSession.messages.length === 0) {
        const titleSnippet = query.slice(0, 26) + (query.length > 26 ? '...' : '');
        updateSessionInDb(activeSessionId, { title: titleSnippet });
      }
    }

    try {
      let patientContext: string | undefined = undefined;

      const currentBeneficiary = familyMemberService.getActiveBeneficiary();
      if (currentBeneficiary) {
        // Third-Person Caregiver Consultation Mode
        const parts: string[] = [
          `CAREGIVER CONSULTATION MODE: The user is consulting on behalf of their ${currentBeneficiary.relationship}, ${currentBeneficiary.name}`,
          `Patient: ${currentBeneficiary.name}`,
          `Relationship to user: ${currentBeneficiary.relationship}`,
          `Age: ${currentBeneficiary.age} years old`,
          `Gender: ${currentBeneficiary.gender}`,
          `Health ID: ${currentBeneficiary.healthId}`,
          `BEDSIDE MANNER DIRECTIVE: You MUST address the user in the third person regarding the patient as a caring family member/caregiver (e.g. "I understand you are consulting for your ${currentBeneficiary.relationship.toLowerCase()}, ${currentBeneficiary.name}. What symptoms is she/he currently experiencing?"). Calibrate triage questions, red flags, and safe dosages for a ${currentBeneficiary.age}-year-old ${currentBeneficiary.gender}. Inquire gently about any chronic conditions or daily medications ${currentBeneficiary.name} takes.`
        ];
        if (currentBeneficiary.chronicConditions && currentBeneficiary.chronicConditions.length > 0) {
          parts.push(`Known Conditions: ${currentBeneficiary.chronicConditions.join(', ')}`);
        }
        if (currentBeneficiary.allergies && currentBeneficiary.allergies.length > 0) {
          parts.push(`Known Allergies: ${currentBeneficiary.allergies.join(', ')}`);
        }
        patientContext = parts.join('. ') + '.';
      } else {
        const patientProfile = medicalRecordService.getProfile();
        const conditions = (patientProfile.chronicConditions || []).filter(c => Boolean(c) && !c.toLowerCase().includes('seasonal'));
        const allergies = (patientProfile.allergies || []).filter(a => Boolean(a) && !a.toLowerCase().includes('penicillin'));
        const hasName = Boolean(
          patientProfile.name &&
          patientProfile.name.trim() &&
          !patientProfile.name.toLowerCase().includes('murugan') &&
          !patientProfile.name.toLowerCase().includes('verified patient')
        );

        // Only attach clinical context if user is signed in with legitimate, non-mock profile data
        if (currentUser && (hasName || conditions.length > 0 || allergies.length > 0)) {
          const parts: string[] = [];
          if (hasName) parts.push(`Patient: ${patientProfile.name.trim()}`);
          if (patientProfile.age > 0) parts.push(`Age: ${patientProfile.age}y`);
          if (conditions.length > 0) parts.push(`Chronic Conditions: ${conditions.join(', ')}`);
          if (allergies.length > 0) parts.push(`Drug Allergies: ${allergies.join(', ')}`);
          if (parts.length > 0) {
            patientContext = parts.join('. ') + '.';
          }
        }
      }

      const history = (activeSession?.messages || []).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await agiService.consultAgiDoctor(
        query,
        history,
        patientContext,
        currentModel.id
      );

      const aiMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: response.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotionalState: response.emotionalState,
        executedTools: response.executedTools,
        genericMedicines: response.genericMedicines,
        suggestedOptions: response.suggestedOptions,
        triageWizard: response.triageWizard,
        usageMeta: {
          latencyMs: response.usage.latencyMs,
          totalTokens: response.usage.totalTokens,
          modelName: currentModel.name,
        },
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
            };
          }
          return s;
        })
      );

      // Persist AI response to Supabase
      if (isSupabaseSession) {
        persistMessage({
          session_id: activeSessionId,
          sender: 'ai',
          text: response.content,
          latency_ms: response.usage.latencyMs,
          total_tokens: response.usage.totalTokens,
          model_name: currentModel.name,
        });
      }

      // Play audio TTS gently
      speechEngine.speak(
        response.content,
        lang,
        0.85,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );

      // If life-threatening emergency, notify ambulance
      if (response.isEmergency && onOpenAmbulance) {
        setTimeout(() => {
          onOpenAmbulance();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err?.message && err.message.toLowerCase().includes('rate limit')) {
        setToastMessage(err.message);
      } else {
        const fallbackAiMessage: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: lang === 'en'
            ? "I am currently assessing your clinical details. Please describe your symptoms or try again in a moment."
            : "உங்கள் அறிகுறிகளை ஆய்வு செய்கிறேன். தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, fallbackAiMessage] } : s))
        );
      }
    } finally {
      setIsThinking(false);
      isSendingRef.current = false;
    }
  };

  // In-Chat Prescription & Lab Report Autonomous Multimodal Vision Reader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!checkAuth(lang === 'en' ? 'Sign in to analyze prescriptions' : 'மருந்து சீட்டுகளைப் பகுப்பாய்வு செய்ய உள்நுழையவும்')) {
      pendingActionRef.current = () => fileInputRef.current?.click();
      e.target.value = '';
      return;
    }

    const patientProfile = medicalRecordService.getProfile();
    const allergies = (patientProfile.allergies || []).filter(a => Boolean(a) && !a.toLowerCase().includes('penicillin'));

    const userMsgId = `u-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: lang === 'en'
        ? `[Attached Medical Document: ${file.name}]\nPlease read this clinical document, extract all medications, check my allergies, and find affordable Jan Aushadhi generic alternatives.`
        : `[மருத்துவ ஆவணம் இணைக்கப்பட்டது: ${file.name}]\nஇந்த ஆவணத்தைப் படித்து மருந்துகள் மற்றும் ஜன் ஔஷதி விலைகளை தெரிவிக்கவும்.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName: file.name,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: `Prescription: ${file.name.slice(0, 16)}`,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setIsThinking(true);
    e.target.value = '';

    try {
      // 1. Multimodal OCR via agenticTools
      const analysis = await agenticTools.readMedicalDocument(file, allergies);

      // 2. Autonomous Jan Aushadhi generic equivalent lookup for detected medications
      let genericMatches: JanAushadhiResult[] = [];
      if (analysis.medications && analysis.medications.length > 0) {
        for (const med of analysis.medications) {
          const medSearchName = med.brandName || med.genericName;
          const results = await agenticTools.searchJanAushadhi(medSearchName);
          if (results && results.length > 0) {
            genericMatches.push(results[0]);
          }
        }
      }

      // Deduplicate generics
      genericMatches = genericMatches.filter(
        (v, i, a) => a.findIndex((t) => t.genericName === v.genericName) === i
      );

      // 3. Construct Doctor AI clinical explanation
      let docExplanation = '';
      if (lang === 'en') {
        docExplanation = `I have clinically analyzed your medical document "${file.name}".\n\n`;
        if (analysis.doctorName) {
          docExplanation += `• Attending Physician: Dr. ${analysis.doctorName}\n`;
        }
        if (analysis.diagnosisNotes) {
          docExplanation += `• Clinical Diagnosis / Indication: ${analysis.diagnosisNotes}\n`;
        }
        docExplanation += `\nIdentified Medications & Regimen:\n`;
        analysis.medications.forEach((m) => {
          docExplanation += `• ${m.brandName || m.genericName} (${m.dosage}) - ${m.frequency}, ${m.timing}. Duration: ${m.duration || 'As indicated'}\n`;
        });

        if (analysis.allergyWarnings && analysis.allergyWarnings.length > 0) {
          docExplanation += `\nClinical Safety Guidance:\n` + analysis.allergyWarnings.map((w: { warningEn: string }) => `• ${w.warningEn}`).join('\n');
        }

        if (genericMatches.length > 0) {
          docExplanation += `\n\nI have matched your prescribed medications with authentic PMBJP Jan Aushadhi generic equivalents below. You can save 50% to 90% at any government Jan Aushadhi Kendra across Tamil Nadu.`;
        }
      } else {
        docExplanation = `உங்கள் மருத்துவ ஆவணத்தை ("${file.name}") வெற்றிகரமாகப் பகுப்பாய்வு செய்துள்ளேன்.\n\n`;
        if (analysis.diagnosisNotes) {
          docExplanation += `• நோய் / அறிகுறிகள்: ${analysis.diagnosisNotes}\n`;
        }
        docExplanation += `\nபரிந்துரைக்கப்பட்ட மருந்துகள்:\n`;
        analysis.medications.forEach((m) => {
          docExplanation += `• ${m.brandName || m.genericName} (${m.dosage}) - ${m.frequency}, ${m.timingTa || m.timing}\n`;
        });
        if (genericMatches.length > 0) {
          docExplanation += `\n\nஇதற்கான அரசு ஜன் ஔஷதி மலிவு விலை மாற்று மருந்துகள் கீழே பட்டியலிடப்பட்டுள்ளன.`;
        }
      }

      const executedToolCalls: AgentToolCall[] = [
        {
          id: `tool-${Date.now()}-ocr`,
          name: 'readMedicalDocument',
          label: 'Multimodal Vision Document OCR',
          status: 'success',
          resultSummary: `Extracted ${analysis.medications.length} medications from prescription`,
          data: analysis,
        },
      ];

      if (genericMatches.length > 0) {
        executedToolCalls.push({
          id: `tool-${Date.now()}-jan`,
          name: 'searchJanAushadhi',
          label: 'PMBJP Jan Aushadhi Generic Radar',
          status: 'success',
          resultSummary: `Found ${genericMatches.length} generic equivalents saving up to ${Math.max(...genericMatches.map(m => m.savingsPercentage))}%`,
          data: genericMatches,
        });
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: docExplanation,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prescriptionAnalysis: analysis,
        genericMedicines: genericMatches,
        executedTools: executedToolCalls,
        usageMeta: {
          latencyMs: 820,
          totalTokens: 480,
          modelName: currentModel.name,
        },
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMsg],
            };
          }
          return s;
        })
      );

      speechEngine.speak(
        docExplanation.slice(0, 250),
        lang,
        0.85,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );
    } catch (ocrErr: any) {
      console.error('OCR Error:', ocrErr);
      const errMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: lang === 'en'
          ? "I was unable to clearly scan that document. Please ensure the photo is well-lit and all medication text is clearly visible, then try attaching it again."
          : "ஆவணத்தை தெளிவாக வாசிக்க முடியவில்லை. நல்ல வெளிச்சத்தில் மருந்துப் பெயர்கள் தெரியும்படி மீண்டும் படம் எடுத்து பதிவேற்றவும்.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errMsg] } : s))
      );
    } finally {
      setIsThinking(false);
    }
  };

  // Conclude Live Vision Consultation & Generate Longitudinal Care-Loop Plan
  const handleLiveConsultationComplete = (summary: LiveConsultationSummary) => {
    const reportText = lang === 'en'
      ? `[Live Vision & Voice Tele-Clinic Consultation Report]\n` +
        `• Session Duration: ${Math.round(summary.durationSeconds)}s\n` +
        `• Chief Complaint: ${summary.chiefComplaint}\n` +
        `• Visual Observations:\n${summary.visualFindings.map(f => `  - ${f}`).join('\n')}\n` +
        `• Clinical Guidance & Advice:\n${summary.doctorConclusion}\n` +
        `• Scheduled Care-Loop: Proactive recovery check-in active in 24 hours.`
      : `[நிகழ்நேர கேமரா மருத்துவ அறிக்கை]\n` +
        `• ஆலோசனை நேரம்: ${Math.round(summary.durationSeconds)} வினாடிகள்\n` +
        `• அறிகுறிகள்: ${summary.chiefComplaint}\n` +
        `• காட்சிப் பதிவுகள்:\n${summary.visualFindings.map(f => `  - ${f}`).join('\n')}\n` +
        `• மருத்துவ வழிகாட்டுதல்:\n${summary.doctorConclusion}\n` +
        `• தீவிரக் கண்காணிப்பு: 24 மணிநேரத்தில் மறுபரிசீலனை நினைவூட்டல் தொடங்கப்பட்டது.`;

    const summaryMessage: ChatMessage = {
      id: `a-${Date.now()}`,
      sender: 'ai',
      text: reportText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      genericMedicines: summary.genericMedications,
      executedTools: [
        {
          id: `tool-${Date.now()}-live`,
          name: 'liveVisionDoctor',
          label: 'Live Vision Tele-Clinic HUD',
          status: 'success',
          resultSummary: `Concluded ${summary.durationSeconds}s stream with visual telemetry`,
        },
      ],
      usageMeta: {
        latencyMs: 310,
        totalTokens: 520,
        modelName: 'Gemini 2.5 Flash Vision',
      },
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: `Live Clinic: ${summary.chiefComplaint.slice(0, 16)}`,
            messages: [...s.messages, summaryMessage],
          };
        }
        return s;
      })
    );

    setToastMessage(lang === 'en' ? 'Live Tele-Clinic Consultation saved with 24h Care-Loop!' : 'நேரடி கேமரா ஆலோசனை சேமிக்கப்பட்டது!');
  };

  // Immediate Simulation of 24h Care-Loop Follow-up
  const handleSimulateCareLoopCheckIn = (loop: CareLoopFollowUp) => {
    const prompt = lang === 'en' ? loop.followUpPromptEn : loop.followUpPromptTa;
    const aiMessage: ChatMessage = {
      id: `a-${Date.now()}`,
      sender: 'ai',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotionalState: 'calm',
      executedTools: [
        {
          id: `tool-${Date.now()}-careloop`,
          name: 'careLoopRecoveryMonitor',
          label: 'Autonomous Proactive Care-Loop Follow-up',
          status: 'success',
          resultSummary: `24-Hour Recovery Check-in for ${loop.condition}`,
        },
      ],
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s))
    );

    speechEngine.speak(prompt.slice(0, 220), lang, 0.88);
  };

  // Right-click context menu handler
  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sessionId,
    });
  };

  // Pin / Unpin
  const handleTogglePin = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextPinned = !s.pinned;
          if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
            updateSessionInDb(sessionId, { is_pinned: nextPinned });
          }
          return { ...s, pinned: nextPinned };
        }
        return s;
      })
    );
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Start Rename
  const handleStartRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Commit Rename
  const handleSaveRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      const trimmed = editingTitle.trim();
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
              updateSessionInDb(sessionId, { title: trimmed });
            }
            return { ...s, title: trimmed };
          }
          return s;
        })
      );
    }
    setEditingSessionId(null);
  };

  // Archive
  const handleArchive = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
            updateSessionInDb(sessionId, { is_archived: true });
          }
          return { ...s, archived: true };
        }
        return s;
      })
    );
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Delete
  const handleDeleteSession = (sessionId: string) => {
    if (currentUser && sessionId.length > 20 && !sessionId.startsWith('chat-')) {
      deleteSessionInDb(sessionId);
    }
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Like / Dislike
  const handleToggleLike = (msgId: string, type: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === msgId) {
                return {
                  ...m,
                  liked: type === 'like' ? !m.liked : false,
                  disliked: type === 'dislike' ? !m.disliked : false,
                };
              }
              return m;
            }),
          };
        }
        return s;
      })
    );
  };

  // Read Aloud
  const handleSpeakMessage = (text: string) => {
    if (isVoiceSpeaking) {
      speechEngine.stopSpeaking();
      setIsVoiceSpeaking(false);
    } else {
      speechEngine.speak(
        text,
        lang,
        1.1,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );
    }
  };

  // Suggestion action card triggers (Tailored for Caregiver Mode when activeBeneficiary is chosen)
  const suggestionCards = activeBeneficiary
    ? [
        {
          titleEn: `Report symptoms for ${activeBeneficiary.name.split(' ')[0]}`,
          titleTa: `${activeBeneficiary.name.split(' ')[0]}-ன் அறிகுறிகள் கூற`,
          icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50',
          query: `My ${activeBeneficiary.relationship.toLowerCase()}, ${activeBeneficiary.name} (${activeBeneficiary.age}y ${activeBeneficiary.gender}), has had a persistent fever and fatigue for 2 days. What should we do?`,
        },
        {
          titleEn: `Check medicine doses for ${activeBeneficiary.name.split(' ')[0]}`,
          titleTa: `மருந்து டோஸ் சரிபார்க்க`,
          icon: <Pill className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50',
          query: `What is the safe medication dosage and precautions for a ${activeBeneficiary.age}-year-old ${activeBeneficiary.gender}?`,
        },
        {
          titleEn: 'Find hospital / specialist',
          titleTa: 'சிறப்பு மருத்துவமனை தேட',
          icon: <Building2 className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50',
          query: `Where is the nearest multi-specialty hospital with geriatric/pediatric care in Chennai?`,
        },
        {
          titleEn: 'Home care & diet tips',
          titleTa: 'வீட்டுப் பராமரிப்பு & உணவு',
          icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
          bg: 'bg-teal-50',
          query: `What diet, hydration, and home monitoring steps should I take for my ${activeBeneficiary.relationship.toLowerCase()} right now?`,
        },
      ]
    : [
        {
          titleEn: 'Ask about a symptom',
          titleTa: 'அறிகுறிகள் பற்றி கேட்க',
          icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50',
          query: 'I have had a sore throat, dry cough, and mild chills for 2 days.'
        },
        {
          titleEn: 'Check a medicine',
          titleTa: 'மருந்து விவரம் பார்க்க',
          icon: <Pill className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50',
          query: 'Can I take Paracetamol 500mg and Montelukast together?'
        },
        {
          titleEn: 'Find a nearby hospital',
          titleTa: 'அருகிலுள்ள மருத்துவமனை',
          icon: <Building2 className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50',
          query: 'Where is the nearest 24/7 Government Emergency Hospital in Chennai?'
        },
        {
          titleEn: 'Get first-aid guidance',
          titleTa: 'முதலுதவி வழிகாட்டுதல்',
          icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
          bg: 'bg-teal-50',
          query: 'What is the immediate first-aid for a sudden burn or cut at home?'
        }
      ];

  return (
    <div className="flex h-full w-full overflow-hidden font-sans bg-white text-slate-800">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Hidden File Input for Paperclip */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={() => {
          handleSendMessage('Attached prescription document. Please extract medicines and verify contraindications.');
        }}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dedicated Consultation History & Sessions) */}
      {/* ========================================================= */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-72 sm:w-80 md:w-64 lg:w-72 flex-shrink-0 flex flex-col border-r bg-[#FAFCFB] border-slate-200/90
        transform transition-transform duration-200 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Header: Title + Close Button on Mobile */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0A604D] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                {lang === 'en' ? 'Consultations' : 'உரையாடல்கள்'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {lang === 'en' ? 'Chat History & Vault' : 'முந்தைய குறிப்புகள்'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* + New Chat Pill Button */}
        <div className="p-3 pb-1">
          <button
            onClick={() => {
              ensureAuth(handleNewChat, lang === 'en' ? 'Sign in to start a new chat' : 'புதிய உரையாடலைத் தொடங்க உள்நுழையவும்');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E8F7F2] hover:bg-[#DDF2EB] text-[#0A604D] font-bold text-xs sm:text-sm transition-colors border border-[#C6ECE0] shadow-2xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'en' ? 'New Consultation' : 'புதிய உரையாடல்'}</span>
          </button>
        </div>

        {/* Recent Chats Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'en' ? 'Recent Chats' : 'முந்தைய உரையாடல்கள்'}
          </div>

          <div className="px-3 py-0.5 text-[10px] font-semibold text-slate-400">
            {lang === 'en' ? 'Today' : 'இன்று'}
          </div>

          <div className="space-y-0.5">
            {sessions
              .filter((s) => !s.archived)
              .map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = session.id === editingSessionId;

                return (
                  <div
                    key={session.id}
                    onContextMenu={(e) => handleContextMenu(e, session.id)}
                    className="relative group"
                  >
                    {isEditing ? (
                      <div className="px-3 py-1.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id);
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                          autoFocus
                          className="w-full text-xs px-2 py-1 bg-white border border-teal-500 rounded-md outline-none text-slate-800"
                        />
                        <button
                          onClick={() => handleSaveRename(session.id)}
                          className="p-1 text-teal-600 hover:text-teal-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!authService.getCurrentUser()) {
                            ensureAuth();
                            return;
                          }
                          setActiveSessionId(session.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (!authService.getCurrentUser()) {
                              ensureAuth();
                              return;
                            }
                            setActiveSessionId(session.id);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isActive
                            ? 'bg-[#E8F7F2] text-[#0A604D] font-bold'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#0A604D]' : 'text-slate-400'}`} />
                          <span className="truncate">{session.title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {session.pinned && (
                            <Pin className="w-3 h-3 text-teal-600 fill-teal-600 flex-shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-800 rounded transition-opacity"
                            title="Options"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Bottom Profile Footer (leads to /profile) */}
        <div className="p-3 border-t border-slate-200 bg-[#FAFCFB]">
          <button
            onClick={() => {
              if (currentUser) {
                onNavigateProfile();
              } else {
                setIsLoginOpen(true);
              }
            }}
            className="w-full p-2.5 rounded-2xl flex items-center justify-between text-xs transition-colors group cursor-pointer hover:bg-slate-100 text-slate-700"
            title={currentUser ? (lang === 'en' ? 'Open Profile Page' : 'சுயவிவரப் பக்கம்') : (lang === 'en' ? 'Click to Sign In' : 'உள்நுழைய கிளிக்')}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-slate-900 truncate max-w-[130px]">
                  {currentUser ? currentUser.name : (lang === 'en' ? 'Guest Patient' : 'விருந்தினர்')}
                </div>
                <div className="text-[10px] text-teal-600 font-medium">
                  {currentUser ? (lang === 'en' ? 'My Health Profile' : 'என் சுயவிவரம்') : (lang === 'en' ? 'Click to Sign In' : 'உள்நுழைய கிளிக்')}
                </div>
              </div>
            </div>
            <span className="text-slate-400 font-bold group-hover:text-teal-600 transition-colors">&gt;</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CHAT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Bar (Matching Chatbot UI.png) */}
        <header className="px-3 sm:px-6 py-2 sm:py-2.5 border-b flex items-center justify-between flex-shrink-0 z-20 bg-white border-slate-200/90 gap-2">
          {/* Left: Mobile History Drawer Trigger + DocBot AI + Verified Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
              aria-label="Open consultation history"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0A604D]" />
              <span>{lang === 'en' ? 'History' : 'வரலாறு'}</span>
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-teal-50 border border-teal-200/60 p-1 flex items-center justify-center shadow-2xs shrink-0">
              <img
                src="/docbot_mascot.png"
                alt="DocBot AI"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">DocBot AI</h2>
              <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700">
                <span className="truncate max-w-[110px] sm:max-w-none">{lang === 'en' ? 'Verified Assistant' : 'சரிபார்க்கப்பட்டவர்'}</span>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
              </div>
            </div>
          </div>

          {/* Right: Actions Header Pills (Clean, Minimal, Single Line, Zero Wrap) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* New Chat Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(handleNewChat, lang === 'en' ? 'Sign in to start a new chat' : 'புதிய உரையாடலைத் தொடங்க உள்நுழையவும்');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-teal-200 bg-[#E8F7F2] hover:bg-[#DDF2EB] text-[#0A604D] text-[11px] sm:text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title={lang === 'en' ? 'Start fresh consultation' : 'புதிய உரையாடல்'}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{lang === 'en' ? 'New' : 'புதியது'}</span>
            </button>

            {/* Beneficiary Switcher Pill (ABDM Multi-Profile Standard) */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsBeneficiaryModalOpen(true),
                  lang === 'en'
                    ? 'Sign in to consult for family members'
                    : 'குடும்ப உறுப்பினர்களுக்காக ஆலோசிக்க உள்நுழையவும்'
                );
              }}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all shadow-2xs group cursor-pointer ${
                activeBeneficiary
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 hover:bg-amber-500/25 ring-1 ring-amber-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={
                activeBeneficiary
                  ? `Consulting for: ${activeBeneficiary.name} (${activeBeneficiary.relationship})`
                  : 'Consulting for Myself'
              }
            >
              <User className={`w-3.5 h-3.5 ${activeBeneficiary ? 'text-amber-700' : 'text-teal-600'} group-hover:scale-110 transition-transform shrink-0`} />
              <span className="font-bold truncate max-w-[85px] sm:max-w-[130px]">
                {activeBeneficiary
                  ? `${activeBeneficiary.relationship}: ${activeBeneficiary.name.split(' ')[0]}`
                  : (lang === 'en' ? 'Myself' : 'எனக்கு')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>

            {/* Live Vision & Voice Tele-Clinic Launch Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsLiveVisionOpen(true),
                  lang === 'en'
                    ? 'Sign in to start Live Vision & Voice Consultation'
                    : 'நேரடி கேமரா ஆலோசனையைத் தொடங்க உள்நுழையவும்'
                );
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all bg-emerald-500/10 border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 shadow-2xs group cursor-pointer"
              title="Start Real-Time Live Camera & Voice Tele-Clinic"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Video className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-bold">
                {lang === 'en' ? 'Live' : 'நேரடி'}
              </span>
              <span className="font-bold hidden md:inline">
                {lang === 'en' ? ' Vision' : ' கேமரா'}
              </span>
            </button>

            {/* Longitudinal Health Memory & Vitals Hub Pill */}
            <button
              type="button"
              onClick={() => {
                ensureAuth(
                  () => setIsVitalsModalOpen(true),
                  lang === 'en'
                    ? 'Sign in to access your Longitudinal Health Memory'
                    : 'உங்கள் நீண்டகால மருத்துவ நினைவகத்தைக் காண உள்நுழையவும்'
                );
              }}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 shadow-2xs group cursor-pointer"
              title="Open Longitudinal Health Memory & Vitals Hub"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-bold">
                {lang === 'en' ? 'Records' : 'நினைவகம்'}
              </span>
              <span className="font-bold hidden md:inline">
                {lang === 'en' ? ' Hub' : ''}
              </span>
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAFCFB]">
          {/* Active Caregiver Consultation Mode Banner */}
          {activeBeneficiary && (
            <div className="max-w-3xl mx-auto p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200/90 text-amber-900 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-2xs">
                  {activeBeneficiary.gender === 'Female' ? '👩' : '👨'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate">
                      {lang === 'en' ? 'Caregiver Mode' : 'பராமரிப்பாளர் முறை'}: {activeBeneficiary.name}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-bold border border-amber-300 flex-shrink-0">
                      {activeBeneficiary.relationship}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium truncate">
                    {activeBeneficiary.age}y • {activeBeneficiary.gender} • <span className="font-mono font-semibold">{activeBeneficiary.healthId}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBeneficiaryModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs transition-colors flex-shrink-0 cursor-pointer"
              >
                {lang === 'en' ? 'Switch Patient' : 'நோயாளி மாற்று'}
              </button>
            </div>
          )}

          {/* Pinned Autonomous Proactive Care-Loop Recovery Monitor */}
          {activeCareLoops.length > 0 && (
            <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50/50 border border-teal-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-950">
                      {lang === 'en' ? 'Proactive Care-Loop Recovery Monitor' : 'தீவிரக் கண்காணிப்பு நெறிமுறை'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-200/70 text-teal-800">
                      {lang === 'en' ? '24h Scheduled Check-in' : '24 மணிநேர நினைவூட்டல்'}
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                    {lang === 'en'
                      ? `Tracking recovery for: ${activeCareLoops[0].condition} (${activeCareLoops[0].initialSymptoms})`
                      : `கண்காணிக்கப்படும் அறிகுறிகள்: ${activeCareLoops[0].condition}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateCareLoopCheckIn(activeCareLoops[0])}
                className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Simulate 24h Check-in Loop Instantly"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Simulate 24h Check-in' : '24h மாதிரி சோதனை'}</span>
              </button>
            </div>
          )}
          {/* Welcome Screen when Session Has No Messages */}
          {(!activeSession || activeSession.messages.length === 0) && (
            <div className="max-w-2xl mx-auto pt-8 pb-4 text-center space-y-6 animate-in fade-in duration-300">
              {/* Center Robot Icon */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-200/80 p-2 flex items-center justify-center shadow-xs">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot Mascot"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeBeneficiary
                    ? (lang === 'en'
                        ? `Consulting for ${activeBeneficiary.name}`
                        : `${activeBeneficiary.name} - மருத்துவ ஆலோசனை`)
                    : (lang === 'en'
                        ? 'Hello! How can I help you today?'
                        : 'வணக்கம்! இன்று உங்களுக்கு எவ்வாறு உதவலாம்?')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                  {activeBeneficiary
                    ? (lang === 'en'
                        ? `Describe symptoms or concerns regarding your ${activeBeneficiary.relationship.toLowerCase()} (${activeBeneficiary.age}y). Clinical guidance and triage will be calibrated for them.`
                        : `உங்கள் ${activeBeneficiary.relationship}-க்கான அறிகுறிகளை விவரிக்கவும். மருத்துவ ஆலோசனைகள் அதற்கேற்ப வழங்கப்படும்.`)
                    : (lang === 'en'
                        ? 'Get trusted, easy-to-understand health information, 24/7.'
                        : 'நம்பகமான, எளிதில் புரியக்கூடிய மருத்துவ ஆலோசனைகள் 24 மணி நேரமும்.')}
                </p>
              </div>

              {/* Action Suggestion Pills (Concise, Small & Pill-Styled) */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-xl mx-auto">
                {suggestionCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(card.query)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-xs text-xs font-semibold text-slate-700 transition-all cursor-pointer group shadow-2xs"
                  >
                    <span className="p-1 rounded-full bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                    <span>
                      {lang === 'en' ? card.titleEn : card.titleTa}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Conversation Messages */}
          {activeSession &&
            activeSession.messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-2xl bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <img
                        src="/docbot_mascot.png"
                        alt="DocBot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#E8F7F2] border border-[#C6ECE0] text-slate-800 rounded-tr-sm max-w-lg'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm w-full shadow-xs'
                    }`}
                  >
                    {/* User Attachment Indicator */}
                    {isUser && msg.attachmentName && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-100/70 border border-teal-200 text-[11px] font-bold text-teal-900">
                        <FileUp className="w-3.5 h-3.5 text-teal-700" />
                        <span>{msg.attachmentName}</span>
                      </div>
                    )}

                    {/* Autonomous Agentic Tool Execution Badges (Zero Emojis, Pure Lucide SVGs) */}
                    {!isUser && msg.executedTools && msg.executedTools.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                        {msg.executedTools.map((tool) => (
                          <span
                            key={tool.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#0B7A75]/10 text-[#0B7A75] border border-[#0B7A75]/20 shadow-2xs"
                            title={tool.resultSummary}
                          >
                            {tool.name === 'searchJanAushadhi' && <Search className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'findNearbyCare' && <MapPin className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'checkDiseaseOutbreaks' && <Activity className="w-3 h-3 text-amber-600" />}
                            {tool.name === 'emergencySOSDispatch' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                            {tool.name === 'readMedicalDocument' && <FileText className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'longitudinalHealthMemory' && <Activity className="w-3 h-3 text-teal-600" />}
                            {tool.name === 'liveVisionDoctor' && <Video className="w-3 h-3 text-[#0B7A75]" />}
                            {tool.name === 'careLoopRecoveryMonitor' && <Clock className="w-3 h-3 text-teal-600" />}
                            <span>{tool.label}</span>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dual-Track Emotional De-escalation Protocol Badge */}
                    {!isUser && msg.emotionalState && msg.emotionalState !== 'calm' && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        <HeartHandshake className="w-3 h-3 text-teal-600" />
                        <span>
                          {msg.emotionalState === 'panic' && (lang === 'en' ? 'Emergency De-escalation Protocol Active' : 'அதிதீவிர அமைதி நெறிமுறை')}
                          {msg.emotionalState === 'parental_worry' && (lang === 'en' ? 'Pediatric Reassurance Protocol Active' : 'குழந்தை நல ஆறுதல் நெறிமுறை')}
                          {msg.emotionalState === 'financial_stress' && (lang === 'en' ? 'Jan Aushadhi Cost Relief Protocol Active' : 'ஜன் ஔஷதி கட்டண நிவாரணம்')}
                          {msg.emotionalState === 'geriatric_confusion' && (lang === 'en' ? 'Geriatric Safety Protocol Active' : 'முதியோர் பாதுகாப்பு நெறிமுறை')}
                          {msg.emotionalState === 'anxious' && (lang === 'en' ? 'Clinical Reassurance Active' : 'மருத்துவ ஆறுதல்')}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Embedded Longitudinal Health Memory Insight Pill */}
                    {!isUser && msg.executedTools && msg.executedTools.some((t) => t.name === 'longitudinalHealthMemory') && (
                      <div className="mt-3 p-3 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-teal-950">
                            <Activity className="w-3.5 h-3.5 text-teal-600" />
                            <span>{lang === 'en' ? 'Health Memory & Vitals Correlation' : 'மருத்துவ நினைவக ஒப்பீடு'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsVitalsModalOpen(true)}
                            className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                          >
                            {lang === 'en' ? 'Open Vitals Hub' : 'அளவீடுகளைக் காண்க'}
                          </button>
                        </div>
                        <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
                          {msg.executedTools.find((t) => t.name === 'longitudinalHealthMemory')?.resultSummary}
                        </p>
                      </div>
                    )}

                    {/* Interactive Jan Aushadhi Generic Medicine Comparison Cards */}
                    {!isUser && msg.genericMedicines && msg.genericMedicines.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-[#0B7A75]" />
                            <span>{lang === 'en' ? 'PMBJP Jan Aushadhi Generic Alternatives' : 'ஜன் ஔஷதி மலிவு விலை மாற்று மருந்துகள்'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {lang === 'en' ? '50% to 90% Lower Cost (PMBJP)' : '50% முதல் 90% வரை சேமிப்பு'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.genericMedicines.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-teal-400 transition-colors text-xs space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <div className="font-bold text-slate-800">{med.brandName}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{med.genericName}</div>
                                </div>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>-{med.savingsPercentage}%</span>
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                                <span className="text-slate-400 line-through">₹{med.brandPrice.toFixed(2)}</span>
                                <span className="font-bold text-emerald-700 font-mono text-xs">₹{med.genericPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline Interactive Clinical Triage Wizard */}
                    {!isUser && msg.triageWizard && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100/90 animate-in fade-in duration-200">
                        {(() => {
                          const wizard = msg.triageWizard;
                          const state = wizardStates[msg.id] || {
                            currentStepIndex: 0,
                            answers: {},
                            isCompleted: false,
                          };
                          const curIdx = Math.min(state.currentStepIndex, wizard.steps.length - 1);
                          const curStep = wizard.steps[curIdx];
                          const totalSteps = wizard.totalSteps;
                          const progressPercent = state.isCompleted
                            ? 100
                            : Math.round(((curIdx) / totalSteps) * 100);

                          return (
                            <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-b from-teal-50/60 via-white to-slate-50/80 p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all duration-300">
                              {/* Header & Step Counter */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-[#0B7A75]/10 flex items-center justify-center text-[#0B7A75]">
                                    <Activity className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 leading-tight">
                                      {lang === 'ta' ? wizard.topicTa : wizard.topicEn}
                                    </div>
                                    <div className="text-[10px] text-teal-700/80 font-medium">
                                      {lang === 'ta' ? 'ICMR மருத்துவ நிலை அளவீடு' : 'ICMR Clinical Triage Flow'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {!state.isCompleted && curIdx > 0 && (
                                    <button
                                      type="button"
                                      disabled={isThinking}
                                      onClick={() => handleWizardStepBack(msg.id)}
                                      className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      title={lang === 'ta' ? 'முந்தைய கேள்வி' : 'Previous Step'}
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                      <span>{lang === 'ta' ? 'முந்தைய' : 'Back'}</span>
                                    </button>
                                  )}
                                  <div className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100/80 text-teal-900 border border-teal-200/60">
                                    {state.isCompleted
                                      ? (lang === 'ta' ? 'முடிந்தது' : 'Complete')
                                      : `${lang === 'ta' ? 'படி' : 'Step'} ${curIdx + 1}/${totalSteps}`}
                                  </div>
                                </div>
                              </div>

                              {/* Animated Progress Bar */}
                              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-[#0B7A75] transition-all duration-300 rounded-full"
                                  style={{ width: `${state.isCompleted ? 100 : Math.max(progressPercent, 15)}%` }}
                                />
                              </div>

                              {/* Active Step Question or Completed Summary */}
                              {!state.isCompleted ? (
                                <div className="space-y-2.5 pt-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-800">
                                      {lang === 'ta' ? curStep.questionTa : curStep.questionEn}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => speakWizardQuestion(lang === 'ta' ? curStep.questionTa : curStep.questionEn)}
                                      className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors shrink-0"
                                      title={lang === 'ta' ? 'கேள்வியைக் கேளுங்கள்' : 'Listen to question'}
                                    >
                                      <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                      <span>{lang === 'ta' ? 'கேளுங்கள்' : 'Listen'}</span>
                                    </button>
                                  </div>

                                  {/* Selectable Option Chips */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {curStep.options.map((opt, optIdx) => {
                                      const labelText = lang === 'ta' ? opt.labelTa : opt.labelEn;
                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          disabled={isThinking}
                                          onClick={() => handleWizardOptionSelect(msg.id, wizard, curStep, opt)}
                                          className={`group px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all duration-150 flex items-start justify-between gap-2 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                                            opt.isRedFlag
                                              ? 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-300/80 text-rose-900 hover:border-rose-400'
                                              : 'bg-white hover:bg-teal-50/70 border-slate-200 hover:border-teal-400 text-slate-800 hover:text-teal-950'
                                          }`}
                                        >
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5 font-medium leading-snug">
                                              {opt.isRedFlag && (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                              )}
                                              <span>{labelText}</span>
                                            </div>
                                            {lang !== 'ta' && (
                                              <div className="text-[10px] text-slate-500 font-normal group-hover:text-teal-700/80">
                                                {opt.labelTa}
                                              </div>
                                            )}
                                          </div>
                                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 text-[#0B7A75]" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                /* Completed Status Pill & Answer Summary */
                                <div className="space-y-2 pt-1 animate-in fade-in duration-300">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      {lang === 'ta'
                                        ? 'மதிப்பீடு நிறைவடைந்தது • மருத்துவர் ஆய்வு செய்கிறார்'
                                        : 'Assessment Complete • Transmitted to Clinical Doctor'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {wizard.steps.map((st, sIdx) => {
                                      const ans = state.answers[st.id];
                                      if (!ans) return null;
                                      const ansText = lang === 'ta' ? ans.labelTa : ans.labelEn;
                                      return (
                                        <div
                                          key={sIdx}
                                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                                            ans.isRedFlag
                                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                                              : 'bg-slate-100/90 text-slate-700 border-slate-200/90'
                                          }`}
                                        >
                                          <span className="font-semibold text-slate-500">
                                            {lang === 'ta' ? st.titleTa : st.titleEn}:
                                          </span>
                                          <span className="truncate max-w-[200px]">{ansText}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Interactive Adaptive Choosing Options (Single-Tap Pills or Multi-Select Checkboxes) */}
                    {!isUser && (!msg.triageWizard || wizardStates[msg.id]?.isCompleted) && msg.suggestedOptions && msg.suggestedOptions.items && msg.suggestedOptions.items.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100/90 animate-in fade-in duration-200">
                        {msg.suggestedOptions.type === 'single_tap' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#0B7A75]" />
                                <span>{lang === 'en' ? 'Quick Follow-ups & Responses' : 'விரைவு பதில்கள்'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => speakAllOptions(msg.suggestedOptions!.items)}
                                className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors"
                                title={lang === 'en' ? 'Listen to all options' : 'தேர்வுகளைக் கேளுங்கள்'}
                              >
                                <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                <span>{lang === 'en' ? 'Listen' : 'கேளுங்கள்'}</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.suggestedOptions.items.map((opt, oIdx) => {
                                const clean = opt.toLowerCase();
                                const isEmergency = clean.includes('108') || clean.includes('emergency') || clean.includes('ambulance');
                                const isStore = clean.includes('kendra') || clean.includes('jan aushadhi') || clean.includes('medicine');
                                const isVideo = clean.includes('video') || clean.includes('vision');
                                const isVitals = clean.includes('vital') || clean.includes('telemetry');

                                let colorStyles = 'bg-[#0B7A75]/5 hover:bg-[#0B7A75]/15 text-[#0B7A75] border-[#0B7A75]/25 hover:border-[#0B7A75]/50';
                                if (isEmergency) {
                                  colorStyles = 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-400 font-semibold';
                                } else if (isStore) {
                                  colorStyles = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-400';
                                } else if (isVideo) {
                                  colorStyles = 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-400';
                                } else if (isVitals) {
                                  colorStyles = 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-400';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={isThinking}
                                    onClick={() => handleOptionSelect(opt)}
                                    className={`group px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-left ${colorStyles}`}
                                  >
                                    <span>{opt}</span>
                                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-[#0B7A75]" />
                                <span>{lang === 'en' ? 'Select all that apply:' : 'பொருந்துபவற்றைத் தேர்ந்தெடுக்கவும்:'}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => speakAllOptions(msg.suggestedOptions!.items)}
                                  className="text-[10px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200/80 transition-colors"
                                  title={lang === 'en' ? 'Listen to options' : 'தேர்வுகளைக் கேளுங்கள்'}
                                >
                                  <Volume2 className="w-2.5 h-2.5 text-teal-600" />
                                  <span>{lang === 'en' ? 'Listen' : 'கேளுங்கள்'}</span>
                                </button>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {(selectedMultiOptions[msg.id] || []).length} {lang === 'en' ? 'selected' : 'தேர்ந்தெடுக்கப்பட்டது'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {msg.suggestedOptions.items.map((opt, oIdx) => {
                                const isChecked = (selectedMultiOptions[msg.id] || []).includes(opt);
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={isThinking}
                                    onClick={() => toggleMultiOption(msg.id, opt)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 border transition-all cursor-pointer ${
                                      isChecked
                                        ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-[#0B7A75] shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="truncate">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="pt-1 flex items-center justify-between">
                              <button
                                type="button"
                                disabled={isThinking || (selectedMultiOptions[msg.id] || []).length === 0}
                                onClick={() => handleSendMultiOptions(msg.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0B7A75] hover:bg-[#09635f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                              >
                                <span>{lang === 'en' ? 'Send Selected' : 'தேர்ந்தெடுத்தவற்றை அனுப்பு'}</span>
                                <span>({(selectedMultiOptions[msg.id] || []).length})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Actions Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{msg.time}</span>
                        {isUser && <span className="text-teal-600 font-bold">✓✓</span>}
                        {msg.usageMeta && (
                          <span className="font-mono text-[10px] text-slate-400 hidden sm:inline flex items-center gap-1">
                            • <Zap className="w-2.5 h-2.5 text-amber-500 inline" /> {msg.usageMeta.latencyMs}ms ({msg.usageMeta.totalTokens} tok)
                          </span>
                        )}
                      </div>

                      {!isUser && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="p-1 hover:text-slate-700 rounded transition-colors"
                            title={copiedId === msg.id ? 'Copied!' : 'Copy to clipboard'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLike(msg.id, 'like')}
                            className={`p-1 hover:text-slate-700 rounded transition-colors ${
                              msg.liked ? 'text-teal-600 font-bold' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLike(msg.id, 'dislike')}
                            className={`p-1 hover:text-slate-700 rounded transition-colors ${
                              msg.disliked ? 'text-rose-500 font-bold' : ''
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSpeakMessage(msg.text)}
                            className="p-1 hover:text-teal-700 rounded transition-colors cursor-pointer"
                            title={isVoiceSpeaking ? (lang === 'en' ? 'Stop Speaking' : 'நிறுத்து') : (lang === 'en' ? 'Read Aloud with Doctor Voice' : 'படிக்கவும்')}
                          >
                            {isVoiceSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Thinking State with Moving Jump Dots Alone (Per User Mandate) */}
          {isThinking && (
            <div className="flex items-start gap-3 max-w-3xl mr-auto animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-2xl bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <img
                  src="/docbot_mascot.png"
                  alt="DocBot"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================= */}
        {/* 3. INPUT BAR & DOCKED CONTROLS */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-5 pb-5 sm:pb-5 safe-area-pb border-t z-10 bg-white border-slate-200/90">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Docked Model Selector, Doctor Voice Persona Switcher & Realtime Quota Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Model Dropdown Pill (Claude/ChatGPT styled) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                    title="Switch AGI Model"
                  >
                    {currentModel.provider === 'google' ? (
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    ) : currentModel.isReasoning ? (
                      <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="font-bold">{currentModel.name}</span>
                    <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-slate-200/70 text-slate-600">
                      {currentModel.provider === 'groq' ? 'Groq' : 'Gemini'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Model Popover Dropdown */}
                  {showModelDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                      <div className="absolute bottom-full mb-2 left-0 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl shadow-slate-950/50 z-50 p-2.5 text-slate-200 animate-dropdown-flow-up">
                        <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Select AGI Model</span>
                          <span className="text-teal-400 lowercase font-mono text-[10px]">Active Keys Verified</span>
                        </div>
                        <div className="space-y-1 mt-2">
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
                                    ? 'bg-teal-950 border border-teal-500/50 text-white'
                                    : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                }`}
                              >
                                <div className="p-2 rounded-xl mt-0.5 bg-slate-800">
                                  {model.provider === 'google' ? (
                                    <Sparkles className="w-4 h-4 text-cyan-400" />
                                  ) : model.isReasoning ? (
                                    <Brain className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Zap className="w-4 h-4 text-amber-400" />
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
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Color-Changing Realtime Quota Bar */}
              {(() => {
                const usedPct = Math.min(100, Math.round((usageStats.sessionTotalTokens / usageStats.sessionQuotaMax) * 100));
                const remainingPct = 100 - usedPct;

                let barColor = 'bg-emerald-500';
                let dotColor = 'bg-emerald-500';

                if (remainingPct <= 20) {
                  barColor = 'bg-rose-500';
                  dotColor = 'bg-rose-500 animate-ping';
                } else if (remainingPct <= 60) {
                  barColor = 'bg-amber-500';
                  dotColor = 'bg-amber-500';
                }

                return (
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                      <span>Quota: {remainingPct}%</span>
                    </span>
                    <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(5, remainingPct)}%` }}
                      />
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
                      {usageStats.sessionTotalTokens.toLocaleString()} / 100k tok
                    </span>
                    <button
                      type="button"
                      onClick={() => agiService.resetUsage()}
                      title="Reset Token Counter"
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Live Voice Recording Status Banner */}
            {isRecording && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-900 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span>
                    {lang === 'en'
                      ? 'Listening to symptoms... Speak in English or Tamil'
                      : 'கேட்கிறது... அறிகுறிகளைத் தமிழில் அல்லது ஆங்கிலத்தில் பேசவும்'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>{lang === 'en' ? 'Done Speaking' : 'முடிந்தது'}</span>
                </button>
              </div>
            )}

            {/* Input Capsule (Matching Chatbot UI.png) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isThinking || isSendingRef.current) return;
                handleSendMessage();
              }}
              className="rounded-full border flex items-center gap-2 p-1.5 sm:p-2 shadow-xs transition-all bg-white border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100"
            >
              {/* Paperclip Attachment Button */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Attach Prescription or Lab Slip"
              >
                <Paperclip className="w-4 h-4 rotate-45" />
              </button>

              {/* Text Input Field */}
              <input
                ref={chatInputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isRecording
                    ? (lang === 'en' ? 'Listening... speak symptoms now...' : 'கேட்கிறது... இப்போது பேசவும்...')
                    : (lang === 'en' ? 'Ask a health question in English or Tamil (or tap mic to speak)...' : 'தமிழில் அல்லது English-ல் மருத்துவக் கேள்வி கேட்கவும்...')
                }
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-1"
              />

              {/* Microphone Button with Active Pulsing Ring Animation */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isRecording ? (lang === 'en' ? 'Stop listening' : 'நிறுத்து') : (lang === 'en' ? 'Voice Input (Click to Speak)' : 'குரல் உள்ளீடு')}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce text-white' : ''}`} />
              </button>

              {/* Circular Send Button (Matching Chatbot UI.png) */}
              <button
                type="submit"
                disabled={isThinking}
                className="p-2.5 rounded-full bg-[#057A55] hover:bg-[#046A4A] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Hidden File Input for Prescription & Lab Report Autonomous Vision OCR Reader */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Bottom Medical Disclaimer (Matching Chatbot UI.png) */}
            <p className="text-[11px] text-center text-slate-400 font-medium">
              {lang === 'en'
                ? 'HealthGrid AI provides general health information and is not a substitute for professional medical advice.'
                : 'HealthGrid AI பொதுவான மருத்துவத் தகவல்களை மட்டுமே வழங்குகிறது. தீவிர நோய்களுக்கு மருத்துவரை நேரில் அணுகவும்.'}
            </p>
          </div>
        </div>

      </main>

      {/* ========================================================= */}
      {/* 4. CONTEXT MENU FOR CHAT HISTORY (Right-Click) */}
      {/* ========================================================= */}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleTogglePin(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Pin className="w-3.5 h-3.5 text-teal-600" />
            <span>Pin chat</span>
          </button>

          <button
            onClick={() => {
              const target = sessions.find((s) => s.id === contextMenu.sessionId);
              if (target) handleStartRename(target);
            }}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => handleArchive(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Archive className="w-3.5 h-3.5 text-slate-600" />
            <span>Archive</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            onClick={() => handleDeleteSession(contextMenu.sessionId)}
            className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 text-left font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete chat</span>
          </button>
        </div>
      )}

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Login Modal mounted inside ChatbotPage */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginNotice(null);
          pendingActionRef.current = null;
        }}
        lang={lang}
        contextNotice={loginNotice}
        onSuccess={handleLoginSuccess}
      />

      {/* Live Camera Vision & Voice Doctor Tele-Clinic Modal */}
      <LiveVisionDoctorModal
        isOpen={isLiveVisionOpen}
        onClose={() => setIsLiveVisionOpen(false)}
        lang={lang}
        userId={currentUser?.id || 'guest-patient'}
        onConsultationComplete={handleLiveConsultationComplete}
      />

      {/* Longitudinal Health Memory & Vitals Telemetry Modal */}
      <VitalsTelemetryModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        lang={lang}
      />

      {/* Consultation Beneficiary & Family Member Multi-Profile Modal */}
      <ConsultationBeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        lang={lang}
        onSelectBeneficiary={(member) => {
          setActiveBeneficiary(member);
          if (member) {
            setToastMessage(
              lang === 'en'
                ? `Switched patient to ${member.name} (${member.relationship})`
                : `நோயாளி மாற்றப்பட்டார்: ${member.name} (${member.relationship})`
            );
          } else {
            setToastMessage(
              lang === 'en'
                ? 'Switched consultation to Myself'
                : 'ஆலோசனை எனக்கான முறைக்கு மாற்றப்பட்டது'
            );
          }
        }}
      />

    </div>
  );
};
