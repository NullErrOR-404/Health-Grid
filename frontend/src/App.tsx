import { useState, useEffect } from 'react';
import type { Language } from './types';
import { Navbar } from './components/Navbar';
import { GovAlertMarquee } from './components/GovAlertMarquee';
import { HeroSection } from './components/HeroSection';
import { ActionCards } from './components/ActionCards';
import { CommunityHealthSection } from './components/CommunityHealthSection';
import { HealthGuideModal, type GuideArticle } from './components/HealthGuideModal';
import { Footer } from './components/Footer';
import { AmbulanceModal } from './components/AmbulanceModal';
import { VoiceChatModal } from './components/VoiceChatModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { DiseaseMapModal } from './components/DiseaseMapModal';
import { BabyShotsModal } from './components/BabyShotsModal';
import { DoctorHandoverModal } from './components/DoctorHandoverModal';
import { RoamingDocBot } from './components/RoamingDocBot';
import { LoginModal } from './components/LoginModal';
import { ChatbotPage } from './components/ChatbotPage';
import { ProfilePage } from './components/ProfilePage';
import { FindCareNearYou } from './components/FindCareNearYou';
import { Siren, Mic } from 'lucide-react';
import { lenisService } from './services/lenisService';
import './App.css';

export type AppView = 'landing' | 'chat' | 'profile' | 'maps';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Modals state
  const [isAmbulanceOpen, setIsAmbulanceOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [voiceChatQuery, setVoiceChatQuery] = useState<string | undefined>(undefined);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isDiseaseMapOpen, setIsDiseaseMapOpen] = useState(false);
  const [isBabyShotsOpen, setIsBabyShotsOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideArticle | null>(null);

  const isAnyModalOpen = Boolean(
    isAmbulanceOpen ||
    isVoiceChatOpen ||
    isPrescriptionOpen ||
    isDiseaseMapOpen ||
    isBabyShotsOpen ||
    isHandoverOpen ||
    isLoginOpen ||
    selectedGuide
  );

  // Initialize Lenis Smooth Scroll on application mount
  useEffect(() => {
    lenisService.init();
    return () => {
      lenisService.destroy();
    };
  }, []);

  // Auto-pause Lenis when any modal is open; resume when closed
  useEffect(() => {
    if (isAnyModalOpen) {
      lenisService.pause();
    } else {
      lenisService.resume();
    }
  }, [isAnyModalOpen]);

  // Reset scroll position smoothly on page/view transition
  useEffect(() => {
    lenisService.scrollTo(0, { immediate: true });
  }, [currentView]);

  // Sync view state with browser hash routing (#/, #chat, #profile, #maps)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#chat' || hash === '#/chat') {
        setCurrentView('chat');
      } else if (hash === '#profile' || hash === '#/profile') {
        setCurrentView('profile');
      } else if (hash === '#maps' || hash === '#/maps') {
        setCurrentView('maps');
      } else {
        setCurrentView('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToView = (view: AppView) => {
    setCurrentView(view);
    if (view === 'chat') window.location.hash = '#chat';
    else if (view === 'profile') window.location.hash = '#profile';
    else if (view === 'maps') window.location.hash = '#maps';
    else window.location.hash = '';
  };

  const handleOpenVoiceChat = (sampleQuery?: string) => {
    if (sampleQuery) {
      setVoiceChatQuery(sampleQuery);
      setIsVoiceChatOpen(true);
    } else {
      // Direct full-screen Chatbot experience matching Chatbot UI.png
      navigateToView('chat');
    }
  };

  // Render Full-Screen Chatbot Page matching Chatbot UI.png
  if (currentView === 'chat') {
    return (
      <>
        <ChatbotPage
          lang={lang}
          setLang={setLang}
          onNavigateHome={() => navigateToView('landing')}
          onNavigateProfile={() => navigateToView('profile')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
        />

        {/* Global Modals Accessible within Chat */}
        <AmbulanceModal
          isOpen={isAmbulanceOpen}
          onClose={() => setIsAmbulanceOpen(false)}
          lang={lang}
          onOpenHandover={() => setIsHandoverOpen(true)}
        />
        <PrescriptionModal
          isOpen={isPrescriptionOpen}
          onClose={() => setIsPrescriptionOpen(false)}
          lang={lang}
        />
        <DiseaseMapModal
          isOpen={isDiseaseMapOpen}
          onClose={() => setIsDiseaseMapOpen(false)}
          lang={lang}
        />
        <BabyShotsModal
          isOpen={isBabyShotsOpen}
          onClose={() => setIsBabyShotsOpen(false)}
          lang={lang}
        />
        <DoctorHandoverModal
          isOpen={isHandoverOpen}
          onClose={() => setIsHandoverOpen(false)}
          lang={lang}
        />
      </>
    );
  }

  // Render Profile Page (/profile)
  if (currentView === 'profile') {
    return (
      <ProfilePage
        lang={lang}
        onNavigateChat={() => navigateToView('chat')}
        onNavigateHome={() => navigateToView('landing')}
      />
    );
  }

  // Render Full-Screen Dedicated Maps Page matching Maps ref.png
  if (currentView === 'maps') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
        {/* Sticky Coordinated Header */}
        <header className="sticky top-0 z-40 w-full">
          <GovAlertMarquee
            lang={lang}
            onOpenMaps={() => navigateToView('maps')}
            onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          />
          <Navbar
            lang={lang}
            setLang={setLang}
            onOpenAmbulance={() => setIsAmbulanceOpen(true)}
            onOpenVoiceChat={() => navigateToView('chat')}
            onOpenPrescription={() => setIsPrescriptionOpen(true)}
            onOpenDiseaseMap={() => navigateToView('maps')}
            onOpenBabyShots={() => setIsBabyShotsOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateProfile={() => navigateToView('profile')}
          />
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <FindCareNearYou
            lang={lang}
            onClose={() => navigateToView('landing')}
            isModal={false}
          />
        </main>
        <Footer
          lang={lang}
          setLang={setLang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenDiseaseMap={() => navigateToView('maps')}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
        />
      </div>
    );
  }

  // Default: Public Landing Page matching Landing page new.png & Footer ref.png
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Sticky Header with Dynamic Pull-Up Marquee */}
      <header className="sticky top-0 z-40 w-full">
        <GovAlertMarquee
          lang={lang}
          onOpenMaps={() => navigateToView('maps')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
        />
        <Navbar
          lang={lang}
          setLang={setLang}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenDiseaseMap={() => navigateToView('maps')}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onNavigateProfile={() => navigateToView('profile')}
        />
      </header>

      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* Hero Section with Intelligent Fuzzy Search & Desk Mascot */}
        <HeroSection
          lang={lang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
        />

        {/* Elevated 6-Service Shelf Matching Landing page new.png */}
        <ActionCards
          lang={lang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
        />

        {/* Community Health Heatmap & Quick Health Insights Section */}
        <CommunityHealthSection
          lang={lang}
          onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
          onSelectGuide={(guide) => setSelectedGuide(guide)}
        />
      </main>

      {/* Global Footer Matching Footer ref.png */}
      <Footer
        lang={lang}
        setLang={setLang}
        onOpenVoiceChat={() => navigateToView('chat')}
        onOpenAmbulance={() => setIsAmbulanceOpen(true)}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
        onOpenBabyShots={() => setIsBabyShotsOpen(true)}
      />

      {/* Mobile Floating Sticky Action Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={() => setIsAmbulanceOpen(true)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-red-500 active:scale-95 transition-all text-xs"
        >
          <Siren className="w-4 h-4 animate-spin" />
          <span>{lang === 'en' ? 'Call 108' : '108 ஆம்புலன்ஸ்'}</span>
        </button>

        <button
          onClick={() => navigateToView('chat')}
          className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-teal-600 active:scale-95 transition-all text-xs"
        >
          <Mic className="w-4 h-4 text-teal-200" />
          <span>{lang === 'en' ? 'Speak to Doctor' : 'குரல் உதவி'}</span>
        </button>
      </div>

      {/* Roaming AI Mascot Companion (DocBot) */}
      <RoamingDocBot
        lang={lang}
        onOpenChat={() => navigateToView('chat')}
      />

      {/* Interactive Modals */}
      <AmbulanceModal
        isOpen={isAmbulanceOpen}
        onClose={() => setIsAmbulanceOpen(false)}
        lang={lang}
        onOpenHandover={() => setIsHandoverOpen(true)}
      />

      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => {
          setIsVoiceChatOpen(false);
          setVoiceChatQuery(undefined);
        }}
        lang={lang}
        initialQuery={voiceChatQuery}
        onOpenAmbulance={() => setIsAmbulanceOpen(true)}
        onOpenHandover={() => setIsHandoverOpen(true)}
      />

      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        lang={lang}
      />

      <DiseaseMapModal
        isOpen={isDiseaseMapOpen}
        onClose={() => setIsDiseaseMapOpen(false)}
        lang={lang}
      />

      <BabyShotsModal
        isOpen={isBabyShotsOpen}
        onClose={() => setIsBabyShotsOpen(false)}
        lang={lang}
      />

      <DoctorHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        lang={lang}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        lang={lang}
      />

      <HealthGuideModal
        guide={selectedGuide}
        onClose={() => setSelectedGuide(null)}
        lang={lang}
        onOpenVoiceChat={handleOpenVoiceChat}
        onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
        onOpenBabyShots={() => setIsBabyShotsOpen(true)}
      />
    </div>
  );
}
