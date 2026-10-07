import React, { useState, useEffect } from 'react';
import { X, Edit3, Stethoscope, Building2, Clock, Calendar, Hash, Award, Check, Trash2 } from 'lucide-react';
import { doctorOpdService, type DoctorRecord } from '../../../services/doctorOpdService';

interface EditDoctorModalProps {
  isOpen: boolean;
  doctor: DoctorRecord | null;
  onClose: () => void;
  onDoctorUpdated: (doc: DoctorRecord) => void;
  onDoctorDeleted?: (id: string) => void;
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

export const EditDoctorModal: React.FC<EditDoctorModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onDoctorUpdated,
  onDoctorDeleted,
  triggerToast,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [specialization, setSpecialization] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [regNo, setRegNo] = useState('');
  const [experienceYears, setExperienceYears] = useState('8');
  const [opdDays, setOpdDays] = useState('Mon - Sat');
  const [opdRoom, setOpdRoom] = useState('Room 101');
  const [totalSlots, setTotalSlots] = useState('25');
  const [status, setStatus] = useState<'In OPD' | 'Available' | 'On Leave'>('In OPD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '');
      setDepartment(doctor.department || 'General Medicine');
      setSpecialization(doctor.specialization || '');
      setDesignation(doctor.designation || '');
      setQualification(doctor.qualification || '');
      setRegNo(doctor.reg_no || '');
      setExperienceYears(String(doctor.experience_years || 5));
      setOpdDays(doctor.opd_days || 'Mon - Sat');
      setOpdRoom(doctor.opd_room || 'Room 101');
      setTotalSlots(String(doctor.total_slots || 25));
      setStatus(doctor.status || 'Available');
    }
  }, [doctor]);

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('Doctor name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await doctorOpdService.updateDoctor(doctor.id, {
        name,
        department,
        specialization,
        designation,
        qualification,
        reg_no: regNo,
        experience_years: parseInt(experienceYears, 10) || 5,
        opd_days: opdDays,
        opd_room: opdRoom,
        total_slots: parseInt(totalSlots, 10) || 25,
        status,
        is_available: status !== 'On Leave',
      });

      if (updated) {
        triggerToast(`Updated ${updated.name} successfully!`);
        onDoctorUpdated(updated);
        onClose();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update doctor details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove ${doctor.name} (${doctor.doctor_code})?`)) {
      await doctorOpdService.deleteDoctor(doctor.id);
      triggerToast(`Removed ${doctor.name}`);
      if (onDoctorDeleted) onDoctorDeleted(doctor.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Edit Doctor Details</h2>
                <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                  {doctor.doctor_code}
                </span>
              </div>
              <p className="text-xs text-slate-500">Update clinical qualifications, room, and schedule status</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Duty Status</label>
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
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Doctor</span>
            </button>

            <div className="flex items-center gap-2.5">
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
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
