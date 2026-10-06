import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { ipdBedService, type IpdWard, type IpdBed, type Doctor } from '../../../services/ipdBedService';
import { unifiedPatientStore, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface AdmitPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  defaultBedNumber?: string;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultBedNumber,
}) => {
  const [wards, setWards] = useState<IpdWard[]>([]);
  const [beds, setBeds] = useState<IpdBed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<UnifiedPatient[]>([]);

  // Form State
  const [patientSearch, setPatientSearch] = useState('');
  const [healthId, setHealthId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(25);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  
  const [selectedWardCode, setSelectedWardCode] = useState('GEN');
  const [selectedBedNumber, setSelectedBedNumber] = useState(defaultBedNumber || '');
  const [selectedDoctorName, setSelectedDoctorName] = useState('Dr. Mohamed');
  const [admissionType, setAdmissionType] = useState('Emergency');
  const [diagnosis, setDiagnosis] = useState('Dengue with thrombocytopenia');
  const [chiefComplaint, setChiefComplaint] = useState('High grade fever with body aches for 3 days');
  const [expectedDischarge, setExpectedDischarge] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      const [w, b, d] = await Promise.all([
        ipdBedService.getWards(),
        ipdBedService.getBeds(),
        ipdBedService.getDoctors(),
      ]);
      setWards(w);
      setBeds(b);
      setDoctors(d);
      setRegisteredPatients(unifiedPatientStore.getAllPatients());

      if (defaultBedNumber) {
        setSelectedBedNumber(defaultBedNumber);
        const matchedBed = b.find((bed) => bed.bed_number === defaultBedNumber);
        if (matchedBed) {
          setSelectedWardCode(matchedBed.ward_code);
        }
      }
    };
    loadData();
  }, [isOpen, defaultBedNumber]);

  // Available beds in selected ward
  const availableBeds = beds.filter(
    (b) => b.ward_code === selectedWardCode && (b.status === 'Available' || b.bed_number === defaultBedNumber)
  );

  // Auto-select first available bed when ward changes if current bed not available
  useEffect(() => {
    if (availableBeds.length > 0 && (!selectedBedNumber || !availableBeds.some((b) => b.bed_number === selectedBedNumber))) {
      setSelectedBedNumber(availableBeds[0].bed_number);
    }
  }, [selectedWardCode, beds]);

  // When selecting existing patient from search
  const handleSelectPatient = (patient: UnifiedPatient) => {
    setHealthId(patient.healthId);
    setPatientName(patient.name);
    setPatientAge(patient.age);
    setPatientGender(patient.gender as any);
    setPatientPhone(patient.phone);
    setPatientSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim()) {
      setErrorMsg('Please enter or select a patient name.');
      return;
    }
    if (!healthId.trim()) {
      setErrorMsg('A valid sovereign HealthID / UHID is required.');
      return;
    }
    if (!selectedBedNumber) {
      setErrorMsg('Please select an available bed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ward = wards.find((w) => w.ward_code === selectedWardCode);
      const res = await ipdBedService.admitPatient({
        patientHealthId: healthId.trim().toUpperCase(),
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        patientGender,
        patientPhone: patientPhone.trim(),
        wardCode: selectedWardCode,
        wardName: ward?.name || 'General Ward',
        bedNumber: selectedBedNumber,
        doctorName: selectedDoctorName,
        diagnosis: diagnosis.trim(),
        expectedDischarge,
        admissionType,
        chiefComplaint: chiefComplaint.trim(),
      });

      if (res.success) {
        onSuccess(`Patient ${patientName} successfully admitted to Bed ${selectedBedNumber} (${res.admissionNumber})`);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to complete admission.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredPatientList = patientSearch.trim()
    ? registeredPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.healthId.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.phone.includes(patientSearch)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Admit Inpatient</h3>
              <p className="text-xs text-slate-500">Assign ward, allocate bed, and initialize clinical case sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Search & Quick Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Registered Patient / Sovereign HealthID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search by patient name, UHID (e.g. HG001245), or phone..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            {filteredPatientList.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-lg">
                {filteredPatientList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-slate-400 ml-2">({p.age}y / {p.gender})</span>
                      <div className="text-[10px] text-teal-600 font-mono mt-0.5">{p.healthId} • {p.phone}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-lg">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Demographic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sovereign HealthID (UHID)</label>
              <input
                type="text"
                value={healthId}
                onChange={(e) => setHealthId(e.target.value.toUpperCase())}
                placeholder="e.g. HG001245"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="125"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Admission & Bed Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ward Selection</label>
              <select
                value={selectedWardCode}
                onChange={(e) => setSelectedWardCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              >
                {wards.map((w) => (
                  <option key={w.ward_code} value={w.ward_code}>
                    {w.name} ({w.total_beds} beds)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Bed</label>
              <select
                value={selectedBedNumber}
                onChange={(e) => setSelectedBedNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-teal-700"
              >
                {availableBeds.length === 0 ? (
                  <option value="">No beds available</option>
                ) : (
                  availableBeds.map((b) => (
                    <option key={b.bed_number} value={b.bed_number}>
                      Bed {b.bed_number} ({b.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attending Consultant</label>
              <select
                value={selectedDoctorName}
                onChange={(e) => setSelectedDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Admission Type & Expected Discharge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admission Type</label>
              <select
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Emergency">Emergency Admission</option>
                <option value="Planned">Planned / Elective</option>
                <option value="OPD Transfer">OPD Direct Transfer</option>
                <option value="ICU Step Down">ICU Step Down</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Discharge Date</label>
              <input
                type="date"
                value={expectedDischarge}
                onChange={(e) => setExpectedDischarge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Diagnosis & Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provisional Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Dengue with thrombocytopenia"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaints & Clinical Presentation</label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Symptoms, duration, initial vitals, and emergency triage findings..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBedNumber}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Admitting Patient...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Admission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
