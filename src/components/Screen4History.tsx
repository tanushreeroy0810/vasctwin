import React, { useState } from 'react';
import { VisitRecord, DigitalTwinOutput, CalculatedPhysiology, PatientInputData } from '../types';
import { ComparisonView } from './ComparisonView';
import { QuickDataAnalysis } from './QuickDataAnalysis';
import { DiseaseRiskAnalysis } from './DiseaseRiskAnalysis';
import {
  Calendar,
  ArrowLeft,
  PlusCircle,
  RotateCcw,
  TrendingUp,
  Columns3,
  FileSpreadsheet,
  Stethoscope,
  Printer,
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
  const [subTab, setSubTab] = useState<'matrix' | 'cohort' | 'diseases' | 'export'>('matrix');

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Step 4 of 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Longitudinal Patient History
            </h1>
          </div>
          <p className="text-base text-slate-600 mt-1">
            Track arterial remodeling, vascular resistance, compliance, and clinical trends over patient visits.
          </p>
        </div>

        {/* Sub-tabs for History Screen */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-sm font-semibold">
          <button
            type="button"
            onClick={() => setSubTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              subTab === 'matrix'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calendar size={16} />
            <span>Visit Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('cohort')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              subTab === 'cohort'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Columns3 size={16} />
            <span>Cohort Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('diseases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              subTab === 'diseases'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Stethoscope size={16} />
            <span>Pathology Screening</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              subTab === 'export'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Clinical Summary</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Exact Clinical History Matrix */}
      {subTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Calendar size={20} className="text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Patient Visits &amp; Biomarkers Comparison
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onAddCurrentAsVisit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <PlusCircle size={16} />
                  <span>Log Current Run to History</span>
                </button>
                <button
                  type="button"
                  onClick={onResetHistory}
                  className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
                  title="Reset to default 3 visits"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Matrix Table with Increased Font Sizes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-700">
                    <th className="p-4 sm:p-5 font-bold text-slate-900 text-sm sm:text-base w-56">Biomarker / Metric</th>
                    {visits.map((visit) => (
                      <th key={visit.id} className="p-4 sm:p-5 text-center font-bold text-slate-900">
                        <div className="text-base font-bold">{visit.visitLabel}</div>
                        <div className="text-xs text-slate-500 font-normal">{visit.date}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Row 1: HR */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-700">Heart Rate (bpm)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-bold text-xl text-slate-900">
                        {v.hr}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: MAP */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-700">MAP (mmHg)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-bold text-xl text-indigo-700">
                        {v.map}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Resistance */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-700">Resistance R (mmHg·s/mL)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-bold text-xl text-slate-900">
                        {v.resistance}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Compliance */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-700">Compliance Cv (mL/mmHg)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-bold text-xl text-emerald-700">
                        {v.compliance}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: AI */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="p-4 sm:p-5 font-semibold text-slate-700">Augmentation Index (%)</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 sm:p-5 text-center font-bold text-xl text-rose-600">
                        {v.ai}%
                      </td>
                    ))}
                  </tr>

                  {/* Action row */}
                  <tr className="bg-slate-50/80">
                    <td className="p-4 text-sm text-slate-600 font-medium">Digital Twin Actions:</td>
                    {visits.map((v) => (
                      <td key={v.id} className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => onLoadVisit(v)}
                          className="px-4 py-2 text-sm font-semibold rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-300 hover:border-indigo-400 transition shadow-2xs"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={20} className="text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Longitudinal Hemodynamic Trajectory
                </h2>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" /> MAP (mmHg)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-3 h-3 rounded-full bg-rose-600" /> AI (%)
                </span>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="visit" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      padding: '10px 14px',
                    }}
                  />
                  <Line type="monotone" dataKey="MAP" stroke="#4338ca" strokeWidth={3.5} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="AI" stroke="#e11d48" strokeWidth={3.5} dot={{ r: 5 }} activeDot={{ r: 7 }} />
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

      {/* Subtab 3: Pathology Screening & Clinical Disease Tracking */}
      {subTab === 'diseases' && (
        <DiseaseRiskAnalysis
          inputData={inputData}
          physiology={physiology}
          twinOutput={twinOutput}
        />
      )}

      {/* Subtab 4: Quick Data Analysis & Printable Report */}
      {subTab === 'export' && (
        <QuickDataAnalysis
          patient={patientProfileAdapter}
          result={currentResultAdapter}
          riskBand={riskBand}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <button
          type="button"
          onClick={onBackToTwin}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-semibold flex items-center gap-2 border border-slate-300 transition"
        >
          <ArrowLeft size={18} />
          <span>Back to Digital Twin</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-base font-semibold shadow-2xs transition flex items-center gap-2 cursor-pointer"
        >
          <Printer size={18} />
          <span>Print Clinical Summary</span>
        </button>
      </div>
    </div>
  );
};
