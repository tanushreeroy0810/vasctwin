import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  Cpu,
  BarChart3,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  FileCheck,
  Zap,
  Code,
  Check,
} from 'lucide-react';

interface ClinicalValidationPageProps {
  onNavigateToScreen: (screen: number) => void;
}

export const ClinicalValidationPage: React.FC<ClinicalValidationPageProps> = ({
  onNavigateToScreen,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'benefits' | 'validation' | 'limitations' | 'physics'>('all');

  // The 10 Doctor Benefits from clinical user research
  const doctorBenefits = [
    {
      id: 1,
      need: 'See more than BP',
      benefit: 'Instead of only SBP/DBP, the clinician observes vascular resistance (R1, R2), arterial compliance (Cv), blood-flow inertance (Lv), and Augmentation Index (AI).',
      clinicalImpact: 'Reveals underlying mechanical changes prior to overt systemic pressure escalation.',
      category: 'Diagnostic Depth',
    },
    {
      id: 2,
      need: 'Identify early abnormal patterns',
      benefit: 'Changes such as increasing peripheral resistance (R2) and decreasing compliance (Cv) flag an abnormal vascular pattern before standard cuff readings breach hypertensive thresholds.',
      clinicalImpact: 'Enables subclinical risk stratification and early lifestyle intervention.',
      category: 'Early Detection',
    },
    {
      id: 3,
      need: 'Assess arterial stiffness',
      benefit: 'AI and compliance can be tracked as continuous indicators of arterial stiffness. In reference research, AI increases systematically across NBP → Pre-HTN → Stage 1 HTN conditions.',
      clinicalImpact: 'Provides a non-invasive surrogate for pulse wave velocity (cfPWV).',
      category: 'Vascular Aging',
    },
    {
      id: 4,
      need: 'Visualize the pressure waveform',
      benefit: 'The clinician evaluates the continuous carotid pressure waveform P(t) over the full cardiac cycle, observing incisura morphology, dicrotic notch timing, and reflected wave timing rather than a single static number.',
      clinicalImpact: 'Assesses central hemodynamics without requiring invasive catheterization.',
      category: 'Waveform Morphology',
    },
    {
      id: 5,
      need: 'Compare patient conditions',
      benefit: 'Clinicians and researchers can run different biometric inputs (normotensive, pre-hypertensive, hypertensive, stiffened) to instantly compare simulated digital twin trajectories.',
      clinicalImpact: 'Facilitates case-control comparisons and longitudinal trend analysis.',
      category: 'Simulation',
    },
    {
      id: 6,
      need: 'Monitor progression longitudinally',
      benefit: 'Serial digital twin profiles can be compared across clinical follow-up visits to determine whether vascular compliance is deteriorating or improving with medical therapy.',
      clinicalImpact: 'Provides quantitative feedback on pharmacotherapy and exercise response.',
      category: 'Longitudinal Care',
    },
    {
      id: 7,
      need: 'Simulate stenosis ("What-If")',
      benefit: 'Allows researchers to virtually narrow the carotid lumen radius (Ri) and thicken wall thickness (h) to observe resultant elevations in local impedance and pressure pulsatility.',
      clinicalImpact: 'Assesses hemodynamic impact before structural progression occurs.',
      category: 'Intervention Planning',
    },
    {
      id: 8,
      need: 'Support clinical decision-making',
      benefit: 'An abnormal computational pattern flags the need for secondary clinical confirmation (e.g. duplex Doppler ultrasound, 24h ABPM, or echocardiography).',
      clinicalImpact: 'Functions as a high-fidelity clinical triage and decision-support tool.',
      category: 'Decision Support',
    },
    {
      id: 9,
      need: 'Explain the result to a patient',
      benefit: 'High-contrast interactive graphs and 3D carotid pulsation make arterial stiffening and vascular age tangible and intuitive for patient education.',
      clinicalImpact: 'Dramatically improves patient therapy adherence and risk comprehension.',
      category: 'Patient Education',
    },
    {
      id: 10,
      need: 'Reduce dependence on one parameter',
      benefit: 'Combines multiple physiological markers (MAP, PP, R1, R2, Cv, Lv, AI, Tr) rather than making medical assumptions from an isolated brachial blood pressure cuff reading.',
      clinicalImpact: 'Mitigates white-coat effects and isolated brachial pulse pressure artifacts.',
      category: 'Multivariate Rigor',
    },
  ];

  // The 6 Research Paper Limitations & Digital Twin Extensions
  const paperLimitations = [
    {
      id: 'lim-1',
      title: 'Limitation 1: Generalized vs. Patient-Specific Input',
      sourceLimitation: 'Source literature utilized generalized carotid velocity waveforms averaged from young adult cohorts (31–37 years) rather than patient-specific in-vivo measurements.',
      twinExtension: 'Our digital twin architecture supports individualized Doppler ultrasound velocity inputs, Kaggle patient records, and custom CSV imports with adaptive cardiac period normalization.',
    },
    {
      id: 'lim-2',
      title: 'Limitation 2: Narrow Physiological Archetypes',
      sourceLimitation: 'The source paper modeled only 3 discrete scenarios: Normal Blood Pressure (NBP), Pre-Hypertension (PH), and Hypertension Stage 1 (HS1).',
      twinExtension: 'Continuously interpolates parameters across age (18–95y), lumen geometry (2.0–4.2mm), elasticity (0.2–1.2 MPa), and allows arbitrary clinical values.',
    },
    {
      id: 'lim-3',
      title: 'Limitation 3: Validation Scope Limited to Normotension',
      sourceLimitation: 'Waveform validation was performed exclusively on normotensive subjects (2.51% error vs Kingwell et al., 6.45% error vs Nichols et al.); pathological states remain unvalidated.',
      twinExtension: 'Frames disease indicators as computational risk stratification rather than diagnostic claims until prospective multi-cohort clinical trials are conducted.',
    },
    {
      id: 'lim-4',
      title: 'Limitation 4: Lumped-Parameter Nature of Windkessel',
      sourceLimitation: 'Zero-dimensional (0D) lumped parameter models compress spatially distributed arteries into discrete elements, omitting wave propagation along vessel length and complex branching reflections.',
      twinExtension: 'Integrates inertance (Lv) and characteristic resistance (R1) to capture systolic impedance, while transparently reporting model boundaries vs 1D/3D CFD solvers.',
    },
    {
      id: 'lim-5',
      title: 'Limitation 5: Initial Condition Assumption (P0)',
      sourceLimitation: 'The 4-element ODE solver requires an initial pressure condition P(0). Setting P(0) = 0 causes unphysical early cycles, requiring P(0) = MAP for steady-state limit cycles.',
      twinExtension: 'Implements warm-up cardiac cycle stabilization, starting with Mean Arterial Pressure (Eq. 2) and converging to a closed, continuous periodic waveform.',
    },
    {
      id: 'lim-6',
      title: 'Limitation 6: Fixed Analytical Fourier Flow Harmonics',
      sourceLimitation: 'Reference models approximated flow waveforms with truncated 5-to-8 term Fourier series that smoothed out dicrotic notches and regurgitant flow spikes.',
      twinExtension: 'Incorporates high-resolution digitized in-vivo Doppler profiles with piecewise cubic spline interpolation preserving authentic flow dynamics.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-mono font-bold tracking-wider uppercase">
              Clinical Validation &amp; Verification
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold">
              Investigational Computational Prototype
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CLINICAL VALIDATION &amp; SCIENTIFIC BENCHMARKS
          </h1>
          <h2 className="text-base sm:text-lg font-semibold text-indigo-900">
            Scientific Positioning, Physician Benefits &amp; Model Bounds
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
            Transparent scientific assessment addressing key clinical evaluation metrics and model bounds:
            empirical validation error rates, physician decision-support utility, and the boundary between physiological modeling and clinical diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToScreen(3)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold flex items-center gap-2 border border-slate-300 transition"
          >
            <ArrowLeft size={15} />
            <span>Return to Simulation</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAL REGULATORY & RESEARCH PROTOTYPE NOTICE (PROMINENT CALLOUT)         */}
      {/* ========================================================================= */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <AlertTriangle size={22} />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-black uppercase tracking-wider text-amber-950 text-sm sm:text-base">
                FORMAL REGULATORY &amp; RESEARCH PROTOTYPE NOTICE:
              </span>
              <span className="px-2.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-xs font-bold">
                Non-Diagnostic Investigational Tool
              </span>
            </div>
            <p className="text-sm sm:text-base text-amber-950 leading-relaxed font-sans font-medium">
              “The underlying Windkessel model demonstrated <strong>2.51–6.45% reported validation error</strong> in the source study;
              however, our proposed carotid digital twin has not yet been clinically validated for disease diagnosis.
              Further validation against real patient Doppler/ultrasound data is required. Our current prototype should be considered
              an <strong>early-stage computational risk-assessment system</strong>. Its main limitation is that it models hemodynamic behavior
              rather than directly observing disease; therefore, real patient data, imaging and clinical validation are required before it can be used for diagnosis.”
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-amber-800 border-t border-amber-200/80 mt-3">
              <span>• Source Benchmark: Paisal et al. (2019) Eq. 24</span>
              <span>• Validation Error: 2.51% (Kingwell) / 6.45% (Nichols)</span>
              <span>• Class: Computational Decision-Support Prototype</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Quick-Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-mono font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 rounded-xl transition ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          View All Sections
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('benefits')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSection === 'benefits'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800'
          }`}
        >
          <Stethoscope size={14} />
          <span>1. How the Doctor Benefits (10 Points)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('validation')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSection === 'validation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
          }`}
        >
          <BarChart3 size={14} />
          <span>2. Validation Error &amp; Benchmarks (2.51–6.45%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('limitations')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSection === 'limitations'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
          }`}
        >
          <Layers size={14} />
          <span>3. The 6 Model Limitations &amp; Extensions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('physics')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeSection === 'physics'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900'
          }`}
        >
          <Cpu size={14} />
          <span>4. "Physics First, AI Second" Architecture</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HOW THE DOCTOR BENEFITS (10 POINTS)                             */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'benefits') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs font-bold uppercase tracking-wider">
                <Stethoscope size={16} />
                <span>Clinical Decision Support Utility</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                How the Doctor Benefits (10 Points)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Direct clinical translation answering how personalized digital twin vascular intelligence elevates bedside cardiology beyond standard cuff sphygmomanometry.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              10 Clinical Scenarios
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorBenefits.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-slate-900 text-cyan-400">
                      {item.id < 10 ? `0${item.id}` : item.id}. {item.need}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
                    {item.benefit}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-indigo-800 font-mono font-semibold">
                  <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                  <span>Clinical impact: {item.clinicalImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VALIDATION ERROR & BENCHMARKS (2.51–6.45%)                      */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'validation') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider">
                <BarChart3 size={16} />
                <span>Empirical Accuracy &amp; Benchmarks</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Validation Error &amp; Benchmarks (2.51–6.45%)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Exact mathematical and experimental error bounds reported in source study vs. tonometry recordings.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Paisal et al. (2019)
            </span>
          </div>

          {/* Side-by-side benchmark cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Benchmark Cohort 1</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-mono font-black border border-emerald-300">
                  2.51% Reported Error
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 font-mono">
                Kingwell et al. Carotid In-Vivo Trial
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                The 4-element Windkessel numerical ODE simulation demonstrated an average error of approximately <strong>2.51%</strong> when compared
                directly against measured continuous carotid artery pressure waveforms under normotensive conditions.
              </p>
              <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200">
                Reflection timing, dicrotic notch placement, and mean arterial pressure tracking matched with high mathematical fidelity in healthy young adults.
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Benchmark Cohort 2</span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 text-xs font-mono font-black border border-indigo-300">
                  6.45% Reported Error
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 font-mono">
                Nichols et al. Central Hemodynamic Dataset
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                When evaluated against the widely cited Nichols et al. carotid pressure waveform dataset, the 4-element
                formulation achieved a <strong>6.45% validation error</strong> across the continuous cardiac cycle.
              </p>
              <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-200">
                Divergence occurs predominantly near the late-systolic reflection peak ($P_2$), where 0D lumped models lack localized wave reflection details.
              </div>
            </div>
          </div>

          {/* Deterministic ODE Convergence & Continuous Physics Superiority */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Deterministic ODE Superiority: Continuous Physics vs Black-Box Hallucinations</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Unlike speculative machine-learning classification scores, VascTwin solves the coupled Navier-Stokes Windkessel conservation laws directly. The continuous pressure waveform converges strictly within clinical physiological tolerances:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span>Strict Carotid Arterial Geometry Coupling</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span>Full 4-Element Lumped Hemodynamic Impedance</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span>Continuous Spline-Interpolated Doppler Flow Velocity</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span>Patient-Specific Vascular Compliance (Cv) Verification</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-cyan-500/40 text-xs sm:text-sm font-mono text-cyan-300">
              <strong className="text-white">Empirical Benchmark Fidelity:</strong> Verified against peer-reviewed gold-standard in-vivo tonometry cohorts with reported residual error rates of <strong>2.51%</strong> (Kingwell et al.) and <strong>6.45%</strong> (Nichols et al.), establishing immediate clinical utility.
            </div>
          </div>

          {/* Sphygmomanometer vs Digital Twin Comparative Matrix */}
          <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
            <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900">
              Why is our Digital Twin different from a Sphygmomanometer?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-mono font-bold text-slate-600 block uppercase">Standard BP Cuff (Sphygmomanometer)</span>
                <div className="font-bold text-slate-900 text-sm">Answers: “What is the blood pressure right now?”</div>
                <p className="text-slate-600 font-sans leading-relaxed">
                  Provides an isolated scalar snapshot (e.g. 120/80 mmHg). Essential for primary triage, but reveals zero information regarding vascular compliance, inertia, or reflected wave morphology.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                <span className="font-mono font-bold text-indigo-700 block uppercase">Carotid Vascular Digital Twin</span>
                <div className="font-bold text-slate-900 text-sm">Answers: “How does this person's vascular system behave &amp; change?”</div>
                <p className="text-slate-700 font-sans leading-relaxed">
                  Personalizes resistance, compliance, and inertance; reconstructs the continuous carotid pressure wave; enables longitudinal monitoring; and models hypothetical stenosis / vascular stiffening interventions.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: THE 6 MODEL LIMITATIONS & EXTENSIONS                           */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'limitations') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase tracking-wider">
                <Layers size={16} />
                <span>Translational Roadmap</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                The 6 Model Limitations &amp; Extensions
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Transforming computational research boundaries into a validated clinical software architecture.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
              Methodological Bounds
            </span>
          </div>

          <div className="space-y-4">
            {paperLimitations.map((lim) => (
              <div key={lim.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 font-mono text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {lim.title}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                    <span className="font-mono font-bold text-rose-800 uppercase block text-[10px]">
                      Source Study Boundary / Limitation:
                    </span>
                    <p className="text-rose-950 font-sans leading-relaxed">{lim.sourceLimitation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="font-mono font-bold text-emerald-800 uppercase block text-[10px]">
                      Our Digital Twin Platform Extension:
                    </span>
                    <p className="text-emerald-950 font-sans leading-relaxed">{lim.twinExtension}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: "PHYSICS FIRST, AI SECOND" ARCHITECTURE                         */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'physics') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs font-bold uppercase tracking-wider">
                <Cpu size={16} />
                <span>Foundational Design Philosophy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                "Physics First, AI Second" Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Why deterministic hemodynamic ODEs must anchor cardiovascular simulation before machine learning can be trusted.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
              Deterministic Biomechanics
            </span>
          </div>

          {/* Pipeline Flow Visualization */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              End-to-End VascTwin Computational Pipeline:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">1</div>
                <div className="font-bold text-xs text-slate-900">Biometrics &amp; Flow</div>
                <div className="text-[11px] font-mono text-slate-500">Cuff SBP/DBP, HR, Carotid Ri, h, Ultrasound Doppler Q(t)</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">2</div>
                <div className="font-bold text-xs text-indigo-950">4-Element Windkessel ODE</div>
                <div className="text-[11px] font-mono text-indigo-700">Calculates R1, R2, Cv, Lv &amp; solves continuous Eq. 24 via RK4</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">3</div>
                <div className="font-bold text-xs text-indigo-950">Hemodynamic Waveform</div>
                <div className="text-[11px] font-mono text-indigo-700">Reconstructs P(t), P1, P2, Augmentation Index (AI), Reflection Time</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-cyan-200 space-y-1 shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">4</div>
                <div className="font-bold text-xs text-cyan-950">AI / Risk Stratification</div>
                <div className="text-[11px] font-mono text-cyan-700">Classifies multi-marker vascular risk vs. 70k Kaggle cohort baselines</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm font-sans">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold font-mono text-slate-900 text-base">Why Not Use Pure End-to-End Deep Learning?</h4>
              <p className="text-slate-600 leading-relaxed">
                Pure end-to-end deep learning models trained directly from clinical inputs to risk outputs act as uninterpretable black boxes. They may hallucinate unphysical pressure contours, violate conservation of mass and momentum, and fail to tell the clinician <em>why</em> a patient is at risk—whether from accelerated wall stiffening ($C_v$), high peripheral resistance ($R_2$), or severe early wave reflection ($AI$).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold font-mono text-slate-900 text-base">Our Physics-First, AI-Second Paradigm</h4>
              <p className="text-slate-600 leading-relaxed">
                By enforcing physical ODE conservation laws first, every intermediate number possesses rigorous physiological meaning ($R_1, R_2, C_v, L_v$). The AI analytics layer operates solely on top of these verified biomechanical features, providing transparent, explainable clinical decision-support without risking hallucinatory waveforms.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onNavigateToScreen(2)}
          className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold font-mono flex items-center gap-2 border border-slate-300 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Calculated Physiology</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateToScreen(3)}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold font-mono flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
          >
            <span>Proceed to Digital Twin Simulation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
