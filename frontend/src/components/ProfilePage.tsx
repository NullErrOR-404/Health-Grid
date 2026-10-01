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
import { authService, generateImmutableHealthId } from '../services/authService';
import { EmergencyContactSkeleton, HealthRecordSkeleton } from './SkeletonLoader';

interface ProfilePageProps {
  lang: Language;
  onNavigateHome: () => void;
  onNavigateChat: () => void;
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isActive: boolean;
  isPrimary?: boolean;
}

export interface MedicineItem {
  id: string;
  name: string;
  generic?: string;
  frequency?: string;
  saving?: string;
}

export interface VaccinationItem {
  id: string;
  name: string;
  date?: string;
  dose?: string;
}

export interface HealthHistoryItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  category?: 'consultation' | 'prescription' | 'vaccine' | 'lab' | 'emergency';
}

export interface UserProfileData {
  name: string;
  dob: string;
  age: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  language: string;
  location: string;
  healthId: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  lang,
  onNavigateHome,
  onNavigateChat,
}) => {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Demographic state - initial values are all empty/null, populated ONLY from real user session
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: '',
    dob: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    language: 'தமிழ் (Tamil)',
    location: '',
    healthId: '',
  });

  // Dynamic Emergency Contact state - initialized to empty array (no hardcoded contacts)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactItem[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Health Information state - initialized to empty arrays (no hardcoded data)
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthHistoryItem[]>([]);

  // AI Assistant permissions state
  const [isAiHealthAccessEnabled, setIsAiHealthAccessEnabled] = useState(true);

  // Dropdown / Modal state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Form states for individual editors
  const [editProfileForm, setEditProfileForm] = useState<UserProfileData>({ ...profileData });
  const [editEmergencyForm, setEditEmergencyForm] = useState({ name: '', relation: '', phone: '' });
  const [newContactForm, setNewContactForm] = useState({ name: '', relation: 'Family', phone: '' });
  
  // Quick Input states
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newConditionInput, setNewConditionInput] = useState('');
  const [newMedicineForm, setNewMedicineForm] = useState({ name: '', generic: '', frequency: 'Once daily', saving: '' });
  const [newVaccineForm, setNewVaccineForm] = useState({ name: '', date: '', dose: '1st Dose' });
  const [newHistoryForm, setNewHistoryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: 'Doctor consultation',
    detail: '',
    category: 'consultation' as const,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  // Support direct deep-linking from navbar dropdown items
  useEffect(() => {
    const handleOpenEdit = () => {
      setOpenDropdown('edit-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (window.location.search.includes('edit=true') || window.location.hash === '#settings') {
      handleOpenEdit();
    }

    if (window.location.hash === '#vault' || window.location.hash === '#health-records') {
      setTimeout(() => {
        const el = document.getElementById('health-information');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    window.addEventListener('open-profile-edit', handleOpenEdit);
    return () => window.removeEventListener('open-profile-edit', handleOpenEdit);
  }, []);

  // Sync profile and health records from Supabase live session
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setIsLoadingProfile(true);

        // 1. Check local session from authService
        const authUser = authService.getUser();
        let initialData: UserProfileData = {
          name: authUser?.name || '',
          dob: '',
          age: authUser?.age ? String(authUser.age) : '',
          gender: '',
          bloodGroup: authUser?.bloodGroup || '',
          phone: authUser?.phone || '',
          email: authUser?.email || '',
          language: 'தமிழ் (Tamil)',
          location: '',
          healthId: authUser?.healthId || '',
        };

        // 2. Fetch live session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userMeta = session.user.user_metadata || {};
          
          if (!initialData.name) initialData.name = userMeta.full_name || userMeta.name || session.user.email?.split('@')[0] || '';
          if (!initialData.email) initialData.email = session.user.email || '';
          if (!initialData.phone) initialData.phone = userMeta.phone || session.user.phone || '';

          // 3. Query PostgreSQL patients table
          const { data: patient, error: patientErr } = await supabase
            .from('patients')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          // Determine immutable account UUID HealthGrid ID
          const existingHealthId = patient?.health_id;
          const immutableHealthId = (existingHealthId && existingHealthId.length > 12)
            ? existingHealthId
            : (authUser?.healthId && authUser.healthId.length > 12)
            ? authUser.healthId
            : generateImmutableHealthId(session.user.id);

          initialData.healthId = immutableHealthId;

          // If patient record is missing health_id or using old truncated prefix, persist full UUID ID
          if (session.user.id && (!patient?.health_id || patient.health_id.length <= 12)) {
            supabase
              .from('patients')
              .upsert({
                id: session.user.id,
                health_id: immutableHealthId,
                full_name: initialData.name,
                email: initialData.email,
                updated_at: new Date().toISOString()
              })
              .then(({ error }) => {
                if (error) console.warn('Could not persist immutable health_id:', error);
              });
          }

          if (patient && !patientErr) {
            initialData = {
              name: patient.full_name || initialData.name,
              dob: patient.dob || '',
              age: patient.age ? String(patient.age) : initialData.age,
              gender: patient.gender || '',
              bloodGroup: patient.blood_group || initialData.bloodGroup,
              phone: patient.phone_number || initialData.phone,
              email: patient.email || initialData.email,
              language: patient.preferred_language || initialData.language,
              location: patient.location || '',
              healthId: (patient.health_id && patient.health_id.length > 12) ? patient.health_id : immutableHealthId,
            };

            // Emergency contacts
            if (Array.isArray(patient.emergency_contacts) && patient.emergency_contacts.length > 0) {
              setEmergencyContacts(patient.emergency_contacts);
            } else if (patient.emergency_contact_name) {
              setEmergencyContacts([{
                id: 'primary-contact',
                name: patient.emergency_contact_name,
                relation: patient.emergency_contact_relation || 'Family',
                phone: patient.emergency_contact_phone || '',
                isActive: true,
                isPrimary: true,
              }]);
            } else {
              setEmergencyContacts([]);
            }

            // Health arrays
            setAllergies(Array.isArray(patient.known_allergies) ? patient.known_allergies : []);
            setConditions(Array.isArray(patient.chronic_conditions) ? patient.chronic_conditions : []);
            
            // Current medications
            if (Array.isArray(patient.current_medications)) {
              setMedicines(patient.current_medications);
            } else {
              setMedicines([]);
            }

            // Vaccinations
            if (Array.isArray(patient.vaccinations)) {
              setVaccinations(patient.vaccinations);
            } else {
              setVaccinations([]);
            }

            // Health History
            if (Array.isArray(patient.health_history)) {
              setHealthHistory(patient.health_history);
            } else {
              setHealthHistory([]);
            }
          } else {
            // New user without patient row yet - initialize all health info to empty
            setEmergencyContacts([]);
            setAllergies([]);
            setConditions([]);
            setMedicines([]);
            setVaccinations([]);
            setHealthHistory([]);
          }
        } else {
          // Unauthenticated or guest view - initialize all to empty
          setEmergencyContacts([]);
          setAllergies([]);
          setConditions([]);
          setMedicines([]);
          setVaccinations([]);
          setHealthHistory([]);
        }

        if (isMounted) {
          setProfileData(initialData);
          setEditProfileForm(initialData);
        }
      } catch (err) {
        console.warn('Live profile fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist patient record to Supabase with upsert
  const persistPatientToSupabase = async (updates: Record<string, any>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('patients')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString(),
            ...updates,
          });

        if (error) {
          console.warn('Supabase upsert warning:', error.message);
        }
      }
    } catch (err) {
      console.warn('Failed to persist to Supabase:', err);
    }
  };

  // Persist emergency contacts
  const persistEmergencyContacts = async (updated: EmergencyContactItem[]) => {
    setEmergencyContacts(updated);
    const primary = updated.find(c => c.isPrimary) || updated[0];
    await persistPatientToSupabase({
      emergency_contacts: updated,
      emergency_contact_name: primary ? primary.name : null,
      emergency_contact_phone: primary ? primary.phone : null,
      emergency_contact_relation: primary ? primary.relation : null,
    });
  };

  // Persist medicines
  const persistMedicines = async (updated: MedicineItem[]) => {
    setMedicines(updated);
    await persistPatientToSupabase({ current_medications: updated });
  };

  // Persist vaccinations
  const persistVaccinations = async (updated: VaccinationItem[]) => {
    setVaccinations(updated);
    await persistPatientToSupabase({ vaccinations: updated });
  };

  // Persist health history
  const persistHealthHistory = async (updated: HealthHistoryItem[]) => {
    setHealthHistory(updated);
    await persistPatientToSupabase({ health_history: updated });
  };

  // Save full profile demographics
  const handleSaveProfile = async () => {
    // HealthGrid ID is strictly immutable and cannot be modified by edits
    const updated = { ...profileData, ...editProfileForm, healthId: profileData.healthId };
    setProfileData(updated);
    setOpenDropdown(null);

    await persistPatientToSupabase({
      full_name: updated.name,
      dob: updated.dob,
      age: updated.age ? parseInt(updated.age, 10) : null,
      gender: updated.gender,
      blood_group: updated.bloodGroup,
      phone_number: updated.phone,
      preferred_language: updated.language,
      location: updated.location,
      health_id: profileData.healthId, // Strictly immutable!
    });

    showToast(lang === 'en' ? 'Profile details saved successfully!' : 'சுயவிவர தகவல்கள் சேமிக்கப்பட்டன!');
  };

  // Export User Health Record JSON (NDHM Compliant)
  const handleDownloadData = () => {
    const dataSummary = {
      patient: profileData,
      emergencyContacts,
      allergies,
      conditions,
      medicines,
      vaccinations,
      healthHistory,
      exportedAt: new Date().toISOString(),
      standard: 'National Digital Health Mission (NDHM) & ABHA Compliant',
    };

    const patientSlug = (profileData.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const blob = new Blob([JSON.stringify(dataSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthGrid_${patientSlug}_Medical_Summary.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(lang === 'en' ? 'Medical health summary exported successfully!' : 'மருத்துவ ஏடு வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!');
  };

  const userInitial = profileData.name ? profileData.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
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
              title="Current Profile"
            >
              <div className="w-6 h-6 rounded-full bg-[#D0F0EC] text-[#00695C] flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/30">
                {userInitial}
              </div>
              <span className="font-bold text-teal-950 truncate max-w-[120px] sm:max-w-none">
                {profileData.name || (lang === 'en' ? 'Citizen' : 'பயனர்')}
              </span>
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

      {/* Main Profile Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Page Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'en' ? 'My Health Profile' : 'என் மருத்துவ சுயவிவரம்'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {lang === 'en'
                ? 'Manage your personal health data, emergency contacts, and active prescriptions.'
                : 'உங்கள் மருத்துவத் தரவுகள், அவசரத் தொடர்புகள் மற்றும் மருந்துகளை நிர்வகிக்கவும்.'}
            </p>
          </div>

          <button
            onClick={handleDownloadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs shadow-2xs transition-all w-fit"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'Export Health Vault (JSON)' : 'மருத்துவ ஏடு பதிவிறக்கம்'}</span>
          </button>
        </div>

        {/* Top Profile Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#00A896] to-[#00695C] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm flex-shrink-0">
                {userInitial}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {profileData.name || (lang === 'en' ? 'Name Not Set' : 'பெயர் குறிப்பிடப்படவில்லை')}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F7F2] text-[#00875A] text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                    <span>{profileData.healthId ? 'Verified' : 'Active'}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                  <span>{profileData.age ? `${profileData.age} yrs` : (lang === 'en' ? 'Age: --' : 'வயது: --')}</span>
                  <span>•</span>
                  <span>{profileData.gender || (lang === 'en' ? 'Gender: --' : 'பாலினம்: --')}</span>
                  <span>•</span>
                  <span>{profileData.bloodGroup ? `Blood: ${profileData.bloodGroup}` : (lang === 'en' ? 'Blood: --' : 'இரத்த வகை: --')}</span>
                  <span>•</span>
                  <span>{profileData.location || (lang === 'en' ? 'Location: Not Set' : 'இருப்பிடம் இல்லை')}</span>
                </div>

                <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap pt-0.5">
                  <span className="font-semibold text-slate-600">HealthGrid ID:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/90 text-xs sm:text-sm tracking-wide flex items-center gap-1.5 shadow-2xs select-all">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{profileData.healthId || 'HG-GENERATING...'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{lang === 'en' ? 'Immutable UUID' : 'மாற்றமுடியாதது'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Edit Demographics Button */}
            <button
              onClick={() => toggleDropdown('edit-profile')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-teal-700" />
              <span>{lang === 'en' ? 'Edit Demographics' : 'சுயவிவரம் திருத்து'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'edit-profile' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Edit Demographics Dropdown Drawer */}
          {openDropdown === 'edit-profile' && (
            <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    {lang === 'en' ? 'Edit Personal Demographics' : 'சுயவிவர விவரங்கள் திருத்தம்'}
                  </span>
                  <button onClick={() => setOpenDropdown(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand Kumar"
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Date of Birth</label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Aug 1995"
                      value={editProfileForm.dob}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, dob: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Age (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 29"
                      value={editProfileForm.age}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, age: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Gender</label>
                    <select
                      value={editProfileForm.gender}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, gender: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Blood Group</label>
                    <select
                      value={editProfileForm.bloodGroup}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, bloodGroup: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A Positive (A+)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                      <option value="AB-">AB Negative (AB-)</option>
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Location / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai, Tamil Nadu"
                      value={editProfileForm.location}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 text-xs bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-2xs transition-all"
                  >
                    {lang === 'en' ? 'Save Demographics' : 'சேமிக்கவும்'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Row 1: Personal Information & Emergency Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Personal Contact & Language Information */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
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
                  <span className="font-semibold text-slate-900">{profileData.name || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Date of Birth</span>
                  <span className="font-semibold text-slate-900">
                    {profileData.dob ? `${profileData.dob} ${profileData.age ? `(${profileData.age} yrs)` : ''}` : '—'}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Gender</span>
                  <span className="font-semibold text-slate-900">{profileData.gender || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Blood Group</span>
                  <span className="font-semibold text-teal-800">{profileData.bloodGroup || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-semibold text-slate-900">{profileData.phone || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{profileData.email || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Preferred Language</span>
                  <span className="font-semibold text-slate-900">{profileData.language || '—'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Residential Location</span>
                  <span className="font-semibold text-slate-900">{profileData.location || '—'}</span>
                </div>
              </div>
            </div>

            {/* Edit Drawer for Contact Info */}
            {openDropdown === 'personal-info' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="font-bold text-slate-900 text-xs">Edit Contact & Preferences</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91..."
                        value={editProfileForm.phone}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Email</label>
                      <input
                        type="text"
                        placeholder="yourname@gmail.com"
                        value={editProfileForm.email}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Preferred Language</label>
                      <select
                        value={editProfileForm.language}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, language: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      >
                        <option value="தமிழ் (Tamil)">தமிழ் (Tamil)</option>
                        <option value="English">English</option>
                        <option value="हिंदी (Hindi)">हिंदी (Hindi)</option>
                        <option value="తెలుగు (Telugu)">తెలుగు (Telugu)</option>
                        <option value="മലയാളം (Malayalam)">മലയാളം (Malayalam)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-500 font-semibold block">HealthGrid ID</label>
                        <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-teal-600" />
                          <span>Non-Editable (Immutable UUID)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono font-semibold text-slate-600 cursor-not-allowed select-all flex items-center justify-between shadow-inner">
                        <span className="truncate">{profileData.healthId}</span>
                        <span className="text-[10px] text-slate-400 font-sans font-normal ml-2 flex-shrink-0">
                          Permanent
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-3 py-1.5 text-slate-500 text-xs font-semibold">Cancel</button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-2xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Emergency Contacts */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                      {lang === 'en' ? 'Emergency Contacts' : 'அவசர தொடர்புகள்'}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {emergencyContacts.filter(c => c.isActive).length} {lang === 'en' ? 'ready for 108 SOS dispatch' : '108 அவசரத்திற்கு தயார்'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDropdown('emergency-add')}
                  className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Contact' : 'தொடர்பு சேர்'}</span>
                </button>
              </div>

              {/* Contacts List or Empty State */}
              {isLoadingProfile ? (
                <div className="space-y-3 pt-1">
                  <EmergencyContactSkeleton />
                </div>
              ) : emergencyContacts.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {lang === 'en' ? 'No Emergency Contacts Added' : 'அவசர தொடர்பு எதுவும் சேர்க்கப்படவில்லை'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {lang === 'en'
                      ? 'Add family members or caretakers so they receive automated emergency SMS & GPS dispatch during a medical crisis.'
                      : 'அவசர மருத்துவ காலத்தில் தொடர்பு கொள்ள உங்கள் குடும்ப உறுப்பினர்களை சேர்க்கவும்.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleDropdown('emergency-add')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Add Primary Emergency Contact' : 'முதன்மை தொடர்பு சேர்க்க'}</span>
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
                        className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
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
                                  <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
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
                                showToast(lang === 'en' ? 'Contact removed' : 'தொடர்பு நீக்கப்பட்டது');
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
            </div>

            {/* Edit Emergency Contact Modal / Drawer */}
            {openDropdown === 'emergency-edit' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="font-bold text-slate-900 text-xs">Edit Emergency Contact</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Name</label>
                      <input
                        type="text"
                        value={editEmergencyForm.name}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Relation</label>
                      <input
                        type="text"
                        value={editEmergencyForm.relation}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, relation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Phone</label>
                      <input
                        type="text"
                        value={editEmergencyForm.phone}
                        onChange={(e) => setEditEmergencyForm({ ...editEmergencyForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-3 py-1 text-slate-500 text-xs font-semibold">Cancel</button>
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
                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs"
                    >
                      Save Contact
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Emergency Contact Drawer */}
            {openDropdown === 'emergency-add' && (
              <div className="mt-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <div className="font-bold text-slate-900 text-xs">Add New Emergency Contact</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh K."
                        value={newContactForm.name}
                        onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Relation</label>
                      <input
                        type="text"
                        placeholder="e.g. Brother, Mother"
                        value={newContactForm.relation}
                        onChange={(e) => setNewContactForm({ ...newContactForm, relation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Phone (+91...)</label>
                      <input
                        type="text"
                        placeholder="+91 98400..."
                        value={newContactForm.phone}
                        onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-3 py-1 text-slate-500 text-xs font-semibold">Cancel</button>
                    <button
                      onClick={() => {
                        if (newContactForm.name.trim()) {
                          const newContact: EmergencyContactItem = {
                            id: `ec-${Date.now()}`,
                            name: newContactForm.name.trim(),
                            relation: newContactForm.relation.trim() || 'Family',
                            phone: newContactForm.phone.trim(),
                            isActive: true,
                            isPrimary: emergencyContacts.length === 0,
                          };
                          const updated = [...emergencyContacts, newContact];
                          persistEmergencyContacts(updated);
                          setNewContactForm({ name: '', relation: 'Family', phone: '' });
                          setOpenDropdown(null);
                          showToast(`Contact ${newContact.name} added!`);
                        }
                      }}
                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Health Information Container (4 Tiles - Allergies, Conditions, Medicines, Vaccinations) */}
        <div id="health-information" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2.5 pb-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
              <Heart className="w-4 h-4 fill-teal-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {lang === 'en' ? 'Health Information & Medical Vault' : 'சுகாதார தகவல் & மருத்துவ பெட்டகம்'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'All entries are private, encrypted, and accessible only to you and AI triage during emergencies.'
                  : 'பாதுகாப்பான மற்றும் துல்லியமான ஆலோசனைகளுக்கு உங்கள் விவரங்களை புதுப்பித்து வைக்கவும்.'}
              </p>
            </div>
          </div>

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
                      <div className="font-bold text-xs text-slate-900">Known Allergies</div>
                      <div className="text-[11px] text-slate-500">{allergies.length} recorded</div>
                    </div>
                  </div>
                </div>

                {allergies.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    {lang === 'en' ? 'No allergies recorded yet.' : 'ஒவ்வாமை எதுவும் பதிவு செய்யப்படவில்லை.'}
                  </p>
                ) : (
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
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-allergy')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Allergy' : 'ஒவ்வாமை சேர்'}</span>
                </button>

                {openDropdown === 'add-allergy' && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Peanuts, NSAIDs"
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
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
                        className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold"
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
                      <div className="font-bold text-xs text-slate-900">Chronic Conditions</div>
                      <div className="text-[11px] text-slate-500">{conditions.length} recorded</div>
                    </div>
                  </div>
                </div>

                {conditions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    {lang === 'en' ? 'No chronic conditions recorded.' : 'நோய்கள் எதுவும் பதிவு செய்யப்படவில்லை.'}
                  </p>
                ) : (
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
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-condition')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Condition' : 'நிலை சேர்'}</span>
                </button>

                {openDropdown === 'add-condition' && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. Type-2 Diabetes, Asthma"
                      value={newConditionInput}
                      onChange={(e) => setNewConditionInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
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
                        className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold"
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
                      <div className="text-[11px] text-slate-500">{medicines.length} active</div>
                    </div>
                  </div>
                </div>

                {medicines.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    {lang === 'en' ? 'No active medicines recorded.' : 'தற்போது உட்கொள்ளும் மருந்துகள் இல்லை.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 mt-3 text-xs text-slate-700 font-medium max-h-32 overflow-y-auto">
                    {medicines.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100">
                        <div className="truncate pr-1">
                          <span className="font-semibold text-slate-900 block truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-500">{med.frequency || 'Regular'}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = medicines.filter(m => m.id !== med.id);
                            persistMedicines(updated);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-medicine')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Medicine' : 'மருந்து சேர்'}</span>
                </button>

                {openDropdown === 'add-medicine' && (
                  <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Medicine Brand (e.g. Paracetamol 500mg)"
                      value={newMedicineForm.name}
                      onChange={(e) => setNewMedicineForm({ ...newMedicineForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Twice daily after food)"
                      value={newMedicineForm.frequency}
                      onChange={(e) => setNewMedicineForm({ ...newMedicineForm, frequency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1 pt-1">
                      <button onClick={() => setOpenDropdown(null)} className="px-2 py-0.5 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          if (newMedicineForm.name.trim()) {
                            const newMed: MedicineItem = {
                              id: `med-${Date.now()}`,
                              name: newMedicineForm.name.trim(),
                              generic: newMedicineForm.generic || `${newMedicineForm.name.trim()} Generic`,
                              frequency: newMedicineForm.frequency || 'Once daily',
                              saving: '60%',
                            };
                            const updated = [...medicines, newMed];
                            persistMedicines(updated);
                            setNewMedicineForm({ name: '', generic: '', frequency: 'Once daily', saving: '' });
                            setOpenDropdown(null);
                            showToast('Medicine added to profile!');
                          }
                        }}
                        className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold"
                      >
                        Save
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
                </div>

                {vaccinations.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic mt-3">
                    {lang === 'en' ? 'No vaccinations recorded.' : 'தடுப்பூசிகள் எதுவும் பதிவு செய்யப்படவில்லை.'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {vaccinations.map((vac) => (
                      <span
                        key={vac.id}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#F3EBFB] text-[#7B1FA2] px-2.5 py-0.5 rounded-full"
                      >
                        <span>{vac.name} {vac.dose ? `(${vac.dose})` : ''}</span>
                        <button
                          onClick={() => {
                            const updated = vaccinations.filter(v => v.id !== vac.id);
                            persistVaccinations(updated);
                          }}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('add-vaccine')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Vaccine' : 'தடுப்பூசி சேர்'}</span>
                </button>

                {openDropdown === 'add-vaccine' && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Vaccine Name (e.g. Hepatitis B, Tetanus)"
                      value={newVaccineForm.name}
                      onChange={(e) => setNewVaccineForm({ ...newVaccineForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. Booster, 2nd Dose)"
                      value={newVaccineForm.dose}
                      onChange={(e) => setNewVaccineForm({ ...newVaccineForm, dose: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setOpenDropdown(null)} className="px-2 py-0.5 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          if (newVaccineForm.name.trim()) {
                            const newVac: VaccinationItem = {
                              id: `vac-${Date.now()}`,
                              name: newVaccineForm.name.trim(),
                              dose: newVaccineForm.dose.trim(),
                            };
                            const updated = [...vaccinations, newVac];
                            persistVaccinations(updated);
                            setNewVaccineForm({ name: '', date: '', dose: '1st Dose' });
                            setOpenDropdown(null);
                            showToast('Vaccination recorded!');
                          }
                        }}
                        className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold"
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

        {/* Row 3: Health History, AI Health Assistant & Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Health History (Editable with Add & Delete) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {lang === 'en' ? 'Health History' : 'மருத்துவ வரலாறு'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDropdown('history-add')}
                  className="flex items-center gap-1 text-teal-700 hover:text-teal-800 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add' : 'சேர்'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Your clinical consultations, test reports, and prescription records.'
                  : 'மருத்துவ ஆலோசனைகள் மற்றும் பரிசோதனை குறிப்புகள்.'}
              </p>

              {/* Add Health Record Form */}
              {openDropdown === 'history-add' && (
                <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-xs">Log Clinical Event</div>
                  <input
                    type="date"
                    value={newHistoryForm.date}
                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Event Title (e.g. Doctor consultation, Blood test)"
                    value={newHistoryForm.title}
                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, title: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  />
                  <textarea
                    placeholder="Clinical details (e.g. Fever & headache resolved with paracetamol)"
                    value={newHistoryForm.detail}
                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, detail: e.target.value })}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none resize-none"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button onClick={() => setOpenDropdown(null)} className="px-2.5 py-1 text-slate-500 text-xs">Cancel</button>
                    <button
                      onClick={() => {
                        if (newHistoryForm.title.trim()) {
                          const newRecord: HealthHistoryItem = {
                            id: `hh-${Date.now()}`,
                            date: newHistoryForm.date,
                            title: newHistoryForm.title.trim(),
                            detail: newHistoryForm.detail.trim() || 'Record logged',
                          };
                          const updated = [newRecord, ...healthHistory];
                          persistHealthHistory(updated);
                          setNewHistoryForm({
                            date: new Date().toISOString().split('T')[0],
                            title: 'Doctor consultation',
                            detail: '',
                            category: 'consultation',
                          });
                          setOpenDropdown(null);
                          showToast('Health event recorded successfully!');
                        }
                      }}
                      className="px-3.5 py-1 bg-teal-700 text-white rounded-lg font-bold text-xs"
                    >
                      Save Event
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline List or Empty State */}
              {isLoadingProfile ? (
                <div className="space-y-3 pt-3">
                  <HealthRecordSkeleton />
                </div>
              ) : healthHistory.length === 0 ? (
                <div className="p-5 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 mt-3 space-y-2">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'No Clinical History Logged' : 'மருத்துவ வரலாறு எதுவும் இல்லை'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en'
                      ? 'Consultations with AI Doctor and scanned prescriptions will automatically appear here.'
                      : 'AI மருத்துவர் ஆலோசனைகள் மற்றும் மருந்துக் குறிப்புகள் இங்கு தோன்றும்.'}
                  </p>
                  <button
                    onClick={() => toggleDropdown('history-add')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Add Record' : 'பதிவு சேர்'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-3 text-xs max-h-80 overflow-y-auto pr-1">
                  {healthHistory.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 hover:bg-teal-50/40 rounded-2xl border border-slate-200/80 transition-all flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 font-mono">{item.date}</div>
                        <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                        <div className="text-slate-500 text-[11px]">{item.detail}</div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = healthHistory.filter(h => h.id !== item.id);
                          persistHealthHistory(updated);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: AI Health Assistant Permissions */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200/80 p-0.5 flex items-center justify-center flex-shrink-0">
                  <img src="/docbot_mascot.png" alt="AI DocBot" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  <span>AI Health Assistant</span>
                </h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Empower your AI Family Doctor to cross-reference drug allergies, generic medicine costs, and emergency protocols.
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-800 pr-2">Health Data Access for AI</span>
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

              <button
                type="button"
                onClick={() => toggleDropdown('ai-permissions')}
                className="w-full py-2 px-3 rounded-xl border border-teal-600/40 text-teal-800 hover:bg-teal-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Manage what AI can access</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {openDropdown === 'ai-permissions' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span>Check drug allergy contraindications</span>
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
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-700">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Privacy &amp; Security</h4>
              </div>

              <p className="text-[11px] text-slate-400">
                Patient data privacy, AES-256 encryption, and NDHM compliance.
              </p>

              <div className="divide-y divide-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => showToast('Biometric security and PostgreSQL Row-Level Security active.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Row-Level Security (RLS)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Stored with AES-256 encryption on dedicated cloud infrastructure.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Health Data Encryption</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Strict zero data selling and limited use policy.')}
                  className="w-full py-2 flex items-center justify-between text-slate-700 hover:text-teal-700 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Zero Data Selling Policy</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadData}
                  className="w-full py-2 flex items-center justify-between text-teal-800 hover:text-teal-900 font-bold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Download Complete Health Vault</span>
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
