import React, { useState } from 'react';
import { DigitalTwinOutput, CalculatedPhysiology, PatientInputData, PatientProfile } from '../types';
import { Vessel3D } from './Vessel3D';
import { RealTimeMonitor } from './RealTimeMonitor';
import { DiseaseRiskAnalysis } from './DiseaseRiskAnalysis';
import { MatlabPlottingStudio } from './MatlabPlottingStudio';
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
  Tv,
  Stethoscope,
  Code,
} from 'lucide-react';

interface Screen3DigitalTwinProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  twinOutput: DigitalTwinOutput;
  onBack: () => void;
  onProceedToHistory: () => void;
  onSaveToHistory: () => void;
  isSaved: boolean;
  onOpenValidationHub?: () => void;
}

export const Screen3DigitalTwin: React.FC<Screen3DigitalTwinProps> = ({
  inputData,
  physiology,
  twinOutput,
  onBack,
  onProceedToHistory,
  onSaveToHistory,
  isSaved,
  onOpenValidationHub,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'dual' | '3d' | 'chart' | 'matlab' | 'telemetry' | 'diseases'>('dual');
  const [showFlowOverlay, setShowFlowOverlay] = useState(false);

  // Risk categorization (Weber et al. 2004)
  const getRiskCategory = (ai: number) => {
    if (ai < 11.7) return { text: 'Normal Elasticity', color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-300' };
    if (ai <= 17.2) return { text: 'Mild Stiffness', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-300' };
    return { text: 'High Vascular Stiffness', color: 'text-rose-800', bg: 'bg-rose-100 border-rose-300' };
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

  // Reusable Waveform Chart Component
  const renderWaveformChart = (heightClass = 'h-96 sm:h-[440px]') => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={twinOutput.waveform} margin={{ top: 20, right: 25, left: 0, bottom: 20 }}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
          tickFormatter={(v) => `${(+v).toFixed(2)}s`}
          label={{
            value: 'Time in Cardiac Cycle (s)',
            position: 'insideBottom',
            offset: -12,
            fill: '#475569',
            fontSize: 13,
            fontWeight: 600,
          }}
        />
        <YAxis
          yAxisId="pressure"
          domain={[yMin, yMax]}
          tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
          label={{
            value: 'Pressure (mmHg)',
            angle: -90,
            position: 'insideLeft',
            offset: 14,
            fill: '#475569',
            fontSize: 13,
            fontWeight: 600,
          }}
        />
        {showFlowOverlay && (
          <YAxis
            yAxisId="flow"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fill: '#0284c7', fontSize: 13 }}
            label={{
              value: 'Flow Q (mL/s)',
              angle: 90,
              position: 'insideRight',
              offset: 14,
              fill: '#0284c7',
              fontSize: 13,
              fontWeight: 600,
            }}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            padding: '10px 14px',
          }}
          formatter={(value: any, name: string) => [
            `${(+value).toFixed(1)} ${name === 'P' ? 'mmHg' : 'mL/s'}`,
            name === 'P' ? 'Carotid Pressure' : 'Flow Rate',
          ]}
          labelFormatter={(t) => `Time: ${(+t).toFixed(3)} s`}
        />

        {/* Clinical Reference Lines */}
        <ReferenceLine
          yAxisId="pressure"
          y={inputData.sbp}
          stroke="#e11d48"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `SBP ${inputData.sbp}`, position: 'top', fill: '#e11d48', fontSize: 12, fontWeight: 700 }}
        />
        <ReferenceLine
          yAxisId="pressure"
          y={inputData.dbp}
          stroke="#64748b"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `DBP ${inputData.dbp}`, position: 'bottom', fill: '#64748b', fontSize: 12, fontWeight: 700 }}
        />
        <ReferenceLine
          yAxisId="pressure"
          x={twinOutput.tP1}
          stroke="#4f46e5"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{ value: `P1`, position: 'top', fill: '#4338ca', fontSize: 12, fontWeight: 800 }}
        />
        <ReferenceLine
          yAxisId="pressure"
          x={twinOutput.tP2}
          stroke="#9333ea"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{ value: `P2`, position: 'insideTopRight', fill: '#7e22ce', fontSize: 12, fontWeight: 800 }}
        />
        <ReferenceLine
          yAxisId="pressure"
          x={twinOutput.tDicrotic}
          stroke="#059669"
          strokeDasharray="2 2"
          label={{ value: 'Dicrotic', position: 'insideBottom', fill: '#059669', fontSize: 11, fontWeight: 700 }}
        />

        {/* Pressure Waveform Curve */}
        <Line
          yAxisId="pressure"
          type="monotone"
          dataKey="P"
          stroke="#4338ca"
          strokeWidth={3.5}
          dot={false}
          activeDot={{ r: 6, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2.5 }}
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
  );

  // Diagnostic Cards
  const renderDiagnosticCards = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
        Waveform Diagnostic Metrics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Pulse Pressure */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pulse Pressure</span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
            {twinOutput.pulsePressure} <span className="text-sm font-semibold text-slate-500">mmHg</span>
          </div>
          <span className="text-xs text-slate-500">SBP − DBP</span>
        </div>

        {/* Reflection Time */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Reflection Time</span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-700 my-2">
            {twinOutput.reflectionTime} <span className="text-sm font-semibold text-slate-500">ms</span>
          </div>
          <span className="text-xs text-slate-500">TR = |tP2 − tP1|</span>
        </div>

        {/* P1 Peak */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">P1 (Systolic Peak)</span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 my-2">
            {twinOutput.p1} <span className="text-sm font-semibold text-slate-500">mmHg</span>
          </div>
          <span className="text-xs text-slate-500">Forward wave at {twinOutput.tP1}s</span>
        </div>

        {/* P2 Reflected Peak */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">P2 (Reflected Peak)</span>
          <div className="text-3xl sm:text-4xl font-black text-purple-700 my-2">
            {twinOutput.p2} <span className="text-sm font-semibold text-slate-500">mmHg</span>
          </div>
          <span className="text-xs text-slate-500">Reflected wave at {twinOutput.tP2}s</span>
        </div>

        {/* Augmentation Index */}
        <div className={`p-5 rounded-2xl border ${risk.bg} col-span-2 md:col-span-1`}>
          <span className={`text-xs font-bold uppercase tracking-wider block ${risk.color}`}>Augmentation Index</span>
          <div className={`text-3xl sm:text-4xl font-black my-2 ${risk.color}`}>
            {twinOutput.augmentationIndex}%
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {risk.text}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Step 3 of 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Carotid Digital Twin Simulation
            </h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${risk.bg} ${risk.color}`}>
              {risk.text} (AI: {twinOutput.augmentationIndex}%)
            </span>
          </div>
          <p className="text-base text-slate-600 mt-1">
            Reconstructed arterial pulse waveform and diagnostic hemodynamic reflection landmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveToHistory}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition border ${
              isSaved
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            {isSaved ? <Check size={18} /> : <BookmarkPlus size={18} />}
            <span>{isSaved ? 'Saved to History' : 'Save Record to History'}</span>
          </button>
        </div>
      </div>

      {/* Convenient Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveViewMode('dual')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === 'dual'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Activity size={18} />
          <span>Dual View (Wave + 3D Artery)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('3d')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === '3d'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Box size={18} />
          <span>3D Artery Only (Full View)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('chart')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === 'chart'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Activity size={18} />
          <span>Waveform Only</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('diseases')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === 'diseases'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={18} />
          <span>Risk Screening</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('telemetry')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === 'telemetry'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Tv size={18} />
          <span>Bedside Monitor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('matlab')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeViewMode === 'matlab'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Code size={18} />
          <span>MATLAB ODE Studio</span>
        </button>
      </div>

      {/* Mode 1: Dual View (Waveform Graph + 3D Artery Side-by-Side) */}
      {activeViewMode === 'dual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 cols: Interactive Waveform */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="text-indigo-600" size={18} />
                    <span>Carotid Pressure Waveform</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Tc = {physiology.cardiacCycle}s · {inputData.heartRate} bpm · MAP {physiology.map} mmHg
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFlowOverlay(!showFlowOverlay)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                    showFlowOverlay
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {showFlowOverlay ? 'Hide Flow' : 'Overlay Q(t)'}
                </button>
              </div>

              <div className="w-full h-80 sm:h-[400px]">
                {renderWaveformChart()}
              </div>
            </div>

            {/* Right 5 cols: Live 3D Pulsating Vessel */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Box className="text-indigo-600" size={18} />
                    <span>3D Artery Twin (Live WebGL)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pulsating with cardiac cycle ({inputData.heartRate} BPM)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('3d')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Full 3D →
                </button>
              </div>

              <div className="w-full h-80 sm:h-[400px] rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
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
            </div>
          </div>

          {/* 5 Core Diagnostic Metric Cards */}
          {renderDiagnosticCards()}
        </div>
      )}

      {/* Mode 2: Waveform Only View */}
      {activeViewMode === 'chart' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Carotid Pressure Waveform Simulation (Full Width)
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Cardiac Cycle Tc = {physiology.cardiacCycle}s · {inputData.heartRate} bpm · MAP {physiology.map} mmHg
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFlowOverlay(!showFlowOverlay)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  showFlowOverlay
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {showFlowOverlay ? 'Hide Flow Curve' : 'Overlay Blood Flow Q(t)'}
              </button>
            </div>

            <div className="w-full h-96 sm:h-[440px] pt-2">
              {renderWaveformChart()}
            </div>
          </div>

          {/* Core Diagnostic Metric Cards */}
          {renderDiagnosticCards()}
        </div>
      )}

      {/* Mode 2: 3D Pulsating Vessel View */}
      {activeViewMode === '3d' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Box className="text-indigo-600" size={22} />
                  <span>3D Common Carotid Artery (CCA) Biomechanical Twin</span>
                </h2>
                <p className="text-base text-slate-600 mt-0.5">
                  Real-time WebGL simulation pulsating in lockstep with patient heart rate ({inputData.heartRate} bpm) and ODE pressure wave.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${risk.bg} ${risk.color}`}>
                  {risk.text}
                </span>
              </div>
            </div>

            {/* 3D WebGL Canvas */}
            <div className="w-full h-96 sm:h-[480px] rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
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
          </div>

          {/* Straight-to-the-Point Viva & Biomechanics Explanation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} />
              <span>3D Digital Twin: Core Physics & Viva Defense Guide</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-slate-700">
              {/* Card 1: What is it? */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                  <h4>What is the 3D Artery?</h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  It is a personalized, interactive 3D WebGL reconstruction of the patient's <strong>Common Carotid Artery (CCA)</strong>. It models the arterial geometry using the patient's exact lumen radius (<code className="text-indigo-600 font-mono font-semibold">{inputData.arteryRadius} mm</code>) and wall thickness (<code className="text-indigo-600 font-mono font-semibold">{inputData.wallThickness} mm</code>).
                </p>
              </div>

              {/* Card 2: How does it work? */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                  <h4>How Does the Physics Work?</h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  The vessel does not use a canned GIF or pre-rendered loop. Its radial expansion is mathematically coupled in real time to the <strong>4-element Windkessel ODE solution</strong>. Systolic pressure waves cause elastic lumen dilatation based on compliance (<code className="text-indigo-600 font-mono font-semibold">Cv = {physiology.cv.toFixed(4)} mL/mmHg</code>).
                </p>
              </div>

              {/* Card 3: "And What Else?" */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                  <h4>"And What Else Does It Do?"</h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  It simulates <strong>RBC blood particle velocity</strong>, dynamic <strong>Wall Shear Stress (WSS)</strong>, <strong>3/4 cutaway cross-section</strong>, and <strong>atheroma plaque stenosis</strong>. The wall color transitions from green (elastic) to red (calcified stiffness) depending on Weber et al. risk criteria.
                </p>
              </div>
            </div>

            {/* Quick Viva Q&A Pills */}
            <div className="mt-5 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-sm text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <strong className="text-indigo-900 block font-semibold">Viva Pro-Tip:</strong>
                <span>If asked: "Why not just display a 2D line graph?", answer: <em>"The 3D model transforms 1D ODE pressure values into spatial biomechanics—revealing wall strain, shear stress, and intimal remodeling critical for stroke risk assessment."</em></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Disease Pathology Risk Screening */}
      {activeViewMode === 'diseases' && (
        <DiseaseRiskAnalysis
          inputData={inputData}
          physiology={physiology}
          twinOutput={twinOutput}
          onOpenValidationHub={onOpenValidationHub}
        />
      )}

      {/* Mode 4: Bedside Oscilloscope Monitor */}
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

      {/* Mode 5: MATLAB ODE Plotting Studio */}
      {activeViewMode === 'matlab' && (
        <MatlabPlottingStudio
          inputData={inputData}
          physiology={physiology}
          twinOutput={twinOutput}
          onOpenValidationHub={onOpenValidationHub}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-semibold flex items-center gap-2 border border-slate-300 transition"
        >
          <ArrowLeft size={18} />
          <span>Back to Physiology</span>
        </button>

        <button
          type="button"
          onClick={onProceedToHistory}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>View Longitudinal History</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
