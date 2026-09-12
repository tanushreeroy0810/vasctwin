import React, { useState } from 'react';
import { CalculatedPhysiology, PatientInputData } from '../types';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Compass,
  Zap,
  Info,
  Layers,
  Heart,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

interface Screen2CalculatedPhysiologyProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  onBack: () => void;
  onProceed: () => void;
}

export const Screen2CalculatedPhysiology: React.FC<Screen2CalculatedPhysiologyProps> = ({
  inputData,
  physiology,
  onBack,
  onProceed,
}) => {
  const [showPhysics, setShowPhysics] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              SCREEN 2 OF 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Calculated Physiology
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Computed cardiovascular mechanics, systemic hemodynamics, and 4-element Windkessel circuit parameters.
          </p>
        </div>

        <div className="text-right text-xs sm:text-sm font-mono text-slate-500 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div>Patient: <b className="text-slate-900 font-bold">{inputData.patientId || 'Unspecified'}</b></div>
          <div className="mt-0.5">BP: <b className="text-indigo-700">{inputData.sbp}/{inputData.dbp} mmHg</b> · HR: <b className="text-rose-600">{inputData.heartRate} bpm</b></div>
        </div>
      </div>

      {/* Primary Physiological Variables (MAP, Cardiac cycle, Flow) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-6">
          <div className="flex items-center gap-2.5">
            <Activity size={20} className="text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              Primary Hemodynamic Output
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Paisal et al. (2019) Core Equations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider block">
                MAP
              </span>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">Mean Arterial Pressure (Eq. 2)</span>
            </div>
            <div className="mt-4 mb-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-indigo-700">
                {physiology.map}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-500">mmHg</span>
            </div>
            <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200/60">
              Pd + 1/3·(Ps − Pd) = {inputData.dbp} + 1/3·({inputData.sbp} − {inputData.dbp})
            </div>
          </div>

          {/* Cardiac cycle */}
          <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Cardiac cycle
              </span>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">Period Tc (Eq. 3)</span>
            </div>
            <div className="mt-4 mb-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900">
                {physiology.cardiacCycle}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-500">s</span>
            </div>
            <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200/60">
              Tc = 60 / HR ({inputData.heartRate} bpm)
            </div>
          </div>

          {/* Flow */}
          <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Flow
              </span>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">Mean Carotid Flow Rate Q(t)</span>
            </div>
            <div className="mt-4 mb-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-sky-700">
                {physiology.flow}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-500">mL/s</span>
            </div>
            <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200/60">
              Peak: <b className="text-slate-800 font-mono">{physiology.peakFlow} mL/s</b> · CO: <b className="text-slate-800 font-mono">{physiology.cardiacOutput} L/min</b> · SV: <b className="text-slate-800 font-mono">{physiology.strokeVolume} mL</b>
            </div>
          </div>
        </div>
      </div>

      {/* Windkessel Circuit Parameters (Rv, Lv, Cv, R1, R2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <Calculator size={20} className="text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              4-Element Windkessel Model Parameters
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Paisal et al. (2019) Table 3
          </span>
        </div>

        {/* Clinical Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono">
          {/* Rv */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold">Rv</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-2">{physiology.rv}</div>
            <div className="text-xs text-slate-500 font-medium">mmHg/cm³/s</div>
            <div className="text-xs text-slate-400 mt-1">Arterial Res. (Eq. 12)</div>
          </div>

          {/* Lv */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold">Lv</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-2">{physiology.lv}</div>
            <div className="text-xs text-slate-500 font-medium">mmHg/cm³/s²</div>
            <div className="text-xs text-slate-400 mt-1">Inertance (Eq. 13)</div>
          </div>

          {/* Cv */}
          <div className="p-4 sm:p-5 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between shadow-2xs">
            <div className="text-emerald-800 text-xs sm:text-sm font-bold">Cv</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 my-2">{physiology.cv}</div>
            <div className="text-xs text-emerald-700 font-medium">cm³/mmHg</div>
            <div className="text-xs text-emerald-700 mt-1">Compliance (Eq. 14)</div>
          </div>

          {/* R1 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold">R1</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-2">{physiology.r1}</div>
            <div className="text-xs text-slate-500 font-medium">mmHg/cm³/s</div>
            <div className="text-xs text-slate-400 mt-1">Characteristic Res.</div>
          </div>

          {/* R2 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs">
            <div className="text-slate-500 text-xs sm:text-sm font-bold">R2</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-2">{physiology.r2}</div>
            <div className="text-xs text-slate-500 font-medium">mmHg/cm³/s</div>
            <div className="text-xs text-slate-400 mt-1">Peripheral Res.</div>
          </div>
        </div>

        {/* Detailed Mathematical Reference Strip */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 text-xs sm:text-sm font-mono space-y-2.5 mt-4">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-400 border-b border-slate-800 pb-2.5 gap-2">
            <span>TOTAL SYSTEMIC RESISTANCE R = R1 + R2: <b className="text-white font-bold">{physiology.totalR} mmHg/cm³/s</b></span>
            <span>WOMERSLEY NUMBER &alpha;: <b className="text-white font-bold">{physiology.womersleyAlpha}</b></span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cv computed directly from patient geometry: (3&pi; &middot; {inputData.arteryRadius}³ &middot; {inputData.arteryLength}) / (2 &middot; {inputData.elasticModulus} &middot; {inputData.wallThickness}) &times; 1.333&times;10⁻⁷ = <b className="text-emerald-400 font-bold">{physiology.cv} cm³/mmHg</b>
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Physics & Equations Module */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowPhysics(!showPhysics)}
          className="w-full p-5 bg-slate-50 hover:bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-indigo-600" />
            <div>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider block">
                Model Physics, Circuit Schematic & Mathematical Derivations
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-sans block mt-0.5">
                Paisal et al. (2019) 4-Element Windkessel ODE equations, fluid-electrical analogies, and RK4 solver
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-indigo-600 font-bold">
            <span>{showPhysics ? 'Hide Equations' : 'View Full Physics'}</span>
            {showPhysics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {showPhysics && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Circuit ASCII Diagram & Analogies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs sm:text-sm space-y-3">
                <span className="text-indigo-400 font-bold block text-xs uppercase">
                  4-Element Windkessel Circuit Schematic
                </span>
                <pre className="text-slate-300 text-xs sm:text-sm leading-relaxed overflow-x-auto">
{`    +----[ R1 ]----+---->---[ Lv ]---+----> P(t)
    |                |                |
 i(t)               ---              [ ]
(Flow)            Cv ---              [ ] R2
    |                |                |
    +----------------+----------------+----> GND`}
                </pre>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                  R1: Proximal aortic impedance · Cv: Carotid compliance<br />
                  Lv: Arterial inertance · R2: Distal peripheral resistance
                </div>
              </div>

              {/* Analogies Table */}
              <div className="overflow-x-auto text-xs sm:text-sm font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs">
                      <th className="pb-2">Physiological Property</th>
                      <th className="pb-2">Electrical Analogue</th>
                      <th className="pb-2">Symbol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5">Blood Pressure P(t)</td>
                      <td>Voltage V(t)</td>
                      <td className="font-bold text-indigo-600">P</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Blood Flow Rate Q(t)</td>
                      <td>Current i(t)</td>
                      <td className="font-bold text-sky-600">i</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Arterial Distensibility</td>
                      <td>Capacitor</td>
                      <td className="font-bold text-emerald-600">Cv</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Blood Inertia</td>
                      <td>Inductor</td>
                      <td className="font-bold text-amber-600">Lv</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Vascular Resistance</td>
                      <td>Resistors</td>
                      <td className="font-bold text-rose-600">R1, R2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Evaluated Equations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm font-mono">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <span className="font-bold text-slate-900 block">Equation 24: ODE Pressure Waveform Solver</span>
                <div className="bg-slate-900 text-amber-300 p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed overflow-x-auto">
                  dP/dt = [(R2 + R1)/(R2 · Cv)] · i(t) + [R1 + 1/(Cv · R2)] · (di/dt) + Lv · (d²i/dt²) − P / (Cv · R2)
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-sans">
                  Solved using 4th-order Runge-Kutta (RK4) numerical integration over continuous cycles.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <span className="font-bold text-slate-900 block">Equation 14: Geometric Compliance</span>
                <div className="bg-slate-900 text-emerald-300 p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed overflow-x-auto">
                  Cv = (3 &middot; &pi; &middot; Ri³ &middot; L) / (2 &middot; E &middot; h)
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-sans">
                  Directly incorporates patient ultrasound measurements: inner radius $R_i$, intima-media thickness $h$, artery length $L$, and Young's modulus $E$.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-bold font-mono flex items-center gap-2 border border-slate-300 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
          <span>Edit Patient Input</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-bold font-mono tracking-wide flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
        >
          <span>Run Digital Twin</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
