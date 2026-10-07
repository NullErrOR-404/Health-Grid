import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Sparkles,
  Activity,
  Scan,
  Maximize2,
  Minimize2,
  MoreVertical,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Pill,
  FlaskConical,
  Wifi,
  Clock,
  Calendar,
  X,
  Ambulance,
  Bell,
  Check,
  ArrowRight,
  Lightbulb,
  Camera
} from 'lucide-react';
import type { Language } from '../types';
import { speechEngine } from '../services/speechService';
import {
  liveVisionDoctor,
  type LiveConsultationSummary
} from '../services/liveVisionDoctorService';
import { type JanAushadhiResult } from '../services/agenticToolsService';

interface LiveVisionDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userId: string;
  patientName?: string;
  knownAllergies?: string[];
  onConsultationComplete: (summary: LiveConsultationSummary) => void;
}

interface TranscriptItem {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export const LiveVisionDoctorModal: React.FC<LiveVisionDoctorModalProps> = ({
  isOpen,
  onClose,
  lang,
  userId,
  patientName = 'Arjun Kumar',
  knownAllergies = [],
  onConsultationComplete,
}) => {
  // Navigation & Sub-views in Left Sidebar
  const [activeNavTab, setActiveNavTab] = useState<'video' | 'patient_info' | 'clinical_notes' | 'prescriptions' | 'lab_investigations' | 'share'>('video');

  // Media stream states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [isPatientSpeaking, setIsPatientSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(504); // 08:24 default matching reference
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  // Mobile Bottom Sheet Toggle
  const [isMobileAiSheetOpen, setIsMobileAiSheetOpen] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);

