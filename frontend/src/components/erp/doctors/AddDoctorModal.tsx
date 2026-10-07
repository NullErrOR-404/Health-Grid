import React, { useState } from 'react';
import { X, UserPlus, Stethoscope, Building2, Clock, Calendar, Hash, Award, Check } from 'lucide-react';
import { doctorOpdService, type DoctorRecord } from '../../../services/doctorOpdService';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorAdded: (doc: DoctorRecord) => void;
  triggerToast: (msg: string) => void;
}

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Diabetology',
  'Gynaecology',
  'Orthopaedics',
  'Dermatology',
  'Emergency Medicine',
  'Paediatrics',
  'Radiology',
  'ENT',
  'Neurology',
  'General Surgery',
  'Ophthalmology',
  'Nephrology',
  'Psychiatry',
  'Pulmonology',
  'Oncology',
  'Anaesthesiology',
  'Gastroenterology',
  'Dental Surgery',
  'Urology',
  'Pathology',
  'Physical Medicine',
  'Geriatrics',
];

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onDoctorAdded,
  triggerToast,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [specialization, setSpecialization] = useState('Internal Medicine');
  const [designation, setDesignation] = useState('Consultant Physician');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [regNo, setRegNo] = useState('');
  const [experienceYears, setExperienceYears] = useState('8');
  const [opdDays, setOpdDays] = useState('Mon - Sat');
  const [opdRoom, setOpdRoom] = useState('Room 101');
  const [totalSlots, setTotalSlots] = useState('25');
  const [status, setStatus] = useState<'In OPD' | 'Available' | 'On Leave'>('In OPD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('Doctor name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const doctorsCount = doctorOpdService.getDoctors().length;
      const nextCode = `DOC${String(doctorsCount + 1).padStart(3, '0')}`;

      const newDoctor = await doctorOpdService.addDoctor({
        doctor_code: nextCode,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        department,
        specialization,
        designation,
        qualification,
        opd_days: opdDays,
        opd_room: opdRoom,
        total_slots: parseInt(totalSlots, 10) || 25,
        booked_slots: 0,
        status,
        reg_no: regNo || String(Math.floor(10000 + Math.random() * 90000)),
        experience_years: parseInt(experienceYears, 10) || 5,
        avatar_url: `https://images.unsplash.com/photo-${1537368910025 + doctorsCount}?auto=format&fit=crop&q=80&w=300`,
        schedule: [
          { day: 'Mon', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
          { day: 'Tue', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
          { day: 'Wed', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
          { day: 'Thu', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
          { day: 'Fri', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
          { day: 'Sat', active: true, slots: [{ time: '09:00 AM - 01:00 PM', room: opdRoom }] },
        ],
        is_available: status !== 'On Leave',
      });

      triggerToast(`Doctor ${newDoctor.name} (${newDoctor.doctor_code}) registered successfully!`);
      onDoctorAdded(newDoctor);
      onClose();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to add doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Doctor</h2>
              <p className="text-xs text-slate-500">Register physician profile, OPD days, and slot limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajeshwari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Interventional Cardiology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Consultant"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD, DNB"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Reg No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical Registration No.</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 78542"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* OPD Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">OPD Days</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={opdDays}
                  onChange={(e) => setOpdDays(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Mon - Sat">Mon - Sat</option>
                  <option value="Mon, Wed, Fri">Mon, Wed, Fri</option>
                  <option value="Tue, Thu, Sat">Tue, Thu, Sat</option>
                  <option value="Mon - Sun">Mon - Sun (24/7)</option>
                  <option value="Mon - Fri">Mon - Fri</option>
                </select>
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Room</label>
              <input
                type="text"
                placeholder="e.g. Room 101"
                value={opdRoom}
                onChange={(e) => setOpdRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Slots Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily Slot Limit</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Current Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'In OPD', label: 'In OPD (Active)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { id: 'Available', label: 'Available (On Duty)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
                  { id: 'On Leave', label: 'On Leave', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      status === st.id
                        ? `${st.color} ring-2 ring-teal-500/30 font-bold shadow-xs`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
