import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Stethoscope, 
  Siren, 
  FileText, 
  Pill, 
  MapPin, 
  Baby, 
  Building2, 
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import type { Language } from '../types';

interface HeroSectionProps {
  lang: Language;
  onOpenVoiceChat: (sampleQuery?: string) => void;
  onOpenAmbulance: () => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
  onOpenBabyShots: () => void;
  onNavigateMedicines?: () => void;
}

interface SearchItem {
  id: string;
  category: 'service' | 'medicine' | 'hospital' | 'symptom';
  titleEn: string;
  titleTa: string;
  subEn: string;
  subTa: string;
  icon: React.ElementType;
  action: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onOpenVoiceChat,
  onOpenAmbulance,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onNavigateMedicines,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GSAP subtle floating animation on the mascot
  useEffect(() => {
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        y: -8,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
  }, []);

  // Database of searchable platform entities
  const searchCatalog: SearchItem[] = useMemo(() => [
    // Services
    {
      id: 'srv-doctor',
      category: 'service',
      titleEn: 'Speak to Doctor (24/7 AI Triage)',
      titleTa: 'குரல் வழி மருத்துவ ஆலோசனை',
      subEn: 'Describe symptoms naturally for instant doctor-verified advice',
      subTa: 'உங்கள் அறிகுறிகளை இயல்பாகப் பேசுங்கள்',
      icon: Stethoscope,
      action: () => onOpenVoiceChat(searchQuery || 'General Consultation'),
    },
    {
      id: 'srv-ambulance',
      category: 'service',
      titleEn: 'Call 108 Emergency Ambulance',
      titleTa: '108 அவசர ஆம்புலன்ஸ்',
      subEn: 'GPS live telemetry dispatch & casualty hospital routing',
      subTa: 'உடனடி நேரலை ஆம்புலன்ஸ் உதவி',
      icon: Siren,
      action: onOpenAmbulance,
    },
    {
      id: 'srv-prescription',
      category: 'service',
      titleEn: 'Scan Doctor Prescription',
      titleTa: 'மருந்து சீட்டு ஸ்கேனர்',
      subEn: 'Decode doctor handwriting, dosages and food restrictions',
      subTa: 'மருத்துவர் கையெழுத்தை தமிழில் அறிய',
      icon: FileText,
      action: onOpenPrescription,
    },
    {
      id: 'srv-medicines',
      category: 'service',
      titleEn: 'Buy Generic Medicines (Jan Aushadhi)',
      titleTa: 'மலிவு விலை மக்கள் மருந்தகம்',
      subEn: 'Find 90% cheaper certified generic equivalents nearby',
      subTa: '90% வரை குறைந்த விலையில் மருந்துகள்',
      icon: Pill,
      action: onNavigateMedicines || onOpenPrescription,
    },
    {
      id: 'srv-map',
      category: 'service',
      titleEn: 'Disease Outbreak Map',
      titleTa: 'நேரலை நோய் பரவல் வரைபடம்',
      subEn: 'Live ward surveillance for Dengue, Flu and local clinics',
      subTa: 'வார்டு அளவிலான காய்ச்சல் தகவல்',
      icon: MapPin,
      action: onOpenDiseaseMap,
    },
    {
      id: 'srv-shots',
      category: 'service',
      titleEn: 'Child Immunization Schedule',
      titleTa: 'குழந்தை தடுப்பூசி அட்டவணை',
      subEn: 'Universal immunization milestones from birth to 12 months',
      subTa: 'அரசு தடுப்பூசி நினைவூட்டல்',
      icon: Baby,
      action: onOpenBabyShots,
    },
    // Medicines
    {
      id: 'med-paracetamol',
      category: 'medicine',
      titleEn: 'Paracetamol / Dolo 650',
      titleTa: 'பாராசிட்டமால் / டோலோ 650',
      subEn: 'Generic: ₹4 per strip (Brand: ₹34) • For fever & pain relief',
      subTa: 'மலிவு விலை: ₹4 மட்டுமே (கடைகளில் ₹34)',
      icon: Pill,
      action: onNavigateMedicines || onOpenPrescription,
    },
    {
      id: 'med-augmentin',
      category: 'medicine',
      titleEn: 'Augmentin 625 Duo (Amoxicillin + Clavulanate)',
      titleTa: 'ஆக்மெண்டின் 625 மாத்திரை',
      subEn: 'Generic: ₹22 per strip (Brand: ₹204) • For bacterial infections',
      subTa: 'மலிவு விலை: ₹22 மட்டுமே (கடைகளில் ₹204)',
      icon: Pill,
      action: onNavigateMedicines || onOpenPrescription,
    },
    {
      id: 'med-pantocid',
      category: 'medicine',
      titleEn: 'Pantocid 40 (Pantoprazole)',
      titleTa: 'பான்டோசிட் 40 அசிடிட்டி மாத்திரை',
      subEn: 'Generic: ₹18 (Brand: ₹155) • For stomach acid & reflux',
      subTa: 'மலிவு விலை: ₹18 மட்டுமே (கடைகளில் ₹155)',
      icon: Pill,
      action: onNavigateMedicines || onOpenPrescription,
    },
    {
      id: 'med-metformin',
      category: 'medicine',
      titleEn: 'Metformin 500mg (Diabetes Care)',
      titleTa: 'மெட்ஃபோர்மின் சர்க்கரை நோய் மாத்திரை',
      subEn: 'Generic: ₹8 per strip (Brand: ₹65) • Blood glucose control',
      subTa: 'மலிவு விலை: ₹8 மட்டுமே (கடைகளில் ₹65)',
      icon: Pill,
      action: onNavigateMedicines || onOpenPrescription,
    },
    // Hospitals
    {
      id: 'hosp-royapuram',
      category: 'hospital',
      titleEn: 'Royapuram Urban Primary Health Centre (PHC)',
      titleTa: 'ராயபுரம் அரசு ஆரம்ப சுகாதார நிலையம்',
      subEn: 'Open 24/7 • Free Doctor Consultation & Essential Drugs',
      subTa: '24 மணி நேரமும் செயல்படும் அரசு மருத்துவமனை',
      icon: Building2,
      action: onOpenDiseaseMap,
    },
    {
      id: 'hosp-stanley',
      category: 'hospital',
      titleEn: 'Govt. Stanley Medical College Hospital',
      titleTa: 'ஸ்டான்லி அரசு மருத்துவக் கல்லூரி மருத்துவமனை',
      subEn: 'Casualty Emergency, Trauma Care & Comprehensive ICU',
      subTa: 'அவசர சிகிச்சை பிரிவு மற்றும் அறுவை சிகிச்சை',
      icon: Building2,
      action: onOpenAmbulance,
    },
    {
      id: 'hosp-rgggh',
      category: 'hospital',
      titleEn: 'Rajiv Gandhi Govt General Hospital (RGGGH)',
      titleTa: 'ராஜீவ் காந்தி அரசு பொது மருத்துவமனை',
      subEn: 'Super Specialty & 24/7 National Emergency Casualty',
      subTa: 'மத்திய அரசு பொது மருத்துவமனை',
      icon: Building2,
      action: onOpenAmbulance,
    },
  ], [onOpenVoiceChat, onOpenAmbulance, onOpenPrescription, onOpenDiseaseMap, onOpenBabyShots, searchQuery]);

