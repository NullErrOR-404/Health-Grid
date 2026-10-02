import React from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Language } from '../types';

export interface GuideArticle {
  id: string;
  titleEn: string;
  titleTa: string;
  subEn: string;
  subTa: string;
  categoryEn: string;
  categoryTa: string;
  image: string;
  pointsEn: string[];
  pointsTa: string[];
  actionEn: string;
  actionTa: string;
  actionType: 'map' | 'shots' | 'doctor';
}

interface HealthGuideModalProps {
  guide: GuideArticle | null;
  onClose: () => void;
  lang: Language;
  onOpenVoiceChat: (sampleQuery?: string) => void;
  onOpenDiseaseMap: () => void;
  onOpenBabyShots: () => void;
}

export const HealthGuideModal: React.FC<HealthGuideModalProps> = ({
  guide,
  onClose,
  lang,
  onOpenVoiceChat,
  onOpenDiseaseMap,
  onOpenBabyShots,
}) => {
  if (!guide) return null;

  const handleAction = () => {
    onClose();
    if (guide.actionType === 'map') onOpenDiseaseMap();
    else if (guide.actionType === 'shots') onOpenBabyShots();
    else if (guide.actionType === 'doctor') onOpenVoiceChat(guide.titleEn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border-none sm:border border-slate-200 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl overflow-hidden flex flex-col">
        
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden flex items-end p-5 text-white shrink-0">
          <img
            src={guide.image}
            alt={guide.titleEn}
            className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[0.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2 py-0.5 rounded-full">
              {lang === 'ta' ? guide.categoryTa : guide.categoryEn}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {lang === 'ta' ? guide.titleTa : guide.titleEn}
            </h3>
            <p className="text-xs text-slate-300">
              {lang === 'ta' ? guide.subTa : guide.subEn}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200/80">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              {lang === 'en'
                ? 'Clinical Guidelines from National Health Portal'
                : 'அரசு பொது சுகாதார வழிகாட்டுதல்கள்'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'Key Health Recommendations:' : 'முக்கிய மருத்துவ குறிப்புகள்:'}
            </h4>
            <div className="space-y-2.5">
              {(lang === 'ta' ? guide.pointsTa : guide.pointsEn).map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            {lang === 'en' ? 'Close' : 'மூடு'}
          </button>

          <button
            onClick={handleAction}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>{lang === 'ta' ? guide.actionTa : guide.actionEn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
