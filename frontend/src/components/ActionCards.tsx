import React from 'react';
import { 
  Stethoscope, 
  Siren, 
  Pill, 
  MapPin, 
  Syringe, 
  BriefcaseMedical,
} from 'lucide-react';
import type { Language } from '../types';

interface ActionCardsProps {
  lang: Language;
  onOpenVoiceChat: () => void;
  onOpenAmbulance: () => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
  onOpenBabyShots: () => void;
  onNavigateMedicines?: () => void;
  onOpenPatientIntake?: () => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  lang,
  onOpenVoiceChat,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onNavigateMedicines,
  onOpenPatientIntake,
}) => {
  const services = [
    {
      id: 'doctor',
      icon: Stethoscope,
      titleEn: 'Speak to Doctor',
      titleTa: 'மருத்துவர் ஆலோசனை',
      subEn: '24/7 consultation',
      subTa: '24/7 உடனடி சேவை',
      iconBg: 'bg-teal-50 text-teal-600',
      action: onOpenPatientIntake || onOpenVoiceChat,
    },
    {
      id: 'ambulance',
      icon: Siren,
      titleEn: 'Call 108 Ambulance',
      titleTa: '108 ஆம்புலன்ஸ்',
      subEn: 'Emergency support',
      subTa: 'அவசர சிகிச்சை உதவி',
      iconBg: 'bg-red-50 text-red-600',
      action: onOpenAmbulance,
    },
    {
      id: 'medicines',
      icon: Pill,
      titleEn: 'Buy Medicines',
      titleTa: 'மலிவு மருந்துகள்',
      subEn: 'Genuine & affordable',
      subTa: 'அரசு மக்கள் மருந்தகம்',
      iconBg: 'bg-blue-50 text-blue-600',
      action: onNavigateMedicines || onOpenPrescription,
    },
    {
      id: 'map',
      icon: MapPin,
      titleEn: 'Maps',
      titleTa: 'வரைபடம்',
      subEn: 'Nearest hospitals & medicals',
      subTa: 'அருகிலுள்ள மருத்துவமனைகள்',
      iconBg: 'bg-red-50 text-red-600',
      action: onOpenDiseaseMap,
    },
    {
      id: 'shots',
      icon: Syringe,
      titleEn: 'Child Immunization',
      titleTa: 'குழந்தை தடுப்பூசி',
      subEn: 'Track & stay updated',
      subTa: 'அரசு அட்டவணை',
      iconBg: 'bg-purple-50 text-purple-600',
      action: onOpenBabyShots,
    },
    {
      id: 'tools',
      icon: BriefcaseMedical,
      titleEn: 'Health Tools',
      titleTa: 'சுகாதார கருவிகள்',
      subEn: 'BMI, BP, more',
      subTa: 'உடல்நல சோதனைகள்',
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: onOpenPrescription,
    },
  ];

  return (
    <div id="action-cards-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-6 reveal-init">
      {/* Unified Elevated Service Shelf Matching Landing page new.png */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-200/80 p-3 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2 lg:divide-x lg:divide-slate-100">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={`action-card-${item.id}`}
                role="button"
                tabIndex={0}
                onClick={item.action}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.action();
                  }
                }}
                className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 min-h-[52px] sm:min-h-[56px] rounded-xl hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] transition-all duration-200 cursor-pointer group select-none reveal-init reveal-delay-${idx + 1} ${
                  idx !== 0 ? 'lg:pl-4' : ''
                }`}
              >
                {/* Rounded Icon Box */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${item.iconBg}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Service Copy */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                    {lang === 'ta' ? item.titleTa : item.titleEn}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {lang === 'ta' ? item.subTa : item.subEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
