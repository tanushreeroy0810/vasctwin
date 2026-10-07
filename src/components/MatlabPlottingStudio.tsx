import React, { useState, useMemo } from 'react';
import { PatientInputData, CalculatedPhysiology, DigitalTwinOutput } from '../types';
import { generateMatlabScript } from '../services/matlabGenerator';
import {
  Code,
  Download,
  Copy,
  Check,
  Activity,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  Sliders,
  ExternalLink,
  ShieldAlert,
  Info,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';

interface MatlabPlottingStudioProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  twinOutput: DigitalTwinOutput;
  onOpenValidationHub?: () => void;
}

export const MatlabPlottingStudio: React.FC<MatlabPlottingStudioProps> = ({
  inputData,
  physiology,
  twinOutput,
  onOpenValidationHub,
}) => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'script' | 'equation' | 'provenance'>('visualizer');
  const [copied, setCopied] = useState(false);

  // Generate MATLAB script on the fly
  const matlabCode = useMemo(() => {
    return generateMatlabScript(inputData, physiology, twinOutput);
  }, [inputData, physiology, twinOutput]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(matlabCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadMFile = () => {
    const blob = new Blob([matlabCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carotid_windkessel_${inputData.patientId.replace(/[^a-zA-Z0-9_-]/g, '_')}.m`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Phase portrait data: P vs Q
  const phasePortraitData = useMemo(() => {
    return twinOutput.waveform.map((pt) => ({
      Q: pt.Q ?? 0,
      P: pt.P,
      t: pt.t,
    }));
  }, [twinOutput.waveform]);

  // Force decomposition data for the 4 Windkessel terms
  const forceDecompositionData = useMemo(() => {
    const { r1, r2, cv, lv } = physiology;
    const denom = Math.max(r2 * cv, 1e-5);
    const term1Coeff = (r2 + r1) / denom;
    const term2Coeff = r1 + 1 / denom;

    return twinOutput.waveform.map((pt, i, arr) => {
      const i_val = pt.Q ?? 0;
      // Numerical derivative of flow di/dt
      const prev = arr[Math.max(0, i - 1)].Q ?? 0;
      const next = arr[Math.min(arr.length - 1, i + 1)].Q ?? 0;
      const dt = 0.005;
      const di_val = (next - prev) / (2 * dt);
      const d2i_val = (next - 2 * i_val + prev) / (dt * dt);

      const termResistive = term1Coeff * i_val;
      const termCompliance = term2Coeff * di_val;
      const termInertance = lv * d2i_val;
      const termDrainage = -pt.P / denom;
      const dPdt = termResistive + termCompliance + termInertance + termDrainage;

      return {
        t: pt.t,
        termResistive: +termResistive.toFixed(2),
        termCompliance: +termCompliance.toFixed(2),
        termInertance: +termInertance.toFixed(2),
        termDrainage: +termDrainage.toFixed(2),
        dPdt: +dPdt.toFixed(2),
      };
    });
  }, [twinOutput.waveform, physiology]);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold tracking-wider uppercase">
              MATLAB R2024b / GNU Octave
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
              ode45 Dormand-Prince
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>MATLAB Plotting &amp; Windkessel Differential Equation Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Directly integrates mathematical ODE solving for the 4-element carotid Windkessel circuit,
            generates executable MATLAB <code className="text-amber-300">.m</code> scripts, plots multi-panel hemodynamic phase loops,
            and validates empirical vs. simulated data provenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-2 shadow-2xs"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Script' : 'Copy .m Code'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMFile}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-2xs"
          >
            <Download size={14} />
            <span>Download .m File</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-mono font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('visualizer')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'visualizer'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Activity size={14} />
          <span>1. MATLAB Multi-Plot (Figure 1)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equation')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'equation'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Cpu size={14} />
          <span>2. Windkessel ODE Breakdown</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'script'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Code size={14} />
          <span>3. Complete MATLAB Script (.m)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('provenance')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'provenance'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
              : 'hover:bg-amber-50/50 text-amber-800'
          }`}
        >
          <ShieldAlert size={14} className="text-amber-600" />
          <span>4. Data Provenance: Real vs. Simulated</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MATLAB MULTI-PLOT (FIGURE 1 EMULATION)                             */}
      {/* ========================================================================= */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          {/* MATLAB Figure Window Frame */}
          <div className="bg-slate-100 rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
            {/* Window Title Bar */}
            <div className="bg-slate-200 px-4 py-2 border-b border-slate-300 flex items-center justify-between text-xs font-mono text-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <span className="font-bold text-slate-800">
                  Figure 1: Carotid Artery 4-Element Windkessel Twin — {inputData.patientId} [MATLAB ode45 Emulation]
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>grid on</span>
                <span>box on</span>
                <span>colormap: jet</span>
              </div>
            </div>

            {/* Subplots 2x2 Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
              {/* SUBPLOT (2,2,1): Pressure Waveform P(t) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    subplot(2, 2, 1): Arterial Pressure Waveform P(t) [mmHg]
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    AI = {twinOutput.augmentationIndex}%
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={twinOutput.waveform} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 'Time t [s]', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} label={{ value: 'P [mmHg]', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                        formatter={(val: number) => [`${val} mmHg`, 'Pressure P(t)']}
                      />
                      <ReferenceLine y={physiology.map} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `MAP ${physiology.map}`, fill: '#ef4444', fontSize: 9 }} />
                      <ReferenceLine y={inputData.sbp} stroke="#94a3b8" strokeDasharray="2 2" />
                      <ReferenceLine y={inputData.dbp} stroke="#94a3b8" strokeDasharray="2 2" />
                      <Line
                        type="monotone"
                        dataKey="P"
                        stroke="#0072BD"
                        strokeWidth={2.5}
                        dot={false}
                        name="ode45 P(t)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
                  <span>P₁ = {twinOutput.p1} mmHg</span>
                  <span>P₂ = {twinOutput.p2} mmHg</span>
                  <span>ΔT = {twinOutput.reflectionTime} ms</span>
                </div>
              </div>

              {/* SUBPLOT (2,2,2): Inflow Flow Rate Q(t) and Velocity */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    subplot(2, 2, 2): Inflow Flow Rate Q(t) &amp; Velocity V(t)
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Peak {physiology.peakFlow} mL/s
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={twinOutput.waveform} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 'Time t [s]', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: 'Flow Q [mL/s]', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                        formatter={(val: number) => [`${val} mL/s`, 'Carotid Flow Q(t)']}
                      />
                      <Area
                        type="monotone"
                        dataKey="Q"
                        stroke="#D95319"
                        fill="#D95319"
                        fillOpacity={0.25}
                        strokeWidth={2}
                        name="Q(t) [mL/s]"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
                  <span>Mean: {physiology.flow} mL/s</span>
                  <span>Stroke Volume: {physiology.strokeVolume} mL</span>
                  <span>Cardiac Output: {physiology.cardiacOutput} L/min</span>
                </div>
              </div>

              {/* SUBPLOT (2,2,3): Pressure-Flow Phase Portrait (Hysteresis Loop) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    subplot(2, 2, 3): P-Q Phase Portrait (Cardiovascular Hysteresis)
                  </span>
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Cv = {physiology.cv} cm³/mmHg
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={phasePortraitData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="Q" type="number" domain={['auto', 'auto']} tick={{ fontSize: 10 }} label={{ value: 'Flow Q [mL/s]', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                      <YAxis dataKey="P" type="number" domain={['auto', 'auto']} tick={{ fontSize: 10 }} label={{ value: 'Pressure P [mmHg]', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                        formatter={(val: number, name: string) => [val, name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="P"
                        stroke="#7E2F8E"
                        strokeWidth={2.2}
                        dot={false}
                        name="Pressure P [mmHg]"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  <span>Loop area reflects viscoelastic damping &amp; arterial compliance buffering.</span>
                </div>
              </div>

              {/* SUBPLOT (2,2,4): Windkessel Force Decomposition */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    subplot(2, 2, 4): 4 Windkessel Forces Decomposition
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    dP/dt Components
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forceDecompositionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 'Time t [s]', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: 'Force [mmHg/s]', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                      <Line type="monotone" dataKey="termResistive" name="Resistive Push" stroke="#0072BD" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="termCompliance" name="Compliance Rate" stroke="#2CA02C" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="termInertance" name="Inertial Kick" stroke="#EDB120" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="termDrainage" name="Peripheral Drain" stroke="#D95319" dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  <span>Sum equals instantaneous pressure time-rate: dP/dt.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WINDKESSEL ODE MATHEMATICAL DERIVATION                             */}
      {/* ========================================================================= */}
      {activeTab === 'equation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold uppercase tracking-wider">
              Governing Equation (Paisal et al. 2019, Eq. 24)
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              The 4-Element Windkessel Differential Equation
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Applying Kirchhoff's current and voltage laws to the carotid vascular circuit yields the first-order ordinary differential equation (ODE):
            </p>
          </div>

          {/* Master Equation Banner */}
          <div className="bg-slate-900 text-amber-300 rounded-xl p-5 font-mono text-sm sm:text-base overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
            <span className="text-slate-400 block text-xs uppercase mb-1 font-sans font-bold">Continuous ODE Formulation:</span>
            <span className="text-emerald-400 font-bold">dP(t)/dt</span> = 
            <span className="text-sky-300"> [ (R₂ + R₁) / (R₂ · Cv) ]</span> · i(t) 
            + <span className="text-purple-300">[ R₁ + 1 / (Cv · R₂) ]</span> · (di/dt) 
            + <span className="text-amber-300">Lv</span> · (d²i/dt²) 
            − <span className="text-rose-400">[ 1 / (Cv · R₂) ]</span> · P(t)
          </div>

          {/* Substituted Numerical Values for Current Patient */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Evaluated with Current Patient Parameters:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Term 1: Resistive Driving Force</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {((physiology.r2 + physiology.r1) / Math.max(physiology.r2 * physiology.cv, 1e-5)).toFixed(2)} · i(t)
                </span>
                <span className="text-slate-500 text-[11px]">R₁={physiology.r1}, R₂={physiology.r2}</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Term 2: Elastic Rate Factor</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {(physiology.r1 + 1 / Math.max(physiology.r2 * physiology.cv, 1e-5)).toFixed(2)} · (di/dt)
                </span>
                <span className="text-slate-500 text-[11px]">Cv={physiology.cv} cm³/mmHg</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Term 3: Inertial Acceleration</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {physiology.lv.toFixed(4)} · (d²i/dt²)
                </span>
                <span className="text-slate-500 text-[11px]">Lv={physiology.lv} mmHg/(cm³/s²)</span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Term 4: Outflow Dissipation</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  −{(1 / Math.max(physiology.r2 * physiology.cv, 1e-5)).toFixed(2)} · P(t)
                </span>
                <span className="text-slate-500 text-[11px]">Time Constant &tau; = {(physiology.r2 * physiology.cv).toFixed(2)} s</span>
              </div>
            </div>
          </div>

          {/* Physical Interpretation of the 4 Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="font-mono font-bold text-sky-700">R₁: Characteristic Aortic/Carotid Impedance</span>
              <p className="text-slate-600 leading-relaxed">
                Represents the high-frequency characteristic resistance of the proximal vessel. Prevents infinite unphysical pressure spikes during the initial rapid systolic ejection phase.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="font-mono font-bold text-emerald-700">Cv: Arterial Wall Compliance (Eq. 14)</span>
              <p className="text-slate-600 leading-relaxed">
                Derived directly from patient arterial geometry: <code className="font-mono text-emerald-800">Cv = (3·&pi;·Ri³·L) / (2·E·h)</code>. Acts as an elastic energy reservoir storing systolic stroke volume and recoiling during diastole.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="font-mono font-bold text-amber-700">Lv: Blood Mass Inertance (Eq. 13)</span>
              <p className="text-slate-600 leading-relaxed">
                Accounts for the mass and inertia of the accelerating blood column during late systole. Crucial for producing realistic pulse wave reflection notches and timing delay.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
              <span className="font-mono font-bold text-indigo-700">R₂: Systemic Peripheral Resistance</span>
              <p className="text-slate-600 leading-relaxed">
                The resistive friction of the arteriolar bed draining blood toward the capillary microcirculation. Governs the exponential diastolic pressure decay rate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPLETE MATLAB SCRIPT (.M)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'script' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                <span>carotid_windkessel_{inputData.patientId}.m</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Copy and paste this script into MATLAB Editor or GNU Octave and press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">F5 (Run)</kbd>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadMFile}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download .m</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 sm:p-5 font-mono text-xs overflow-x-auto max-h-[600px] border border-slate-800 leading-relaxed select-all">
            {matlabCode}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DATA PROVENANCE: REAL VS. SIMULATED DATA TRANSPARENCY               */}
      {/* ========================================================================= */}
      {activeTab === 'provenance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              Scientific Audit &amp; Data Provenance
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              Have We Used Any Simulated Data?
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              A transparent, scientific breakdown distinguishing <strong>empirical real patient clinical records</strong> from <strong>numerically simulated physical solutions</strong>.
            </p>
          </div>

          {/* Side-by-side comparison table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. What is REAL Empirical Data */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>100% Real Empirical Clinical Data</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-sans leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kaggle 70,000 Patient Examination Records:</strong> Real hospital records containing Systolic BP, Diastolic BP, age, gender, BMI, cholesterol levels, glucose levels, smoking status, and clinical cardiovascular disease diagnoses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Carotid Duplex Ultrasound Doppler Waveforms:</strong> Real clinical sonographic velocity envelopes ($PSV$, $EDV$, resistive indices) digitized from authentic medical ultrasound recordings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Empirical Validation Cohorts:</strong> Validation datasets from Kingwell et al. (2002) and Nichols et al. (2011) applanation tonometry patient trials.
                  </span>
                </li>
              </ul>
            </div>

            {/* 2. What is NUMERICALLY SIMULATED */}
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>What Is Numerically Simulated (And Why)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-sans leading-relaxed">
                <li className="flex items-start gap-2">
                  <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Continuous Arterial Pressure Curve P(t):</strong> Internal carotid pressure cannot be continuously measured without inserting an invasive intra-arterial needle/catheter. Therefore, $P(t)$ is <strong>simulated via the 4-element Windkessel differential equation</strong> (RK4 in browser, ode45 in MATLAB) driven by cuff BP and flow.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Carotid Vessel Wall Geometry ($R_i, h, E$):</strong> When analyzing tabular Kaggle rows lacking raw ultrasound DICOM scans, vessel radius ($R_i$), wall thickness ($h$), and elasticity ($E$) are <strong>calibrated using peer-reviewed allometric biomechanical models</strong> (Langewouters, Reneman).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>3D Pulsatile Vessel Deformation:</strong> The 3D pulsing artery is a dynamic CAD canvas rendering simulated by coupling local internal pressure to wall strain: &Delta;r(t) = r₀ &middot; (&Delta;P(t) / E).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Validation Benchmark Footer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-3 text-amber-950">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong>Reported Validation Accuracy:</strong> The 4-element Windkessel ODE demonstrated a reported validation error of <strong>2.51% to 6.45%</strong> against in-vivo applanation tonometry (Paisal et al. 2019). It serves as an early-stage computational risk assessment prototype, not a standalone diagnostic medical device.
              </div>
            </div>
            {onOpenValidationHub && (
              <button
                type="button"
                onClick={onOpenValidationHub}
                className="px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-mono font-bold shrink-0 hover:bg-amber-950 transition"
              >
                Inspect Clinical Hub
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
