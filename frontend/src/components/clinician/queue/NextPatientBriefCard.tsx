import React from 'react';
import {
  Users,
  ChevronRight,
  Thermometer,
  Heart,
  Activity,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import type { PatientEntity } from '../../../types/clinician';

interface NextPatientBriefCardProps {
  patient: PatientEntity;
  waitingMinutes?: number;
  onOpenFullChart: (patientId: string) => void;
  onStartConsultation: (patientId: string) => void;
  onViewInvestigation?: (investigationId: string) => void;
  onViewPastVisit?: (visitId: string) => void;
}

export const NextPatientBriefCard: React.FC<NextPatientBriefCardProps> = ({
  patient,
  waitingMinutes = 12,
  onOpenFullChart,
  onStartConsultation,
  onViewInvestigation,
  onViewPastVisit,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-700" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Next Patient
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenFullChart(patient.id)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Next in line"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Patient Bio & Avatar */}
      <div className="space-y-3">
        <div className="flex items-start gap-3.5">
          <img
            src={patient.avatarUrl}
            alt={patient.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {patient.name}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">
                New Patient
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {patient.age} yrs • {patient.gender} • {patient.bloodGroup}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              UHID: <span className="font-semibold text-slate-700">{patient.uhid}</span> | ABHA: {patient.abhaId}
            </div>
          </div>
        </div>

        {/* Waiting Status Pill */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Waiting ({waitingMinutes} mins)</span>
          </span>
        </div>

        {/* Why she's here */}
        <div className="space-y-1 pt-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span>Why she&apos;s here</span>
          </div>
          <div className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {patient.primaryProblem}
          </div>
        </div>

        {/* Today's Vitals */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
            <span>Today&apos;s vitals</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({patient.vitals.recordedAt || '09:18 AM'})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Temp</div>
                <div className="text-xs font-bold text-slate-900">
                  {patient.vitals.tempF || 98.6}°F
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Pulse</div>
                <div className="text-xs font-bold text-slate-900">
                  {patient.vitals.pulseBpm || 72} bpm
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">BP</div>
                <div className="text-xs font-bold text-slate-900">
                  {patient.vitals.bpSystolic || 120}/{patient.vitals.bpDiastolic || 80}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">SpO2</div>
                <div className="text-xs font-bold text-slate-900">
                  {patient.vitals.spo2Percent || 98}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important History & Allergies */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-slate-900">
            Important
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {patient.allergies.length === 0
                  ? 'No known allergies'
                  : `Allergies: ${patient.allergies.map((a) => a.allergen).join(', ')}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {patient.medications.length === 0
                  ? 'No current medications'
                  : `Taking: ${patient.medications.map((m) => m.name).join(', ')}`}
              </span>
            </div>

            {patient.problems.some((p) => p.name.toLowerCase().includes('dengue')) && (
              <div className="flex items-center gap-2 text-rose-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Previous dengue — 2024</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent investigations */}
        {patient.investigations.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-bold text-slate-900">
              Recent investigations
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-700">
                <span className="font-bold">{patient.investigations[0].testName}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span>{patient.investigations[0].date}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-emerald-700 font-semibold">{patient.investigations[0].status}</span>
              </div>
              <button
                type="button"
                onClick={() => onViewInvestigation?.(patient.investigations[0].id)}
                className="px-2 py-0.5 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-white border border-slate-200 rounded-md transition-colors"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Previous visit */}
        {patient.pastVisits.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-bold text-slate-900">
              Previous visit
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-700">
                <span className="font-semibold">{patient.pastVisits[0].date}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span>{patient.pastVisits[0].reason}</span>
              </div>
              <button
                type="button"
                onClick={() => onViewPastVisit?.(patient.pastVisits[0].id)}
                className="px-2 py-0.5 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-white border border-slate-200 rounded-md transition-colors"
              >
                View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Consultation Actions */}
      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenFullChart(patient.id)}
          className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-xl text-xs font-bold transition-colors text-center shadow-2xs"
        >
          Open Full Chart
        </button>

        <button
          type="button"
          onClick={() => onStartConsultation(patient.id)}
          className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/30"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Start Consultation</span>
        </button>
      </div>
    </div>
  );
};
