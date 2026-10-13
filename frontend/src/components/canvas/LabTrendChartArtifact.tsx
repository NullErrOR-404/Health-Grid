import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { type LabTrendsData } from '../../types/canvas';

interface LabTrendChartArtifactProps {
  data: LabTrendsData;
  onSendToChat?: (text: string) => void;
}

export const LabTrendChartArtifact: React.FC<LabTrendChartArtifactProps> = ({
  data,
  onSendToChat,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(
    data.trends[0]?.biomarkerKey || 'hba1c'
  );

  const activeTrend = data.trends.find((t) => t.biomarkerKey === selectedKey) || data.trends[0];

  if (!activeTrend) {
    return <div className="p-4 text-xs text-slate-500">No laboratory biomarker trends available.</div>;
  }

  const chartData = activeTrend.dataPoints.map((pt) => ({
    date: pt.date,
    value: pt.value,
    status: pt.status,
    note: pt.note,
  }));

  const latestPoint = activeTrend.dataPoints[activeTrend.dataPoints.length - 1];
  const isOutOfRange = latestPoint && (latestPoint.value > activeTrend.referenceHigh || latestPoint.value < activeTrend.referenceLow);

  return (
    <div className="space-y-6">
      {/* Biomarker Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {data.trends.map((trend) => (
          <button
            key={trend.biomarkerKey}
            onClick={() => setSelectedKey(trend.biomarkerKey)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedKey === trend.biomarkerKey
                ? 'bg-[#00A896] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {trend.name}
          </button>
        ))}
      </div>

      {/* KPI Highlight Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Biomarker Value
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold text-slate-900">
              {latestPoint?.value}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {activeTrend.unit}
            </span>
            {isOutOfRange ? (
              <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Above Reference Limit
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Target Optimal Range
              </span>
            )}
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-[10px] text-slate-400 uppercase block">Clinical Reference Range</span>
          <span className="font-mono font-bold text-slate-700">
            {activeTrend.referenceLow} – {activeTrend.referenceHigh} {activeTrend.unit}
          </span>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Latest Tested: {latestPoint?.date}
          </div>
        </div>
      </div>

      {/* Responsive Recharts Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Longitudinal Trajectory ({activeTrend.dataPoints.length} tests)
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
              Actual Result
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
              Normal Reference Band
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <ReferenceArea
                y1={activeTrend.referenceLow}
                y2={activeTrend.referenceHigh}
                fill="#10B981"
                fillOpacity={0.08}
              />
              <ReferenceLine
                y={activeTrend.referenceHigh}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{ value: 'High Cutoff', position: 'insideTopRight', fill: '#EF4444', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00A896"
                strokeWidth={3}
                dot={{ r: 5, fill: '#00A896', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clinical Interpretation Notes */}
      <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
          Clinical Interpretation & Trajectory Analysis
        </span>
        <p className="text-xs text-teal-950 leading-relaxed font-medium">
          {data.clinicalInterpretation}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
        <span className="text-[11px] text-slate-500 font-mono">
          Patient ABDM ID: {data.patientHealthId}
        </span>
        <button
          onClick={() => {
            const summary = `Lab Trends Review (${data.patientName}):\n• ${activeTrend.name}: Latest ${latestPoint?.value} ${activeTrend.unit} (${latestPoint?.date})\n• Reference: ${activeTrend.referenceLow}-${activeTrend.referenceHigh} ${activeTrend.unit}\n• Status: ${isOutOfRange ? 'Out of Range' : 'Normal Target'}.`;
            onSendToChat?.(summary);
          }}
          className="px-3 py-1.5 font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send Lab Trend to Chat
        </button>
      </div>
    </div>
  );
};
