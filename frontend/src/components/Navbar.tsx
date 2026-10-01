import React, { useState, useEffect, useRef } from 'react';
import {
  Siren,
  Menu,
  X,
  User,
  ChevronDown,
  PhoneCall,
  Stethoscope,
  FileText,
  Pill,
  MapPin,
  Baby,
  LogOut,
  Bell,
  ChevronRight,
  Check,
  Settings,
  Home
} from 'lucide-react';
import type { Language } from '../types';
import { authService, type AuthUser } from '../services/authService';

export interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeView?: 'landing' | 'chat' | 'profile' | 'maps' | 'privacy' | 'not-found' | 'medicines';
  onOpenAmbulance: () => void;
  onOpenVoiceChat: (sampleQuery?: string) => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
  onOpenBabyShots: () => void;
  onOpenLogin: () => void;
  onNavigateProfile?: () => void;
  onNavigateHome?: () => void;
  onNavigateMedicines?: () => void;
  onNavigateHealthRecords?: () => void;
  onNavigateSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  activeView = 'landing',
  onOpenAmbulance,
  onOpenVoiceChat,
  onOpenPrescription,
  onOpenDiseaseMap,
  onOpenBabyShots,
  onOpenLogin,
  onNavigateProfile,
  onNavigateHome,
  onNavigateMedicines,
  onNavigateHealthRecords,
  onNavigateSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  // Determine active nav index for underline positioning
  // 0: Home, 1: Chat, 2: Medicines, 3: Maps, 4: More
  const getActiveNavIndex = (): number => {
    if (activeView === 'landing') return 0;
    if (activeView === 'chat') return 1;
    if (activeView === 'medicines') return 2;
    if (activeView === 'maps') return 3;
    return -1;
  };

  const activeNavIndex = getActiveNavIndex();
  const displayNavIndex = hoveredNavIndex !== null ? hoveredNavIndex : activeNavIndex;
  const isHovering = hoveredNavIndex !== null;

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'M';

  const userFirstName = currentUser?.name
    ? currentUser.name.trim().split(/\s+/)[0]
    : 'User';

  return (
    <>
      <header className="relative w-full bg-white border-b border-slate-200/90 shadow-2xs transition-all z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Brand Logo matching Header reference.png */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0" 
            onClick={handleHomeClick}
          >
            <img 
              src="/Logo.png" 
              alt="HealthGrid - நலம் AI" 
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity" 
            />
          </div>

          {/* Center: Desktop Navigation Links with Equal Spacing & Dynamic Sliding Underline */}
          <nav className="hidden md:flex items-center justify-center relative text-sm font-medium text-slate-700 flex-1 px-2 lg:px-4">
            <div 
              className="grid grid-cols-5 items-center text-center w-full max-w-[500px] lg:max-w-[580px] xl:max-w-[640px] relative select-none"
              onMouseLeave={() => setHoveredNavIndex(null)}
            >
              
              {/* Slot 0: Home */}
              <div className="flex justify-center items-center w-full">
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredNavIndex(0)}
                  onClick={() => {
                    setHoveredNavIndex(null);
                    handleHomeClick();
                  }} 
                  className={`py-2 text-center transition-colors cursor-pointer w-full truncate ${
                    hoveredNavIndex === 0 
                      ? 'text-[#2563EB] font-semibold' 
                      : hoveredNavIndex === null && activeNavIndex === 0 
                      ? 'text-[#00A896] font-semibold' 
                      : 'text-slate-700 hover:text-[#2563EB]'
                  }`}
                >
                  {lang === 'en' ? 'Home' : 'முகப்பு'}
                </button>
              </div>

              {/* Slot 1: Chat */}
              <div className="flex justify-center items-center w-full">
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredNavIndex(1)}
                  onClick={() => {
                    setHoveredNavIndex(null);
                    onOpenVoiceChat();
                  }} 
                  className={`py-2 text-center transition-colors cursor-pointer w-full truncate ${
                    hoveredNavIndex === 1 
                      ? 'text-[#2563EB] font-semibold' 
                      : hoveredNavIndex === null && activeNavIndex === 1 
                      ? 'text-[#00A896] font-semibold' 
                      : 'text-slate-700 hover:text-[#2563EB]'
                  }`}
                >
                  {lang === 'en' ? 'Chat' : 'உரையாடல்'}
                </button>
              </div>

              {/* Slot 2: Medicines */}
              <div className="flex justify-center items-center w-full">
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredNavIndex(2)}
                  onClick={() => {
                    setHoveredNavIndex(null);
                    if (onNavigateMedicines) {
                      onNavigateMedicines();
                    } else {
                      window.history.pushState({}, '', '/medicines');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }} 
                  className={`py-2 text-center transition-colors cursor-pointer w-full truncate ${
                    hoveredNavIndex === 2 
                      ? 'text-[#2563EB] font-semibold' 
                      : hoveredNavIndex === null && activeNavIndex === 2 
                      ? 'text-[#00A896] font-semibold' 
                      : 'text-slate-700 hover:text-[#2563EB]'
                  }`}
                >
                  {lang === 'en' ? 'Medicines' : 'மருந்துகள்'}
                </button>
              </div>

              {/* Slot 3: Maps */}
              <div className="flex justify-center items-center w-full">
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredNavIndex(3)}
                  onClick={() => {
                    setHoveredNavIndex(null);
                    onOpenDiseaseMap();
                  }} 
                  className={`py-2 text-center transition-colors cursor-pointer w-full truncate ${
                    hoveredNavIndex === 3 
                      ? 'text-[#2563EB] font-semibold' 
                      : hoveredNavIndex === null && activeNavIndex === 3 
                      ? 'text-[#00A896] font-semibold' 
                      : 'text-slate-700 hover:text-[#2563EB]'
                  }`}
                >
                  {lang === 'en' ? 'Maps' : 'வரைபடம்'}
                </button>
              </div>

              {/* Slot 4: More Dropdown */}
              <div className="flex justify-center items-center w-full relative" ref={moreDropdownRef}>
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredNavIndex(4)}
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)} 
                  className={`flex items-center justify-center gap-1 py-2 text-center transition-colors cursor-pointer w-full ${
                    moreDropdownOpen || hoveredNavIndex === 4
                      ? 'text-[#2563EB] font-semibold' 
                      : hoveredNavIndex === null && activeNavIndex === 4 
                      ? 'text-[#00A896] font-semibold' 
                      : 'text-slate-700 hover:text-[#2563EB]'
                  }`}
                >
                  <span>{lang === 'en' ? 'More' : 'மேலும்'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* More dropdown popover */}
                {moreDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 z-50 animate-dropdown-flow text-left">
                    <button 
                      type="button"
                      onClick={() => { onOpenBabyShots(); setMoreDropdownOpen(false); }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors cursor-pointer"
                    >
                      <Baby className="w-4 h-4 text-teal-600" />
                      <span>{lang === 'en' ? 'Baby Shots Tracker' : 'குழந்தை தடுப்பூசி'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { onOpenPrescription(); setMoreDropdownOpen(false); }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'en' ? 'Scan Prescription' : 'சீட்டு ஸ்கேன்'}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {lang === 'en' ? 'Emergency 24x7' : 'அவசர உதவி'}
                    </div>
                    <a 
                      href="tel:108" 
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <span>108 Ambulance</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <a 
                      href="tel:104" 
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                    >
                      <span>104 Health Helpline</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Dynamic Flowing Underline Indicator: Blue while switching/hovering, Brand Green when clicked/resting */}
              {displayNavIndex >= 0 && (
                <span
                  className={`absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out pointer-events-none ${
                    isHovering
                      ? 'bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.45)]'
                      : 'bg-[#00A896]'
                  }`}
                  style={{
                    width: '36px',
                    left: `calc(${displayNavIndex} * (100% / 5) + ((100% / 5) - 36px) / 2)`,
                  }}
                />
              )}
            </div>
          </nav>

          {/* Right: Language Pill Dropdown, Notification Bell, User Profile Pill, and SOS Ambulance Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0">
            
            {/* Language Pill Dropdown: [ EN ⌵ ] matching reference */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer select-none"
                aria-label="Select Language"
              >
                <span>{lang === 'en' ? 'EN' : 'தமிழ்'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-1.5 z-50 animate-dropdown-flow">
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setLangDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                      lang === 'en' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>English (EN)</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('ta'); setLangDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left font-tamil transition-colors cursor-pointer ${
                      lang === 'ta' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>தமிழ் (TA)</span>
                    {lang === 'ta' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Subtle vertical separator matching reference */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Notification Bell with Red Badge Dot matching reference */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors relative border border-slate-200/80 cursor-pointer"
                title={lang === 'en' ? 'Health Alerts' : 'சுகாதார அறிவிப்புகள்'}
                aria-label="Health Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-3 z-50 animate-dropdown-flow">
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

            {/* User Profile Pill & Dropdown - Strict Fixed 140px Footprint */}
            <div className="relative w-[140px] flex-shrink-0" ref={userDropdownRef}>
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-[140px] h-9 sm:h-10 flex items-center justify-between pl-1 pr-2 rounded-full hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group border border-slate-200/60 hover:border-slate-300 flex-shrink-0"
                    title={currentUser.name}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00897B] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs overflow-hidden flex-shrink-0">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          userInitial
                        )}
                      </div>
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-800 truncate block text-left" title={currentUser.name}>
                        {userFirstName}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Card matching reference screenshot exactly */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-3.5 z-50 animate-dropdown-flow">
                      {/* Top User Info Card */}
                      <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-[#00897B] text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden">
                          {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {currentUser.name || 'Mohamed Sameen'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {currentUser.email || 'sameen14mmofficial@gmail.com'}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        {/* View Profile */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onNavigateProfile) onNavigateProfile();
                            else {
                              window.history.pushState({}, '', '/profile');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E6F7F5] text-[#00A896] font-semibold text-xs transition-colors cursor-pointer text-left"
                        >
                          <User className="w-4 h-4 text-[#00A896]" />
                          <span>{lang === 'en' ? 'View Profile' : 'சுயவிவரம் காண்க'}</span>
                        </button>

                        {/* Health Records */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onNavigateHealthRecords) {
                              onNavigateHealthRecords();
                            } else if (onNavigateProfile) {
                              onNavigateProfile();
                              setTimeout(() => {
                                const el = document.getElementById('health-information');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 200);
                            } else {
                              window.history.pushState({}, '', '/profile#vault');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left"
                        >
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span>{lang === 'en' ? 'Health Records' : 'மருத்துவ ஏடுகள்'}</span>
                        </button>

                        {/* Settings */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (onNavigateSettings) {
                              onNavigateSettings();
                            } else if (onNavigateProfile) {
                              onNavigateProfile();
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('open-profile-edit'));
                              }, 200);
                            } else {
                              window.history.pushState({}, '', '/profile?edit=true');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>{lang === 'en' ? 'Settings' : 'அமைப்புகள்'}</span>
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        {/* Logout */}
                        <button
                          type="button"
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await authService.logout();
                            if (onNavigateHome) onNavigateHome();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>{lang === 'en' ? 'Logout' : 'வெளியேறு'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-[140px] h-9 sm:h-10 flex items-center justify-center gap-1.5 px-3 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex-shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>{lang === 'en' ? 'Sign In' : 'உள்நுழைக'}</span>
                </button>
              )}
            </div>

            {/* SOS Ambulance Button - Pinned to the Far Right Corner */}
            <button
              type="button"
              onClick={onOpenAmbulance}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 sm:px-3.5 lg:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer select-none active:scale-95 flex-shrink-0 ml-1 sm:ml-2"
            >
              <Siren className="w-4 h-4 text-white flex-shrink-0" />
              <span className="tracking-wide whitespace-nowrap">SOS Ambulance</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
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
                      <div className="w-8 h-8 rounded-full bg-[#00897B] text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          userInitial
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

              {/* Language Selection in Mobile Drawer */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  {lang === 'en' ? 'Select Language' : 'மொழி தேர்வு'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lang === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('ta')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-tamil transition-all ${
                      lang === 'ta' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>
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
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Chat' : 'உரையாடல்'}</span>
                </button>

                <button
                  onClick={() => { handleHomeClick(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-teal-50/80 hover:bg-teal-100/80 text-teal-800 rounded-xl border border-teal-200/80 transition-colors"
                >
                  <Home className="w-5 h-5 text-teal-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Home' : 'முகப்பு'}</span>
                </button>

                <button
                  onClick={() => { onOpenPrescription(); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-3 bg-blue-50/80 hover:bg-blue-100/80 text-blue-800 rounded-xl border border-blue-200/80 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-semibold text-center">{lang === 'en' ? 'Scan Prescription' : 'சீட்டு ஸ்கேன்'}</span>
                </button>

                <button
                  onClick={() => { 
                    if (onNavigateMedicines) {
                      onNavigateMedicines();
                    } else {
                      window.history.pushState({}, '', '/medicines');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                    setMobileMenuOpen(false); 
                  }}
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
