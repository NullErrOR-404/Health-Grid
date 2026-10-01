import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Scan,
  Zap,
  Tag
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
  knownAllergies?: string[];
  onConsultationComplete: (summary: LiveConsultationSummary) => void;
}

export const LiveVisionDoctorModal: React.FC<LiveVisionDoctorModalProps> = ({
  isOpen,
  onClose,
  lang,
  userId,
  knownAllergies = [],
  onConsultationComplete,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false);
  const [isPatientSpeaking, setIsPatientSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live subtitles & accumulated clinical findings
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [doctorResponseText, setDoctorResponseText] = useState(
    lang === 'en'
      ? "I can see you clearly. Please point the camera at the area of concern and speak naturally."
      : "நான் தயாராக உள்ளேன். உங்கள் பிரச்சனை உள்ள பகுதியை கேமராவில் காட்டிப் பேசுங்கள்."
  );
  const [accumulatedFindings, setAccumulatedFindings] = useState<string[]>([]);
  const [accumulatedGenerics, setAccumulatedGenerics] = useState<JanAushadhiResult[]>([]);
  const [isEmergencyDetected, setIsEmergencyDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const autoScanIntervalRef = useRef<any>(null);

  // Initialize camera & microphone
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Could not access camera/mic:', err);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCameraStream(cameraFacing);
      setElapsedSeconds(0);
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

  // Start continuous speech recognition loop
  const startContinuousListening = useCallback(() => {
    if (isMicMuted || !isOpen) return;

    speechEngine.startListening(lang, {
      onTranscript: (text, isFinal) => {
        setCurrentTranscript(text);
        setIsPatientSpeaking(true);
        if (isFinal) {
          setIsPatientSpeaking(false);
          // Trigger vision analysis on user voice conclusion
          triggerFrameAnalysis(text);
        }
      },
      onStateChange: (state) => {
        if (state === 'idle' && isOpen && !isMicMuted && !isDoctorSpeaking) {
          // Restart loop to keep telephone-like continuous conversation
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

  // Auto-scan camera frame periodically (~3.5 seconds) if user is silent
  useEffect(() => {
    if (!isOpen) return;

    autoScanIntervalRef.current = setInterval(() => {
      if (!isAnalyzing && !isDoctorSpeaking && videoRef.current) {
        triggerFrameAnalysis(currentTranscript);
      }
    }, 4500);

    return () => clearInterval(autoScanIntervalRef.current);
  }, [isOpen, isAnalyzing, isDoctorSpeaking, currentTranscript]);

  // Frame capture and Multimodal Vision API call
  const triggerFrameAnalysis = async (userQuery: string) => {
    if (!videoRef.current || isAnalyzing) return;

    const base64 = liveVisionDoctor.captureFrameBase64(videoRef.current);
    if (!base64) return;

    setIsAnalyzing(true);
    try {
      const result = await liveVisionDoctor.analyzeLiveVisionFrame(
        base64,
        userQuery || 'Inspect patient symptom and provide immediate advice.',
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
        // Play verbal advice aloud
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
      // ignore concurrent throttling
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
    }
  };

  const handleToggleCameraVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((t) => {
        t.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const handleEndConsultation = () => {
    const summary = liveVisionDoctor.concludeLiveConsultation({
      userId,
      durationSeconds: elapsedSeconds,
      chiefComplaint: accumulatedFindings[0] || 'Live Vision Tele-Triage',
      accumulatedFindings,
      finalAdvice: doctorResponseText,
      genericMeds: accumulatedGenerics,
      isEmergency: isEmergencyDetected,
      followUpHours: 24,
    });

    onConsultationComplete(summary);
    onClose();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between text-white font-sans overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER HUD */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-slate-950/90 to-transparent">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-400/40 p-1 flex items-center justify-center shadow-lg shadow-teal-950/50 backdrop-blur-md">
            <img
              src="/docbot_mascot.png"
              alt="DocBot Mascot"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">DocBot Live Clinic</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>REC {timeString}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {lang === 'en' ? 'Real-Time Multimodal Vision & Voice' : 'நிகழ்நேர கேமரா மற்றும் குரல் ஆலோசனை'}
            </p>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          {/* Flip Camera */}
          <button
            type="button"
            onClick={handleToggleCameraFacing}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white transition-transform active:scale-95 shadow-md"
            title="Flip Camera (Front/Rear)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Camera Video Toggle */}
          <button
            type="button"
            onClick={handleToggleCameraVideo}
            className={`p-2.5 rounded-full border backdrop-blur-md transition-transform active:scale-95 shadow-md ${
              isCameraOff
                ? 'bg-rose-500/30 border-rose-400/50 text-rose-300'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
            }`}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. CAMERA VIEWFINDER & RETICLE HUD */}
      <div className="relative flex-1 w-full max-w-4xl mx-auto px-4 flex items-center justify-center">
        {/* Video Element */}
        <div className="relative w-full h-full max-h-[72vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
          />

          {/* Clinical Scanning Reticle Overlay */}
          <div className="absolute inset-8 sm:inset-14 border border-teal-400/25 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            {/* Top Corners */}
            <div className="flex justify-between items-center text-teal-400/80">
              <div className="w-5 h-5 border-t-2 border-l-2 border-teal-400"></div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/70 text-teal-300 border border-teal-500/30 backdrop-blur-md">
                <Scan className="w-3 h-3 text-teal-400" />
                <span>AI VISION SCANNER</span>
              </div>
              <div className="w-5 h-5 border-t-2 border-r-2 border-teal-400"></div>
            </div>

            {/* Center Focus Crosshair */}
            <div className="flex justify-center items-center">
              <div className={`w-12 h-12 rounded-full border border-teal-400/40 flex items-center justify-center ${isAnalyzing ? 'animate-spin border-t-teal-400 border-l-transparent' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
              </div>
            </div>

            {/* Bottom Corners */}
            <div className="flex justify-between items-center text-teal-400/80">
              <div className="w-5 h-5 border-b-2 border-l-2 border-teal-400"></div>
              {isEmergencyDetected ? (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/80 text-white animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span>EMERGENCY RED FLAG</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-md">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>TRIAGE ENGINE ACTIVE</span>
                </div>
              )}
              <div className="w-5 h-5 border-b-2 border-r-2 border-teal-400"></div>
            </div>
          </div>

          {/* Real-time Subtitles / Live Tele-Clinic Captions */}
          <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto text-center space-y-2 z-10 pointer-events-none">
            {/* Patient Speech Caption */}
            {currentTranscript && (
              <div className="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <span className="text-teal-400 font-bold mr-1.5">You:</span>
                <span>"{currentTranscript}"</span>
              </div>
            )}

            {/* Doctor Verbal Advice Caption */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/85 border border-teal-500/30 text-xs sm:text-sm leading-relaxed text-white shadow-xl backdrop-blur-md animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>DocBot Clinical Advice</span>
              </div>
              <p className="font-medium text-slate-100">{doctorResponseText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONTROLS & AMBIENT VOICE ORB */}
      <footer className="w-full px-6 py-5 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent flex flex-col items-center gap-4">
        {/* Voice Orb with Pulsating Audio Rings (Gemini Live / ChatGPT style) */}
        <div className="relative flex items-center justify-center">
          {/* Animated Pulsating Rings when speaking */}
          {(isDoctorSpeaking || isPatientSpeaking) && (
            <>
              <span className="absolute w-20 h-20 rounded-full bg-teal-500/20 animate-ping"></span>
              <span className="absolute w-24 h-24 rounded-full bg-cyan-500/15 animate-pulse"></span>
            </>
          )}

          {/* Central Voice Orb */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isDoctorSpeaking
                ? 'bg-gradient-to-tr from-[#057A55] via-teal-400 to-cyan-400 ring-4 ring-teal-400/50 scale-105 shadow-teal-500/50'
                : isPatientSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-sky-400 to-teal-400 ring-4 ring-cyan-400/50 scale-105 shadow-cyan-500/50'
                : isAnalyzing
                ? 'bg-gradient-to-tr from-amber-600 to-teal-500 animate-pulse ring-2 ring-amber-400/50'
                : 'bg-gradient-to-tr from-teal-800 to-slate-800 ring-2 ring-white/10'
            }`}
          >
            {isDoctorSpeaking ? (
              <Sparkles className="w-6 h-6 text-white animate-spin [animation-duration:3s]" />
            ) : isPatientSpeaking ? (
              <Mic className="w-6 h-6 text-white animate-bounce" />
            ) : isAnalyzing ? (
              <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
            ) : (
              <Activity className="w-6 h-6 text-teal-300" />
            )}
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Microphone Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full border backdrop-blur-md transition-all active:scale-95 shadow-lg ${
              isMicMuted
                ? 'bg-rose-500/30 border-rose-400/50 text-rose-300 hover:bg-rose-500/40'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Manual Inspect Frame Button */}
          <button
            type="button"
            onClick={() => triggerFrameAnalysis(currentTranscript)}
            disabled={isAnalyzing}
            className="px-5 py-3 rounded-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-900/50 transition-all active:scale-95 border border-teal-400/30"
          >
            <Scan className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? (lang === 'en' ? 'Scanning...' : 'ஆய்வு செய்கிறது...') : (lang === 'en' ? 'Inspect Now' : 'இப்போது ஆய்வு செய்')}</span>
          </button>

          {/* End Consultation Button (Red Pill) */}
          <button
            type="button"
            onClick={handleEndConsultation}
            className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all active:scale-95 border border-rose-400/30"
            title="Conclude Consultation"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{lang === 'en' ? 'End Call' : 'முடிக்கவும்'}</span>
          </button>
        </div>

        {/* Generic Drug & Care-Loop Status Footer */}
        {accumulatedGenerics.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
            <Tag className="w-3 h-3 text-emerald-400" />
            <span>
              {lang === 'en'
                ? `Mapped ${accumulatedGenerics.length} PMBJP Jan Aushadhi generic alternatives (Save up to 88%)`
                : `${accumulatedGenerics.length} ஜன் ஔஷதி மாற்று மருந்துகள் கண்டறியப்பட்டன`}
            </span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        )}
      </footer>

    </div>
  );
};
