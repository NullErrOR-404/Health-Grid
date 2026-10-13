import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Radio,
  FileText,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import type { Language } from '../../types';
import { speechEngine } from '../../services/speechService';
import { AudioVisualizerCanvas } from '../AudioVisualizerCanvas';
import {
  ambientScribeService,
  type ScribeTranscriptTurn
} from '../../services/ambientScribeService';
import { type SoapNoteData } from '../../types/canvas';

interface DuplexVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  patientName?: string;
  patientHealthId?: string;
  onSoapGenerated?: (soap: SoapNoteData) => void;
  onOpenAmbulance?: () => void;
}

export const DuplexVoiceOverlay: React.FC<DuplexVoiceOverlayProps> = ({
  isOpen,
  onClose,
  lang,
  patientName = 'Citizen Patient',
  patientHealthId = 'HG001245',
  onSoapGenerated,
  onOpenAmbulance: _onOpenAmbulance,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isScribeActive, setIsScribeActive] = useState(false);
  const [consentGranted] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'DOCTOR' | 'PATIENT'>('PATIENT');
  const [liveTranscript, setLiveTranscript] = useState<ScribeTranscriptTurn[]>([]);
  const [interimText, setInterimText] = useState('');
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);

  // Subscribe to ambient scribe updates
  useEffect(() => {
    const unsubscribe = ambientScribeService.subscribe((session) => {
      if (session) {
        setLiveTranscript([...session.transcript]);
      } else {
        setLiveTranscript([]);
      }
    });
    return unsubscribe;
  }, []);

  // Handle toggling ambient scribe mode
  const handleToggleScribe = () => {
    if (!isScribeActive) {
      setIsScribeActive(true);
      ambientScribeService.startSession(patientHealthId, patientName, consentGranted);
    } else {
      setIsScribeActive(false);
      ambientScribeService.discard();
    }
  };

  // Start speech recognition
  const startListening = () => {
    setIsListening(true);
    speechEngine.startListening(lang === 'ta' ? 'ta' : 'en', {
      onTranscript: (recognizedText: string, isFinal: boolean) => {
        if (isFinal) {
          setInterimText('');
          if (isScribeActive) {
            ambientScribeService.addTurn(activeSpeaker, recognizedText);
          } else {
            handleDuplexResponse(recognizedText);
          }
        } else {
          setInterimText(recognizedText);
        }
      },
      onError: (error: string) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      onStateChange: (state) => {
        if (state === 'idle') {
          setIsListening(false);
        }
      },
    });
  };

  const stopListening = () => {
    setIsListening(false);
    speechEngine.stopListening();
  };

  // Simulates duplex doctor turn-taking response
  const handleDuplexResponse = (userSpeech: string) => {
    setIsAiSpeaking(true);
    let reply = "I understand your symptoms clearly. Please continue explaining how long this has been bothering you.";
    if (lang === 'ta' || userSpeech.includes('valikkudhu') || userSpeech.includes('kaichal')) {
      reply = "உங்கள் அறிகுறிகளை தெளிவாக புரிந்துகொண்டேன். காய்ச்சல் அல்லது வலி எப்போது தொடங்கியது என்று சொல்லுங்கள், பரிசோதிக்கலாம்.";
    }

    speechEngine.speak(
      reply,
      lang === 'ta' ? 'ta' : 'en',
      0.95,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  const handleStopAndSynthesizeSoap = async () => {
    setIsGeneratingSoap(true);
    stopListening();
    try {
      const soap = await ambientScribeService.stopAndGenerateSoap();
      if (soap && onSoapGenerated) {
        onSoapGenerated(soap);
      }
      onClose();
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Duplex Tele-Clinic & Ambient Scribe
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Real-Time Voice
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Turn-taking voice consultation • DPDP-compliant consent logging
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              speechEngine.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Scribe Patient Consent Banner */}
        {isScribeActive && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Ambient Clinical Scribe Active:</strong> Recording with patient consent ({patientName} • {patientHealthId})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Speaker Channel:</span>
              <button
                onClick={() => setActiveSpeaker(activeSpeaker === 'DOCTOR' ? 'PATIENT' : 'DOCTOR')}
                className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                {activeSpeaker === 'DOCTOR' ? 'Clinician Speaking' : 'Patient Speaking'}
              </button>
            </div>
          </div>
        )}

        {/* Kinetic Waveform Audio Visualizer Canvas */}
        <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 relative min-h-[180px]">
          <div className="w-full max-w-md h-28 flex items-center justify-center">
            <AudioVisualizerCanvas
              isActive={isListening || isAiSpeaking}
              isAiSpeaking={isAiSpeaking}
              mode="wave"
              height={70}
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs font-semibold text-slate-300">
              {isAiSpeaking
                ? 'DocBot speaking... (You can speak anytime to interrupt)'
                : isListening
                ? interimText
                  ? `“${interimText}”`
                  : 'Listening to consultation...'
                : 'Microphone paused. Click below to begin speaking.'}
            </p>
          </div>
        </div>

        {/* Scribing Transcript Stream (When Scribe Mode is On) */}
        {isScribeActive && (
          <div className="flex-1 overflow-y-auto p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2 max-h-48 text-xs font-mono">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Live Consult Diarization ({liveTranscript.length} turns)
            </div>
            {liveTranscript.map((t) => (
              <div
                key={t.id}
                className={`p-2 rounded-lg flex items-start gap-2 ${
                  t.speaker === 'DOCTOR'
                    ? 'bg-teal-950/50 border border-teal-800/40 text-teal-200'
                    : t.speaker === 'PATIENT'
                    ? 'bg-slate-800/60 border border-slate-700/40 text-slate-200'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase shrink-0 px-1.5 py-0.5 rounded bg-black/40">
                  {t.speaker}
                </span>
                <span className="flex-1 font-sans text-xs">{t.text}</span>
                <span className="text-[10px] text-slate-500 shrink-0">{t.timestamp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="p-4 sm:px-6 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Scribe Mode Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleScribe}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                isScribeActive
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              {isScribeActive ? 'Ambient Scribe: ON' : 'Turn on Ambient Scribe'}
            </button>
          </div>

          {/* Primary Mic Activation */}
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-[#00A896] hover:bg-[#008f80] text-white'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Right Action: Generate SOAP or Discard */}
          <div className="flex items-center gap-2">
            {isScribeActive && (
              <button
                onClick={handleStopAndSynthesizeSoap}
                disabled={isGeneratingSoap || liveTranscript.length < 2}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                {isGeneratingSoap ? 'Drafting SOAP...' : 'Synthesize SOAP to Canvas ↗'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
