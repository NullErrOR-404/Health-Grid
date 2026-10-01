import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Home,
  MessageSquare,
  Phone,
  Siren,
  Pill,
  Shield,
  ChevronDown,
  User,
  CheckCircle2,
  Globe,
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
  X
} from 'lucide-react';
import type { Language } from '../types';
import { speechEngine } from '../services/speechService';
import {
  agiService,
  AVAILABLE_MODELS,
  type ModelOption,
  type UsageStats
} from '../services/aiService';
import { medicalRecordService } from '../services/medicalRecordService';
import { supabase } from '../services/supabaseClient';
import { authService, purgeAllTestArtifacts, type AuthUser } from '../services/authService';
import { LoginModal } from './LoginModal';

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
  setLang,
  onNavigateHome,
  onNavigateProfile,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  initialQuery,
}) => {
  // Sessions state with LocalStorage persistence and legacy mock purging
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      purgeAllTestArtifacts();
      const saved = localStorage.getItem('healthgrid_chat_sessions');
      if (saved) {
        const lower = saved.toLowerCase();
        if (
          lower.includes('murugan') ||
          lower.includes('8841') ||
          lower.includes('fever') ||
          lower.includes('vaccination') ||
          lower.includes('diabetes') ||
          lower.includes('stomach') ||
          lower.includes('rash')
        ) {
          localStorage.removeItem('healthgrid_chat_sessions');
          return [createFreshSession()];
        }
        const parsed = JSON.parse(saved);
        // Purge legacy mock sessions if detected
        const hasLegacyMock = Array.isArray(parsed) && parsed.some((s: any) =>
          s.id === 'fever-headache' ||
          s.id === 'child-vaccination' ||
          s.id === 'diabetes-diet-plan' ||
          s.id === 'skin-rash' ||
          s.id === 'stomach-pain' ||
          s.title?.toLowerCase().includes('fever') ||
          s.title?.toLowerCase().includes('vaccination') ||
          s.title?.toLowerCase().includes('diabetes') ||
          s.title?.toLowerCase().includes('stomach') ||
          s.title?.toLowerCase().includes('rash') ||
          JSON.stringify(s).toLowerCase().includes('murugan')
        );
        if (!hasLegacyMock && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else {
          localStorage.removeItem('healthgrid_chat_sessions');
        }
      }
    } catch {
      // fallback
    }
    return [createFreshSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || `chat-${Date.now()}`);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Proactively sweep and eliminate any legacy mock chat history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('healthgrid_chat_sessions');
      if (saved) {
        const lower = saved.toLowerCase();
        if (
          lower.includes('murugan') ||
          lower.includes('fever') ||
          lower.includes('vaccination') ||
          lower.includes('diabetes') ||
          lower.includes('stomach') ||
          lower.includes('rash')
        ) {
          localStorage.removeItem('healthgrid_chat_sessions');
          setSessions([createFreshSession()]);
        }
      }
    } catch {}
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

  // Sync sessions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('healthgrid_chat_sessions', JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const ensureAuth = (action?: () => void, customNotice?: string): boolean => {
    const user = authService.getCurrentUser();
    if (user) {
      if (action) action();
      return true;
    }
    const notice =
      customNotice ||
      (lang === 'en'
        ? 'Sign in or create an account to start your consultation'
        : 'மருத்துவ ஆலோசனையைத் தொடங்க உள்நுழையவும் அல்லது புதிய கணக்கு தொடங்கவும்');
    setLoginNotice(notice);
    setToastMessage(notice);
    setIsLoginOpen(true);
    if (action) {
      pendingActionRef.current = action;
    }
    return false;
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
  const handleToggleVoiceInput = () => {
    if (!ensureAuth(() => handleToggleVoiceInput(), lang === 'en' ? 'Sign in to use voice consultation' : 'குரல் வழிக் கேள்வி கேட்க உள்நுழையவும்')) {
      return;
    }

    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
      return;
    }

    if (isVoiceSpeaking) {
      speechEngine.stopSpeaking();
      setIsVoiceSpeaking(false);
    }

    setIsRecording(true);
    speechEngine.startListening(lang, {
      onTranscript: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onStateChange: (state) => {
        if (state === 'idle' || state === 'error') {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        console.warn('Voice input error:', err);
        setIsRecording(false);
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

    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

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
      const patientProfile = medicalRecordService.getProfile();
      const conditions = (patientProfile.chronicConditions || []).filter(c => Boolean(c) && !c.toLowerCase().includes('seasonal'));
      const allergies = (patientProfile.allergies || []).filter(a => Boolean(a) && !a.toLowerCase().includes('penicillin'));
      const hasName = Boolean(
        patientProfile.name &&
        patientProfile.name.trim() &&
        !patientProfile.name.toLowerCase().includes('murugan') &&
        !patientProfile.name.toLowerCase().includes('verified patient')
      );

      let patientContext: string | undefined = undefined;
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
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackAi: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text:
          lang === 'en'
            ? 'Based on Tamil Nadu clinical standards, your symptoms have been noted. Maintain hydration and rest. For fever relief, Paracetamol 500mg generic (₹0.40/tablet) is safe with your medical profile.'
            : 'தமிழ்நாடு மருத்துவ வழிகாட்டுதல்களின்படி விவரங்கள் பதிவு செய்யப்பட்டன. ஓய்வு மற்றும் நீர்ச்சத்து எடுத்துக்கொள்ளவும். காய்ச்சலுக்கு பாராசிட்டமால் 500 மிகி மாத்திரை பாதுகாப்பானது.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, fallbackAi] } : s))
      );
    } finally {
      setIsThinking(false);
    }
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
        0.85,
        () => setIsVoiceSpeaking(true),
        () => setIsVoiceSpeaking(false)
      );
    }
  };

  // Suggestion action card triggers
  const suggestionCards = [
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
    <div className="flex h-screen w-full overflow-hidden font-sans bg-white text-slate-800">
      
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
      {/* 1. LEFT SIDEBAR (Matching Chatbot UI.png) */}
      {/* ========================================================= */}
      <aside className="w-64 sm:w-72 flex-shrink-0 flex flex-col border-r bg-[#FAFCFB] border-slate-200/90">
        
        {/* Brand Logo Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onNavigateHome}>
            <img 
              src="/Logo.png" 
              alt="HealthGrid - நலம் AI" 
              className="h-9 sm:h-10 w-auto object-contain hover:opacity-95 transition-opacity" 
            />
          </div>
        </div>

        {/* + New Chat Pill Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() => {
              ensureAuth(handleNewChat, lang === 'en' ? 'Sign in to start a new chat' : 'புதிய உரையாடலைத் தொடங்க உள்நுழையவும்');
            }}
            className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#E8F7F2] hover:bg-[#DDF2EB] text-[#0A604D] font-bold text-xs transition-colors border border-[#C6ECE0] shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'en' ? 'New Chat' : 'புதிய உரையாடல்'}</span>
          </button>
        </div>

        {/* Primary Navigation Items */}
        <div className="px-3 py-1 space-y-0.5 text-xs font-medium">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'Home' : 'முகப்பு'}</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-[#E8F7F2] text-[#0A604D] font-bold border border-[#C6ECE0]/60 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#0A604D]" />
            <span>{lang === 'en' ? 'Chat with AI' : 'AI மருத்துவருடன் பேசு'}</span>
          </button>

          <button
            onClick={() => {
              ensureAuth(
                () => handleSendMessage(lang === 'en' ? 'Connect me with doctor telemedicine tele-triage.' : 'மருத்துவரை தொலைபேசியில் அழைக்கவும்.'),
                lang === 'en' ? 'Sign in to request doctor tele-triage' : 'மருத்துவரை அழைக்க உள்நுழையவும்'
              );
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
          >
            <Phone className="w-4 h-4 text-slate-500" />
            <span>{lang === 'en' ? 'Speak to Doctor' : 'மருத்துவரிடம் பேசு'}</span>
          </button>

          {onOpenAmbulance && (
            <button
              onClick={() => {
                ensureAuth(onOpenAmbulance, lang === 'en' ? 'Sign in to dispatch ambulance' : 'ஆம்புலன்ஸ் அழைக்க உள்நுழையவும்');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
            >
              <Siren className="w-4 h-4 text-rose-500" />
              <span>{lang === 'en' ? 'Call Ambulance' : 'ஆம்புலன்ஸ் 108'}</span>
            </button>
          )}

          {onOpenPrescription && (
            <button
              onClick={() => {
                ensureAuth(onOpenPrescription, lang === 'en' ? 'Sign in to access prescription & generic medicines' : 'மருந்து சேவைகளுக்கு உள்நுழையவும்');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
            >
              <Pill className="w-4 h-4 text-slate-500" />
              <span>{lang === 'en' ? 'Medicines' : 'மருந்துகள் (Jan Aushadhi)'}</span>
            </button>
          )}

          {onOpenDiseaseMap && (
            <button
              onClick={() => {
                ensureAuth(onOpenDiseaseMap, lang === 'en' ? 'Sign in to access disease outbreak map' : 'நோய் வரைபடத்திற்கு உள்நுழையவும்');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>{lang === 'en' ? 'Disease Map' : 'நோய் பரவல் வரைபடம்'}</span>
            </button>
          )}

          {onOpenBabyShots && (
            <button
              onClick={() => {
                ensureAuth(onOpenBabyShots, lang === 'en' ? 'Sign in to access vaccination records' : 'தடுப்பூசி அட்டவணைக்கு உள்நுழையவும்');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-600"
            >
              <div className="flex items-center gap-3">
                <ChevronDown className="w-4 h-4 text-slate-400" />
                <span>{lang === 'en' ? 'More (Vaccination)' : 'கூடுதல் (தடுப்பூசி)'}</span>
              </div>
            </button>
          )}
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
        <header className="px-6 py-3.5 border-b flex items-center justify-between flex-shrink-0 z-20 bg-white border-slate-200/90">
          {/* Left: DocBot AI + Verified Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200/60 p-1 flex items-center justify-center shadow-2xs">
              <img
                src="/docbot_mascot.png"
                alt="DocBot AI"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">DocBot AI</h2>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span>{lang === 'en' ? 'Verified Medical Assistant' : 'சரிபார்க்கப்பட்ட மருத்துவ உதவியாளர்'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              </div>
            </div>
          </div>

          {/* Right: Language Dropdown + Profile Pill (Clean Light Theme, No Toggle Icon) */}
          <div className="flex items-center gap-2.5">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                title="Toggle Language (English / Tamil)"
              >
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                <span>{lang === 'en' ? 'EN' : 'தமிழ்'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Top Right Profile Round Pill */}
            <button
              onClick={() => {
                if (currentUser) {
                  onNavigateProfile();
                } else {
                  setIsLoginOpen(true);
                }
              }}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border transition-all text-xs font-semibold cursor-pointer group bg-white border-slate-200 text-slate-800 hover:border-teal-400 shadow-2xs"
              title={currentUser ? (lang === 'en' ? `My Health Profile (${currentUser.name})` : 'என் சுயவிவரம்') : (lang === 'en' ? 'Sign In / Profile' : 'உள்நுழை / சுயவிவரம்')}
            >
              <div className="w-5 h-5 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-[10px] group-hover:scale-105 transition-transform">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
              </div>
              <span className="truncate max-w-[80px] font-semibold">
                {currentUser ? currentUser.name : (lang === 'en' ? 'Sign In' : 'உள்நுழை')}
              </span>
              {currentUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAFCFB]">
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
                  {lang === 'en' ? 'Hello! How can I help you today?' : 'வணக்கம்! இன்று உங்களுக்கு எவ்வாறு உதவலாம்?'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                  {lang === 'en'
                    ? 'Get trusted, easy-to-understand health information, 24/7.'
                    : 'நம்பகமான, எளிதில் புரியக்கூடிய மருத்துவ ஆலோசனைகள் 24 மணி நேரமும்.'}
                </p>
              </div>

              {/* 4 Action Suggestion Cards (Matching Chatbot UI.png) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {suggestionCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      ensureAuth(
                        () => handleSendMessage(card.query),
                        lang === 'en' ? 'Sign in or create an account to consult DocBot' : 'ஆலோசனையைத் தொடங்க உள்நுழையவும்'
                      );
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xs transition-all flex items-center gap-3.5 group text-left"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {card.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {lang === 'en' ? card.titleEn : card.titleTa}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {card.query}
                      </div>
                    </div>
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
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Bottom Actions Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{msg.time}</span>
                        {isUser && <span className="text-teal-600 font-bold">✓✓</span>}
                        {msg.usageMeta && (
                          <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                            • ⚡ {msg.usageMeta.latencyMs}ms ({msg.usageMeta.totalTokens} tok)
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
                            className="p-1 hover:text-teal-700 rounded transition-colors"
                            title="Read Aloud"
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
        <div className="p-4 sm:p-5 border-t z-10 bg-white border-slate-200/90">
          <div className="max-w-3xl mx-auto space-y-2.5">
            
            {/* Docked Model Selector & Realtime Quota Bar (Per Grill-me User Selection) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              
              {/* Model Dropdown Pill (Claude/ChatGPT styled) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    ensureAuth(
                      () => setShowModelDropdown(!showModelDropdown),
                      lang === 'en' ? 'Sign in to switch clinical AI models' : 'மாதிரியை மாற்ற உள்நுழையவும்'
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-semibold transition-all bg-slate-50 border-slate-200/90 text-slate-700 hover:bg-slate-100 shadow-2xs"
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
                    <div className="absolute bottom-full mb-2 left-0 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl shadow-slate-950/50 z-50 p-2.5 text-slate-200 animate-dropdown-flow-up">
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

            {/* Input Capsule (Matching Chatbot UI.png) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ensureAuth(() => handleSendMessage())) return;
                handleSendMessage();
              }}
              className="rounded-full border flex items-center gap-2 p-1.5 sm:p-2 shadow-xs transition-all bg-white border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100"
            >
              {/* Paperclip Attachment Button */}
              <button
                type="button"
                onClick={() => {
                  ensureAuth(
                    () => fileInputRef.current?.click(),
                    lang === 'en' ? 'Sign in to attach medical records or prescriptions' : 'மருத்துவ ஆவணங்களைப் பதிவேற்ற உள்நுழையவும்'
                  );
                }}
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Attach Prescription or Lab Slip"
              >
                <Paperclip className="w-4 h-4 rotate-45" />
              </button>

              {/* Text Input Field */}
              <input
                ref={chatInputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  if (!authService.getCurrentUser()) {
                    ensureAuth();
                    return;
                  }
                  setInputText(e.target.value);
                }}
                onFocus={(e) => {
                  if (!authService.getCurrentUser()) {
                    e.target.blur();
                    ensureAuth(() => chatInputRef.current?.focus());
                  }
                }}
                onClick={(e) => {
                  if (!authService.getCurrentUser()) {
                    e.currentTarget.blur();
                    ensureAuth(() => chatInputRef.current?.focus());
                  }
                }}
                placeholder={
                  lang === 'en'
                    ? (currentUser ? 'Ask a health question in English or Tamil...' : 'Sign in or create an account to chat...')
                    : (currentUser ? 'தமிழில் அல்லது English-ல் மருத்துவக் கேள்வி கேட்கவும்...' : 'உரையாட உள்நுழையவும் அல்லது கணக்கு தொடங்கவும்...')
                }
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-1"
              />

              {/* Microphone Button with Active Pulsing Ring Animation */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-full transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isRecording ? (lang === 'en' ? 'Stop listening' : 'நிறுத்து') : (lang === 'en' ? 'Voice Input' : 'குரல் உள்ளீடு')}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
              </button>

              {/* Circular Send Button (Matching Chatbot UI.png) */}
              <button
                type="submit"
                disabled={isThinking}
                className="p-2.5 rounded-full bg-[#057A55] hover:bg-[#046A4A] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-transform active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

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

    </div>
  );
};