  // Live Subtitles & Clinical checklist matching Live vision Clinic ref.png
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [doctorResponseText, setDoctorResponseText] = useState(
    lang === 'en'
      ? "I can see your image clearly. The area looks like a skin rash. Let me ask a few questions to understand better."
      : "உங்கள் படத்தை தெளிவாகக் காண்கிறேன். இது தோல் அரிப்பு போல் தெரிகிறது. துல்லியமாகப் புரிந்துகொள்ள சில கேள்விகள் கேட்கிறேன்."
  );

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 'c1', label: lang === 'en' ? 'This is the affected area' : 'இது பாதிக்கப்பட்ட பகுதி', checked: true },
    { id: 'c2', label: lang === 'en' ? 'It feels itchy' : 'அரிப்பு அல்லது நமைச்சல் உள்ளது', checked: false },
    { id: 'c3', label: lang === 'en' ? 'It is painful' : 'வலிக்கிறது', checked: false },
    { id: 'c4', label: lang === 'en' ? 'It started in the last 3 days' : 'கடந்த 3 நாட்களில் தொடங்கியது', checked: false },
  ]);

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    { id: 't1', sender: 'user', text: lang === 'en' ? 'I have a skin rash on my hand.' : 'என் கையில் தோல் தடிப்பு உள்ளது.', time: '08:32 AM' },
    { id: 't2', sender: 'doctor', text: lang === 'en' ? 'Please bring the affected area closer to the camera so I can take a look.' : 'நான் பார்க்க ஏதுவாக பாதிக்கப்பட்ட பகுதியை கேமராவுக்கு அருகில் கொண்டு வாருங்கள்.', time: '08:32 AM' },
    { id: 't3', sender: 'user', text: lang === 'en' ? 'Okay, here it is.' : 'சரி, இதோ இங்கே.', time: '08:33 AM' },
    { id: 't4', sender: 'doctor', text: lang === 'en' ? 'Thank you. I can see it clearly now.' : 'நன்றி. இப்போது என்னால் தெளிவாகப் பார்க்க முடிகிறது.', time: '08:33 AM' },
  ]);

  const [chatInputText, setChatInputText] = useState('');
  const [accumulatedFindings, setAccumulatedFindings] = useState<string[]>([
    'Mild erythematous macular rash over dorsal hand',
    'No active weeping or vesicular lesions observed',
  ]);
  const [accumulatedGenerics, setAccumulatedGenerics] = useState<JanAushadhiResult[]>([]);
  const [isEmergencyDetected, setIsEmergencyDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const autoScanIntervalRef = useRef<any>(null);

  // Initialize camera & microphone stream
  const startCameraStream = useCallback(async (facing: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      setStream(mediaStream);
      setCameraPermissionDenied(false);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Could not access live camera, falling back to simulated high-fidelity clinic preview:', err);
      setCameraPermissionDenied(true);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCameraStream(cameraFacing);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      clearInterval(timerRef.current);
      clearInterval(autoScanIntervalRef.current);
      speechEngine.stopListening();
      liveVisionDoctor.stopSpeaking();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      clearInterval(timerRef.current);
      clearInterval(autoScanIntervalRef.current);
      speechEngine.stopListening();
      liveVisionDoctor.stopSpeaking();
    };
  }, [isOpen]);

  // Continuous speech-to-text listener
  const startContinuousListening = useCallback(() => {
    if (isMicMuted || !isOpen) return;

    speechEngine.startListening(lang, {
      onTranscript: (text, isFinal) => {
        setCurrentTranscript(text);
        setIsPatientSpeaking(true);
        if (isFinal) {
          setIsPatientSpeaking(false);
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setTranscripts((prev) => [...prev, { id: `t-${Date.now()}`, sender: 'user', text, time: timeStr }]);
          triggerFrameAnalysis(text);
        }
      },
      onStateChange: (state) => {
        if (state === 'idle' && isOpen && !isMicMuted && !isDoctorSpeaking) {
          setTimeout(() => startContinuousListening(), 300);
        }
      },
      onError: () => {
        setIsPatientSpeaking(false);
      },
    });
  }, [lang, isMicMuted, isOpen, isDoctorSpeaking]);

  useEffect(() => {
    if (isOpen && !isMicMuted && !isDoctorSpeaking) {
      startContinuousListening();
    }
  }, [isOpen, isMicMuted, isDoctorSpeaking, startContinuousListening]);

  // Periodic frame inspection (~5 seconds)
  useEffect(() => {
    if (!isOpen) return;

    autoScanIntervalRef.current = setInterval(() => {
      if (!isAnalyzing && !isDoctorSpeaking && videoRef.current) {
        triggerFrameAnalysis(currentTranscript);
      }
    }, 5500);

    return () => clearInterval(autoScanIntervalRef.current);
  }, [isOpen, isAnalyzing, isDoctorSpeaking, currentTranscript]);

  // Trigger multimodal vision inspection
  const triggerFrameAnalysis = async (userQuery: string) => {
    if (!videoRef.current || isAnalyzing) return;

    const base64 = liveVisionDoctor.captureFrameBase64(videoRef.current);
    if (!base64) return;

    setIsAnalyzing(true);
    try {
      const result = await liveVisionDoctor.analyzeLiveVisionFrame(
        base64,
        userQuery || 'Inspect patient symptom and provide immediate bedside guidance.',
        lang,
        knownAllergies
      );

      if (result.visualObservations && result.visualObservations.length > 0) {
        setAccumulatedFindings((prev) => [
          ...prev,
          ...result.visualObservations.filter((o) => !prev.includes(o)),
        ]);
      }

      if (result.detectedMeds && result.detectedMeds.length > 0) {
        setAccumulatedGenerics((prev) => [
          ...prev,
          ...result.detectedMeds!.filter((m) => !prev.some((p) => p.genericName === m.genericName)),
        ]);
      }

      if (result.isEmergency) {
        setIsEmergencyDetected(true);
      }

      if (result.verbalAdvice) {
        setDoctorResponseText(result.verbalAdvice);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        setTranscripts((prev) => [...prev, { id: `t-doc-${Date.now()}`, sender: 'doctor', text: result.verbalAdvice, time: timeStr }]);

        speechEngine.stopListening();
        liveVisionDoctor.speakAdvice(
          result.verbalAdvice,
          lang,
          () => setIsDoctorSpeaking(true),
          () => {
            setIsDoctorSpeaking(false);
            setCurrentTranscript('');
            startContinuousListening();
          }
        );
      }
    } catch {
      // throttle
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleCameraFacing = () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(next);
    startCameraStream(next);
  };

  const handleToggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = isMicMuted;
      });
      setIsMicMuted(!isMicMuted);
      if (!isMicMuted) {
        speechEngine.stopListening();
      } else {
        startContinuousListening();
      }
    } else {
      setIsMicMuted(!isMicMuted);
    }
  };

  const handleToggleCameraVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    } else {
      setIsCameraOff(!isCameraOff);
    }
  };

  // Conclude Call: as resolved in grill-me, immediately close and inject SBAR card into chat
  const handleEndConsultation = () => {
    const summary = liveVisionDoctor.concludeLiveConsultation({
      userId,
      durationSeconds: elapsedSeconds,
      chiefComplaint: accumulatedFindings[0] || 'Live Vision Tele-Triage (Skin Rash)',
      accumulatedFindings,
      finalAdvice: doctorResponseText,
      genericMeds: accumulatedGenerics,
      isEmergency: isEmergencyDetected,
      followUpHours: 24,
    });

    onConsultationComplete(summary);
    onClose();
  };

  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const userMsg = chatInputText.trim();
    setTranscripts((prev) => [...prev, { id: `t-chat-${Date.now()}`, sender: 'user', text: userMsg, time: timeStr }]);
    setChatInputText('');

    // Trigger AI response for typed message in Live Clinic
    triggerFrameAnalysis(userMsg);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col text-slate-900 font-sans overflow-hidden animate-in fade-in duration-200"
    >
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER (Matching Live vision Clinic ref.png) */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between z-30 shrink-0">
        {/* Left: HealthGrid Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">HealthGrid</span>
            </div>
            <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">AI Health Assistant</p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button type="button" onClick={onClose} className="hover:text-slate-900 cursor-pointer">Home</button>
          <button type="button" className="text-teal-700 font-bold border-b-2 border-teal-600 pb-0.5 cursor-pointer">Chat</button>
          <button type="button" className="hover:text-slate-900 cursor-pointer">Medicines</button>
          <button type="button" className="hover:text-slate-900 cursor-pointer">Maps</button>
          <div className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
            <span>More</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </nav>

        {/* Right Tools: Lang, Notif, Doctor Profile, SOS Ambulance */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50">
            <span>EN</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* Doctor / User Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120"
              alt="Dr. Mohamed"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden xl:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">Dr. Mohamed</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Apollo Clinic, Chennai</p>
            </div>
          </div>

          {/* SOS Ambulance */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Ambulance className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOS Ambulance</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE BODY (Matching Live vision Clinic ref.png) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2A. LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex w-72 xl:w-80 border-r border-slate-200/90 bg-white flex-col justify-between p-5 overflow-y-auto shrink-0">
          <div className="space-y-6">
            {/* Header: Live Clinic */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Live Clinic</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time AI Assisted Consultation</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveNavTab('video')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'video'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-4 h-4 ${activeNavTab === 'video' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>Video Consultation</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab('patient_info')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'patient_info'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Patient Information</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab('clinical_notes')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'clinical_notes'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>AI Clinical Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab('prescriptions')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'prescriptions'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Pill className="w-4 h-4 text-slate-400" />
                <span>Prescriptions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab('lab_investigations')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'lab_investigations'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-slate-400" />
                <span>Lab Investigations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab('share')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'share'
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Share & Follow-up</span>
              </button>
            </div>
          </div>

          {/* Session Details Card matching reference */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-3 mt-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Session Details</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient</span>
                  <span className="font-bold text-slate-900">{patientName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                  <span className="font-semibold text-slate-800">28 yrs / Male</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Type</span>
                  <span className="font-semibold text-slate-800">General Medicine</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Duration</span>
                  <span className="font-mono font-bold text-slate-900">{timeFormatted}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation ID</span>
                  <span className="font-mono font-medium text-slate-700">VC20250929-001</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Network</span>
                  <span className="font-bold text-emerald-700">Good</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 2B. CENTER MAIN VIDEO VIEWPORT */}
        <main className="flex-1 p-3 sm:p-5 flex flex-col min-w-0 bg-[#F1F5F9] relative overflow-hidden">
          
          {/* Main Video Screen Container (Matching Live vision Clinic ref.png) */}
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center">
            
            {/* Live Camera Video Stream or Fallback High-Fidelity Simulation */}
            {!cameraPermissionDenied && !isCameraOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1280"
                  alt="Patient consultation preview"
                  className="w-full h-full object-cover filter brightness-90"
                />
                {isCameraOff && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-slate-300">
                    <VideoOff className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-semibold">Camera is paused</span>
                  </div>
                )}
              </div>
            )}

            {/* TOP OVERLAYS OVER VIDEO */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
              {/* Live Timer Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 text-white border border-slate-700/80 backdrop-blur-md text-xs font-mono font-bold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{timeFormatted}</span>
                {isPatientSpeaking && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" title="Speaking"></span>
                )}
              </div>

              {/* Right Camera & Window Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleCameraFacing}
                  className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md"
                  title="Flip Camera (Front/Rear)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md"
                  title="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FLOATING AI VISION SCANNER BANNER (Matching Live vision Clinic ref.png) */}
            <div className="absolute bottom-24 inset-x-4 sm:inset-x-8 max-w-2xl mx-auto z-20 pointer-events-auto">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/85 border border-teal-500/30 text-white shadow-2xl backdrop-blur-md text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI VISION SCANNER</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-100 max-w-xl mx-auto leading-relaxed">
                  {lang === 'en'
                    ? "Hello! I am DocBot. Please bring the area of concern, symptom, or medicine strip closer to the camera so I can properly inspect it and help you."
                    : "வணக்கம்! நான் DocBot. உங்கள் பிரச்சனை உள்ள பகுதி அல்லது மருந்து அட்டையை கேமராவுக்கு அருகில் கொண்டு வாருங்கள்."}
                </p>

                {/* 3 Guidance Tip Cards in Dark Glass */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium leading-tight">
                      {lang === 'en' ? 'Show affected area in good lighting' : 'நல்ல வெளிச்சத்தில் காட்டவும்'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium leading-tight">
                      {lang === 'en' ? 'Keep the camera steady' : 'கேமராவை அசையாமல் வைக்கவும்'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium leading-tight">
                      {lang === 'en' ? 'You can also show medicine strips' : 'மருந்து அட்டைகளையும் காட்டலாம்'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCTOR PIP (Picture-in-Picture) in Bottom Right */}
            <div className="absolute bottom-24 right-4 sm:right-6 z-20 pointer-events-auto hidden sm:block">
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240"
                  alt="Doctor avatar PIP"
                  className="w-full h-full object-cover"
                />
                {/* Audio Equalizer wave badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-1 rounded-md bg-slate-950/80 border border-teal-500/40 flex items-center gap-0.5">
                  <span className="w-0.5 h-2.5 bg-emerald-400 animate-pulse"></span>
                  <span className="w-0.5 h-4 bg-emerald-400 animate-bounce"></span>
                  <span className="w-0.5 h-2 bg-emerald-400 animate-pulse"></span>
                </div>
              </div>
            </div>

            {/* FLOATING CALL CONTROLS CAPSULE (Bottom Center) */}
            <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-30 pointer-events-auto">
              <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-slate-950/85 border border-slate-700/80 backdrop-blur-md shadow-2xl">
                {/* Mute Button */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`flex flex-col items-center gap-1 p-2 rounded-full transition-colors cursor-pointer ${
                    isMicMuted ? 'text-rose-400 hover:text-rose-300' : 'text-white hover:text-slate-200'
                  }`}
                  title={isMicMuted ? 'Unmute' : 'Mute'}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isMicMuted ? 'bg-rose-500/30' : 'bg-white/10'}`}>
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline">Mute</span>
                </button>

                {/* Stop Video Button */}
                <button
                  type="button"
                  onClick={handleToggleCameraVideo}
                  className={`flex flex-col items-center gap-1 p-2 rounded-full transition-colors cursor-pointer ${
                    isCameraOff ? 'text-rose-400 hover:text-rose-300' : 'text-white hover:text-slate-200'
                  }`}
                  title={isCameraOff ? 'Start Video' : 'Stop Video'}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCameraOff ? 'bg-rose-500/30' : 'bg-white/10'}`}>
                    {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline">Stop Video</span>
                </button>

                {/* End Call Button (Prominent Red Pill) */}
                <button
                  type="button"
                  onClick={handleEndConsultation}
                  className="flex flex-col items-center gap-1 p-1 transition-transform active:scale-95 cursor-pointer"
                  title="End Consultation"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/50">
                    <PhoneOff className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-300 hidden sm:inline">End Call</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1 p-2 text-white hover:text-slate-200 transition-colors cursor-pointer"
                  title="Share Screen"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline">Share</span>
                </button>

                {/* More Button */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1 p-2 text-white hover:text-slate-200 transition-colors cursor-pointer"
                  title="More Settings"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline">More</span>
                </button>

                {/* Mobile AI Assistant Drawer Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileAiSheetOpen(true)}
                  className="lg:hidden flex flex-col items-center gap-1 p-2 text-teal-300 hover:text-teal-200 transition-colors cursor-pointer"
                  title="AI Assistant Sheet"
                >
                  <div className="w-9 h-9 rounded-full bg-teal-600/40 border border-teal-400/50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-300" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-300">AI Sheet</span>
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* 2C. RIGHT SIDEBAR (Desktop: AI Assistant & Live Transcript matching Live vision Clinic ref.png) */}
        <aside className="hidden lg:flex w-80 xl:w-96 border-l border-slate-200/90 bg-white flex-col justify-between p-4 overflow-y-auto shrink-0 space-y-4">
          
          <div className="space-y-4 flex-1 flex flex-col overflow-y-auto">
            
            {/* TOP CARD: AI Assistant */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">AI Assistant</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              {/* Doctor Observation Bubble */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {doctorResponseText}
                </p>
              </div>

              {/* Please confirm: Interactive Checklist */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">Please confirm:</span>
                
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        item.checked
                          ? 'bg-[#E6F4F1] border-teal-500 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        item.checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                      }`}>
                        {item.checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerFrameAnalysis('User confirmed checklist items.');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Medicine Strip Helper Tip */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-600">
                <div className="w-4 h-4 text-teal-600 shrink-0 mt-0.5">
                  <Scan className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-[11px] leading-relaxed">
                  You can also show me a medicine strip if you are currently taking any medication.
                </p>
              </div>
            </div>

            {/* BOTTOM CARD: Live Transcript */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <button
                type="button"
                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">Live Transcript</h3>
                </div>
                {isTranscriptExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isTranscriptExpanded && (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 text-xs">
                  {transcripts.map((t) => (
                    <div key={t.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${t.sender === 'user' ? 'text-slate-800' : 'text-teal-700'}`}>
                          {t.sender === 'user' ? 'You' : 'DocBot'}
                        </span>
                        <span className="text-[10px] text-slate-400">{t.time}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pl-1">{t.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* CHAT INPUT BAR AT BOTTOM OF RIGHT SIDEBAR */}
          <form onSubmit={handleSendChatMessage} className="relative flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </aside>

      </div>

      {/* 3. MOBILE SLIDE-UP DRAWER FOR AI ASSISTANT & TRANSCRIPT */}
      {isMobileAiSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden text-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Consultation Assistant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileAiSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-slate-800">
                {doctorResponseText}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Please confirm symptoms:</span>
                {checklistItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border text-left cursor-pointer ${
                      item.checked ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      item.checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-400'
                    }`}>
                      {item.checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Transcript</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto text-xs text-slate-600">
                  {transcripts.map((t) => (
                    <div key={t.id}>
                      <span className="font-bold text-slate-900">{t.sender === 'user' ? 'You' : 'DocBot'}: </span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileAiSheetOpen(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
            >
              Return to Video
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
