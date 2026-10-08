import React, { useState } from 'react';
import {
  FileText,
  Layers,
  BookOpen,
  Settings,
  HelpCircle,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { clinicianStore } from '../../../services/clinician/clinicianWorkflowStore';

interface ClinicalToolsViewsProps {
  toolType: 'templates' | 'order-sets' | 'guidelines' | 'settings' | 'help';
}

export const ClinicalToolsViews: React.FC<ClinicalToolsViewsProps> = ({ toolType }) => {
  const storeState = clinicianStore.getState();

  // Templates state
  const templates = [
    {
      id: 'tpl_gen_med',
      name: 'General Medicine Comprehensive Adult Encounter',
      specialty: 'Internal Medicine',
      description: 'Full 14-system ROS, cardiovascular/respiratory exam, and multi-morbidity SOAP format.',
      sections: ['HPI Multi-problem', '14-Point ROS', 'Vitals Interpretation', 'Comprehensive Exam', 'SOAP Note'],
    },
    {
      id: 'tpl_cardio',
      name: 'Cardiology Hypertensive & Dyspnea Evaluation',
      specialty: 'Cardiology',
      description: 'NYHA class grading, JVP, peripheral edema, ECG findings, and ASCVD risk stratification.',
      sections: ['NYHA Functional Class', 'Cardiovascular Exam', 'ECG Assessment', 'Heart Failure Protocol'],
    },
    {
      id: 'tpl_diabetes',
      name: 'Type 2 Diabetes Mellitus Surveillance & Care Gap',
      specialty: 'Endocrinology',
      description: 'HbA1c titration, microvascular screening, monofilament foot exam, and Jan Aushadhi generic alignment.',
      sections: ['Hypoglycemia History', 'Monofilament Foot Exam', 'Urine ACR & eGFR Check', 'Lipid & Eye Screening'],
    },
    {
      id: 'tpl_pediatrics',
      name: 'Pediatrics Acute Febrile Child Protocol',
      specialty: 'Pediatrics',
      description: 'Weight-based paracetamol/ibuprofen dosing, hydration assessment, fontanelle, and rash examination.',
      sections: ['Immunization History', 'Hydration & Dehydration Score', 'Pediatric Vitals', 'Growth Milestones'],
    },
  ];

  // Guidelines state
  const guidelines = [
    {
      id: 'gl_ada',
      title: 'ADA Standards of Medical Care in Diabetes (2025)',
      authority: 'American Diabetes Association / RSSDI India',
      recommendation: 'Target HbA1c < 7.0% for non-pregnant adults. First-line SGLT2i or GLP-1 RA in T2DM with high CV/CKD risk regardless of baseline HbA1c.',
      evidenceLevel: 'Level A (High Quality Randomized Trials)',
    },
    {
      id: 'gl_aha',
      title: 'AHA / ACC Guideline for Hypertension Management',
      authority: 'American Heart Association',
      recommendation: 'Blood pressure target < 130/80 mmHg. Initiate dual therapy for Stage 2 HTN with SBP > 20 mmHg above goal. Monitor K+ and Creatinine when pairing ACEi/ARB.',
      evidenceLevel: 'Level A',
    },
    {
      id: 'gl_icmr_dengue',
      title: 'ICMR National Guidelines for Dengue & Arboviral Management',
      authority: 'Indian Council of Medical Research',
      recommendation: 'Avoid NSAIDs, aspirin, and steroids in acute febrile phase. Ensure isotonic fluid resuscitation and daily platelet monitoring if count < 100,000 /µL.',
      evidenceLevel: 'National Clinical Standard',
    },
  ];

  // Calculators
  const [calcBmiWeight, setCalcBmiWeight] = useState(70);
  const [calcBmiHeight, setCalcBmiHeight] = useState(170);
  const calculatedBmi = (calcBmiWeight / ((calcBmiHeight / 100) * (calcBmiHeight / 100))).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. TEMPLATES VIEW */}
      {toolType === 'templates' && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Clinical Encounter Templates
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized specialty HPI, ROS, examination macros, and SOAP documentation structures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-teal-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {tpl.specialty}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {tpl.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.sections.map((sec, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                    >
                      {sec}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Validated Clinical Template</span>
                  <button
                    onClick={() => alert(`Template "${tpl.name}" active in encounter engine.`)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ORDER SETS VIEW */}
      {toolType === 'order-sets' && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Standard Clinical Order Sets
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bundled laboratory investigations, imaging requests, and referrals for accelerated clinical ordering
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeState.orderSets.map((os) => (
              <div
                key={os.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-teal-300 transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {os.specialty}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {os.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {os.description}
                  </p>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700">
                    Included Orders ({os.items.length}):
                  </div>
                  {os.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-center justify-between text-slate-800"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {item.code}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">One-tap Encounter Order Set</span>
                  <button
                    onClick={() => {
                      if (storeState.activeEncounterId) {
                        clinicianStore.applyOrderSetToEncounter(storeState.activeEncounterId, os.id);
                        alert(`Order set "${os.name}" applied to active encounter.`);
                      } else {
                        alert(`Order set "${os.name}" ready. Open an encounter to apply.`);
                      }
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Apply to Encounter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GUIDELINES & CALCULATORS VIEW */}
      {toolType === 'guidelines' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Clinical Guidelines & Decision Calculators
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-based medical protocols, dosage calculators, and national healthcare directives
            </p>
          </div>

          {/* Clinical Calculators Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Bedside Medical Calculator: BMI & Body Mass Index
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (kg): {calcBmiWeight} kg
                </label>
                <input
                  type="range"
                  min="35"
                  max="140"
                  value={calcBmiWeight}
                  onChange={(e) => setCalcBmiWeight(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm): {calcBmiHeight} cm
                </label>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={calcBmiHeight}
                  onChange={(e) => setCalcBmiHeight(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                  Calculated BMI
                </div>
                <div className="text-2xl font-black text-teal-700 font-mono mt-0.5">
                  {calculatedBmi} kg/m²
                </div>
                <div className="text-[10px] text-teal-600 font-medium">
                  {Number(calculatedBmi) < 18.5
                    ? 'Underweight'
                    : Number(calculatedBmi) < 23
                    ? 'Normal (Asian Indian BMI)'
                    : Number(calculatedBmi) < 27.5
                    ? 'Overweight'
                    : 'Obese (High Metabolic Risk)'}
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              National & Global Clinical Protocols
            </h3>
            <div className="space-y-3">
              {guidelines.map((gl) => (
                <div
                  key={gl.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">
                      {gl.title}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {gl.evidenceLevel}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-teal-700">
                    Source: {gl.authority}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {gl.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS VIEW */}
      {toolType === 'settings' && (
        <div className="space-y-5 max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Clinician Settings & Preferences
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Digital signature, facility credentialing, ABDM HPR registration, and workspace configuration
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            {/* Clinician Profile */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <img
                src={storeState.clinician.avatarUrl}
                alt={storeState.clinician.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/30"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {storeState.clinician.name}
                </h3>
                <div className="text-xs text-teal-700 font-semibold">
                  {storeState.clinician.title} • {storeState.clinician.specialty}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Registration No: <span className="font-mono text-slate-700">{storeState.clinician.regNumber}</span>
                </div>
              </div>
            </div>

            {/* Electronic Signature */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Digital DSC Signature Certificate
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      National Medical Council e-Sign Token
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Valid through Dec 2027 • Class 3 Digital Certificate
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active & Verified
                </span>
              </div>
            </div>

            {/* Facilities Affiliation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Primary Facility & Practice Location
              </label>
              <select
                value={storeState.selectedFacilityId}
                onChange={(e) => clinicianStore.setSelectedFacility(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {storeState.facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} — {fac.city} ({fac.address})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. HELP & SUPPORT VIEW */}
      {toolType === 'help' && (
        <div className="space-y-5 max-w-3xl">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Clinician Portal Help & Keyboard Shortcuts
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fast workstation navigation guides and emergency clinical support hotline
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Workstation Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-700">Global Patient Search</span>
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">
                  Ctrl + K
                </kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-700">HealthGrid AI Voice / Text</span>
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">
                  /
                </kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-700">Close AI Drawer / Modal</span>
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">
                  Esc
                </kbd>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-700">Sign & Close Encounter</span>
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">
                  Alt + S
                </kbd>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1 mt-4">
              <div className="font-bold flex items-center gap-1.5 text-teal-800">
                <ShieldCheck className="w-4 h-4" />
                Hospital Clinical Support Desk
              </div>
              <p className="text-[11px] text-teal-700">
                For IT emergencies or lab telemetry feed status, contact extension <strong>#4401</strong> or email support@healthgrid.med.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
