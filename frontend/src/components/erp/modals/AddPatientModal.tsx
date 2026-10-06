import React, { useState } from 'react';
import { X, UserPlus, Search, ShieldCheck } from 'lucide-react';
import { unifiedPatientStore, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: (patient: UnifiedPatient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientAdded,
}) => {
  const [existingHealthId, setExistingHealthId] = useState('');
  const [searchFoundMsg, setSearchFoundMsg] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [department, setDepartment] = useState('General Medicine (OPD)');
  const [doctor, setDoctor] = useState('Dr. Mohamed');

  if (!isOpen) return null;

  const handleSearchHealthId = () => {
    if (!existingHealthId.trim()) return;
    const found = unifiedPatientStore.getPatientByHealthId(existingHealthId.trim());
    if (found) {
      setName(found.name);
      setPhone(found.phone);
      setAge(String(found.age));
      setGender(found.gender);
      setBloodGroup(found.bloodGroup);
      setAllergies(found.allergies.join(', '));
      setChronicConditions(found.chronicConditions.join(', '));
      setInsuranceProvider(found.insurance.provider !== 'Not Available' ? found.insurance.provider : '');
      setSearchFoundMsg(`Found registered patient: ${found.name} (${found.healthId})`);
    } else {
      setSearchFoundMsg('No existing record found for this HealthID. Proceeding with new patient registration.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !age) return;

    const parsedAllergies = allergies.trim()
      ? allergies.split(',').map((s) => s.trim()).filter(Boolean)
      : ['No known allergies'];
    const parsedChronic = chronicConditions.trim()
      ? chronicConditions.split(',').map((s) => s.trim()).filter(Boolean)
      : ['None reported'];

    const newPatient = unifiedPatientStore.registerNewPatient({
      name,
      phone,
      age: parseInt(age, 10) || 30,
      gender,
      bloodGroup,
      allergies: parsedAllergies,
      chronicConditions: parsedChronic,
      insuranceProvider: insuranceProvider.trim() || undefined,
      initialDepartment: department,
      initialDoctor: doctor,
    });

    onPatientAdded(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Add New Patient</h3>
              <p className="text-xs text-slate-500">Auto-provisions a sovereign HealthGrid HealthID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HealthID lookup bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Search Existing HealthGrid HealthID or Phone</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={existingHealthId}
              onChange={(e) => setExistingHealthId(e.target.value)}
              placeholder="e.g. HG001245 or +91 98765..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
            <button
              type="button"
              onClick={handleSearchHealthId}
              className="px-3.5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-teal-700"
            >
              <Search className="w-3.5 h-3.5" />
              Fetch
            </button>
          </div>
          {searchFoundMsg && (
            <p className="text-[11px] text-teal-700 font-semibold mt-1.5 bg-teal-50 p-1.5 rounded-md">
              {searchFoundMsg}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sameer Ahmed"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                min="0"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="20"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa or No known allergies"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Chronic Conditions
              </label>
              <input
                type="text"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Insurance Provider / Gov Scheme (Optional)
            </label>
            <input
              type="text"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              placeholder="e.g. Star Health or TN CM Comprehensive Scheme"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="General Medicine (OPD)">General Medicine (OPD)</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Diabetology">Diabetology</option>
                <option value="Gynaecology">Gynaecology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Nephrology">Nephrology</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Consulting Doctor
              </label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Dr. Mohamed">Dr. Mohamed (Chief Physician)</option>
                <option value="Dr. Revathi">Dr. Revathi (Cardiologist)</option>
                <option value="Dr. Arjun">Dr. Arjun (Endocrinologist)</option>
                <option value="Dr. Priya">Dr. Priya (Obstetrics & Gynae)</option>
                <option value="Dr. Karthik">Dr. Karthik (Orthopaedic Surgeon)</option>
                <option value="Dr. Nivetha">Dr. Nivetha (Dermatologist)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700"
            >
              Register & Enqueue Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
