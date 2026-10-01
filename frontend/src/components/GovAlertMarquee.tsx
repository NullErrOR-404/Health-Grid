import React, { useState, useEffect } from 'react';
import { Megaphone, FileText, ChevronLeft, ChevronRight, X, ShieldCheck, ExternalLink } from 'lucide-react';
import type { Language } from '../types';
import { healthBulletinService, type BulletinItem } from '../services/healthBulletinService';

interface GovAlertMarqueeProps {
  lang: Language;
  onOpenMaps?: () => void;
  onOpenAmbulance?: () => void;
}

export const GovAlertMarquee: React.FC<GovAlertMarqueeProps> = ({
  lang,
  onOpenMaps,
  onOpenAmbulance,
}) => {
  const [bulletins, setBulletins] = useState<BulletinItem[]>(() => healthBulletinService.getBulletins());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalItem, setModalItem] = useState<BulletinItem | null>(null);
  const [isPulledUp, setIsPulledUp] = useState(false);

  // Pull up marquee when scrolling down down the hero section; reveal when scrolling up or at top
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Keep visible if user is interacting with detail modal or hovering
      if (modalItem) {
        ticking = false;
        return;
      }

      // 1. At the very top of the page / top of hero section, always show marquee
      if (currentScrollY <= 40) {
        setIsPulledUp(false);
      } 
      // 2. When scrolling down down the hero section (past 60px and moving downwards), pull up
      else if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setIsPulledUp(true);
      } 
      // 3. When scrolling back up, pull back down into view
      else if (currentScrollY < lastScrollY - 8) {
        setIsPulledUp(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [modalItem]);

  // Sync daily verified 2026 data on mount
  useEffect(() => {
    let mounted = true;
    healthBulletinService.syncDailyUpdates().then((fresh) => {
      if (mounted && fresh.length > 0) {
        setBulletins(fresh);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-cycle through bulletins every 7 seconds if not paused
  useEffect(() => {
    if (isPaused || bulletins.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bulletins.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, bulletins.length]);

  const activeBulletin = bulletins[currentIndex] || bulletins[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? bulletins.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % bulletins.length);
  };

  const handleAction = (item: BulletinItem) => {
    if (item.actionType === 'ambulance') {
      onOpenAmbulance?.();
    } else {
      onOpenMaps?.();
    }
  };

  return (
    <>
      {/* Top Thin Horizontal Government Health Bulletin Bar - Matching Marquee ref.png */}
      <aside 
        aria-label="Government Health Alerts"
        className={`bg-[#0B132B] text-white border-slate-800/90 select-none px-3 sm:px-6 flex items-center justify-between text-xs shadow-sm transition-all duration-300 ease-in-out z-50 ${
          isPulledUp
            ? '-translate-y-full max-h-0 h-0 opacity-0 pointer-events-none py-0 border-b-0 overflow-hidden'
            : 'translate-y-0 max-h-[42px] h-[42px] opacity-100 py-0 border-b overflow-hidden'
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Section: Megaphone + Title + Divider + Health Alert Badge */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm tracking-tight whitespace-nowrap">
            <Megaphone className="w-4 h-4 text-[#EF4444] fill-[#EF4444]/20 flex-shrink-0" />
            <span>
              {lang === 'en' ? 'Government Health Bulletin' : 'அரசு சுகாதார அறிவிப்பு'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline text-sm">|</span>

          {/* Red Health Alert Pill Badge */}
          <span className="bg-[#7F1D1D] text-[#FCA5A5] border border-[#991B1B] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            {lang === 'en' ? activeBulletin.tagEn : activeBulletin.tagTa}
          </span>
        </div>

        {/* Center Section: Active Scrolling / Ticker Text */}
        <div className="flex-1 overflow-hidden mx-3 sm:mx-5 relative h-full flex items-center">
          <div 
            key={activeBulletin.id}
            onClick={() => handleAction(activeBulletin)}
            className="text-slate-200 hover:text-white transition-colors truncate cursor-pointer font-normal text-xs sm:text-[13px] leading-snug flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
            title="Click to view details"
          >
            <span>
              {lang === 'en' ? activeBulletin.textEn : activeBulletin.textTa}
            </span>
          </div>
        </div>

        {/* Right Section: Read More Link + Divider + Date + Navigation Chevrons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-slate-300">
          {/* Read More Link with Document Icon */}
          <button 
            type="button"
            onClick={() => setModalItem(activeBulletin)}
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-200 hover:text-teal-300 transition-colors whitespace-nowrap group font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 transition-colors" />
            <span className="underline decoration-slate-500 hover:decoration-teal-300 underline-offset-2">
              {lang === 'en' ? 'Read More' : 'மேலும் படிக்க'} &gt;
            </span>
          </button>

          <span className="text-slate-600 hidden lg:inline text-sm">|</span>

          {/* Formatted Date */}
          <span className="hidden lg:inline text-slate-400 text-xs font-medium whitespace-nowrap">
            {activeBulletin.date}
          </span>

          {/* Circular Previous / Next Control Buttons */}
          <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
            <button
              type="button"
              onClick={handlePrev}
              className="w-6 h-6 rounded-full bg-[#152342] hover:bg-[#1E293B] border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Previous bulletin"
              aria-label="Previous bulletin"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-6 h-6 rounded-full bg-[#152342] hover:bg-[#1E293B] border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Next bulletin"
              aria-label="Next bulletin"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Advisory Detail Modal (when user clicks Read More) */}
      {modalItem && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setModalItem(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setModalItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close advisory"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#7F1D1D] text-[#FCA5A5] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {lang === 'en' ? modalItem.tagEn : modalItem.tagTa}
              </span>
              <span className="text-xs text-slate-400">{modalItem.date}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full ml-auto">
                Verified 2026 Feed
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#0B132B] mb-2 leading-snug">
              {lang === 'en' ? modalItem.textEn : modalItem.textTa}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {lang === 'en' ? modalItem.detailEn : modalItem.detailTa}
            </p>

            {/* Official Verified Source Attribution */}
            {modalItem.sourceAgency && (
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Issuing Authority</div>
                  <div className="font-semibold text-slate-700 mt-0.5">{modalItem.sourceAgency}</div>
                </div>
                {modalItem.sourceUrl && (
                  <a
                    href={modalItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold text-xs hover:underline flex-shrink-0"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setModalItem(null);
                  handleAction(modalItem);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {modalItem.actionType === 'ambulance'
                    ? (lang === 'en' ? 'Open 108 Ambulance Dispatch' : '108 அவசர ஆம்புலன்ஸ்')
                    : (lang === 'en' ? 'Locate Centers on Map' : 'வரைபடத்தில் காண்க')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'மூடு'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
