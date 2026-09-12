import React, { useState } from 'react';
import { DigitalTwinOutput, CalculatedPhysiology, PatientInputData, PatientProfile } from '../types';
import { Vessel3D } from './Vessel3D';
import { RealTimeMonitor } from './RealTimeMonitor';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  Check,
  Box,
  Sliders,
  Tv,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

interface Screen3DigitalTwinProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  twinOutput: DigitalTwinOutput;
  onBack: () => void;
  onProceedToHistory: () => void;
  onSaveToHistory: () => void;
  isSaved: boolean;
}

export const Screen3DigitalTwin: React.FC<Screen3DigitalTwinProps> = ({
  inputData,
  physiology,
  twinOutput,
  onBack,
  onProceedToHistory,
  onSaveToHistory,
  isSaved,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'chart' | 'telemetry'>('chart');
  const [show3DVessel, setShow3DVessel] = useState(true);
  const [showFlowOverlay, setShowFlowOverlay] = useState(false);

  // Risk categorization (Weber et al. 2004)
  const getRiskCategory = (ai: number) => {
    if (ai < 11.7) return { text: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (ai <= 17.2) return { text: 'Elevated', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'High Risk', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
  };

  const risk = getRiskCategory(twinOutput.augmentationIndex);

  const yMin = Math.floor((inputData.dbp - 15) / 10) * 10;
  const yMax = Math.ceil((inputData.sbp + 25) / 10) * 10;

  // Normalized points for 3D animation
  const normPoints = twinOutput.waveform.map((p) => {
    const Ps = Math.max(...twinOutput.waveform.map((w) => w.P));
    const Pd = Math.min(...twinOutput.waveform.map((w) => w.P));
    return {
      t: p.t,
      n: (p.P - Pd) / Math.max(Ps - Pd, 1e-5),
    };
  });

  const patientProfileAdapter: PatientProfile = {
    id: inputData.patientId,
    name: inputData.patientId,
    age: inputData.age,
    gender: 'Male',
    medicalRecordNumber: inputData.patientId,
    systolicBP: inputData.sbp,
    diastolicBP: inputData.dbp,
    heartRate: inputData.heartRate,
    lumenRadius: inputData.arteryRadius,
    wallThickness: inputData.wallThickness,
    notes: 'Personalized 4-element Windkessel digital twin',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              SCREEN 3 OF 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Digital Twin Simulation
            </h2>
            <span className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full border ${risk.bg} ${risk.color}`}>
              {risk.text} Risk (AI {twinOutput.augmentationIndex}%)
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Personalized carotid pressure waveform predicted by 4-element Windkessel Runge-Kutta numerical solver.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Monitoring Pulse Badge */}
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono text-indigo-700 font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <span>REAL-TIME PULSE {inputData.heartRate} BPM</span>
          </div>

          {/* View switcher: Waveform Analysis vs Bedside Telemetry */}
          <div className="flex items-center bg-slate-200/90 p-1 rounded-xl text-xs sm:text-sm font-mono">
            <button
              type="button"
              onClick={() => setActiveViewMode('chart')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-2 ${
                activeViewMode === 'chart'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity size={16} />
              <span>Waveform Analysis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('telemetry')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-bold flex items-center gap-2 ${
                activeViewMode === 'telemetry'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tv size={16} />
              <span>Bedside Monitor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          <button
            type="button"
            onClick={onSaveToHistory}
            className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all shadow-2xs ${
              isSaved
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
            <span>{isSaved ? 'Saved to History' : 'Save as Visit Record'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Waveform Analysis Chart with Real-Time Pulse Animation */}
      {activeViewMode === 'chart' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                </span>
                Predicted Personalized Arterial Pressure Waveform
              </h3>
              <span className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5 block">
                Continuous Common Carotid Artery (CCA) Cycle · Period Tc = {physiology.cardiacCycle}s · {inputData.heartRate} bpm · MAP {physiology.map} mmHg
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs font-mono text-indigo-700">
                <span className="inline-block w-2.5 h-0.5 bg-indigo-600 rounded-full animate-pulse"></span>
                <span>Active Pulse Rhythm</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFlowOverlay(!showFlowOverlay)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono transition border ${
                  showFlowOverlay
                    ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                {showFlowOverlay ? 'Hide Flow Q(t)' : 'Overlay Flow Q(t)'}
              </button>
            </div>
          </div>

          {/* Large Graph with Pulsing Glow Animation */}
          <div className="relative w-full h-88 sm:h-[420px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-50/50 to-white pt-2">
            {/* Subtle arterial pulse glow overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.04)]" />

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={twinOutput.waveform} margin={{ top: 20, right: 28, left: -4, bottom: 12 }}>
                <defs>
                  <filter id="arterial-pulse-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#6366f1" floodOpacity="0.45" />
                  </filter>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fill: '#475569', fontSize: 12, fontFamily: 'monospace', fontWeight: 500 }}
                  tickFormatter={(v) => `${(+v).toFixed(2)}s`}
                  label={{
                    value: 'Time in Cardiac Cycle (seconds)',
                    position: 'insideBottom',
                    offset: -6,
                    fill: '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  yAxisId="pressure"
                  domain={[yMin, yMax]}
                  tick={{ fill: '#334155', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}
                  label={{
                    value: 'Pressure (mmHg)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 18,
                    fill: '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                {showFlowOverlay && (
                  <YAxis
                    yAxisId="flow"
                    orientation="right"
                    domain={[0, 'auto']}
                    tick={{ fill: '#0284c7', fontSize: 11, fontFamily: 'monospace' }}
                    label={{
                      value: 'Flow Q (mL/s)',
                      angle: 90,
                      position: 'insideRight',
                      offset: 18,
                      fill: '#0284c7',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                )}
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
                  labelFormatter={(val) => `Cycle Time: ${(+val).toFixed(3)}s`}
                  formatter={(val: any, name: any) => [
                    name === 'P' ? `${val} mmHg` : `${val} mL/s`,
                    name === 'P' ? 'Arterial Pressure P(t)' : 'Flow Rate Q(t)',
                  ]}
                />

                {/* SBP and DBP reference lines */}
                <ReferenceLine
                  yAxisId="pressure"
                  y={inputData.sbp}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: `SBP: ${inputData.sbp} mmHg`, position: 'top', fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <ReferenceLine
                  yAxisId="pressure"
                  y={inputData.dbp}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: `DBP: ${inputData.dbp} mmHg`, position: 'bottom', fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <ReferenceLine
                  yAxisId="pressure"
                  x={twinOutput.tP1}
                  stroke="#4f46e5"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{ value: `P1 (${twinOutput.p1} mmHg)`, position: 'top', fill: '#4338ca', fontSize: 11, fontWeight: 800 }}
                />
                <ReferenceLine
                  yAxisId="pressure"
                  x={twinOutput.tP2}
                  stroke="#9333ea"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{ value: `P2 (${twinOutput.p2} mmHg)`, position: 'insideTopRight', fill: '#7e22ce', fontSize: 11, fontWeight: 800 }}
                />
                <ReferenceLine
                  yAxisId="pressure"
                  x={twinOutput.tDicrotic}
                  stroke="#059669"
                  strokeDasharray="2 2"
                  label={{ value: 'Dicrotic Notch', position: 'insideBottom', fill: '#059669', fontSize: 11, fontWeight: 600 }}
                />

                {/* Animated Pulsing Arterial Pressure Waveform Curve */}
                <Line
                  yAxisId="pressure"
                  type="monotone"
                  dataKey="P"
                  stroke="#4338ca"
                  strokeWidth={3.5}
                  className="animate-arterial-glow transition-all duration-700 ease-in-out"
                  dot={false}
                  activeDot={{ r: 6, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2.5 }}
                  style={{ filter: 'url(#arterial-pulse-filter)' }}
                />

                {showFlowOverlay && (
                  <Line
                    yAxisId="flow"
                    type="monotone"
                    dataKey="Q"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mode 2: Real-Time Bedside Telemetry Oscilloscope Monitor */}
      {activeViewMode === 'telemetry' && (
        <RealTimeMonitor
          patient={patientProfileAdapter}
          result={{
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
          }}
          wallColor={twinOutput.augmentationIndex > 17.2 ? '#ef4444' : twinOutput.augmentationIndex > 11.7 ? '#f59e0b' : '#10b981'}
        />
      )}

      {/* Required Variables Below Large Graph:
          Pulse Pressure, Reflection Time, P1, P2, Augmentation Index */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
            Waveform Diagnostic Metrics
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Paisal et al. (2019) Landmarks &amp; Weber et al. Risk Classification
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono">
          {/* Pulse Pressure */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider">Pulse Pressure</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
              {twinOutput.pulsePressure} <span className="text-xs sm:text-sm font-medium text-slate-500">mmHg</span>
            </div>
            <div className="text-xs text-slate-400">SBP − DBP</div>
          </div>

          {/* Reflection Time */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider">Reflection Time</div>
            <div className="text-3xl sm:text-4xl font-black text-indigo-700 my-2">
              {twinOutput.reflectionTime} <span className="text-xs sm:text-sm font-medium text-slate-500">ms</span>
            </div>
            <div className="text-xs text-slate-400">TR = |tP2 − tP1|</div>
          </div>

          {/* P1 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider">P1 (1st Peak)</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
              {twinOutput.p1} <span className="text-xs sm:text-sm font-medium text-slate-500">mmHg</span>
            </div>
            <div className="text-xs text-slate-400">at {twinOutput.tP1}s</div>
          </div>

          {/* P2 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider">P2 (Reflected)</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
              {twinOutput.p2} <span className="text-xs sm:text-sm font-medium text-slate-500">mmHg</span>
            </div>
            <div className="text-xs text-slate-400">at {twinOutput.tP2}s</div>
          </div>

          {/* Augmentation Index */}
          <div className={`p-4 sm:p-5 rounded-xl border ${risk.bg} flex flex-col justify-between col-span-2 sm:col-span-1 shadow-2xs`}>
            <div className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${risk.color}`}>Augmentation Index</div>
            <div className={`text-3xl sm:text-4xl font-black my-2 ${risk.color}`}>
              {twinOutput.augmentationIndex}%
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{risk.text} Risk</span>
              <span className="text-slate-400 font-normal">|P2−P1|/PP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Carotid Artery Digital Twin Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Box size={20} className="text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              3D Interactive Carotid Vessel Twin (WebGL / Three.js)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShow3DVessel(!show3DVessel)}
            className="text-xs sm:text-sm font-mono font-bold text-slate-500 hover:text-slate-800"
          >
            {show3DVessel ? 'Minimize 3D' : 'Expand 3D'}
          </button>
        </div>

        {show3DVessel && (
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
            <Vessel3D
              Ri={inputData.arteryRadius}
              h={inputData.wallThickness}
              cvRatio={physiology.cv / 0.0231}
              norm={normPoints}
              Tc={physiology.cardiacCycle}
              wallColor={twinOutput.augmentationIndex > 17.2 ? '#ef4444' : twinOutput.augmentationIndex > 11.7 ? '#f59e0b' : '#10b981'}
              heartRate={inputData.heartRate}
            />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-bold font-mono flex items-center gap-2 border border-slate-300 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
          <span>Back to Physiology</span>
        </button>

        <button
          type="button"
          onClick={onProceedToHistory}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-bold font-mono tracking-wide flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
        >
          <span>View Longitudinal History</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
