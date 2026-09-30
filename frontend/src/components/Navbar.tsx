import React, { useState, useEffect } from 'react';
import { Siren, Menu, X, User, ChevronDown, PhoneCall, Stethoscope, FileText, Pill, MapPin, Baby, LogOut, ShieldCheck, Bell, ChevronRight } from 'lucide-react';
import type { Language } from '../types';
import { authService, type AuthUser } from '../services/authService';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenAmbulance: () => void;
  onOpenVoiceChat: (sampleQuery?: string) => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
  onOpenBabyShots: () => void;
  onOpenLogin: () => void;
  onNavigateProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  onOpenAmbulance,
  onOpenVoiceChat,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onOpenLogin,
  onNavigateProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <>
      <header className="relative w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => {
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src="/Logo.png" 
              alt="HealthGrid - நலம் AI" 
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity" 
            />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-700">
            <button 
              onClick={() => {
                window.location.hash = '';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="relative text-teal-700 font-semibold py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-600 after:rounded-full"
            >
              {lang === 'en' ? 'Home' : 'முகப்பு'}
            </button>
            <button 
              onClick={() => onOpenVoiceChat()} 
              className="hover:text-teal-600 transition-colors py-1"
            >
              {lang === 'en' ? 'Speak to Doctor' : 'குரல் உதவி'}
            </button>
            <button 
              onClick={onOpenAmbulance} 
              className="hover:text-red-600 transition-colors py-1"
            >
              {lang === 'en' ? 'Call Ambulance' : 'ஆம்புலன்ஸ்'}
            </button>
            <button 
              onClick={onOpenPrescription} 
              className="hover:text-teal-600 transition-colors py-1"
            >
              {lang === 'en' ? 'Medicines' : 'மருந்துகள்'}
            </button>
            <button 
              onClick={onOpenDiseaseMap} 
              className="hover:text-teal-600 transition-colors py-1"
            >
              {lang === 'en' ? 'Maps' : 'வரைபடம்'}
            </button>

            {/* More dropdown */}
            <div className="relative">
              <button 
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)} 
                className="flex items-center gap-1 hover:text-teal-600 transition-colors py-1"
              >
                {lang === 'en' ? 'More' : 'மேலும்'}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button 
                    onClick={() => { onOpenBabyShots(); setMoreDropdownOpen(false); }} 
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors text-left"
                  >
                    <Baby className="w-4 h-4 text-teal-600" />
                    <span>{lang === 'en' ? 'Baby Shots Tracker' : 'குழந்தை தடுப்பூசி'}</span>
                  </button>
                  <button 
                    onClick={() => { onOpenPrescription(); setMoreDropdownOpen(false); }} 
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{lang === 'en' ? 'Scan Prescription' : 'சீட்டு ஸ்கேன்'}</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    {lang === 'en' ? 'Emergency 24x7' : 'அவசர உதவி'}
                  </div>
                  <a 
                    href="tel:108" 
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span>108 Ambulance</span>
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href="tel:104" 
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <span>104 Health Helpline</span>
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Language Switcher, Profile, and SOS Ambulance Button */}
          <div className="flex items-center gap-3">
            
            {/* Language Pill Switcher */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/80 text-xs font-medium">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === 'en' 
                    ? 'bg-teal-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-3 py-1 rounded-full font-tamil transition-all ${
                  lang === 'ta' 
                    ? 'bg-teal-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Notification Bell with indicator */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-colors relative border border-slate-200/80"
                title={lang === 'en' ? 'Health Alerts' : 'சுகாதார அறிவிப்புகள்'}
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900">
                      {lang === 'en' ? 'Public Health Alerts' : 'சுகாதார எச்சரிக்கைகள்'}
                    </span>
                    <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                      1 Active
                    </span>
                  </div>
                  <div 
                    onClick={() => { onOpenDiseaseMap(); setNotificationsOpen(false); }}
                    className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 hover:bg-rose-100/80 transition-colors cursor-pointer text-xs space-y-1"
                  >
                    <div className="font-bold text-rose-900 text-xs">
                      {lang === 'en' ? 'Dengue Outbreak Alert' : 'டெங்கு காய்ச்சல் எச்சரிக்கை'}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {lang === 'en' ? 'North Chennai Ward 48 reporting spike. Tap to open live radar map.' : 'வடசென்னையில் காய்ச்சல் பரவல். நேரலை வரைபடம் பார்க்கவும்.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Right Profile Pill / Sign In Button */}
            <div className="relative flex items-center gap-1.5">
              {currentUser ? (
                <>
                  <button
                    onClick={onNavigateProfile}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white hover:bg-teal-50/80 text-slate-800 border border-slate-200/90 shadow-2xs hover:border-teal-400 transition-all text-xs font-semibold cursor-pointer group"
                    title={currentUser.name}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/30 group-hover:scale-105 transition-transform overflow-hidden">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="max-w-[85px] sm:max-w-[110px] truncate font-bold text-slate-800">
                      {currentUser.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Active"></span>
                  </button>

                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Account Menu"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100/90 text-teal-800 border border-teal-200 shadow-2xs transition-all text-xs font-bold cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>{lang === 'en' ? 'Sign In' : 'உள்நுழைக'}</span>
                </button>
              )}

              {/* User Dropdown Menu if toggled */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="pb-2 mb-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>{currentUser.role === 'HEALTHCARE_PROFESSIONAL' ? 'Clinician Verified' : 'Personal Account'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigateProfile) onNavigateProfile();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-teal-700 hover:bg-teal-50 rounded-xl font-semibold transition-colors mb-1"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{lang === 'en' ? 'View Health Profile' : 'சுயவிவரம் பார்க்க'}</span>
                  </button>

                  <button
                    onClick={() => {
                      authService.logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Logout' : 'வெளியேறு'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pulsing Emergency SOS Button */}
            <button
              onClick={onOpenAmbulance}
              className="relative group flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-glow-red transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 select-none animate-pulse-slow"
            >
              <Siren className="w-4 h-4 animate-bounce text-white" />
              <span className="tracking-wide">SOS Ambulance</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-slate-900/40 backdrop-blur-sm z-50">
            <div className="bg-white border-b border-slate-200 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
              
              {/* Mobile Profile / Login Card */}
              <div className="pb-3 border-b border-slate-100">
                {currentUser ? (
                  <button
                    onClick={() => {
                      if (onNavigateProfile) onNavigateProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#D0F0EC] text-[#00695C] font-bold flex items-center justify-center text-xs ring-1 ring-teal-500/20 overflow-hidden">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                        <div className="text-[10px] text-teal-700 font-semibold">{lang === 'en' ? 'View My Health Profile' : 'சுயவிவரம் காண்க'}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-teal-700" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">{lang === 'en' ? 'Sign In / Register' : 'உள்நுழைக / பதிவு செய்க'}</div>
                        <div className="text-[10px] text-teal-100 font-medium">{lang === 'en' ? 'Access your private health records' : 'தனிப்பட்ட மருத்துவ பதிவுகளை காண்க'}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {lang === 'en' ? 'Quick Access Services' : 'அதிவேக சேவைகள்'}
                </span>
                <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  24x7 Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { onOpenVoiceChat(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-teal-50/80 hover:bg-teal-100/80 text-teal-800 rounded-xl border border-teal-200/80 transition-colors"
                >
                  <Stethoscope className="w-5 h-5 text-teal-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Speak to Doctor' : 'குரல் உதவி'}</span>
                </button>

                <button
                  onClick={() => { onOpenAmbulance(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-red-50/80 hover:bg-red-100/80 text-red-800 rounded-xl border border-red-200/80 transition-colors"
                >
                  <Siren className="w-5 h-5 text-red-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Call Ambulance' : 'ஆம்புலன்ஸ்'}</span>
                </button>

                <button
                  onClick={() => { onOpenPrescription(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-blue-50/80 hover:bg-blue-100/80 text-blue-800 rounded-xl border border-blue-200/80 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Scan Prescription' : 'சீட்டு ஸ்கேன்'}</span>
                </button>

                <button
                  onClick={() => { onOpenPrescription(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-yellow-50/80 hover:bg-yellow-100/80 text-yellow-800 rounded-xl border border-yellow-200/80 transition-colors"
                >
                  <Pill className="w-5 h-5 text-yellow-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Cheap Medicines' : 'மலிவு மருந்துகள்'}</span>
                </button>

                <button
                  onClick={() => { onOpenDiseaseMap(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-red-50/80 hover:bg-red-100/80 text-red-800 rounded-xl border border-red-200/80 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-red-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Maps' : 'வரைபடம்'}</span>
                </button>

                <button
                  onClick={() => { onOpenBabyShots(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-green-50/80 hover:bg-green-100/80 text-green-800 rounded-xl border border-green-200/80 transition-colors"
                >
                  <Baby className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Baby Shots' : 'தடுப்பூசி'}</span>
                </button>
              </div>

              {/* Emergency Hotline Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <a 
                  href="tel:108" 
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>108 Ambulance</span>
                </a>
                <a 
                  href="tel:104" 
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>104 Health Help</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
