import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';
import { unifiedPatientStore, type UnifiedPatient } from '../../../services/unifiedPatientStore';

interface EditClinicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: UnifiedPatient;
  field: 'allergies' | 'bloodGroup' | 'chronicConditions' | 'insurance';
  onSaved?: () => void;
}

export const EditClinicalInfoModal: React.FC<EditClinicalInfoModalProps> = ({
  isOpen,
  onClose,
  patient,
  field,
  onSaved,
}) => {
  const [val, setVal] = useState(() => {
    if (field === 'allergies') return patient.allergies.join(', ');
    if (field === 'bloodGroup') return patient.bloodGroup;
    if (field === 'chronicConditions') return patient.chronicConditions.join(', ');
    if (field === 'insurance') return patient.insurance.provider !== 'Not Available' ? patient.insurance.provider : '';
    return '';
  });

  if (!isOpen) return null;

  const titles: Record<string, string> = {
    allergies: 'Edit Patient Allergies',
    bloodGroup: 'Update Blood Group',
    chronicConditions: 'Edit Chronic Conditions',
    insurance: 'Update Health Insurance & Scheme',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (field === 'allergies') {
      const parsed = val.trim() ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : ['No known allergies'];
      unifiedPatientStore.updatePatientClinicalInfo(patient.id, { allergies: parsed });
    } else if (field === 'bloodGroup') {
      unifiedPatientStore.updatePatientClinicalInfo(patient.id, { bloodGroup: val });
    } else if (field === 'chronicConditions') {
      const parsed = val.trim() ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : ['None reported'];
      unifiedPatientStore.updatePatientClinicalInfo(patient.id, { chronicConditions: parsed });
    } else if (field === 'insurance') {
      unifiedPatientStore.updatePatientClinicalInfo(patient.id, {
        insurance: {
          provider: val.trim() || 'Not Available',
          policyNumber: val.trim() ? 'POL-' + Math.floor(100000 + Math.random() * 900000) : '—',
          status: val.trim() ? 'Active' : 'Not Available',
        },
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900">{titles[field]}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Patient: {patient.name} ({patient.healthId})
            </label>
            {field === 'bloodGroup' ? (
              <select
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            ) : (
              <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={
                  field === 'allergies'
                    ? 'e.g. Penicillin, Peanuts (comma separated)'
                    : field === 'chronicConditions'
                    ? 'e.g. Hypertension, Asthma (comma separated)'
                    : 'Insurance company or scheme name'
                }
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 hover:bg-teal-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