  // Fuzzy filter
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return searchCatalog.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return searchCatalog.filter(
      (item) =>
        item.titleEn.toLowerCase().includes(q) ||
        item.titleTa.toLowerCase().includes(q) ||
        item.subEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery, searchCatalog]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (filteredResults.length > 0) {
      filteredResults[0].action();
    } else {
      onOpenVoiceChat(searchQuery);
    }
    setIsSearchFocused(false);
  };

  const handlePillClick = (query: string) => {
    setSearchQuery(query);
    onOpenVoiceChat(query);
  };

  const popularPills = [
    { en: 'Fever', ta: 'காய்ச்சல்' },
    { en: 'Diabetes', ta: 'சர்க்கரை நோய்' },
    { en: 'Blood Pressure', ta: 'இரத்த அழுத்தம்' },
    { en: 'Child Vaccination', ta: 'குழந்தை தடுப்பூசி' },
    { en: 'Nearby Hospitals', ta: 'அருகிலுள்ள மருத்துவமனை' },
  ];

  return (
    <section id="hero-section" className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* Left Column: Headlines, Intelligent Search & Popular Queries */}
        <div className="lg:col-span-6 space-y-6 reveal-init reveal-delay-1">
          
          {/* Overline Kicker */}
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {lang === 'en' ? 'TRUSTED • SAFE • ALWAYS WITH YOU' : 'நம்பகமானது • பாதுகாப்பானது • எப்போதும் உங்களுடன்'}
          </div>

          {/* Main Title Matching Reference */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
            {lang === 'en' ? (
              <>
                Your Health<br />Our Priority
              </>
            ) : (
              <>
                உங்கள் நலம்<br />எங்கள் முதன்மை
              </>
            )}
          </h1>

          {/* Subtext Matching Reference */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg">
            {lang === 'en'
              ? 'Get instant answers, trusted health information, find nearby hospitals, call an ambulance and more, all in one place.'
              : 'உடனடி மருத்துவ பதில்கள், நம்பகமான சுகாதார தகவல்கள், அருகிலுள்ள மருத்துவமனைகள் மற்றும் அவசர ஆம்புலன்ஸ் உதவி, அனைத்தும் ஒரே தளத்தில்.'}
          </p>

          {/* Intelligent Search Input Container */}
          <div ref={searchContainerRef} className="relative max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-full p-2 pl-5 sm:pl-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:border-teal-400 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={
                    lang === 'en'
                      ? 'Ask a health question, search a medicine, or find a hospital...'
                      : 'மருத்துவ கேள்வி கேட்க, மருந்து அல்லது மருத்துவமனை தேட...'
                  }
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none truncate"
                />
              </div>

              <button
                type="submit"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 flex-shrink-0 shadow-md"
                title={lang === 'en' ? 'Search or Consult' : 'தேடு'}
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </form>

            {/* Live Intelligent Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>{lang === 'en' ? 'Smart Suggestions' : 'பரிந்துரைகள்'}</span>
                  <span>{filteredResults.length} matches</span>
                </div>

                <div className="space-y-1">
                  {filteredResults.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          item.action();
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors mt-0.5">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                            {lang === 'ta' ? item.titleTa : item.titleEn}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {lang === 'ta' ? item.subTa : item.subEn}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transform group-hover:translate-x-0.5 transition-transform flex-shrink-0 self-center" />
                      </button>
                    );
                  })}

                  {/* Ask DocBot Fallback */}
                  {searchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenVoiceChat(searchQuery);
                        setIsSearchFocused(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50/80 text-teal-900 hover:bg-teal-100 transition-colors text-xs font-bold border border-teal-200/80 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span>
                          {lang === 'en' ? `Ask DocBot about "${searchQuery}"` : `DocBot-இடம் "${searchQuery}" பற்றி கேள்`}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-teal-700" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Popular Search Pills Matching Reference */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">
              {lang === 'en' ? 'Popular:' : 'பிரபலமானவை:'}
            </span>
            {popularPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePillClick(lang === 'ta' ? pill.ta : pill.en)}
                className="px-3.5 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-medium rounded-full border border-slate-200/90 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                {lang === 'ta' ? pill.ta : pill.en}
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Doctor Robot at Desk Matching Landing page new.png */}
        <div className="lg:col-span-6 relative flex items-center justify-center reveal-scale-init reveal-delay-2">
          <div className="relative w-full max-w-lg lg:max-w-none">
            
            {/* The Authentic 3D Doctor Robot Sitting at Desk */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white group cursor-pointer"
                 onClick={() => onOpenVoiceChat()}
                 title={lang === 'en' ? 'Click DocBot to start consultation' : 'DocBot-உடன் பேச தொடங்கு'}>
              <img
                ref={heroImageRef}
                src="/desk_robot_hero.png"
                alt="HealthGrid AI Doctor Mascot"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Interactive Floating Hotspots */}
              {/* Hotspot 1: Speech Bubble triggers Voice Chat */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVoiceChat();
                }}
                className="absolute top-[28%] left-[2%] w-[38%] h-[26%] rounded-2xl cursor-pointer transition-all hover:ring-2 hover:ring-teal-400/50 bg-transparent"
                title="Tap speech bubble to speak"
                aria-label="Tap to speak with DocBot"
              />

              {/* Hotspot 2: Top-right Pill capsule icon triggers Prescriptions */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigateMedicines) {
                    onNavigateMedicines();
                  } else {
                    onOpenPrescription();
                  }
                }}
                className="absolute top-[7%] right-[42%] w-[18%] h-[18%] rounded-2xl cursor-pointer hover:ring-2 hover:ring-blue-400/50 bg-transparent"
                title="View Medicines"
                aria-label="View Medicines"
              />

              {/* Hotspot 3: Hospital icon triggers clinic locator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDiseaseMap();
                }}
                className="absolute top-[22%] right-[11%] w-[16%] h-[18%] rounded-2xl cursor-pointer hover:ring-2 hover:ring-cyan-400/50 bg-transparent"
                title="Find Hospitals & Clinics"
                aria-label="Find Hospitals & Clinics"
              />

              {/* Hotspot 4: Location pin icon triggers Outbreak map */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDiseaseMap();
                }}
                className="absolute bottom-[28%] right-[8%] w-[16%] h-[18%] rounded-2xl cursor-pointer hover:ring-2 hover:ring-rose-400/50 bg-transparent"
                title="Outbreak Radar"
                aria-label="Outbreak Radar"
              />

              {/* Hotspot 5: Green cross shield triggers Doctor consultation */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVoiceChat();
                }}
                className="absolute top-[10%] left-[20%] w-[16%] h-[18%] rounded-2xl cursor-pointer hover:ring-2 hover:ring-emerald-400/50 bg-transparent"
                title="Doctor Verified Advice"
                aria-label="Doctor Verified Advice"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
