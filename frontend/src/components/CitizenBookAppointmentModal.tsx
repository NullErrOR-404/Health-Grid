import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { authService } from '../services/authService';
import { appointmentService, type Appointment } from '../services/appointmentService';
import { doctorOpdService, type DoctorRecord } from '../services/doctorOpdService';
import { hospitalAlertsService } from '../services/hospitalAlertsService';

interface CitizenBookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHospital?: string;
  defaultDoctor?: string;
  defaultDepartment?: string;
  onSuccess?: (appointment: Appointment) => void;
}

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Emergency Medicine',
  'Orthopedics',
  'Pulmonology',
  'ENT',
  'Dermatology',
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM',
];

export const CitizenBookAppointmentModal: React.FC<CitizenBookAppointmentModalProps> = ({
  isOpen,
  onClose,
  defaultHospital = 'Government Medical College & Hospital (GMCH)',
  defaultDoctor = 'Dr. Mohamed',
  defaultDepartment = 'General Medicine',
  onSuccess,
}) => {
  const currentUser = authService.getCurrentUser();

  const [hospital, setHospital] = useState(defaultHospital);
  const [department, setDepartment] = useState(defaultDepartment);
  const [doctorName, setDoctorName] = useState(defaultDoctor);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '');
  const [patientAge, setPatientAge] = useState(currentUser?.age || 25);
  const [patientGender, setPatientGender] = useState((currentUser as any)?.gender || 'Other');
  const [patientHealthId, setPatientHealthId] = useState(currentUser?.healthId || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [doctorsList, setDoctorsList] = useState<DoctorRecord[]>([]);

  useEffect(() => {
    const docs = doctorOpdService.getDoctors();
    if (docs.length > 0) {
      setDoctorsList(docs);
    } else {
      doctorOpdService.fetchDoctors().then((fetched) => setDoctorsList(fetched));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfirmedAppointment(null);
      const user = authService.getCurrentUser();
      if (user) {
        setPatientName(user.name || '');
        setPatientPhone(user.phone || '');
        setPatientAge(user.age || 25);
        setPatientGender((user as any)?.gender || 'Other');
        setPatientHealthId(user.healthId || '');
      } else {
        setPatientName('');
        setPatientPhone('');
        setPatientHealthId('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appt = await appointmentService.createAppointment({
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_age: Number(patientAge),
        patient_gender: patientGender,
        patient_health_id: patientHealthId,
        doctor_name: doctorName,
        department: department,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: 'Consultation',
        reason_for_visit: reasonForVisit || 'General clinical review and consultation',
        source: 'Online Booking',
        status: 'Scheduled',
      });

      // Dispatch alert to hospital notification inbox
      hospitalAlertsService.addAlert({
        type: 'REGISTRATION',
        patientName: patientName,
        healthId: patientHealthId,
        message: `${patientName} (${patientHealthId}) booked OPD appointment with ${doctorName} for ${appointmentDate} at ${appointmentTime}`,
      });

      setConfirmedAppointment(appt);
      if (onSuccess) onSuccess(appt);
    } catch (err) {
      console.error('Error booking appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-teal-200">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Book Hospital OPD Appointment</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Live Cloud
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Direct booking into Government Medical College & Hospital queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedAppointment ? (
          /* CONFIRMED DIGITAL OPD PASS VIEW */
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black">Appointment Confirmed Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your token has been issued in Government Medical College & Hospital ERP.
                </p>
              </div>
            </div>

            {/* Visual OPD Pass Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl border border-teal-800/40 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-teal-800/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Official OPD Consultation Pass
                  </span>
                  <div className="text-base font-black text-white mt-0.5">
                    {hospital}
                  </div>
                  <div className="text-xs text-slate-300">
                    Department of {confirmedAppointment.department}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Token ID</div>
                  <div className="text-xl font-mono font-black text-teal-300">
                    {confirmedAppointment.appointment_id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Consulting Doctor</div>
                  <div className="text-sm font-black text-white mt-0.5">{confirmedAppointment.doctor_name}</div>
                  <div className="text-[10px] text-teal-300 mt-0.5 font-medium">Room 101 • OPD Wing A</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Time Slot</div>
                  <div className="text-sm font-black text-white mt-0.5">{confirmedAppointment.appointment_time}</div>
                  <div className="text-[10px] text-teal-300 mt-0.5 font-medium">{confirmedAppointment.appointment_date}</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Patient Name & Health ID</div>
                  <div className="text-xs font-bold text-white mt-0.5">{confirmedAppointment.patient_name}</div>
                  <div className="text-[10px] font-mono text-teal-400 mt-0.5">
                    ABDM HealthID: {confirmedAppointment.patient_health_id}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-teal-900/40 p-2.5 rounded-xl border border-teal-700/50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  The hospital has linked your sovereign e-chart. AI is currently synthesizing your clinical brief for {confirmedAppointment.doctor_name}.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
              >
                <span>Done</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* APPOINTMENT BOOKING FORM */
          <form onSubmit={handleBook} className="p-6 space-y-4">
            
            {/* Hospital Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Select Hospital / Medical Center
              </label>
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
              >
                <option value="Government Medical College & Hospital (GMCH)">
                  Government Medical College & Hospital (GMCH) • HG-H002
                </option>
                <option value="Rajiv Gandhi Govt General Hospital">
                  Rajiv Gandhi Govt General Hospital (Park Town)
                </option>
                <option value="Chennai Government Children's Hospital">
                  Chennai Government Children&apos;s Hospital (Egmore)
                </option>
                <option value="Kasturba Gandhi Hospital for Women">
                  Kasturba Gandhi Hospital for Women & Children (Triplicane)
                </option>
              </select>
            </div>

            {/* Department & Doctor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  Doctor
                </label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                >
                  {doctorsList.length > 0 ? (
                    doctorsList.map((doc) => (
                      <option key={doc.id || doc.doctor_code || doc.name} value={doc.name}>
                        {doc.name} ({doc.specialization || doc.department})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Dr. Mohamed">Dr. Mohamed (Senior Consultant Physician)</option>
                      <option value="Dr. Bala Murugan">Dr. Bala Murugan (Casualty / ER Specialist)</option>
                      <option value="Dr. S. K. Sundaram">Dr. S. K. Sundaram (Cardiologist)</option>
                      <option value="Dr. Priya Ramasamy">Dr. Priya Ramasamy (General Medicine)</option>
                      <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (Orthopedic Surgeon)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Preferred Slot
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason for Visit / Chief Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                Reason for Visit / Symptoms
              </label>
              <textarea
                rows={2}
                required
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="e.g. Mild chest heaviness post-exertion, sore throat for 2 days, routine blood pressure review"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-slate-900"
              />
            </div>

            {/* Linked Sovereign Health ID Banner */}
            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{patientName} • {patientAge}y / {patientGender}</div>
                  <div className="text-[11px] text-teal-700 font-mono">
                    Sovereign Health ID: {patientHealthId}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-800">
                E-Chart Linked
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Slot in ERP...' : 'Confirm Appointment Slot'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
