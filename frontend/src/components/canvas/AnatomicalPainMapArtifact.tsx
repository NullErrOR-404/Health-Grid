import React, { useState } from 'react';
import {
  Send,
  Info,
  RotateCcw
} from 'lucide-react';
import { type AnatomicalMapData, type AnatomicalPainRegion } from '../../types/canvas';

interface AnatomicalPainMapArtifactProps {
  data: AnatomicalMapData;
  onUpdate?: (updatedData: AnatomicalMapData) => void;
  onSendToChat?: (text: string) => void;
}

interface BodyRegionDef {
  id: string;
  name: string;
  tamilName: string;
  cx: number;
  cy: number;
  r: number;
  view: 'anterior' | 'posterior';
}

const BODY_REGIONS: BodyRegionDef[] = [
  // Anterior (Front)
  { id: 'head_front', name: 'Head / Forehead', tamilName: 'தலை / நெற்றி', cx: 100, cy: 38, r: 16, view: 'anterior' },
  { id: 'neck_front', name: 'Throat & Anterior Neck', tamilName: 'தொண்டை & கழுத்து', cx: 100, cy: 72, r: 10, view: 'anterior' },
  { id: 'chest', name: 'Chest / Precordium', tamilName: 'நெஞ்சு பகுதி', cx: 100, cy: 110, r: 20, view: 'anterior' },
  { id: 'shoulder_r', name: 'Right Shoulder', tamilName: 'வலது தோள்பட்டை', cx: 62, cy: 95, r: 12, view: 'anterior' },
  { id: 'shoulder_l', name: 'Left Shoulder', tamilName: 'இடது தோள்பட்டை', cx: 138, cy: 95, r: 12, view: 'anterior' },
  { id: 'epigastrium', name: 'Upper Abdomen / Epigastric', tamilName: 'வயிற்று மேல் பகுதி', cx: 100, cy: 148, r: 15, view: 'anterior' },
  { id: 'abdomen_lower', name: 'Lower Abdomen / Pelvic', tamilName: 'அடிவயிறு & இடுப்பு', cx: 100, cy: 185, r: 16, view: 'anterior' },
  { id: 'arm_r', name: 'Right Arm & Elbow', tamilName: 'வலது கை', cx: 48, cy: 142, r: 11, view: 'anterior' },
  { id: 'arm_l', name: 'Left Arm & Elbow', tamilName: 'இடது கை', cx: 152, cy: 142, r: 11, view: 'anterior' },
  { id: 'hip_r', name: 'Right Hip & Inguinal', tamilName: 'வலது இடுப்பு', cx: 80, cy: 215, r: 13, view: 'anterior' },
  { id: 'hip_l', name: 'Left Hip & Inguinal', tamilName: 'இடது இடுப்பு', cx: 120, cy: 215, r: 13, view: 'anterior' },
  { id: 'knee_r', name: 'Right Knee', tamilName: 'வலது முழங்கால்', cx: 82, cy: 280, r: 13, view: 'anterior' },
  { id: 'knee_l', name: 'Left Knee', tamilName: 'இடது முழங்கால்', cx: 118, cy: 280, r: 13, view: 'anterior' },
  { id: 'ankle_r', name: 'Right Ankle / Foot', tamilName: 'வலது பாதம்', cx: 82, cy: 350, r: 11, view: 'anterior' },
  { id: 'ankle_l', name: 'Left Ankle / Foot', tamilName: 'இடது பாதம்', cx: 118, cy: 350, r: 11, view: 'anterior' },

  // Posterior (Back)
  { id: 'occiput_back', name: 'Back of Head / Occiput', tamilName: 'தலையின் பின்பகுதி', cx: 100, cy: 38, r: 16, view: 'posterior' },
  { id: 'cervical_spine', name: 'Cervical Spine / Upper Neck', tamilName: 'கழுத்து எலும்பு', cx: 100, cy: 72, r: 10, view: 'posterior' },
  { id: 'thoracic_spine', name: 'Upper Back / Thoracic Spine', tamilName: 'மேல் முதுகு', cx: 100, cy: 115, r: 18, view: 'posterior' },
  { id: 'lumbar_spine', name: 'Lower Back / Lumbar Spine', tamilName: 'கீழ் முதுகு / இடுப்பு', cx: 100, cy: 168, r: 18, view: 'posterior' },
  { id: 'sacrum_buttock', name: 'Sacrum / Buttocks', tamilName: 'புட்டம் & வால் எலும்பு', cx: 100, cy: 210, r: 17, view: 'posterior' },
  { id: 'hamstring_r', name: 'Right Posterior Thigh', tamilName: 'வலது தொடை பின்புறம்', cx: 82, cy: 250, r: 12, view: 'posterior' },
  { id: 'hamstring_l', name: 'Left Posterior Thigh', tamilName: 'இடது தொடை பின்புறம்', cx: 118, cy: 250, r: 12, view: 'posterior' },
  { id: 'calf_r', name: 'Right Calf', tamilName: 'வலது கெண்டைக்கால்', cx: 82, cy: 315, r: 12, view: 'posterior' },
  { id: 'calf_l', name: 'Left Calf', tamilName: 'இடது கெண்டைக்கால்', cx: 118, cy: 315, r: 12, view: 'posterior' },
];

