import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import type { Language } from './types';
import { Navbar } from './components/Navbar';
import { GovAlertMarquee } from './components/GovAlertMarquee';
import { HeroSection } from './components/HeroSection';
import { ActionCards } from './components/ActionCards';
import { CommunityHealthSection } from './components/CommunityHealthSection';
import { OAuthTransparencySection } from './components/OAuthTransparencySection';
import { Footer } from './components/Footer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Siren, AlertCircle, X, Stethoscope, MapPin } from 'lucide-react';
import { lenisService } from './services/lenisService';
import { authService, type AuthUser } from './services/authService';
import { useScrollReveal } from './hooks/useScrollReveal';
import type { GuideArticle } from './components/HealthGuideModal';
import type { HospitalEntity } from './data/hospitalsList';
import './App.css';

// Lazy-loaded Views (Code-splitting secondary routes)
const ChatbotPage = lazy(() => import('./components/ChatbotPage').then(m => ({ default: m.ChatbotPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const FindCareNearYou = lazy(() => import('./components/FindCareNearYou').then(m => ({ default: m.FindCareNearYou })));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ThankYouPage = lazy(() => import('./components/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const MedicineStorePage = lazy(() => import('./components/MedicineStorePage').then(m => ({ default: m.MedicineStorePage })));
const HospitalErpDashboard = lazy(() => import('./components/erp/HospitalErpDashboard').then(m => ({ default: m.HospitalErpDashboard })));

// Lazy-loaded On-Demand Modals
const AmbulanceModal = lazy(() => import('./components/AmbulanceModal').then(m => ({ default: m.AmbulanceModal })));
const VoiceChatModal = lazy(() => import('./components/VoiceChatModal').then(m => ({ default: m.VoiceChatModal })));
const PrescriptionModal = lazy(() => import('./components/PrescriptionModal').then(m => ({ default: m.PrescriptionModal })));
const DiseaseMapModal = lazy(() => import('./components/DiseaseMapModal').then(m => ({ default: m.DiseaseMapModal })));
const BabyShotsModal = lazy(() => import('./components/BabyShotsModal').then(m => ({ default: m.BabyShotsModal })));
const DoctorHandoverModal = lazy(() => import('./components/DoctorHandoverModal').then(m => ({ default: m.DoctorHandoverModal })));
const PatientIntakeModal = lazy(() => import('./components/PatientIntakeModal').then(m => ({ default: m.PatientIntakeModal })));
const HealthGuideModal = lazy(() => import('./components/HealthGuideModal').then(m => ({ default: m.HealthGuideModal })));
const LoginModal = lazy(() => import('./components/LoginModal').then(m => ({ default: m.LoginModal })));

// Background Prefetch Handlers for 0ms Route Switching
export const prefetchRouteChunks = {
  chat: () => import('./components/ChatbotPage'),
  profile: () => import('./components/ProfilePage'),
  maps: () => import('./components/FindCareNearYou'),
  medicines: () => import('./components/MedicineStorePage'),
  'hospital-erp': () => import('./components/erp/HospitalErpDashboard'),
  privacy: () => import('./components/PrivacyPolicyPage'),
  ambulance: () => import('./components/AmbulanceModal'),
  prescription: () => import('./components/PrescriptionModal'),
  login: () => import('./components/LoginModal'),
};

const prefetchSecondaryRoutesOnIdle = () => {
  if (typeof window === 'undefined') return;
  const schedule = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1200));
  schedule(() => {
    prefetchRouteChunks.chat();
    prefetchRouteChunks['hospital-erp']();
    prefetchRouteChunks.medicines();

    setTimeout(() => {
      prefetchRouteChunks.maps();
      prefetchRouteChunks.profile();
      prefetchRouteChunks.ambulance();
    }, 1500);
  });
};

const ViewLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-500 animate-pulse">Loading HealthGrid...</span>
  </div>
);

export type AppView = 'landing' | 'chat' | 'profile' | 'maps' | 'privacy' | 'terms' | 'thank-you' | 'not-found' | 'medicines' | 'hospital-erp';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeErpHospital, setActiveErpHospital] = useState<HospitalEntity | undefined>(undefined);
  const [activeErpAdmin, setActiveErpAdmin] = useState<string>('Admin Ravi');

  // Modals state
  const [isAmbulanceOpen, setIsAmbulanceOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [voiceChatQuery, setVoiceChatQuery] = useState<string | undefined>(undefined);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isDiseaseMapOpen, setIsDiseaseMapOpen] = useState(false);
  const [isBabyShotsOpen, setIsBabyShotsOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPatientIntakeOpen, setIsPatientIntakeOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideArticle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);
  const pendingAuthActionRef = useRef<(() => void) | null>(null);

  const isAnyModalOpen = Boolean(
    isAmbulanceOpen ||
    isVoiceChatOpen ||
    isPrescriptionOpen ||
    isDiseaseMapOpen ||
    isBabyShotsOpen ||
    isHandoverOpen ||
    isLoginOpen ||
    isPatientIntakeOpen ||
    selectedGuide
  );

  // Initialize Lenis Smooth Scroll & idle route prefetching on application mount
  useEffect(() => {
    lenisService.init();
    prefetchSecondaryRoutesOnIdle();
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

  // Hardware-accelerated scroll reveal observer across view switches
  useScrollReveal([currentView]);

  // Sync view state with browser routing (/privacy, /chat, /profile, /maps and custom 404s)
  useEffect(() => {
    const syncRoute = () => {
      const rawPath = window.location.pathname.toLowerCase();
      // Strip trailing slashes, e.g. /privacy/ -> /privacy
      const pathname = rawPath.replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();

      if (pathname === '/privacy' || hash === '#privacy' || hash === '#/privacy') {
        setCurrentView('privacy');
      } else if (pathname === '/terms' || hash === '#terms' || hash === '#/terms') {
        setCurrentView('terms');
      } else if (pathname === '/thank-you' || hash === '#thank-you' || hash === '#/thank-you') {
        setCurrentView('thank-you');
      } else if (pathname === '/chat' || hash === '#chat' || hash === '#/chat') {
        setCurrentView('chat');
      } else if (pathname === '/profile' || hash === '#profile' || hash === '#/profile') {
        setCurrentView('profile');
      } else if (pathname === '/maps' || hash === '#maps' || hash === '#/maps') {
        setCurrentView('maps');
      } else if (pathname === '/medicines' || hash === '#medicines' || hash === '#/medicines') {
        setCurrentView('medicines');
      } else if (pathname === '/his' || pathname === '/doctor-portal' || hash === '#his' || hash === '#/his' || hash === '#doctor-portal' || pathname === '/hospital-erp' || pathname === '/hospital-portal' || hash === '#hospital-erp' || hash === '#hospital-portal' || hash === '#/hospital-erp') {
        setCurrentView('hospital-erp');
      } else if (hash === '#prescription' || hash === '#/prescription' || hash === '#scan-prescription') {
        setCurrentView('landing');
        setIsPrescriptionOpen(true);
      } else if (pathname === '/' || pathname === '/index.html' || pathname === '') {
        // If there is an unknown anchor hash like #unknown
        if (hash && !['', '#', '#/', '#landing', '#home', '#prescription', '#/prescription', '#scan-prescription'].includes(hash) && !hash.startsWith('#section-') && !hash.startsWith('#guide-')) {
          setCurrentView('not-found');
        } else {
          setCurrentView('landing');
        }
      } else {
        // Any unknown path like /random, /admin, /test, /404, etc.
        setCurrentView('not-found');
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  // Dynamic SEO Meta Title & Meta Description per Page Route
  useEffect(() => {
    let title = 'HealthGrid | நலம் AI - Your 24/7 AI Family Doctor & Emergency Guide';
    let desc = 'HealthGrid (நலம் AI) is Tamil Nadu\'s 24/7 autonomous healthcare network providing real-time AI doctor triage, 108 emergency ambulance dispatch, live vision tele-clinic, and Jan Aushadhi generic pharmaceutical savings.';

    switch (currentView) {
      case 'chat':
        title = lang === 'en' ? 'DocBot AI Consultation & Tele-Clinic | HealthGrid' : 'DocBot AI மருத்துவ ஆலோசனை | HealthGrid';
        desc = lang === 'en' ? 'Consult with DocBot AI for instant clinical triage, live vision symptom scanning, and affordable generic medication guidance.' : 'நிகழ்நேர AI மருத்துவ ஆலோசனை மற்றும் உடனடி அவசர வழிகாட்டுதல்.';
        break;
      case 'maps':
        title = lang === 'en' ? 'Find 24/7 PHCs, Blood Banks & Emergency Care | HealthGrid' : 'அருகிலுள்ள மருத்துவமனைகள் & அவசர சிகிச்சை | HealthGrid';
        desc = lang === 'en' ? 'Interactive locator for Primary Health Centres, government casualty hospitals, and live blood bank inventory across Tamil Nadu.' : 'தமிழ்நாடு முழுவதும் உள்ள அரசு ஆரம்ப சுகாதார நிலையங்கள் மற்றும் இரத்த வங்கிகளைக் கண்டறியவும்.';
        break;
      case 'profile':
        title = lang === 'en' ? 'Patient Medical Vault & Health Records | HealthGrid' : 'மருத்துவ ஏடு & சுயவிவரம் | HealthGrid';
        desc = lang === 'en' ? 'Your secure, zero-tracking personal health vault with longitudinal vitals and prescription history.' : 'பாதுகாப்பான தனிப்பட்ட மருத்துவ ஏடு மற்றும் நீண்டகால உடல் அளவீடுகள்.';
        break;
      case 'privacy':
        title = lang === 'en' ? 'Privacy Policy & Data Sovereignty | HealthGrid' : 'தனியுரிமைக் கொள்கை | HealthGrid';
        desc = lang === 'en' ? 'HealthGrid data sovereignty, HIPAA and DPDP compliance, and zero-ad tracking policies.' : 'தனியுரிமை மற்றும் தரவு பாதுகாப்பு கொள்கைகள்.';
        break;
      case 'terms':
        title = lang === 'en' ? 'Terms & Conditions of Service | HealthGrid' : 'விதிமுறைகள் & நிபந்தனைகள் | HealthGrid';
        desc = lang === 'en' ? 'HealthGrid clinical scope, NMC telemedicine compliance, and emergency triage disclaimer.' : 'சேவை விதிமுறைகள் மற்றும் மருத்துவ வழிகாட்டுதல்.';
        break;
      case 'thank-you':
        title = lang === 'en' ? 'Thank You | HealthGrid - நலம் AI' : 'நன்றி | HealthGrid - நலம் AI';
        desc = lang === 'en' ? 'Thank you for choosing HealthGrid for your healthcare needs.' : 'HealthGrid-ஐ தேர்ந்தெடுத்ததற்கு நன்றி.';
        break;
      case 'medicines':
        title = lang === 'en' ? 'PMBJP Cheap Generic Medicines & Kendra Store | HealthGrid' : 'மலிவு விலை மக்கள் மருந்தகம் & பொது மருந்துகள் | HealthGrid';
        desc = lang === 'en' ? 'Order authentic Indian Pharmacopoeia PMBJP generic chronic medicines at up to 89% savings with doorstep delivery and Kendra store pickup.' : 'அரசு மக்கள் மருந்தக விலையில் 89% வரை குறைந்த விலையில் அத்தியாவசிய மருந்துகளை வீட்டிலேயே அல்லது அருகிலுள்ள மருந்தகத்தில் பெறலாம்.';
        break;
      case 'hospital-erp':
        title = 'HealthGrid Hospital ERP | Autonomous Multi-Tenant Healthcare Operations';
        desc = 'Unified hospital ERP management: OPD and IPD censuses, real-time bed occupancy, department activity, revenue flow, and clinical alerts.';
        break;
      case 'not-found':
        title = lang === 'en' ? '404 - Page Not Found | HealthGrid' : '404 - பக்கம் கிடைக்கவில்லை | HealthGrid';
        desc = lang === 'en' ? 'The requested health service page could not be located.' : 'பக்கம் கிடைக்கவில்லை.';
        break;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [currentView, lang]);

  // Listen for global auth triggers and toast notifications
  useEffect(() => {
    const handleRequireLogin = (e: any) => {
      if (e.detail?.message) {
        setToastMessage(e.detail.message);
      }
      setIsLoginOpen(true);
    };
    const handleShowToast = (e: any) => {
      if (e.detail?.message) {
        setToastMessage(e.detail.message);
      }
    };
    const handleOpenPrescription = () => {
      setIsPrescriptionOpen(true);
    };
    window.addEventListener('healthgrid:require-login', handleRequireLogin);
    window.addEventListener('healthgrid:toast', handleShowToast);
    window.addEventListener('healthgrid:open-prescription', handleOpenPrescription);
    return () => {
      window.removeEventListener('healthgrid:require-login', handleRequireLogin);
      window.removeEventListener('healthgrid:toast', handleShowToast);
      window.removeEventListener('healthgrid:open-prescription', handleOpenPrescription);
    };
  }, []);

  // Auto-dismiss toast notification after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const requireAuth = (action: () => void, featureName?: string) => {
    const user = authService.getCurrentUser();
    if (user) {
      action();
    } else {
      const notice =
        lang === 'en'
          ? `Sign in or create an account to access ${featureName || 'this service'}`
          : `${featureName || 'இந்த சேவையைப்'} பயன்படுத்த உள்நுழையவும் அல்லது புதிய கணக்கு தொடங்கவும்`;
      setToastMessage(notice);
      setLoginNotice(notice);
      pendingAuthActionRef.current = action;
      setIsLoginOpen(true);
    }
  };

  const handleGlobalLoginSuccess = (_user: AuthUser) => {
    setIsLoginOpen(false);
    setLoginNotice(null);
    if (pendingAuthActionRef.current) {
      const act = pendingAuthActionRef.current;
      pendingAuthActionRef.current = null;
      setTimeout(() => act(), 100);
    }
  };

  const navigateToView = (view: AppView) => {
    setCurrentView(view);
    const path = view === 'landing' ? '/' : view === 'not-found' ? '/404' : `/${view}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleOpenVoiceChat = (sampleQuery?: string) => {
    if (sampleQuery && sampleQuery.trim()) {
      setChatInitialQuery(sampleQuery.trim());
      requireAuth(() => {
        setChatInitialQuery(sampleQuery.trim());
        navigateToView('chat');
      }, lang === 'en' ? 'AI Consultation' : 'மருத்துவ ஆலோசனை');
      return;
    }
    // Direct click to chat: allow interactive preview
    navigateToView('chat');
  };

  // Render Full-Screen Chatbot Page matching Chatbot UI.png with Persistent Top Header
  if (currentView === 'chat') {
    return (
      <div className="h-[100dvh] flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white overflow-hidden">
        {/* Sticky Coordinated Header */}
        <header className="sticky top-0 z-40 w-full flex-shrink-0">
          {/* Top Government Health Bulletin Bar */}
          <GovAlertMarquee
            lang={lang}
            onOpenMaps={() => navigateToView('maps')}
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          />
          <Navbar
            lang={lang}
            setLang={setLang}
            activeView="chat"
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
            onOpenVoiceChat={() => navigateToView('chat')}
            onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
            onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
            onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateProfile={() => requireAuth(() => navigateToView('profile'), lang === 'en' ? 'Patient Profile' : 'சுயவிவரப் பக்கம்')}
            onNavigateHome={() => navigateToView('landing')}
            onNavigateMedicines={() => navigateToView('medicines')}
            onNavigateHealthRecords={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  const el = document.getElementById('health-information');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 250);
              }, lang === 'en' ? 'Health Records' : 'மருத்துவ ஏடுகள்');
            }}
            onNavigateSettings={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-profile-edit'));
                }, 250);
              }, lang === 'en' ? 'Profile Settings' : 'அமைப்புகள்');
            }}
            onOpenPatientIntake={() => setIsPatientIntakeOpen(true)}
          />
        </header>

        {/* Chatbot Content Area filling exact remaining viewport height */}
        <main className="flex-1 w-full overflow-hidden flex flex-col min-h-0">
          <Suspense fallback={<ViewLoadingFallback />}>
            <ChatbotPage
              lang={lang}
              setLang={setLang}
              initialQuery={chatInitialQuery}
              onNavigateHome={() => navigateToView('landing')}
              onNavigateProfile={() => navigateToView('profile')}
              onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
              onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
              onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
              onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
              onNavigateMedicines={() => navigateToView('medicines')}
            />
          </Suspense>
        </main>

        {/* Global Modals Accessible within Chat */}
        {isAmbulanceOpen && (
          <Suspense fallback={null}>
            <AmbulanceModal
              isOpen={isAmbulanceOpen}
              onClose={() => setIsAmbulanceOpen(false)}
              lang={lang}
              onOpenHandover={() => setIsHandoverOpen(true)}
            />
          </Suspense>
        )}
        {isPrescriptionOpen && (
          <Suspense fallback={null}>
            <PrescriptionModal
              isOpen={isPrescriptionOpen}
              onClose={() => setIsPrescriptionOpen(false)}
              lang={lang}
              onOpenDiseaseMap={() => navigateToView('maps')}
              onNavigateMedicines={() => navigateToView('medicines')}
            />
          </Suspense>
        )}
        {isDiseaseMapOpen && (
          <Suspense fallback={null}>
            <DiseaseMapModal
              isOpen={isDiseaseMapOpen}
              onClose={() => setIsDiseaseMapOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isBabyShotsOpen && (
          <Suspense fallback={null}>
            <BabyShotsModal
              isOpen={isBabyShotsOpen}
              onClose={() => setIsBabyShotsOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isHandoverOpen && (
          <Suspense fallback={null}>
            <DoctorHandoverModal
              isOpen={isHandoverOpen}
              onClose={() => setIsHandoverOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isLoginOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => {
                setIsLoginOpen(false);
                setLoginNotice(null);
                pendingAuthActionRef.current = null;
              }}
              lang={lang}
              contextNotice={loginNotice}
              onSuccess={() => {
                setIsLoginOpen(false);
                setLoginNotice(null);
                if (pendingAuthActionRef.current) {
                  const action = pendingAuthActionRef.current;
                  pendingAuthActionRef.current = null;
                  action();
                }
              }}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render Profile Page (/profile)
  if (currentView === 'profile') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <ProfilePage
          lang={lang}
          onNavigateChat={() => navigateToView('chat')}
          onNavigateHome={() => navigateToView('landing')}
        />
      </Suspense>
    );
  }

  // Render Full-Screen Dedicated Maps Page matching Maps ref.png
  if (currentView === 'maps') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
        {/* Sticky Coordinated Header */}
        <header className="sticky top-0 z-40 w-full">
          {/* Top Government Health Bulletin Bar */}
          <GovAlertMarquee
            lang={lang}
            onOpenMaps={() => navigateToView('maps')}
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          />
          <Navbar
            lang={lang}
            setLang={setLang}
            activeView="maps"
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
            onOpenVoiceChat={() => navigateToView('chat')}
            onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
            onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
            onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateProfile={() => requireAuth(() => navigateToView('profile'), lang === 'en' ? 'Patient Profile' : 'சுயவிவரப் பக்கம்')}
            onNavigateHome={() => navigateToView('landing')}
            onNavigateMedicines={() => navigateToView('medicines')}
            onNavigateHealthRecords={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  const el = document.getElementById('health-information');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 250);
              }, lang === 'en' ? 'Health Records' : 'மருத்துவ ஏடுகள்');
            }}
            onNavigateSettings={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-profile-edit'));
                }, 250);
              }, lang === 'en' ? 'Profile Settings' : 'அமைப்புகள்');
            }}
            onOpenPatientIntake={() => setIsPatientIntakeOpen(true)}
          />
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Suspense fallback={<ViewLoadingFallback />}>
            <FindCareNearYou
              lang={lang}
              onClose={() => navigateToView('landing')}
              isModal={false}
            />
          </Suspense>
        </main>
        <Footer
          lang={lang}
          setLang={setLang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
          onOpenPrivacy={() => navigateToView('privacy')}
          onNavigateMedicines={() => navigateToView('medicines')}
        />
      </div>
    );
  }

  // Render PMBJP Jan Aushadhi Medicine Store Page (/medicines)
  if (currentView === 'medicines') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
        {/* Sticky Coordinated Header */}
        <header className="sticky top-0 z-40 w-full">
          {/* Top Government Health Bulletin Bar */}
          <GovAlertMarquee
            lang={lang}
            onOpenMaps={() => navigateToView('maps')}
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          />
          <Navbar
            lang={lang}
            setLang={setLang}
            activeView="medicines"
            onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
            onOpenVoiceChat={() => navigateToView('chat')}
            onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
            onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
            onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateProfile={() => requireAuth(() => navigateToView('profile'), lang === 'en' ? 'Patient Profile' : 'சுயவிவரப் பக்கம்')}
            onNavigateHome={() => navigateToView('landing')}
            onNavigateMedicines={() => navigateToView('medicines')}
            onNavigateHealthRecords={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  const el = document.getElementById('health-information');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 250);
              }, lang === 'en' ? 'Health Records' : 'மருத்துவ ஏடுகள்');
            }}
            onNavigateSettings={() => {
              requireAuth(() => {
                navigateToView('profile');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-profile-edit'));
                }, 250);
              }, lang === 'en' ? 'Profile Settings' : 'அமைப்புகள்');
            }}
            onOpenPatientIntake={() => setIsPatientIntakeOpen(true)}
          />
        </header>

        {/* Medicine Store Content */}
        <main className="flex-1 w-full">
          <Suspense fallback={<ViewLoadingFallback />}>
            <MedicineStorePage
              lang={lang}
              onNavigateHome={() => navigateToView('landing')}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
              onOpenDiseaseMap={() => navigateToView('maps')}
            />
          </Suspense>
        </main>

        {/* Global Footer */}
        <Footer
          lang={lang}
          setLang={setLang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
          onOpenPrivacy={() => navigateToView('privacy')}
          onOpenTerms={() => navigateToView('terms')}
          onNavigateMedicines={() => navigateToView('medicines')}
        />

        {/* Global Modals Accessible within Medicine Store */}
        {isAmbulanceOpen && (
          <Suspense fallback={null}>
            <AmbulanceModal
              isOpen={isAmbulanceOpen}
              onClose={() => setIsAmbulanceOpen(false)}
              lang={lang}
              onOpenHandover={() => setIsHandoverOpen(true)}
            />
          </Suspense>
        )}
        {isPrescriptionOpen && (
          <Suspense fallback={null}>
            <PrescriptionModal
              isOpen={isPrescriptionOpen}
              onClose={() => setIsPrescriptionOpen(false)}
              lang={lang}
              onOpenDiseaseMap={() => navigateToView('maps')}
              onNavigateMedicines={() => navigateToView('medicines')}
            />
          </Suspense>
        )}
        {isDiseaseMapOpen && (
          <Suspense fallback={null}>
            <DiseaseMapModal
              isOpen={isDiseaseMapOpen}
              onClose={() => setIsDiseaseMapOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isBabyShotsOpen && (
          <Suspense fallback={null}>
            <BabyShotsModal
              isOpen={isBabyShotsOpen}
              onClose={() => setIsBabyShotsOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isHandoverOpen && (
          <Suspense fallback={null}>
            <DoctorHandoverModal
              isOpen={isHandoverOpen}
              onClose={() => setIsHandoverOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isPatientIntakeOpen && (
          <Suspense fallback={null}>
            <PatientIntakeModal
              isOpen={isPatientIntakeOpen}
              onClose={() => setIsPatientIntakeOpen(false)}
              lang={lang}
              onOpenAmbulance={() => setIsAmbulanceOpen(true)}
              onJoinConsultation={() => {
                setIsPatientIntakeOpen(false);
                navigateToView('chat');
              }}
            />
          </Suspense>
        )}
        {isLoginOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => {
                setIsLoginOpen(false);
                setLoginNotice(null);
                pendingAuthActionRef.current = null;
              }}
              lang={lang}
              contextNotice={loginNotice}
              onSuccess={handleGlobalLoginSuccess}
              onNavigateHospitalErp={(hospital, adminName) => {
                setActiveErpHospital(hospital);
                setActiveErpAdmin(adminName);
                navigateToView('hospital-erp');
              }}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render Dedicated Hospital ERP Operations Workspace (Matching ERP Overview.png)
  if (currentView === 'hospital-erp') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <HospitalErpDashboard
          initialHospital={activeErpHospital}
          adminName={activeErpAdmin}
          onExit={() => navigateToView('landing')}
        />
      </Suspense>
    );
  }

  // Render Dedicated Privacy Policy & Data Sovereignty / Terms Page
  if (currentView === 'privacy' || currentView === 'terms') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <PrivacyPolicyPage
          lang={lang}
          defaultTab={currentView === 'terms' ? 'terms' : 'privacy'}
          onBack={() => navigateToView('landing')}
        />
      </Suspense>
    );
  }

  // Render Dedicated Thank You & Confirmation Page
  if (currentView === 'thank-you') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <ThankYouPage
          lang={lang}
          onNavigateHome={() => navigateToView('landing')}
          onNavigateChat={() => navigateToView('chat')}
          onNavigateMaps={() => navigateToView('maps')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
        />
      </Suspense>
    );
  }

  // Render Custom 404 Telemetry / Not Found Page for any unknown route
  if (currentView === 'not-found') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <NotFoundPage
          lang={lang}
          setLang={setLang}
          onNavigateHome={() => navigateToView('landing')}
          onNavigateChat={() => navigateToView('chat')}
          onNavigateMaps={() => navigateToView('maps')}
          onNavigateProfile={() => navigateToView('profile')}
          onOpenAmbulance={() => setIsAmbulanceOpen(true)}
          onOpenPrescription={() => setIsPrescriptionOpen(true)}
          onOpenBabyShots={() => setIsBabyShotsOpen(true)}
          onOpenPrivacy={() => navigateToView('privacy')}
          onOpenLogin={() => setIsLoginOpen(true)}
          onNavigateMedicines={() => navigateToView('medicines')}
        />

        {/* Global Modals Accessible within 404 Page */}
        {isAmbulanceOpen && (
          <Suspense fallback={null}>
            <AmbulanceModal
              isOpen={isAmbulanceOpen}
              onClose={() => setIsAmbulanceOpen(false)}
              lang={lang}
              onOpenHandover={() => setIsHandoverOpen(true)}
            />
          </Suspense>
        )}
        {isPrescriptionOpen && (
          <Suspense fallback={null}>
            <PrescriptionModal
              isOpen={isPrescriptionOpen}
              onClose={() => setIsPrescriptionOpen(false)}
              lang={lang}
              onOpenDiseaseMap={() => navigateToView('maps')}
              onNavigateMedicines={() => navigateToView('medicines')}
            />
          </Suspense>
        )}
        {isBabyShotsOpen && (
          <Suspense fallback={null}>
            <BabyShotsModal
              isOpen={isBabyShotsOpen}
              onClose={() => setIsBabyShotsOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isHandoverOpen && (
          <Suspense fallback={null}>
            <DoctorHandoverModal
              isOpen={isHandoverOpen}
              onClose={() => setIsHandoverOpen(false)}
              lang={lang}
            />
          </Suspense>
        )}
        {isLoginOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => {
                setIsLoginOpen(false);
                setLoginNotice(null);
                pendingAuthActionRef.current = null;
              }}
              lang={lang}
              contextNotice={loginNotice}
              onSuccess={handleGlobalLoginSuccess}
              onNavigateHospitalErp={(hospital, adminName) => {
                setActiveErpHospital(hospital);
                setActiveErpAdmin(adminName);
                navigateToView('hospital-erp');
              }}
            />
          </Suspense>
        )}
      </Suspense>
    );
  }

  // Default: Public Landing Page matching Landing page new.png & Footer ref.png
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-500 selection:text-white pb-20 md:pb-0">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full">
        {/* Top Government Health Bulletin Bar */}
        <GovAlertMarquee
          lang={lang}
          onOpenMaps={() => navigateToView('maps')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
        />
        <Navbar
          lang={lang}
          setLang={setLang}
          activeView="landing"
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
          onOpenLogin={() => setIsLoginOpen(true)}
          onNavigateProfile={() => requireAuth(() => navigateToView('profile'), lang === 'en' ? 'Patient Profile' : 'சுயவிவரப் பக்கம்')}
          onNavigateHome={() => navigateToView('landing')}
          onNavigateMedicines={() => navigateToView('medicines')}
          onNavigateHealthRecords={() => {
            requireAuth(() => {
              navigateToView('profile');
              setTimeout(() => {
                const el = document.getElementById('health-information');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 250);
            }, lang === 'en' ? 'Health Records' : 'மருத்துவ ஏடுகள்');
          }}
          onNavigateSettings={() => {
            requireAuth(() => {
              navigateToView('profile');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-profile-edit'));
              }, 250);
            }, lang === 'en' ? 'Profile Settings' : 'அமைப்புகள்');
          }}
          onOpenPatientIntake={() => setIsPatientIntakeOpen(true)}
        />
      </header>

      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* Hero Section with Intelligent Fuzzy Search & Desk Mascot */}
        <HeroSection
          lang={lang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
          onNavigateMedicines={() => navigateToView('medicines')}
        />

        {/* Elevated 6-Service Shelf Matching Landing page new.png */}
        <ActionCards
          lang={lang}
          onOpenVoiceChat={() => navigateToView('chat')}
          onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
          onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
          onNavigateMedicines={() => navigateToView('medicines')}
          onOpenPatientIntake={() => setIsPatientIntakeOpen(true)}
        />

        {/* Community Health Heatmap & Quick Health Insights Section */}
        <CommunityHealthSection
          lang={lang}
          onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
          onSelectGuide={(guide) => setSelectedGuide(guide)}
        />

        {/* Google OAuth & User Data Transparency Compliance Section */}
        <OAuthTransparencySection
          lang={lang}
          onOpenPrivacy={() => navigateToView('privacy')}
          onOpenTerms={() => navigateToView('terms')}
        />
      </main>

      {/* Global Footer Matching Footer ref.png */}
      <Footer
        lang={lang}
        setLang={setLang}
        onOpenVoiceChat={() => navigateToView('chat')}
        onOpenAmbulance={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Ambulance Dispatch' : '108 ஆம்புலன்ஸ்')}
        onOpenPrescription={() => requireAuth(() => setIsPrescriptionOpen(true), lang === 'en' ? 'Prescription Scanner' : 'மருந்துச் சீட்டு ஸ்கேனர்')}
        onOpenDiseaseMap={() => requireAuth(() => setIsDiseaseMapOpen(true), lang === 'en' ? 'Disease Map' : 'நோய் வரைபடம்')}
        onOpenBabyShots={() => requireAuth(() => setIsBabyShotsOpen(true), lang === 'en' ? 'Immunization Schedule' : 'தடுப்பூசி அட்டவணை')}
        onOpenPrivacy={() => navigateToView('privacy')}
        onOpenTerms={() => navigateToView('terms')}
        onNavigateMedicines={() => navigateToView('medicines')}
      />

      {/* Interactive Modals */}
      {isAmbulanceOpen && (
        <Suspense fallback={null}>
          <AmbulanceModal
            isOpen={isAmbulanceOpen}
            onClose={() => setIsAmbulanceOpen(false)}
            lang={lang}
            onOpenHandover={() => setIsHandoverOpen(true)}
          />
        </Suspense>
      )}

      {isVoiceChatOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {isPrescriptionOpen && (
        <Suspense fallback={null}>
          <PrescriptionModal
            isOpen={isPrescriptionOpen}
            onClose={() => setIsPrescriptionOpen(false)}
            lang={lang}
            onOpenDiseaseMap={() => navigateToView('maps')}
            onNavigateMedicines={() => navigateToView('medicines')}
          />
        </Suspense>
      )}

      {isDiseaseMapOpen && (
        <Suspense fallback={null}>
          <DiseaseMapModal
            isOpen={isDiseaseMapOpen}
            onClose={() => setIsDiseaseMapOpen(false)}
            lang={lang}
          />
        </Suspense>
      )}

      {isBabyShotsOpen && (
        <Suspense fallback={null}>
          <BabyShotsModal
            isOpen={isBabyShotsOpen}
            onClose={() => setIsBabyShotsOpen(false)}
            lang={lang}
          />
        </Suspense>
      )}

      {isHandoverOpen && (
        <Suspense fallback={null}>
          <DoctorHandoverModal
            isOpen={isHandoverOpen}
            onClose={() => setIsHandoverOpen(false)}
            lang={lang}
          />
        </Suspense>
      )}

      {isPatientIntakeOpen && (
        <Suspense fallback={null}>
          <PatientIntakeModal
            isOpen={isPatientIntakeOpen}
            onClose={() => setIsPatientIntakeOpen(false)}
            lang={lang}
            onOpenAmbulance={() => setIsAmbulanceOpen(true)}
            onJoinConsultation={() => {
              setIsPatientIntakeOpen(false);
              navigateToView('chat');
            }}
          />
        </Suspense>
      )}

      {isLoginOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => {
              setIsLoginOpen(false);
              setLoginNotice(null);
              pendingAuthActionRef.current = null;
            }}
            lang={lang}
            contextNotice={loginNotice}
            onSuccess={handleGlobalLoginSuccess}
            onNavigateHospitalErp={(hospital, adminName) => {
              setActiveErpHospital(hospital);
              setActiveErpAdmin(adminName);
              navigateToView('hospital-erp');
            }}
          />
        </Suspense>
      )}

      {selectedGuide && (
        <Suspense fallback={null}>
          <HealthGuideModal
            guide={selectedGuide}
            onClose={() => setSelectedGuide(null)}
            lang={lang}
            onOpenVoiceChat={handleOpenVoiceChat}
            onOpenDiseaseMap={() => setIsDiseaseMapOpen(true)}
            onOpenBabyShots={() => setIsBabyShotsOpen(true)}
          />
        </Suspense>
      )}

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sticky Mobile Bottom Quick Action Bar (<768px screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 safe-area-pb">
        <button
          type="button"
          onClick={() => handleOpenVoiceChat()}
          className="flex-1 min-h-[48px] py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Stethoscope className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{lang === 'en' ? 'Consult AI' : 'AI ஆலோசனை'}</span>
        </button>

        <button
          type="button"
          onClick={() => requireAuth(() => setIsAmbulanceOpen(true), lang === 'en' ? 'Emergency 108' : '108 அவசரம்')}
          className="min-h-[48px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer flex-shrink-0"
        >
          <Siren className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span>108</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToView('maps')}
          className="min-h-[48px] py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer flex-shrink-0"
        >
          <MapPin className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span className="truncate">{lang === 'en' ? 'PHCs' : 'மருத்துவமனை'}</span>
        </button>
      </div>

      {/* HIPAA & Privacy Cookie Consent Banner */}
      <CookieConsentBanner
        lang={lang}
        onOpenPrivacy={() => navigateToView('privacy')}
      />
    </div>
  );
}
