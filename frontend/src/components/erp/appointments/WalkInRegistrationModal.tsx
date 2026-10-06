import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building,
  Stethoscope,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { appointmentService } from '../../../services/appointmentService';

interface WalkInRegistrationModalProps {
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
  'Pediatrics',
  'Pulmonology',
];

const DOCTORS = [
  { name: 'Dr. Mohamed', dept: 'General Medicine' },
  { name: 'Dr. Revathi', dept: 'Cardiology' },
  { name: 'Dr. Arjun', dept: 'Diabetology' },
  { name: 'Dr. Priya', dept: 'Gynaecology' },
  { name: 'Dr. Karthik', dept: 'Orthopaedics' },
  { name: 'Dr. Nivetha', dept: 'Dermatology' },
];

export const WalkInRegistrationModal: React.FC<WalkInRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+91 ');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [department, setDepartment] = useState('General Medicine');
  const [doctorName, setDoctorName] = useState('Dr. Mohamed');
  const [chiefComplaint, setChiefComplaint] = useState('Walk-in general outpatient consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      const autoHealthId = `HG${Math.floor(100000 + Math.random() * 900000)}`;

      await appointmentService.createAppointment({
        patient_health_id: autoHealthId,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        patient_age: patientAge,
        patient_gender: patientGender,
        department,
        doctor_name: doctorName,
        appointment_date: dateStr,
        appointment_time: timeStr,
        appointment_type: 'Consultation',
        status: 'Checked In',
        checked_in_at: now.toISOString(),
        source: 'Walk-in',
        reason_for_visit: chiefComplaint,
        notes: 'Walk-in front desk token issued.',
      });

      onSuccess(`Walk-in patient ${patientName} registered and checked in at ${timeStr}`);
      onClose();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-lg h-full sm:h-auto max-h-none sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Walk-in Registration</h2>
              <p className="text-xs text-slate-500">Issue instant OPD token & check-in patient</p>
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-700">
            <Ticket className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>This issues an instant live OPD token and queues the patient for consultation today.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-1.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                  <option value="Other">O</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  const firstDoc = DOCTORS.find((d) => d.dept === e.target.value);
                  if (firstDoc) setDoctorName(firstDoc.name);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Consulting Doctor
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {DOCTORS.map((doc) => (
                  <option key={doc.name} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaint</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Acute stomach pain, high fever..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Issuing Token...' : 'Issue OPD Token & Check In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