export const AnatomicalPainMapArtifact: React.FC<AnatomicalPainMapArtifactProps> = ({
  data,
  onUpdate,
  onSendToChat,
}) => {
  const [activeView, setActiveView] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedRegions, setSelectedRegions] = useState<AnatomicalPainRegion[]>(data.selectedRegions || []);
  const [activeRegionId, setActiveRegionId] = useState<string>(
    data.selectedRegions?.[0]?.id || 'epigastrium'
  );
  const [currentIntensity, setCurrentIntensity] = useState<number>(6);
  const [currentCharacter, setCurrentCharacter] = useState<AnatomicalPainRegion['character']>('dull');
  const [radiationPath, setRadiationPath] = useState<string>('');

  const toggleRegion = (regionDef: BodyRegionDef) => {
    const existingIndex = selectedRegions.findIndex((r) => r.id === regionDef.id);
    let updated: AnatomicalPainRegion[];

    if (existingIndex >= 0) {
      updated = selectedRegions.filter((r) => r.id !== regionDef.id);
      if (activeRegionId === regionDef.id) {
        setActiveRegionId(updated[0]?.id || '');
      }
    } else {
      const newRegion: AnatomicalPainRegion = {
        id: regionDef.id,
        name: regionDef.name,
        tamilName: regionDef.tamilName,
        view: regionDef.view,
        intensity: currentIntensity,
        character: currentCharacter,
        radiationTarget: radiationPath,
        duration: '3 days',
      };
      updated = [...selectedRegions, newRegion];
      setActiveRegionId(regionDef.id);
    }

    setSelectedRegions(updated);
    if (onUpdate) {
      onUpdate({
        ...data,
        selectedRegions: updated,
        primaryComplaint: updated.map((u) => u.name).join(', '),
      });
    }
  };

  const updateActiveRegionProperties = (
    intensity: number,
    character: AnatomicalPainRegion['character'],
    radiation: string
  ) => {
    const updated = selectedRegions.map((r) => {
      if (r.id === activeRegionId) {
        return {
          ...r,
          intensity,
          character,
          radiationTarget: radiation,
        };
      }
      return r;
    });

    setSelectedRegions(updated);
    if (onUpdate) {
      onUpdate({
        ...data,
        selectedRegions: updated,
      });
    }
  };

  const activeRegionData = selectedRegions.find((r) => r.id === activeRegionId);

  const getIntensityColor = (score: number) => {
    if (score <= 3) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score <= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* View Toggle Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveView('anterior')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'anterior'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anterior (Front View)
          </button>
          <button
            onClick={() => setActiveView('posterior')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'posterior'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Posterior (Back View)
          </button>
        </div>

        <span className="text-xs font-medium text-slate-500">
          {selectedRegions.length} region{selectedRegions.length === 1 ? '' : 's'} localized
        </span>
      </div>

      {/* Main Interactive Diagram and Controls Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* SVG Vector Body Map */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-xs">
          <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {activeView === 'anterior' ? 'Frontal Body Plane' : 'Posterior Spine Plane'}
          </div>

          <svg
            viewBox="0 0 200 400"
            className="w-56 h-[340px] drop-shadow-sm select-none"
          >
            {/* Body Silhouettes */}
            <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5">
              {/* Head */}
              <circle cx="100" cy="38" r="18" />
              {/* Neck */}
              <rect x="94" y="56" width="12" height="18" rx="3" />
              {/* Torso */}
              <path d="M 68 76 Q 100 82 132 76 L 126 195 Q 100 200 74 195 Z" />
              {/* Shoulders & Arms */}
              <path d="M 68 76 L 42 165 L 54 168 L 74 95 Z" />
              <path d="M 132 76 L 158 165 L 146 168 L 126 95 Z" />
              {/* Legs */}
              <path d="M 74 195 L 70 345 L 88 345 L 96 210 Z" />
              <path d="M 126 195 L 130 345 L 112 345 L 104 210 Z" />
            </g>

            {/* Interactive Region Anchors */}
            {BODY_REGIONS.filter((r) => r.view === activeView).map((reg) => {
              const isSelected = selectedRegions.some((r) => r.id === reg.id);
              const isFocal = activeRegionId === reg.id;
              const foundRegion = selectedRegions.find((r) => r.id === reg.id);
              const intensity = foundRegion?.intensity || 5;

              let fillColor = 'rgba(255, 255, 255, 0.8)';
              let strokeColor = '#94A3B8';

              if (isSelected) {
                if (intensity <= 3) {
                  fillColor = '#10B981';
                  strokeColor = '#059669';
                } else if (intensity <= 6) {
                  fillColor = '#F59E0B';
                  strokeColor = '#D97706';
                } else {
                  fillColor = '#EF4444';
                  strokeColor = '#DC2626';
                }
              }

              return (
                <g
                  key={reg.id}
                  onClick={() => toggleRegion(reg)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={reg.cx}
                    cy={reg.cy}
                    r={reg.r}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isFocal ? 3 : 1.5}
                    className="transition-all duration-200 group-hover:scale-110"
                    opacity={isSelected ? 0.9 : 0.6}
                  />
                  {isSelected && (
                    <circle
                      cx={reg.cx}
                      cy={reg.cy}
                      r={reg.r + 4}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin-slow"
                    />
                  )}
                  <text
                    x={reg.cx}
                    y={reg.cy + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill={isSelected ? '#FFFFFF' : '#475569'}
                    className="pointer-events-none"
                  >
                    {isSelected ? foundRegion?.intensity : '+'}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="text-[11px] text-slate-500 text-center mt-2">
            Tap anatomical nodes to pinpoint focal pain and trigger dermatomal mapping
          </p>
        </div>

        {/* Region Clinical Configuration Panel */}
        <div className="space-y-4">
          {activeRegionData ? (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                  Active Focal Area
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeRegionData.name}
                </h3>
                {activeRegionData.tamilName && (
                  <p className="text-xs text-slate-500 font-medium">
                    {activeRegionData.tamilName}
                  </p>
                )}
              </div>

              {/* Visual Analogue Scale Slider (0-10) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">Pain Intensity (VAS 0–10)</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${getIntensityColor(currentIntensity)}`}>
                    {currentIntensity} / 10 • {currentIntensity <= 3 ? 'Mild' : currentIntensity <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentIntensity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentIntensity(val);
                    updateActiveRegionProperties(val, currentCharacter, radiationPath);
                  }}
                  className="w-full accent-[#00A896] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1: Barely noticeable</span>
                  <span>5: Distracting</span>
                  <span>10: Incapacitating</span>
                </div>
              </div>

              {/* Pain Quality / Character */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Character of Sensation
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['dull', 'sharp', 'throbbing', 'burning', 'stabbing', 'colicky'] as const).map((char) => (
                    <button
                      key={char}
                      onClick={() => {
                        setCurrentCharacter(char);
                        updateActiveRegionProperties(currentIntensity, char, radiationPath);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg capitalize font-medium transition-colors ${
                        currentCharacter === char
                          ? 'bg-[#00A896] text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radiation Path */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Radiation Path (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Radiates from chest to left jaw / inner arm"
                  value={radiationPath}
                  onChange={(e) => {
                    setRadiationPath(e.target.value);
                    updateActiveRegionProperties(currentIntensity, currentCharacter, e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                No anatomical site selected
              </p>
              <p className="text-[11px] text-slate-500">
                Click on any node in the human silhouette to record pain intensity and clinical characteristics.
              </p>
            </div>
          )}

          {/* Localized Regions Summary Tags */}
          {selectedRegions.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Recorded Symptom Sites
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRegions.map((reg) => (
                  <span
                    key={reg.id}
                    onClick={() => setActiveRegionId(reg.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${getIntensityColor(
                      reg.intensity
                    )}`}
                  >
                    <span>{reg.name}</span>
                    <span className="font-mono text-[10px]">({reg.intensity}/10)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <button
          onClick={() => {
            setSelectedRegions([]);
            setActiveRegionId('');
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Markers
        </button>

        <button
          onClick={() => {
            if (selectedRegions.length === 0) return;
            const summary = selectedRegions
              .map(
                (r) =>
                  `• ${r.name} (${r.tamilName || ''}): ${r.intensity}/10 (${r.character} sensation)${
                    r.radiationTarget ? `, radiating to ${r.radiationTarget}` : ''
                  }`
              )
              .join('\n');
            const fullMessage = `Anatomical Symptom Mapping Record:\n${summary}\n\nPlease factor these focal pain locations into your clinical differential and triage recommendation.`;
            onSendToChat?.(fullMessage);
          }}
          disabled={selectedRegions.length === 0}
          className="px-4 py-2 text-xs font-bold text-white bg-[#00A896] hover:bg-[#008f80] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          Send Anatomical Record to DocBot
        </button>
      </div>
    </div>
  );
};
