import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  CheckCircle2,
  Edit2,
  Plus,
  ChevronRight,
  Shield,
  Heart,
  Clock,
  Lock,
  FileText,
  ShieldCheck,
  Smartphone,
  Download,
  X,
  AlertCircle,
  Pill,
  Syringe,
  Activity,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Trash2
} from 'lucide-react';
import type { Language } from '../types';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { EmergencyContactSkeleton, HealthRecordSkeleton } from './SkeletonLoader';

interface ProfilePageProps {
  lang: Language;
  onNavigateHome: () => void;
  onNavigateChat: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  lang,
  onNavigateHome,
  onNavigateChat,
}) => {
  // Demographic state
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState({
    name: 'Murugan S.',
    dob: '14 Aug 1981',
    age: '45',
    gender: 'Male',
    phone: '+91 98401 23456',
    email: 'murugan.s@gmail.com',
    language: 'தமிழ் (Tamil)',
    location: 'Chennai, Tamil Nadu',
    healthId: 'HG-782341',
  });

  // Dynamic Emergency Contact state
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{
    id: string;
    name: string;
    relation: string;
    phone: string;
    isActive: boolean;
    isPrimary?: boolean;
  }>>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Health Information state
  const [allergies, setAllergies] = useState<string[]>(['Penicillin', 'NSAIDs']);
  const [conditions, setConditions] = useState<string[]>(['Asthma', 'Hypertension']);
  const [medicines, setMedicines] = useState([
    { name: 'Budesonide Inhaler', generic: 'Budesonide 200mcg', frequency: 'Twice daily', saving: '65%' },
    { name: 'Montelukast', generic: 'Montelukast 10mg', frequency: 'Once daily at night', saving: '74%' },
  ]);
  const [vaccinations, setVaccinations] = useState<string[]>(['COVID-19 (2 doses)']);

  // AI Assistant permissions state
  const [isAiHealthAccessEnabled, setIsAiHealthAccessEnabled] = useState(true);

  // Individual Dropdown Expansion states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Form states for individual dropdown editors
  const [editProfileForm, setEditProfileForm] = useState({ ...profileData });
  const [editEmergencyForm, setEditEmergencyForm] = useState({ name: '', relation: '', phone: '' });
  const [newContactForm, setNewContactForm] = useState({ name: '', relation: '', phone: '' });
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newConditionInput, setNewConditionInput] = useState('');
  const [newMedicineInput, setNewMedicineInput] = useState('');
  const [newVaccineInput, setNewVaccineInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync profile data from Supabase live session
  useEffect(() => {
    const fetchUserData = async () => {
      const user = authService.getUser();
      if (user) {
        setProfileData((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          healthId: user.healthId || prev.healthId,
          age: user.age ? String(user.age) : prev.age,
        }));
        setEditProfileForm((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          healthId: user.healthId || prev.healthId,
          age: user.age ? String(user.age) : prev.age,
        }));
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: patient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (patient) {
            const updated = {
              name: patient.full_name || session.user.email?.split('@')[0] || 'User',
              dob: patient.dob || '14 Aug 1981',
              age: patient.age ? String(patient.age) : '45',
              gender: patient.gender || 'Male',
              phone: patient.phone_number || '',
              email: patient.email || session.user.email || '',
              language: patient.preferred_language || 'தமிழ் (Tamil)',
              location: patient.location || 'Chennai, Tamil Nadu',
              healthId: patient.health_id || ('HG-' + session.user.id.substring(0, 6).toUpperCase()),
            };
            setProfileData(updated);
            setEditProfileForm(updated);

            if (patient.emergency_contacts && Array.isArray(patient.emergency_contacts) && patient.emergency_contacts.length > 0) {
              setEmergencyContacts(patient.emergency_contacts);
            } else if (patient.emergency_contact_name) {
              setEmergencyContacts([
                {
                  id: 'primary',
                  name: patient.emergency_contact_name,
                  relation: patient.emergency_contact_relation || 'Family',
                  phone: patient.emergency_contact_phone || '',
                  isActive: true,
                  isPrimary: true,
                }
              ]);
            }

            if (patient.known_allergies && Array.isArray(patient.known_allergies) && patient.known_allergies.length > 0) {
              setAllergies(patient.known_allergies);
            }
            if (patient.chronic_conditions && Array.isArray(patient.chronic_conditions) && patient.chronic_conditions.length > 0) {
              setConditions(patient.chronic_conditions);
            }
          }
        }
      } catch (err) {
        console.warn('Live profile fetch error:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, []);

  const persistPatientToSupabase = async (updates: Record<string, any>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('patients')
          .update(updates)
          .eq('id', session.user.id);
      }
    } catch (err) {
      console.warn('Failed to persist to Supabase:', err);
    }
  };

  const persistEmergencyContacts = async (updated: Array<{
    id: string;
    name: string;
    relation: string;
    phone: string;
    isActive: boolean;
    isPrimary?: boolean;
  }>) => {
    setEmergencyContacts(updated);
    const primary = updated.find(c => c.isPrimary) || updated[0];
    await persistPatientToSupabase({
      emergency_contacts: updated,
      emergency_contact_name: primary ? primary.name : null,
      emergency_contact_phone: primary ? primary.phone : null,
      emergency_contact_relation: primary ? primary.relation : null,
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  // Download My Data
  const handleDownloadData = () => {
    const dataSummary = {
      patient: profileData,
      emergencyContacts,
      allergies,
      conditions,
      medicines,
      vaccinations,
      healthHistory: [
        { date: '24 Sep 2026', title: 'Doctor consultation', detail: 'Fever & headache' },
        { date: '12 Aug 2026', title: 'Prescription scanned', detail: 'Budesonide inhaler' },
        { date: '03 Jun 2026', title: 'Vaccination record', detail: 'Annual Influenza booster' },
      ],
      exportedAt: new Date().toISOString(),
      standard: 'National Digital Health Mission (NDHM) & ABHA Compliant',
    };

    const blob = new Blob([JSON.stringify(dataSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthGrid_Murugan_S_Medical_Summary.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(lang === 'en' ? 'Medical health summary exported successfully!' : 'மருத்துவ ஏடு வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP GLOBAL NAVBAR WITH ACTIVE PROFILE PILL */}
      {/* ========================================================= */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Return Navigation & Brand */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-all border border-slate-200"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Back' : 'பின்செல்'}</span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onNavigateHome}>
              <img 
                src="/Logo.png" 
                alt="HealthGrid - நலம் AI" 
                className="h-8 sm:h-9 w-auto object-contain hover:opacity-95 transition-opacity" 
              />
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={onNavigateHome} className="hover:text-teal-700 transition-colors">
              {lang === 'en' ? 'Home' : 'முகப்பு'}
            </button>
            <button onClick={onNavigateChat} className="hover:text-teal-700 transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <span>{lang === 'en' ? 'Chat with AI' : 'AI மருத்துவருடன் பேசு'}</span>
            </button>
          </nav>

          {/* Right: Active Profile Round Pill & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-teal-50 text-slate-800 border border-teal-300 shadow-2xs text-xs font-semibold cursor-default"
              title="Current Profile View"
            >
              <div className="w-6 h-6 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/30">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-bold text-teal-950 truncate max-w-[120px] sm:max-w-none">{profileData.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await authService.logout();
                onNavigateHome();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              title={lang === 'en' ? 'Sign out of your account' : 'வெளியேறு'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Sign Out' : 'வெளியேறு'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN PROFILE BODY (Matching Profile page ref.png) */}
      {/* ========================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Page Title Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'en' ? 'My Profile' : 'என் சுயவிவரம்'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {lang === 'en'
              ? 'Manage your personal information, health records, and preferences.'
              : 'உங்கள் தனிப்பட்ட தகவல்கள், மருத்துவ ஏடுகள் மற்றும் விருப்பங்களை நிர்வகிக்கவும்.'}
          </p>
        </div>

        {/* ========================================================= */}
        {/* TOP PROFILE BANNER CARD */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Teal Avatar Circle with Letter M */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xs flex-shrink-0">
                M
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{profileData.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F7F2] text-[#00875A] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                  <span>{profileData.age} years</span>
                  <span>|</span>
                  <span>{profileData.gender}</span>
                  <span>|</span>
                  <span>{profileData.location}</span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  HealthGrid ID: <span className="font-semibold text-slate-600">{profileData.healthId}</span>
                </div>
              </div>
            </div>

            {/* Right: Edit Profile Button */}
            <button
              onClick={() => toggleDropdown('edit-profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-teal-600/40 text-teal-800 hover:bg-teal-50/70 text-xs font-semibold transition-all shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-teal-700" />
              <span>{lang === 'en' ? 'Edit Profile' : 'சுயவிவரம் திருத்து'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'edit-profile' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Individual Dropdown: Edit Profile Dropdown */}
          {openDropdown === 'edit-profile' && (
            <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-xs text-slate-900">
                  {lang === 'en' ? 'Quick Profile Demographics' : 'சுயவிவர திருத்தம்'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Age</label>
                    <input
                      type="text"
                      value={editProfileForm.age}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, age: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Location</label>
                    <input
                      type="text"
                      value={editProfileForm.location}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setProfileData({ ...profileData, ...editProfileForm });
                      persistPatientToSupabase({
                        full_name: editProfileForm.name,
                        age: parseInt(editProfileForm.age) || 45,
                        location: editProfileForm.location,
                      });
                      setOpenDropdown(null);
                      showToast('Profile demographics updated successfully!');
                    }}
                    className="px-4 py-1.5 text-xs bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-2xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* ROW 1: PERSONAL INFORMATION & EMERGENCY CONTACT */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Personal Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {lang === 'en' ? 'Personal Information' : 'தனிநபர் தகவல்'}
                  </h3>
                </div>

                <button
                  onClick={() => toggleDropdown('personal-info')}
                  className="flex items-center gap-1 text-teal-700 hover:text-teal-800 text-xs font-semibold"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Edit' : 'திருத்து'}</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="divide-y divide-slate-100 text-xs mt-2">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Full Name</span>
                  <span className="font-semibold text-slate-900">{profileData.name}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Date of Birth</span>
                  <span className="font-semibold text-slate-900">{profileData.dob} ({profileData.age} years)</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Gender</span>
                  <span className="font-semibold text-slate-900">{profileData.gender}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-semibold text-slate-900">{profileData.phone}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Email</span>
                  <span className="font-semibold text-slate-900">{profileData.email}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Preferred Language</span>
                  <span className="font-semibold text-slate-900">{profileData.language}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-semibold text-slate-900">{profileData.location}</span>
                </div>
              </div>
            </div>

            {/* Individual Dropdown Editor for Personal Info */}
            {openDropdown === 'personal-info' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 text-[11px]">Edit Contact Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Phone</label>
                      <input
                        type="text"
                        value={editProfileForm.phone}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Email</label>
                      <input
                        type="text"
                        value={editProfileForm.email}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-2.5 py-1 text-slate-500 text-xs font-semibold">Cancel</button>
                    <button
                      onClick={() => {
                        setProfileData({ ...profileData, ...editProfileForm });
                        persistPatientToSupabase({
                          phone_number: editProfileForm.phone,
                          email: editProfileForm.email,
                        });
                        setOpenDropdown(null);
                        showToast('Personal information updated!');
                      }}
                      className="px-3.5 py-1 bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Emergency Contact */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                      {lang === 'en' ? 'Emergency Contacts' : 'அவசர தொடர்புகள்'}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {emergencyContacts.filter(c => c.isActive).length} {lang === 'en' ? 'active for 108 SOS' : '108 அவசரத்திற்கு தயார்'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDropdown('emergency-add')}
                  className="flex items-center gap-1 text-teal-700 hover:text-teal-800 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add' : 'சேர்'}</span>
                </button>
              </div>

              {/* Contacts List or Empty State */}
              {isLoadingProfile ? (
                <div className="space-y-3 pt-1">
                  <EmergencyContactSkeleton />
                  <EmergencyContactSkeleton />
                </div>
              ) : emergencyContacts.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'No Emergency Contact Added' : 'அவசர தொடர்பு எதுவும் சேர்க்கப்படவில்லை'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {lang === 'en'
                      ? 'Add family members or caretakers so they are instantly alerted during a medical emergency.'
                      : 'அவசர மருத்துவ காலத்தில் தொடர்பு கொள்ள உங்கள் குடும்ப உறுப்பினர்களை சேர்க்கவும்.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleDropdown('emergency-add')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Add Primary Contact' : 'முதன்மை தொடர்பு சேர்க்க'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {emergencyContacts.map((contact, index) => {
                    const initial = (contact.name || 'E').charAt(0).toUpperCase();
                    const isPrimary = contact.isPrimary || index === 0;
                    return (
                      <div
                        key={contact.id || index}
                        className="p-3 rounded-2xl bg-[#FAFBFB] border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFE8E8] text-[#C93B3B] flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                                {isPrimary && (
                                  <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full font-bold border border-red-200">
                                    Primary SOS
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">{contact.relation}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContactId(contact.id);
                                setEditEmergencyForm({
                                  name: contact.name,
                                  relation: contact.relation,
                                  phone: contact.phone,
                                });
                                setOpenDropdown('emergency-edit');
                              }}
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = emergencyContacts.filter((c) => c.id !== contact.id);
                                persistEmergencyContacts(updated);
                                showToast('Emergency contact removed');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <a
                            href={`tel:${contact.phone}`}
                            className="font-semibold text-slate-700 hover:text-teal-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{contact.phone || 'No phone set'}</span>
                          </a>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">
                              {contact.isActive ? 'Active for SOS' : 'Muted'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = emergencyContacts.map((c) =>
                                  c.id === contact.id ? { ...c, isActive: !c.isActive } : c
                                );
                                persistEmergencyContacts(updated);
                              }}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                                contact.isActive ? 'bg-teal-600' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  contact.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* + Add Another Contact Button */}
              {emergencyContacts.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleDropdown('emergency-add')}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-teal-700" />
                  <span>{lang === 'en' ? 'Add Another Contact' : 'கூடுதல் தொடர்பு சேர்க்க'}</span>
                </button>
              )}
            </div>

            {/* Individual Dropdown: Edit Emergency Contact */}
            {openDropdown === 'emergency-edit' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-[11px]">Edit Emergency Contact</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Name</label>
                      <input
                        type="text"
                        value={editEmergencyForm.name}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Relation</label>
                      <input
                        type="text"
                        value={editEmergencyForm.relation}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, relation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Phone</label>
                      <input
                        type="text"
                        value={editEmergencyForm.phone}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-2 py-1 text-slate-500 text-xs">Cancel</button>
                    <button
                      onClick={() => {
                        if (editEmergencyForm.name.trim()) {
                          const updated = emergencyContacts.map((c) =>
                            c.id === editingContactId ? { ...c, ...editEmergencyForm } : c
                          );
                          persistEmergencyContacts(updated);
                          setOpenDropdown(null);
                          showToast('Emergency contact updated!');
                        }
                      }}
                      className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Dropdown: Add New Emergency Contact */}
            {openDropdown === 'emergency-add' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-[11px]">New Emergency Contact</div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Anand S.)"
                      value={newContactForm.name}
                      onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. Brother)"
                      value={newContactForm.relation}
                      onChange={(e) => setNewContactForm({ ...newContactForm, relation: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phone (+91...)"
                      value={newContactForm.phone}
                      onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-2 py-1 text-slate-500 text-xs">Cancel</button>
                    <button
                      onClick={() => {
                        if (newContactForm.name.trim()) {
                          const newContact = {
                            id: `ec-${Date.now()}`,
                            name: newContactForm.name.trim(),
                            relation: newContactForm.relation.trim() || 'Family',
                            phone: newContactForm.phone.trim(),
                            isActive: true,
                            isPrimary: emergencyContacts.length === 0,
                          };
                          const updated = [...emergencyContacts, newContact];
                          persistEmergencyContacts(updated);
                          setNewContactForm({ name: '', relation: '', phone: '' });
                          setOpenDropdown(null);
                          showToast(`Contact ${newContact.name} saved successfully!`);
                        }
                      }}
                      className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold text-xs"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* ROW 2: HEALTH INFORMATION CONTAINER (4 TILES) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
              <Heart className="w-4 h-4 fill-teal-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {lang === 'en' ? 'Health Information' : 'சுகாதார தகவல்'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Keep your health information up to date for better and safer guidance.'
                  : 'பாதுகாப்பான மற்றும் துல்லியமான ஆலோசனைகளுக்கு உங்கள் விவரங்களை புதுப்பித்து வைக்கவும்.'}
              </p>
            </div>
          </div>

          {/* 4 Interactive Health Information Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            
            {/* Tile 1: Allergies */}
            <div className="bg-[#FAFBFB] rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFEAEA] text-[#D32F2F] flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Allergies</div>
                      <div className="text-[11px] text-slate-500">{allergies.length} recorded</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FEECEC] text-[#D32F2F] px-2.5 py-0.5 rounded-full"
                    >
                      <span>{allergy}</span>
                      <button
                        onClick={() => {
                          const updated = allergies.filter((_, idx) => idx !== i);
                          setAllergies(updated);
                          persistPatientToSupabase({ known_allergies: updated });
                        }}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-allergy')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Allergy</span>
                </button>

                {openDropdown === 'add-allergy' && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. Sulfa drugs, Peanuts"
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setOpenDropdown(null)} className="px-2 py-0.5 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          if (newAllergyInput.trim()) {
                            const updated = [...allergies, newAllergyInput.trim()];
                            setAllergies(updated);
                            persistPatientToSupabase({ known_allergies: updated });
                            setNewAllergyInput('');
                            setOpenDropdown(null);
                            showToast('Allergy added to medical vault!');
                          }
                        }}
                        className="px-2.5 py-0.5 bg-teal-700 text-white rounded font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tile 2: Health Conditions */}
            <div className="bg-[#FAFBFB] rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF2FE] text-[#1976D2] flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Health Conditions</div>
                      <div className="text-[11px] text-slate-500">{conditions.length} recorded</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EAF2FE] text-[#1976D2] px-2.5 py-0.5 rounded-full"
                    >
                      <span>{cond}</span>
                      <button
                        onClick={() => {
                          const updated = conditions.filter((_, idx) => idx !== i);
                          setConditions(updated);
                          persistPatientToSupabase({ chronic_conditions: updated });
                        }}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-condition')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition</span>
                </button>

                {openDropdown === 'add-condition' && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. Type-2 Diabetes"
                      value={newConditionInput}
                      onChange={(e) => setNewConditionInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setOpenDropdown(null)} className="px-2 py-0.5 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          if (newConditionInput.trim()) {
                            const updated = [...conditions, newConditionInput.trim()];
                            setConditions(updated);
                            persistPatientToSupabase({ chronic_conditions: updated });
                            setNewConditionInput('');
                            setOpenDropdown(null);
                            showToast('Condition recorded in profile!');
                          }
                        }}
                        className="px-2.5 py-0.5 bg-teal-700 text-white rounded font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tile 3: Current Medicines */}
            <div className="bg-[#FAFBFB] rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E6F7F2] text-[#00875A] flex items-center justify-center flex-shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Current Medicines</div>
                      <div className="text-[11px] text-slate-500">{medicines.length} active medicines</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1 mt-3 text-xs text-slate-700 font-medium">
                  {medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                      <span className="truncate">{med.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('medicines-view')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {openDropdown === 'medicines-view' && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-[11px]">
                    <div className="font-bold text-slate-800 text-xs">Jan Aushadhi Prescriptions:</div>
                    {medicines.map((m, idx) => (
                      <div key={idx} className="p-1.5 bg-slate-50 rounded-lg">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-slate-500">{m.generic} • {m.frequency}</div>
                        <div className="text-emerald-700 font-bold">Generic Savings: {m.saving}</div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add medicine..."
                        value={newMedicineInput}
                        onChange={(e) => setNewMedicineInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newMedicineInput.trim()) return;
                          setMedicines(prev => [
                            ...prev,
                            { name: newMedicineInput.trim(), generic: `${newMedicineInput.trim()} Generic`, frequency: 'As advised', saving: '70%' }
                          ]);
                          setNewMedicineInput('');
                          showToast('Medicine added to profile!');
                        }}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tile 4: Vaccinations */}
            <div className="bg-[#FAFBFB] rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F3EBFB] text-[#7B1FA2] flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Vaccinations</div>
                      <div className="text-[11px] text-slate-500">{vaccinations.length} recorded</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {vaccinations.map((vac, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F3EBFB] text-[#7B1FA2] px-2.5 py-0.5 rounded-full"
                    >
                      <span>{vac}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-vaccine')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vaccination</span>
                </button>

                {openDropdown === 'add-vaccine' && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. Hepatitis B, Tetanus"
                      value={newVaccineInput}
                      onChange={(e) => setNewVaccineInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setOpenDropdown(null)} className="px-2 py-0.5 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          if (newVaccineInput.trim()) {
                            setVaccinations([...vaccinations, newVaccineInput.trim()]);
                            setNewVaccineInput('');
                            setOpenDropdown(null);
                            showToast('Vaccination milestone updated!');
                          }
                        }}
                        className="px-2.5 py-0.5 bg-teal-700 text-white rounded font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: THREE COLUMNS (History, AI Assistant, Privacy) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Health History */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Health History</h4>
                </div>
                <button
                  onClick={() => showToast('Full clinical consultation records loaded.')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Your recent consultations, prescriptions and health events.
              </p>

              {/* Timeline List */}
              {isLoadingProfile ? (
                <div className="space-y-3 pt-4">
                  <HealthRecordSkeleton />
                  <HealthRecordSkeleton />
                  <HealthRecordSkeleton />
                </div>
              ) : (
                <div className="space-y-4 pt-4 text-xs">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 ring-4 ring-emerald-50"></div>
                  <div>
                    <div className="text-[11px] text-slate-400">24 Sep 2026</div>
                    <div className="font-bold text-slate-900">Doctor consultation</div>
                    <div className="text-slate-500 text-[11px]">Fever &amp; headache</div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0 ring-4 ring-blue-50"></div>
                  <div>
                    <div className="text-[11px] text-slate-400">12 Aug 2026</div>
                    <div className="font-bold text-slate-900">Prescription scanned</div>
                    <div className="text-slate-500 text-[11px]">Budesonide inhaler</div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1 flex-shrink-0 ring-4 ring-purple-50"></div>
                  <div>
                    <div className="text-[11px] text-slate-400">03 Jun 2026</div>
                    <div className="font-bold text-slate-900">Vaccination record</div>
                    <div className="text-slate-500 text-[11px]">Annual Influenza booster</div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Column 2: AI Health Assistant */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header with Cute Robot Mascot */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200/80 p-0.5 flex items-center justify-center flex-shrink-0">
                  <img src="/docbot_mascot.png" alt="AI DocBot" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  <span>AI Health Assistant</span>
                  <span className="text-[10px] text-slate-400 cursor-pointer" title="Privacy-first localized health AI">ℹ️</span>
                </h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use your health information to get more personalized and accurate answers.
              </p>

              {/* Setting Toggle */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-800 pr-2">Health information available to AI</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAiHealthAccessEnabled(!isAiHealthAccessEnabled);
                    showToast(isAiHealthAccessEnabled ? 'AI access paused' : 'AI health memory active');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 ${
                    isAiHealthAccessEnabled ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isAiHealthAccessEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Manage Permissions Button */}
              <button
                type="button"
                onClick={() => toggleDropdown('ai-permissions')}
                className="w-full py-2 px-3 rounded-xl border border-teal-600/40 text-teal-800 hover:bg-teal-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Manage what AI can use</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Individual Dropdown: AI Permissions Checklist */}
              {openDropdown === 'ai-permissions' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Cross-check drug allergies (Brufen blocker)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Recommend Jan Aushadhi generic medicines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Check emergency hospital proximity</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Privacy & Security */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Privacy &amp; Security</h4>
              </div>

              <p className="text-[11px] text-slate-400">
                Manage your data, permissions and account security.
              </p>

              {/* List Items Matching Reference */}
              <div className="divide-y divide-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => showToast('Two-factor biometric authentication active.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Security</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Health data stored with AES-256 military encryption.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Health Data</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Zero data selling policy verified under NDHM.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>AI Data Permissions</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Active session: Chrome on Windows 11 (Chennai, TN).')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Login &amp; Devices</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Download My Data (Real Action) */}
                <button
                  type="button"
                  onClick={handleDownloadData}
                  className="w-full py-2 flex items-center justify-between text-teal-800 hover:text-teal-900 font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Download My Data</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
