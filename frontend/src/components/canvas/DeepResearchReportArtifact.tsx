import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Scale,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { type DeepResearchReportData, type GradeEvidenceLevel } from '../../types/canvas';

interface DeepResearchReportArtifactProps {
  data: DeepResearchReportData;
  onSendToChat?: (text: string) => void;
}

export const DeepResearchReportArtifact: React.FC<DeepResearchReportArtifactProps> = ({
  data,
  onSendToChat,
}) => {
  const [copied, setCopied] = useState(false);

  const getGradeBadge = (level: GradeEvidenceLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          label: 'GRADE High Certainty',
          class: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'MODERATE':
        return {
          label: 'GRADE Moderate Certainty',
          class: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'LOW':
        return {
          label: 'GRADE Low Certainty',
          class: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      default:
        return {
          label: 'GRADE Very Low / Expert Opinion',
          class: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const gradeInfo = getGradeBadge(data.evidenceQualityLevel);

  const handleCopy = () => {
    const text = `# Clinical Evidence Report: ${data.clinicalQuestion}\n\n## Executive Summary\n${data.executiveSummary}\n\n## Actionable Recommendation\n${data.actionableRecommendation}\n\n## Sources\n${data.citations.map((c) => `- ${c.title} (${c.source}, ${c.year}) - ${c.pmidOrDoi || ''}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border border-teal-200/80 rounded-2xl shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${gradeInfo.class}`}>
              {gradeInfo.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
              Confidence Index: {data.confidenceScore}%
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Report'}
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {data.clinicalQuestion}
        </h3>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          Executive Evidence Synthesis
        </h4>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed space-y-2 font-normal">
          <p>{data.executiveSummary}</p>
        </div>
      </div>

      {/* Actionable Clinical Recommendation Box */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Actionable Bedside Directive
        </div>
        <p className="text-xs font-medium text-emerald-950 leading-relaxed">
          {data.actionableRecommendation}
        </p>
      </div>

      {/* Interactive Evidence Matrix Table */}
      {data.evidenceTable && data.evidenceTable.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Key Clinical Trials & Endpoints Table
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Intervention</th>
                  <th className="p-2.5">Comparator</th>
                  <th className="p-2.5">Primary Endpoint</th>
                  <th className="p-2.5">Effect Estimate</th>
                  <th className="p-2.5">GRADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.evidenceTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-medium text-slate-900">{row.intervention}</td>
                    <td className="p-2.5 text-slate-600">{row.control}</td>
                    <td className="p-2.5 text-slate-700">{row.endpoint}</td>
                    <td className="p-2.5 font-mono text-teal-700 font-semibold">{row.effectEstimate}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {row.certainty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* National (ICMR) vs International (WHO/NICE) Guideline Comparison */}
      {data.guidelineComparisons && data.guidelineComparisons.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Indian Guidelines (ICMR) vs. International Consensus
          </h4>
          <div className="space-y-2.5">
            {data.guidelineComparisons.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-900">{item.domain}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-orange-50/70 border border-orange-200/60 rounded-lg">
                    <span className="text-[10px] font-bold text-orange-800 uppercase block">
                      🇮🇳 {item.indianGuideline.body} ({item.indianGuideline.level})
                    </span>
                    <p className="text-slate-800 mt-1">{item.indianGuideline.recommendation}</p>
                  </div>
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">
                      🌐 {item.internationalGuideline.body} ({item.internationalGuideline.level})
                    </span>
                    <p className="text-slate-800 mt-1">{item.internationalGuideline.recommendation}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                  <span className="font-semibold not-italic">Clinical Consensus: </span>
                  {item.clinicalConsensus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Limitations & Gaps */}
      {data.limitationsAndGaps && data.limitationsAndGaps.length > 0 && (
        <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Study Limitations & Uncertainty Disclosures
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-950">
            {data.limitationsAndGaps.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Clickable Authoritative Citations */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          Authoritative Primary Sources ({data.citations.length})
        </h4>
        <div className="space-y-2">
          {data.citations.map((cite) => (
            <div
              key={cite.id}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-300 transition-colors shadow-2xs space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                  {cite.title}
                </h5>
                {cite.url && (
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 p-1"
                    title="Open PubMed citation"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">{cite.source}</span>
                <span>•</span>
                <span>Year: {cite.year}</span>
                {cite.pmidOrDoi && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-teal-700">{cite.pmidOrDoi}</span>
                  </>
                )}
                {cite.sampleSize && (
                  <>
                    <span>•</span>
                    <span>Sample Size: N={cite.sampleSize.toLocaleString()}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1">
                {cite.keyFinding}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & Medical Transparency Footer */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <p className="max-w-md italic">{data.disclosureStatement}</p>
        <button
          onClick={() => {
            const summary = `Evidence Report Summary:\n• ${data.clinicalQuestion}\n• Primary Consensus: ${data.actionableRecommendation}\n• Certainty: ${data.evidenceQualityLevel} (${data.citations.length} primary citations indexed).`;
            onSendToChat?.(summary);
          }}
          className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send Report to Chat
        </button>
      </div>
    </div>
  );
};
