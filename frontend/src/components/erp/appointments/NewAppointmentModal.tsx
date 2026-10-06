import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
  CheckCircle2,
  Search,
  FileText
} from 'lucide-react';
import { appointmentService, type AppointmentType } from '../../../services/appointmentService';
import { unifiedPatientStore } from '../../../services/unifiedPatientStore';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Diabetology',
  'Gynaecology',
  'Orthopaedics',
  'Dermatology',
  'Endocrinology',
  'Nephrology',
  'Pulmonology',
  'Pediatrics',
];

const DOCTORS = [
  { name: 'Dr. Mohamed', dept: 'General Medicine' },
  { name: 'Dr. Revathi', dept: 'Cardiology' },
  { name: 'Dr. Arjun', dept: 'Diabetology' },
  { name: 'Dr. Priya', dept: 'Gynaecology' },
  { name: 'Dr. Karthik', dept: 'Orthopaedics' },
  { name: 'Dr. Nivetha', dept: 'Dermatology' },
  { name: 'Dr. Suresh', dept: 'Orthopaedics' },
  { name: 'Dr. Ananya', dept: 'Pediatrics' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientHealthId, setPatientHealthId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  const [patientAge, setPatientAge] = useState<number>(25);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  
  const [department, setDepartment] = useState('General Medicine');
  const [doctorName, setDoctorName] = useState('Dr. Mohamed');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('09:30 AM');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('Consultation');
  const [source, setSource] = useState('Online Booking');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePatientSelect = (pat: any) => {
    setPatientHealthId(pat.healthId);
    setPatientName(pat.name);
    setPatientPhone(pat.phone);
    setPatientAge(pat.age);
    setPatientGender(pat.gender || 'Male');
    setPatientSearch('');
  };

  const filteredRegistered = patientSearch.trim()
    ? unifiedPatientStore.getAllPatients().filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.healthId.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.phone.includes(patientSearch)
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedHealthId = patientHealthId.trim() || `HG${Math.floor(100000 + Math.random() * 900000)}`;

      await appointmentService.createAppointment({
        patient_health_id: generatedHealthId,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        patient_age: patientAge,
        patient_gender: patientGender,
        department,
        doctor_name: doctorName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
        status: 'Scheduled',
        source,
        reason_for_visit: reasonForVisit.trim(),
        notes: notes.trim(),
      });

      onSuccess(`Appointment booked successfully for ${patientName} on ${appointmentDate} at ${appointmentTime}`);
      onClose();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-2xl h-full sm:h-auto max-h-none sm:max-h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Schedule New Appointment</h2>
              <p className="text-xs text-slate-500">Book outpatient consultation or follow-up slot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Patient Search or Autofill */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quick Patient Lookup (UHID / Name / Phone)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search registered HealthIDs (e.g. HG001245, Sameer)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            {filteredRegistered.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                {filteredRegistered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePatientSelect(p)}
                    className="w-full text-left px-3.5 py-2 hover:bg-teal-50/60 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.healthId} · {p.age}y/{p.gender}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Patient Details Grid */}
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Patient Demographics
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sameer Ahmed"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">UHID / HealthID</label>
                <input
                  type="text"
                  value={patientHealthId}
                  onChange={(e) => setPatientHealthId(e.target.value)}
                  placeholder="Auto-generated if blank (e.g. HG001245)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>

          {/* Department & Doctor Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" /> Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  const firstDoc = DOCTORS.find((d) => d.dept === e.target.value);
                  if (firstDoc) setDoctorName(firstDoc.name);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-800"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-slate-400" /> Doctor
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-800"
              >
                {DOCTORS.map((doc) => (
                  <option key={doc.name} value={doc.name}>{doc.name} ({doc.dept})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Slot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Time Slot
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type & Booking Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Appointment Type</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine">Routine Checkup</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Booking Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Online Booking">Online Booking</option>
                <option value="Walk-in">Walk-in Front Desk</option>
                <option value="Mobile App">Citizen Mobile App</option>
                <option value="Referral">Physician Referral</option>
              </select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> Chief Complaints / Reason for Visit
            </label>
            <textarea
              rows={2}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g. Persistent mild headache, fever for 3 days..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Internal Clinical / Triage Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for consulting doctor or triage nurse..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
