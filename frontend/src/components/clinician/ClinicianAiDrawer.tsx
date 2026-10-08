import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Maximize2,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  Bot,
  Keyboard,
  FileText,
} from 'lucide-react';
import { clinicianStore } from '../../services/clinician/clinicianWorkflowStore';

interface ClinicianAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Prepare me for my next patient',
  "Summarize Priya's history",
  'Order a CBC for this patient',
  "Draft today's note",
  'Show my abnormal results',
  'What follow-ups are due today?',
];

export const ClinicianAiDrawer: React.FC<ClinicianAiDrawerProps> = ({ isOpen, onClose }) => {
  const [storeState, setStoreState] = useState(clinicianStore.getState());
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showInputMode, setShowInputMode] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = clinicianStore.subscribe(() => {
      setStoreState({ ...clinicianStore.getState() });
    });
    return unsub;
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storeState.aiMessages, storeState.isAiGenerating]);

  // Global hotkey '/' to toggle voice/input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setShowInputMode(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    clinicianStore.sendAiMessage(text.trim());
    setInputText('');
  };

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate rapid speech recognition
      setTimeout(() => {
        setIsListening(false);
        handleSend('Prepare me for my next patient');
      }, 2200);
    } else {
      setIsListening(false);
    }
  };

  return (
    <aside className="w-80 md:w-96 bg-white border-l border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-xs">
      {/* Drawer Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shadow-teal-600/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">
              HealthGrid AI
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Assistant Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Equalizer Visualizer Header Card */}
        <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 text-center space-y-2">
          {/* Animated audio bars */}
          <div className="flex items-center justify-center gap-1 h-7">
            <span className="w-1 bg-sky-500 rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
            <span className="w-1 bg-teal-500 rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
            <span className="w-1 bg-sky-600 rounded-full animate-[bounce_1s_infinite_200ms] h-7" />
            <span className="w-1 bg-teal-600 rounded-full animate-[bounce_1s_infinite_400ms] h-5" />
            <span className="w-1 bg-sky-500 rounded-full animate-[bounce_1s_infinite_150ms] h-3" />
          </div>

          <div className="text-sm font-bold text-slate-900">
            Ask, tell or just speak
          </div>
          <div className="text-xs text-slate-500">
            Your clinical workflow assistant
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-3">
          {storeState.aiMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Structured Action Card if present */}
                {msg.actionCard && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-teal-200/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{msg.actionCard.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {msg.actionCard.description}
                    </div>

                    {msg.actionCard.items && (
                      <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                        {msg.actionCard.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (msg.actionCard?.onExecuteAction) {
                          clinicianStore.executeAiAction(msg.actionCard.onExecuteAction);
                        }
                      }}
                      className="w-full mt-1.5 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>{msg.actionCard.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {storeState.isAiGenerating && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl rounded-tl-xs border border-slate-200/70 text-xs text-slate-500 w-max">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Analyzing patient chart & guidelines...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Try Saying... Suggestion Pills */}
        <div className="pt-2 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Try saying...
          </div>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="w-full p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-teal-300 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-teal-600 group-hover:text-teal-700 shrink-0" />
                  <span>{prompt}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Speech / Keyboard Interaction Dock */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-2">
        {showInputMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask HealthGrid AI..."
              autoFocus
              className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:border-teal-500 focus:bg-white outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowInputMode(false)}
              className="w-9 h-9 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              title="Return to voice"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-1 space-y-1">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowInputMode(true)}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="Switch to keyboard input"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200 scale-105'
                    : 'bg-teal-600 hover:bg-teal-700 text-white ring-4 ring-teal-100'
                }`}
                title="Click to speak"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="text-[11px] font-medium text-slate-400 text-center">
              {isListening ? (
                <span className="text-rose-600 font-semibold animate-pulse">
                  Listening to clinical speech...
                </span>
              ) : (
                <span>Click to speak or press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]"> / </kbd></span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
