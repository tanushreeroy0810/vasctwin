import React from 'react';
import { SimulationResult } from '../types';
import { BookOpen, Cpu, ShieldCheck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface ModelPhysicsViewProps {
  result: SimulationResult;
}

export const ModelPhysicsView: React.FC<ModelPhysicsViewProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold tracking-wider">
              Mathematical Biofluid Mechanics
            </span>
            <h2 className="text-xl font-bold mt-2 tracking-tight">
              4-Element Windkessel Hemodynamic Model (Paisal et al., 2019)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Arterial blood pressure simulation in the Common Carotid Artery (CCA) using electrical circuit
              analogy, 8-harmonic Fourier blood velocity input, and patient-specific wall geometry compliance.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-xs font-mono text-slate-300">
            <span>Journal of Adv. Research in</span>
            <span>Fluid Mech. & Thermal Sciences</span>
            <span className="text-indigo-300">Vol 57, Issue 1 (2019) 69-85</span>
          </div>
        </div>
      </div>

      {/* Electrical Circuit Diagram & Analogy */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
          <Cpu size={16} className="text-indigo-600" />
          Electrical Circuit Analogy (Figure 2c & Figure 7)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Schematic SVG */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center">
            <svg viewBox="0 0 460 220" className="w-full h-48 text-slate-200 font-mono text-[11px]">
              {/* Main Source Line */}
              <line x1="20" y1="90" x2="90" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
              <polygon points="65,85 75,90 65,95" fill="#38bdf8" />
              <text x="35" y="80" fill="#38bdf8" fontWeight="bold">i(t) = Q(t)</text>
              <circle cx="20" cy="90" r="5" fill="#38bdf8" />

              {/* R1 Characteristic Resistance */}
              <rect x="90" y="78" width="50" height="24" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" rx="3" />
              <text x="105" y="94" fill="#f8fafc" fontWeight="bold">R1</text>
              <text x="92" y="118" fill="#94a3b8" fontSize="9">Proximal</text>

              {/* Junction to Parallel Branches */}
              <line x1="140" y1="90" x2="200" y2="90" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="200" cy="90" r="4" fill="#e2e8f0" />

              {/* Branch Up: Lv (Inductor) and Cv (Capacitor) */}
              <line x1="200" y1="90" x2="200" y2="40" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="200" y1="40" x2="240" y2="40" stroke="#e2e8f0" strokeWidth="2" />

              {/* Lv Inductor */}
              <path d="M 240 40 Q 248 24 256 40 Q 264 24 272 40 Q 280 24 288 40" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="256" y="22" fill="#f59e0b" fontWeight="bold">Lv</text>
              <text x="238" y="58" fill="#94a3b8" fontSize="9">Inertance</text>

              {/* Cv Capacitor */}
              <line x1="288" y1="40" x2="330" y2="40" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="330" y1="28" x2="330" y2="52" stroke="#10b981" strokeWidth="3" />
              <line x1="338" y1="28" x2="338" y2="52" stroke="#10b981" strokeWidth="3" />
              <text x="325" y="20" fill="#10b981" fontWeight="bold">Cv</text>
              <text x="312" y="68" fill="#94a3b8" fontSize="9">Compliance</text>
              <line x1="338" y1="40" x2="390" y2="40" stroke="#e2e8f0" strokeWidth="2" />

              {/* Branch Down: R2 Peripheral Resistance */}
              <line x1="200" y1="90" x2="200" y2="150" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="200" y1="150" x2="260" y2="150" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="260" y="138" width="55" height="24" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" rx="3" />
              <text x="278" y="154" fill="#f8fafc" fontWeight="bold">R2</text>
              <text x="250" y="178" fill="#94a3b8" fontSize="9">Peripheral Res.</text>
              <line x1="315" y1="150" x2="390" y2="150" stroke="#e2e8f0" strokeWidth="2" />

              {/* Reconnect Right Bus */}
              <line x1="390" y1="40" x2="390" y2="150" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="390" cy="90" r="4" fill="#e2e8f0" />
              <line x1="390" y1="90" x2="440" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="440" cy="90" r="5" fill="#38bdf8" />
              <text x="400" y="115" fill="#38bdf8" fontWeight="bold">P(t)</text>

              {/* Voltage arrows */}
              <path d="M 440 80 C 440 50, 440 30, 440 10" fill="none" stroke="#64748b" strokeDasharray="3 3" />
            </svg>
            <span className="text-[10px] text-slate-400 font-mono text-center">
              4-Element Windkessel Equivalent Circuit (Paisal et al. Eq. 23)
            </span>
          </div>

          {/* Fluid vs Electrical Analog Table */}
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="pb-2">Cardiovascular Variable</th>
                  <th className="pb-2">Circuit Analogy</th>
                  <th className="pb-2">Current Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Blood Flow Rate Q(t)</td>
                  <td className="py-2 text-sky-600">Current i(t)</td>
                  <td className="py-2 font-bold">{result.CO} L/min</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Arterial Blood Pressure P(t)</td>
                  <td className="py-2 text-sky-600">Voltage V(t)</td>
                  <td className="py-2 font-bold">{result.PP + Math.round(result.MAP - result.PP / 3)} / {Math.round(result.MAP - result.PP / 3)} mmHg</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Characteristic Resistance (R1)</td>
                  <td className="py-2 text-indigo-600">Resistor R1</td>
                  <td className="py-2 font-bold">{result.R1} mmHg/cm³/s</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Systemic Peripheral Resistance (R2)</td>
                  <td className="py-2 text-indigo-600">Resistor R2</td>
                  <td className="py-2 font-bold">{result.R2} mmHg/cm³/s</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Carotid Compliance (Cv)</td>
                  <td className="py-2 text-emerald-600">Capacitor C</td>
                  <td className="py-2 font-bold">{result.Cv} cm³/mmHg</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-900 font-sans">Blood Inertia (Lv)</td>
                  <td className="py-2 text-amber-600">Inductor L</td>
                  <td className="py-2 font-bold">{result.Lv} mmHg/cm³/s²</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Equations Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Eq. 24: The 4-Element ODE */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            Governing Differential Equation (Eq. 24)
          </span>
          <div className="my-3 bg-slate-900 text-amber-300 font-mono p-3.5 rounded-lg text-xs overflow-x-auto leading-relaxed">
            dP(t)/dt = [ (R2 + R1) / (R2 · Cv) ] · i(t) <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ [ R1 + 1 / (Cv · R2) ] · (di/dt) <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Lv · (d²i/dt²) <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− P(t) / (Cv · R2)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eq. 24 is solved via 4th-order Runge-Kutta (RK4) integration over continuous cardiac cycles.
            Initial condition is stabilized by setting P₀ = MAP (Paisal et al. Section 3.1 &amp; Figure 9).
          </p>
        </div>

        {/* Eq. 14: Geometric Compliance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            Patient Geometry Compliance (Eq. 14)
          </span>
          <div className="my-3 bg-slate-900 text-emerald-300 font-mono p-3.5 rounded-lg text-xs overflow-x-auto leading-relaxed">
            Cv = (3 · π · Ri³ · L) / (2 · E · h)<br />
            <span className="text-slate-400 text-[11px]">
              Current Evaluation: (3 · π · {result.Ri}³ · 192.5) / (2 · {result.E} · {result.h})<br />
              = <b>{result.Cv}</b> cm³/mmHg
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directly accounts for clinical ultrasound measurements: $R_i$ (lumen inner radius) and $h$ (wall thickness/cIMT),
            arterial length $L = 192.5$ mm, and Young's modulus of elasticity $E$.
          </p>
        </div>

        {/* Eq. 1 & Fourier Velocity series */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            Fourier Velocity Series V(t) (Eq. 1)
          </span>
          <div className="my-3 bg-slate-900 text-sky-300 font-mono p-3.5 rounded-lg text-xs overflow-x-auto leading-relaxed">
            V(t) = a₀ + Σₙ₌₁⁸ [ aₙ · cos(n·ω·t) + bₙ · sin(n·ω·t) ]<br />
            <span className="text-slate-400 text-[11px]">
              Empirical coefficients (Table 1) derived from ultrasound Doppler velocity curves of young adults (Azhim et al.).
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cardiac cycle length is dynamically scaled via &omega; = &omega;₀ &times; (HR / 75) to handle patient heart rate variations.
          </p>
        </div>

        {/* Eq. 25 & Augmentation Index */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            Augmentation Index AI (Eq. 25)
          </span>
          <div className="my-3 bg-slate-900 text-rose-300 font-mono p-3.5 rounded-lg text-xs overflow-x-auto leading-relaxed">
            AI = [ |P₂ − P₁| / Pulse Pressure (PP) ] × 100%<br />
            <span className="text-slate-400 text-[11px]">
              Current: |{result.p2} − {result.p1}| / {result.PP} × 100% = <b>{result.ai}%</b>
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reflects wave reflection amplitude from peripheral arterial branching. Evaluated against Weber et al. benchmarks:
            Normal &lt;11.7%, Elevated 11.7–17.2%, High Risk &gt;17.2%.
          </p>
        </div>
      </div>

      {/* Model Validation Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <b className="text-slate-800">Empirical Clinical Validation:</b> As demonstrated in Paisal et al. Section 3.2 and Figure 10,
          the 4-element Windkessel simulated waveform exhibits small relative error ($E_r$) when benchmarked against clinical applanation
          tonometry and ultrasound datasets: <b>6.45% error</b> compared to Nichols et al. (2011) and <b>2.51% error</b> compared to
          Kingwell et al. (2002).
        </div>
      </div>
    </div>
  );
};
