import React, { useState } from 'react';
import { VisitRecord, DigitalTwinOutput, CalculatedPhysiology, PatientInputData } from '../types';
import { ComparisonView } from './ComparisonView';
import { QuickDataAnalysis } from './QuickDataAnalysis';
import {
  Calendar,
  Clock,
  ArrowLeft,
  PlusCircle,
  RotateCcw,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Columns3,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Screen4HistoryProps {
  visits: VisitRecord[];
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  twinOutput: DigitalTwinOutput;
  onBackToTwin: () => void;
  onAddCurrentAsVisit: () => void;
  onResetHistory: () => void;
  onLoadVisit: (visit: VisitRecord) => void;
}

export const Screen4History: React.FC<Screen4HistoryProps> = ({
  visits,
  inputData,
  physiology,
  twinOutput,
  onBackToTwin,
  onAddCurrentAsVisit,
  onResetHistory,
  onLoadVisit,
}) => {
  const [subTab, setSubTab] = useState<'matrix' | 'cohort' | 'export'>('matrix');

  // Format trend data for charting across visits
  const trendData = visits.map((v) => ({
    visit: v.visitLabel,
    HR: v.hr,
    MAP: v.map,
    Resistance: v.resistance,
    Compliance: +(v.compliance * 1000).toFixed(2),
    AI: v.ai,
  }));

  const riskBand = {
    name: (twinOutput.augmentationIndex > 17.2 ? 'High Risk' : twinOutput.augmentationIndex > 11.7 ? 'Elevated' : 'Normal') as any,
    color: twinOutput.augmentationIndex > 17.2 ? 'text-rose-600' : twinOutput.augmentationIndex > 11.7 ? 'text-amber-600' : 'text-emerald-600',
    badgeClass: twinOutput.augmentationIndex > 17.2 ? 'bg-rose-50 text-rose-700 border-rose-200' : twinOutput.augmentationIndex > 11.7 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Weber et al. vascular risk index',
  };

  const currentResultAdapter = {
    p1: twinOutput.p1,
    p2: twinOutput.p2,
    ai: twinOutput.augmentationIndex,
    tP1: twinOutput.tP1,
    tP2: twinOutput.tP2,
    MAP: physiology.map,
    PP: twinOutput.pulsePressure,
    Tc: physiology.cardiacCycle,
    R1: physiology.r1,
    R2: physiology.r2,
    Lv: physiology.lv,
    Cv: physiology.cv,
    Ri: inputData.arteryRadius,
    h: inputData.wallThickness,
    E: inputData.elasticModulus,
    waveform: twinOutput.waveform,
    bracketA: 117,
    bracketB: 124,
    frac: 0.5,
    alpha: physiology.womersleyAlpha,
  };

  const patientProfileAdapter = {
    id: inputData.patientId,
    name: inputData.patientId,
    age: inputData.age,
    gender: 'Male' as const,
    medicalRecordNumber: inputData.patientId,
    systolicBP: inputData.sbp,
    diastolicBP: inputData.dbp,
    heartRate: inputData.heartRate,
    lumenRadius: inputData.arteryRadius,
    wallThickness: inputData.wallThickness,
    notes: 'Longitudinal clinical record analysis',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              SCREEN 4 OF 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Longitudinal History &amp; Comparative Analysis
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Tracking vascular remodeling, peripheral resistance, compliance, and clinical cohort benchmarking.
          </p>
        </div>

        {/* Sub-tabs for History Screen: Matrix | Cohort Benchmark | Clinical Export */}
        <div className="flex items-center bg-slate-200/90 p-1 rounded-xl text-xs sm:text-sm font-mono">
          <button
            type="button"
            onClick={() => setSubTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
              subTab === 'matrix'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={16} />
            <span>Visit Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('cohort')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
              subTab === 'cohort'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns3 size={16} />
            <span>Cohort Benchmark</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
              subTab === 'export'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Report &amp; Export</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Exact Clinical History Matrix */}
      {subTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
                  Clinical Biomarker Tracking Matrix
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onAddCurrentAsVisit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-2xs transition"
                >
                  <PlusCircle size={16} />
                  <span>Log Current Run</span>
                </button>
                <button
                  type="button"
                  onClick={onResetHistory}
                  className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 transition shadow-2xs"
                  title="Reset to default 3 visits"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700">
                    <th className="p-4 sm:p-5 font-sans font-bold text-slate-900 text-sm sm:text-base w-52">Parameter</th>
                    {visits.map((visit) => (
                      <th key={visit.id} className="p-4 sm:p-5 text-center font-bold text-slate-900">
                        <div className="text-sm sm:text-base font-mono">{visit.visitLabel}</div>
                        <div className="text-xs text-slate-500 font-normal">{visit.date}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Row 1: HR */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-bold text-slate-700 text-sm sm:text-base">HR (bpm)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-black text-lg sm:text-xl text-slate-900">
                        {v.hr}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: MAP */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-bold text-slate-700 text-sm sm:text-base">MAP (mmHg)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-black text-lg sm:text-xl text-indigo-700">
                        {v.map}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Resistance */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-bold text-slate-700 text-sm sm:text-base">Resistance (mmHg/cm³/s)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-black text-lg sm:text-xl text-slate-900">
                        {v.resistance}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Compliance */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-bold text-slate-700 text-sm sm:text-base">Compliance (cm³/mmHg)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-black text-lg sm:text-xl text-emerald-700">
                        {v.compliance}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: AI */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-bold text-slate-700 text-sm sm:text-base">Augmentation Index (%)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-black text-lg sm:text-xl text-rose-600">
                        {v.ai}%
                      </td>
                    ))}
                  </tr>

                  {/* Action row */}
                  <tr className="bg-slate-50/60">
                    <td className="p-4 text-xs sm:text-sm text-slate-500 font-sans">Digital Twin Actions:</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => onLoadVisit(v)}
                          className="px-3.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-300 hover:border-indigo-300 transition shadow-2xs"
                        >
                          Load into Twin
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Longitudinal Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={20} className="text-indigo-600" />
                <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
                  Longitudinal Hemodynamic Trajectory
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> MAP (mmHg)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> AI (%)
                </span>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 12, right: 24, left: -16, bottom: 6 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
                  <XAxis dataKey="visit" tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  <Line type="monotone" dataKey="MAP" stroke="#4338ca" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="AI" stroke="#e11d48" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Comparative Cohort Benchmarking */}
      {subTab === 'cohort' && (
        <ComparisonView
          patientResult={currentResultAdapter}
          patientName={inputData.patientId}
          riskBand={riskBand}
        />
      )}

      {/* Subtab 3: Quick Data Analysis & Printable Report */}
      {subTab === 'export' && (
        <QuickDataAnalysis
          patient={patientProfileAdapter}
          result={currentResultAdapter}
          riskBand={riskBand}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBackToTwin}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-bold font-mono flex items-center gap-2 border border-slate-300 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
          <span>Back to Digital Twin</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-mono font-bold shadow-2xs transition"
        >
          Print Clinical Summary
        </button>
      </div>
    </div>
  );
};
