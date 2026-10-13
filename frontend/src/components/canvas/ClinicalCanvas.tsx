import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Printer,
  Layers,
  FileText,
  Activity,
  Pill,
  Apple,
  Search,
  Stethoscope
} from 'lucide-react';
import { type ClinicalArtifact, type ClinicalArtifactType } from '../../types/canvas';
import { MedicationScheduleArtifact } from './MedicationScheduleArtifact';
import { AnatomicalPainMapArtifact } from './AnatomicalPainMapArtifact';
import { DeepResearchReportArtifact } from './DeepResearchReportArtifact';
import { SoapNoteArtifact } from './SoapNoteArtifact';
import { LabTrendChartArtifact } from './LabTrendChartArtifact';
import { PatientDietEducationArtifact } from './PatientDietEducationArtifact';

interface ClinicalCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  activeArtifact: ClinicalArtifact | null;
  artifactsList?: ClinicalArtifact[];
  onSelectArtifact?: (artifact: ClinicalArtifact) => void;
  onUpdateArtifact?: (updatedArtifact: ClinicalArtifact) => void;
  onSendToChat?: (text: string) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const ClinicalCanvas: React.FC<ClinicalCanvasProps> = ({
  isOpen,
  onClose,
  activeArtifact,
  artifactsList = [],
  onSelectArtifact,
  onUpdateArtifact,
  onSendToChat,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const [isPip, setIsPip] = useState(false);

  if (!isOpen || !activeArtifact) return null;

  const getArtifactIcon = (type: ClinicalArtifactType) => {
    switch (type) {
      case 'MEDICATION_PLAN':
        return Pill;
      case 'ANATOMICAL_BODY_MAP':
        return Activity;
      case 'DEEP_RESEARCH':
        return Search;
      case 'SOAP_NOTE':
        return Stethoscope;
      case 'LAB_TRENDS':
        return Activity;
      case 'DIET_PLAN':
        return Apple;
      default:
        return FileText;
    }
  };

  const IconComponent = getArtifactIcon(activeArtifact.type);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-in-out flex flex-col bg-white border-l border-slate-200/90 shadow-2xl ${
        isFullScreen
          ? 'inset-0 w-full h-full'
          : isPip
          ? 'bottom-6 right-6 w-[420px] max-w-[95vw] h-[480px] rounded-2xl border'
          : 'top-0 right-0 bottom-0 w-full sm:w-[540px] md:w-[620px] lg:w-[680px] xl:w-[740px] h-full'
      }`}
    >
      {/* Top Navigation & Controls Header */}
      <div className="p-3.5 sm:px-5 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md shrink-0">
                {activeArtifact.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {activeArtifact.createdAt}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {activeArtifact.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-600">
          <button
            onClick={handlePrint}
            title="Print or Save PDF"
            className="p-1.5 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors text-slate-500"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPip(!isPip)}
            title={isPip ? 'Dock to Side Panel' : 'Picture-in-Picture Mini View'}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors text-slate-500"
          >
            <Layers className="w-4 h-4" />
          </button>

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              title={isFullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
              className="p-1.5 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors text-slate-500"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={onClose}
            title="Collapse Clinical Canvas"
            className="p-1.5 hover:text-slate-900 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Artifact Tab Switcher (if session has multiple artifacts) */}
      {artifactsList.length > 1 && (
        <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Session Workspace:
          </span>
          {artifactsList.map((art) => {
            const TabIcon = getArtifactIcon(art.type);
            const isActive = art.id === activeArtifact.id;
            return (
              <button
                key={art.id}
                onClick={() => onSelectArtifact?.(art)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-teal-800 font-bold shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="max-w-[140px] truncate">{art.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dynamic Artifact Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {activeArtifact.type === 'MEDICATION_PLAN' && (
          <MedicationScheduleArtifact
            data={activeArtifact.data as any}
            onUpdate={(updatedData) =>
              onUpdateArtifact?.({ ...activeArtifact, data: updatedData })
            }
            onSendToChat={onSendToChat}
          />
        )}

        {activeArtifact.type === 'ANATOMICAL_BODY_MAP' && (
          <AnatomicalPainMapArtifact
            data={activeArtifact.data as any}
            onUpdate={(updatedData) =>
              onUpdateArtifact?.({ ...activeArtifact, data: updatedData })
            }
            onSendToChat={onSendToChat}
          />
        )}

        {activeArtifact.type === 'DEEP_RESEARCH' && (
          <DeepResearchReportArtifact
            data={activeArtifact.data as any}
            onSendToChat={onSendToChat}
          />
        )}

        {activeArtifact.type === 'SOAP_NOTE' && (
          <SoapNoteArtifact
            data={activeArtifact.data as any}
            onUpdate={(updatedData) =>
              onUpdateArtifact?.({ ...activeArtifact, data: updatedData })
            }
            onSendToChat={onSendToChat}
          />
        )}

        {activeArtifact.type === 'LAB_TRENDS' && (
          <LabTrendChartArtifact
            data={activeArtifact.data as any}
            onSendToChat={onSendToChat}
          />
        )}

        {activeArtifact.type === 'DIET_PLAN' && (
          <PatientDietEducationArtifact
            data={activeArtifact.data as any}
            onSendToChat={onSendToChat}
          />
        )}
      </div>
    </div>
  );
};
