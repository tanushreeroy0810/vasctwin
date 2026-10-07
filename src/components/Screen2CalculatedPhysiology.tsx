import React, { useState } from 'react';
import { CalculatedPhysiology, PatientInputData } from '../types';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Heart,
  Layers,
  BookOpen,
} from 'lucide-react';

interface Screen2CalculatedPhysiologyProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  onBack: () => void;
  onProceed: () => void;
  onOpenValidationHub?: () => void;
}

export const Screen2CalculatedPhysiology: React.FC<Screen2CalculatedPhysiologyProps> = ({
  inputData,
  physiology,
  onBack,
  onProceed,
}) => {
  const [showPhysics, setShowPhysics] = useState(false);

  const isMapNormal = physiology.map < 95;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Step 2 of 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Calculated Hemodynamic Physiology
            </h1>
          </div>
          <p className="text-base text-slate-600 mt-1">
            Deterministic Windkessel parameters computed directly from patient biometrics and geometry.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs text-sm">
          <span className="text-slate-500 font-medium">Patient:</span>{' '}
          <strong className="text-slate-900 font-bold">{inputData.patientId || 'PT-8029'}</strong>
          <span className="mx-2 text-slate-300">|</span>
          <span className="text-slate-500 font-medium">BP:</span>{' '}
          <strong className="text-indigo-700 font-bold">{inputData.sbp}/{inputData.dbp} mmHg</strong>
          <span className="mx-2 text-slate-300">|</span>
          <span className="text-slate-500 font-medium">HR:</span>{' '}
          <strong className="text-rose-600 font-bold">{inputData.heartRate} bpm</strong>
        </div>
      </div>

      {/* Primary Hemodynamic Indicators */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
          <Activity size={22} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Core Hemodynamic Results
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-700">MAP</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isMapNormal
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {isMapNormal ? 'Normal (<95)' : 'Elevated (≥95)'}
                </span>
              </div>
              <span className="text-sm text-slate-500 block mt-1">Mean Arterial Pressure</span>
            </div>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-indigo-700">{physiology.map}</span>
              <span className="text-lg font-bold text-slate-600">mmHg</span>
            </div>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
              Pd + 1/3·(Ps − Pd) = {inputData.dbp} + 1/3·({inputData.sbp - inputData.dbp})
            </div>
          </div>

          {/* Cardiac Cycle */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-base font-bold text-slate-700">Cardiac Cycle (Tc)</span>
              <span className="text-sm text-slate-500 block mt-1">Heart Beat Duration</span>
            </div>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{physiology.cardiacCycle}</span>
              <span className="text-lg font-bold text-slate-600">seconds</span>
            </div>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
              Cycle duration for {inputData.heartRate} beats per minute (60 / HR)
            </div>
          </div>

          {/* Mean Flow */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-base font-bold text-slate-700">Mean Flow Rate</span>
              <span className="text-sm text-slate-500 block mt-1">Common Carotid Blood Flow</span>
            </div>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-sky-700">{physiology.flow}</span>
              <span className="text-lg font-bold text-slate-600">mL/s</span>
            </div>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
              Peak: <b>{physiology.peakFlow} mL/s</b> · Stroke Volume: <b>{physiology.strokeVolume} mL</b>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Element Windkessel Model Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Calculator size={22} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              4-Element Windkessel Circuit Parameters
            </h2>
          </div>
          <span className="text-sm font-semibold text-slate-600">
            Total Resistance R: <strong className="text-indigo-700">{physiology.totalR} mmHg·s/mL</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* R1 */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-sm font-bold text-slate-500 uppercase">R1 (Aortic Resistance)</span>
            <div className="text-3xl font-black text-slate-900 my-2">{physiology.r1}</div>
            <span className="text-xs font-semibold text-slate-500 block">mmHg·s/mL</span>
            <p className="text-xs text-slate-500 mt-2">Proximal characteristic impedance of the aortic root</p>
          </div>

          {/* R2 */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-sm font-bold text-slate-500 uppercase">R2 (Peripheral Resistance)</span>
            <div className="text-3xl font-black text-slate-900 my-2">{physiology.r2}</div>
            <span className="text-xs font-semibold text-slate-500 block">mmHg·s/mL</span>
            <p className="text-xs text-slate-500 mt-2">Distal microvascular bed resistance to blood flow</p>
          </div>

          {/* Cv */}
          <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/70">
            <span className="text-sm font-bold text-emerald-800 uppercase">Cv (Arterial Compliance)</span>
            <div className="text-3xl font-black text-emerald-800 my-2">{physiology.cv}</div>
            <span className="text-xs font-semibold text-emerald-700 block">mL/mmHg</span>
            <p className="text-xs text-emerald-800 mt-2">Arterial distensibility and elasticity of the carotid wall</p>
          </div>

          {/* Lv */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <span className="text-sm font-bold text-slate-500 uppercase">Lv (Blood Inertance)</span>
            <div className="text-3xl font-black text-slate-900 my-2">{physiology.lv}</div>
            <span className="text-xs font-semibold text-slate-500 block">mmHg·s²/mL</span>
            <p className="text-xs text-slate-500 mt-2">Inertial mass of the accelerating blood column</p>
          </div>
        </div>
      </div>

      {/* Optional Collapsible Physics Equations (Clean, not bombarding) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowPhysics(!showPhysics)}
          className="w-full p-5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-indigo-600" />
            <div>
              <span className="text-base font-bold text-slate-900 block">
                Technical Circuit &amp; Mathematical Equations (Optional)
              </span>
              <span className="text-sm text-slate-500 block">
                Click to inspect the governing 4-element Windkessel differential equations
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <span>{showPhysics ? 'Hide Equations' : 'Show Equations'}</span>
            {showPhysics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {showPhysics && (
          <div className="p-6 space-y-5 bg-white border-t border-slate-200 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-slate-900 text-slate-200 font-mono">
                <span className="text-indigo-400 font-bold block mb-2">Governing Pressure ODE</span>
                <p className="text-sm leading-relaxed text-amber-300">
                  dP/dt = [(R2 + R1)/(R2 · Cv)] · i(t) + [R1 + 1/(Cv · R2)] · (di/dt) + Lv · (d²i/dt²) − P / (Cv · R2)
                </p>
                <span className="text-xs text-slate-400 block mt-2">
                  Solved using 4th-Order Runge-Kutta (RK4) numerical integration.
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 text-slate-200 font-mono">
                <span className="text-emerald-400 font-bold block mb-2">Patient-Specific Compliance Eq.</span>
                <p className="text-sm leading-relaxed text-emerald-300">
                  Cv = (3 · π · Ri³ · L) / (2 · E · h) · 1.333×10⁻⁷
                </p>
                <span className="text-xs text-slate-400 block mt-2">
                  Ri = {inputData.arteryRadius} mm, h = {inputData.wallThickness} mm, E = {inputData.elasticModulus} MPa.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-semibold flex items-center gap-2 border border-slate-300 transition"
        >
          <ArrowLeft size={18} />
          <span>Edit Patient Vitals</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-3 cursor-pointer"
        >
          <span>Run 3D Digital Twin Simulation</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
