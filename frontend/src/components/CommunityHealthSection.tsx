import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  BookOpen 
} from 'lucide-react';
import type { Language } from '../types';
import type { GuideArticle } from './HealthGuideModal';

interface CommunityHealthSectionProps {
  lang: Language;
  onOpenDiseaseMap: () => void;
  onSelectGuide: (guide: GuideArticle) => void;
}

export const CommunityHealthSection: React.FC<CommunityHealthSectionProps> = ({
  lang,
  onOpenDiseaseMap,
  onSelectGuide,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const guideArticles: GuideArticle[] = [
    {
      id: 'monsoon',
      titleEn: 'Monsoon Health Tips',
      titleTa: 'பருவமழை சுகாதாரக் குறிப்புகள்',
      subEn: 'How to stay safe this season',
      subTa: 'மழைக்கால காய்ச்சல் மற்றும் பாதுகாப்பு வழிகள்',
      categoryEn: 'Seasonal Wellness',
      categoryTa: 'பருவகால நலம்',
      image: '/insights/monsoon_tips.png',
      pointsEn: [
        'Drink only boiled and cooled water to prevent water-borne Typhoid & Cholera.',
        'Empty flowerpots, coconut shells, and tires around your house to eliminate dengue mosquito breeding.',
        'Consult DocBot immediately if fever persists beyond 48 hours or accompanied by eye pain or vomiting.',
      ],
      pointsTa: [
        'டைபாய்டு மற்றும் காலரா போன்ற நீர்வழி நோய்களைத் தடுக்க கொதிக்க வைத்து ஆறிய நீரையே அருந்தவும்.',
        'டெங்கு கொசு உற்பத்தியைத் தடுக்க வீட்டைச் சுற்றியுள்ள தேங்காய் ஓடுகள், பூந்தொட்டிகளில் தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளவும்.',
        'காய்ச்சல் 2 நாட்களுக்கு மேல் நீடித்தாலோ அல்லது கண் வலி, வாந்தி இருந்தாலோ உடனடியாக மருத்துவ ஆலோசனை பெறவும்.',
      ],
      actionEn: 'View Outbreak Heatmap',
      actionTa: 'நேரலை வரைபடம் பார்க்க',
      actionType: 'map',
    },
    {
      id: 'vaccination',
      titleEn: 'Child Vaccination Guide',
      titleTa: 'குழந்தை தடுப்பூசி வழிகாட்டி',
      subEn: 'Complete schedule by age',
      subTa: 'வயது வாரியான முழுமையான அட்டவணை',
      categoryEn: 'Child Care',
      categoryTa: 'குழந்தை நலம்',
      image: '/insights/vaccine_guide.png',
      pointsEn: [
        'Universal Immunization Programme (UIP) provides free vaccines at all government Urban PHCs.',
        'Key shots: BCG & Polio at birth, Pentavalent 1-2-3 at 6, 10, 14 weeks, and MR-1 at 9-12 months.',
        'Never delay booster doses; mild fever post-vaccination is normal and signals antibody generation.',
      ],
      pointsTa: [
        'தேசிய தடுப்பூசி திட்டத்தின் கீழ் அனைத்து அரசு ஆரம்ப சுகாதார நிலையங்களிலும் இலவசமாக தடுப்பூசி போடப்படுகிறது.',
        'முக்கிய தவணைகள்: பிறந்தவுடன் BCG & போலியோ, 6, 10, 14-வது வாரங்களில் பென்டாவேலன்ட், 9-12 மாதத்தில் தட்டம்மை.',
        'தடுப்பூசிக்கு பின் லேசான காய்ச்சல் வருவது இயற்கையானதே; நோயெதிர்ப்பு சக்தி உருவாவதற்கான அறிகுறி.',
      ],
      actionEn: 'Open Vaccination Tracker',
      actionTa: 'தடுப்பூசி அட்டவணை பார்க்க',
      actionType: 'shots',
    },
    {
      id: 'diabetes',
      titleEn: 'Managing Diabetes',
      titleTa: 'சர்க்கரை நோய் மேலாண்மை',
      subEn: 'Simple daily care tips',
      subTa: 'எளிய அன்றாட பராமரிப்பு முறைகள்',
      categoryEn: 'Chronic Care',
      categoryTa: 'நாள்பட்ட பராமரிப்பு',
      image: '/insights/diabetes_tips.png',
      pointsEn: [
        'Check fasting blood sugar once monthly; maintain target levels below 110 mg/dL.',
        'Generic Metformin costs ₹7.50 at Jan Aushadhi pharmacies vs ₹45.00 for commercial brand tablets.',
        'Daily 30-minute brisk walk improves insulin sensitivity and reduces cardiovascular risks.',
      ],
      pointsTa: [
        'மாதமொருமுறை வெறும் வயிற்று இரத்த சர்க்கரை அளவை பரிசோதிக்கவும் (110 mg/dL கீழ் இருக்க வேண்டும்).',
        'அரசு மக்கள் மருந்தகத்தில் மெட்ஃபோர்மின் மாத்திரை வெறும் ₹7.50 மட்டுமே, கடைகளில் ₹45.',
        'தினமும் 30 நிமிடங்கள் வேகமாக நடப்பது இன்சுலின் சுரப்பை சீராக்கி இதயத்தை பாதுகாக்கும்.',
      ],
      actionEn: 'Consult DocBot on Diet',
      actionTa: 'உணவுமுறை பற்றி கேட்க',
      actionType: 'doctor',
    },
  ];

  return (
    <section id="community-health" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 content-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Community Health (Span 7) */}
        <div className="lg:col-span-7 bg-[#E8F8F4] border border-teal-200/70 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group reveal-init reveal-delay-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Left Content Column */}
            <div className="sm:col-span-7 space-y-3 sm:space-y-4 z-10">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                {lang === 'en' ? 'COMMUNITY HEALTH' : 'சமூக நலம்'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {lang === 'en' ? (
                  <>
                    Stay Informed,<br />Stay Safer
                  </>
                ) : (
                  <>
                    விழிப்புடன் இருங்கள்,<br />பாதுகாப்பாய் வாழுங்கள்
                  </>
                )}
              </h2>

              {/* Mobile Graphic Visual Anchor (Headline -> Graphic -> Description & CTA) */}
              <div 
                onClick={onOpenDiseaseMap}
                className="sm:hidden relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-teal-200/80 bg-teal-100/50 my-2 max-w-xs"
              >
                <img
                  src="/insights/community_map.png"
                  alt="Dengue Activity Heatmap Map"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                {lang === 'en'
                  ? 'Track dengue and seasonal fever trends in your area.'
                  : 'உங்கள் பகுதியில் டெங்கு மற்றும் பருவமழை காய்ச்சல் பரவல் நிலவரங்களை நேரலையாக அறியுங்கள்.'}
              </p>

              <div className="pt-2">
                <button
                  onClick={onOpenDiseaseMap}
                  className="bg-[#0D7A70] hover:bg-[#0A625A] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'View Disease Map' : 'நோய் வரைபடம் பார்க்க'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Desktop Map Graphic Column with Heatmap */}
            <div className="hidden sm:flex sm:col-span-5 relative items-center justify-center">
              <div 
                onClick={onOpenDiseaseMap}
                className="relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 group-hover:scale-105 shadow-sm"
              >
                <img
                  src="/insights/community_map.png"
                  alt="Dengue Activity Heatmap Map"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Carousel Pagination Dots Matching Reference */}
          <div className="flex items-center gap-2 mt-6 pt-2 z-10">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === idx 
                    ? 'w-5 bg-[#0D7A70]' 
                    : 'w-2 bg-teal-300 hover:bg-teal-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Right Card: Quick Health Insights (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between reveal-init reveal-delay-2">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {lang === 'en' ? 'Quick Health Insights' : 'சுகாதார வழிகாட்டிகள்'}
                </h3>
              </div>
              <button
                onClick={() => onSelectGuide(guideArticles[0])}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
              >
                {lang === 'en' ? 'View All' : 'அனைத்தும்'}
              </button>
            </div>

            {/* 3 Insight Rows Matching Reference */}
            <div className="divide-y divide-slate-100">
              {guideArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onSelectGuide(article)}
                  className="py-3.5 sm:py-4 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm bg-slate-100">
                      <img
                        src={article.image}
                        alt={article.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Titles */}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate leading-tight">
                        {lang === 'ta' ? article.titleTa : article.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {lang === 'ta' ? article.subTa : article.subEn}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400 font-medium">
            {lang === 'en' ? 'Updated daily by District Medical Office' : 'மாவட்ட மருத்துவ அலுவலகத்தின் தினசரி தகவல்கள்'}
          </div>
        </div>

      </div>
    </section>
  );
};
