import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Stethoscope,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  Cpu,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface ClinicalValidationHubProps {
  onClose?: () => void;
}

export const ClinicalValidationHub: React.FC<ClinicalValidationHubProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'validation' | 'limitations' | 'philosophy'>('benefits');

  // The 10 Doctor Benefits from clinical user research (Image 1)
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-5xl w-full">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 border-b border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-xs font-black font-mono tracking-wider uppercase">
                Clinical Validation &amp; Research Defense
              </span>
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                <Scale size={13} className="text-cyan-400" /> Investigational Computational Prototype
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
              Scientific Positioning, Physician Benefits &amp; Model Bounds
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Transparent scientific assessment answering key clinical, viva, and hackathon evaluation questions:
              empirical validation error rates, physician decision-support utility, and the boundary between physiological modeling and clinical diagnosis.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shrink-0"
              title="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs sm:text-sm font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'benefits'
                ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Stethoscope size={15} />
            <span>How the Doctor Benefits (10 Points)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'validation'
                ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 size={15} />
            <span>Validation Error &amp; Benchmarks (2.51–6.45%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('limitations')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'limitations'
                ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers size={15} />
            <span>The 6 Model Limitations &amp; Extensions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('philosophy')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'philosophy'
                ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Cpu size={15} />
            <span>"Physics First, AI Second" Architecture</span>
          </button>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer Callout Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200 px-6 py-4 flex items-start gap-3.5">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-sans">
          <span className="font-bold font-mono uppercase tracking-wider text-amber-950 block mb-0.5">
            Formal Regulatory &amp; Research Prototype Notice:
          </span>
          “The underlying Windkessel model demonstrated <strong>2.51–6.45% reported validation error</strong> in the source study;
          however, our proposed carotid digital twin has not yet been clinically validated for disease diagnosis.
          Further validation against real patient Doppler/ultrasound data is required. Our current prototype should be considered
          an <strong>early-stage computational risk-assessment system</strong>. Its main limitation is that it models hemodynamic behavior
          rather than directly observing disease; therefore, real patient data, imaging and clinical validation are required before it can be used for diagnosis.”
        </div>
      </div>

      <div className="p-6 sm:p-8 overflow-y-auto max-h-[68vh] space-y-6">
        {/* TAB 1: 10 DOCTOR BENEFITS */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900">
                  How the Doctor Benefits: 10 Clinical Advantages
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Direct clinical translation comparing standard cuff sphygmomanometry against personalized digital twin vascular intelligence.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                10 Clinical Use Cases
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorBenefits.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-slate-900 text-cyan-400">
                        0{item.id}. {item.need}
                      </span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {item.benefit}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-700 font-mono font-semibold">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                    <span>Clinical impact: {item.clinicalImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VALIDATION ERROR & BENCHMARKS */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900">
                Validation Accuracy in Reference Research
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Why we report 2.51%–6.45% error rather than claiming a blanket "95% accuracy".
              </p>
            </div>

            {/* Validation Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">Benchmark Dataset 1</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-black">
                    2.51% Reported Error
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-mono">
                  Kingwell et al. Carotid In-Vivo Cohort
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The 4-element Windkessel numerical ODE simulation showed an error of approximately <strong>2.51%</strong> when compared
                  directly against measured carotid artery pressure waveforms under normotensive conditions.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                  Reflected wave timing and dicrotic notch matching: High fidelity in young normotensive adults.
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">Benchmark Dataset 2</span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-mono font-black">
                    6.45% Reported Error
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-mono">
                  Nichols et al. Central Hemodynamic Dataset
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  When evaluated against the widely cited Nichols et al. carotid pressure waveform dataset, the 4-element
                  formulation achieved a <strong>6.45% validation error</strong> across the full cardiac cycle.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                  Minor divergence observed primarily around the late-systolic inflection point (P1 to P2 transition).
                </div>
              </div>
            </div>

            {/* Why Not Say "95% Accurate"? */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                <HelpCircle size={15} />
                <span>Viva / Hackathon Defense: Why Avoid Saying "The Model is 95% Accurate"</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Claiming a generic “95% accuracy” is scientifically flawed because hemodynamic accuracy depends on:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Specific artery modeled (Carotid vs Aorta vs Femoral)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Order of the Windkessel model (2, 3, or 4 elements)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Quality and resolution of the input velocity waveform
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Specific patient demographic and disease state
                </li>
              </ul>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-emerald-400">
                <strong>Recommended Scientific Answer:</strong> “In the reference study we build upon, the four-element Windkessel model demonstrated reported errors of 2.51% and 6.45% against measured normotensive carotid waveforms.”
              </div>
            </div>

            {/* Sphygmomanometer vs Digital Twin */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900">
                Why is our Digital Twin different from a Sphygmomanometer?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-mono font-bold text-slate-600 block uppercase">Sphygmomanometer (BP Cuff)</span>
                  <div className="font-bold text-slate-900 text-sm">Answers: “What is the blood pressure right now?”</div>
                  <p className="text-slate-600 font-sans leading-relaxed">
                    Provides a snapshot measurement (e.g. 120/80 mmHg). Excellent for routine vital signs, but reveals nothing about vascular compliance, blood inertia, or wave reflection timing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                  <span className="font-mono font-bold text-indigo-700 block uppercase">Carotid Digital Twin</span>
                  <div className="font-bold text-slate-900 text-sm">Answers: “How does this person's vascular system behave &amp; change?”</div>
                  <p className="text-slate-700 font-sans leading-relaxed">
                    Personalizes resistance, compliance, and inertance; predicts the continuous pressure waveform; enables longitudinal tracking; and provides "what-if" simulation of arterial remodeling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THE 6 RESEARCH LIMITATIONS */}
        {activeTab === 'limitations' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900">
                6 Foundational Limitations of the Source Literature &amp; Our Extensions
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Transforming academic research gaps into a defensible startup and translational innovation narrative.
              </p>
            </div>

            <div className="space-y-3">
              {paperLimitations.map((lim) => (
                <div key={lim.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-slate-900 font-mono text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {lim.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
                      <span className="font-mono font-bold text-rose-800 uppercase block text-[10px]">
                        Literature Limitation:
                      </span>
                      <p className="text-rose-950 font-sans leading-relaxed">{lim.sourceLimitation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <span className="font-mono font-bold text-emerald-800 uppercase block text-[10px]">
                        Our Digital Twin Extension:
                      </span>
                      <p className="text-emerald-950 font-sans leading-relaxed">{lim.twinExtension}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PHYSICS FIRST, AI SECOND */}
        {activeTab === 'philosophy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900">
                "Physics First, AI Second" Architecture
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Why pure end-to-end black-box AI fails in clinical medicine, and why biomechanics must lead.
              </p>
            </div>

            {/* Visual Architecture Flow */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                VascTwin Pipeline Architecture:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center mx-auto">1</div>
                  <div className="font-bold text-xs text-slate-800">Biometrics &amp; Flow</div>
                  <div className="text-[11px] font-mono text-slate-500">BP, HR, Carotid Ri, h, Ultrasound Q(t)</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center mx-auto">2</div>
                  <div className="font-bold text-xs text-indigo-900">4-Element Windkessel</div>
                  <div className="text-[11px] font-mono text-indigo-600">Calculates R1, R2, Cv, Lv, ODE Solver</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center mx-auto">3</div>
                  <div className="font-bold text-xs text-indigo-900">Physiological Waveform</div>
                  <div className="text-[11px] font-mono text-indigo-600">Extracts MAP, PP, AI, P1, P2, Tr</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-cyan-200 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-cyan-600 text-white font-mono text-xs flex items-center justify-center mx-auto">4</div>
                  <div className="font-bold text-xs text-cyan-900">Pattern Screening</div>
                  <div className="text-[11px] font-mono text-cyan-700">Identifies abnormal multi-marker trends</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold font-mono text-slate-900 text-sm">Why Not Just Use Pure Machine Learning?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Pure machine learning models trained directly on raw inputs identify statistical correlations but lack physiological interpretability. When an ML model predicts an abnormality, it cannot explain whether the defect is driven by decreased compliance, increased proximal impedance, or early reflected wave augmentation.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold font-mono text-slate-900 text-sm">Our Hybrid Solution</h4>
                <p className="text-slate-600 leading-relaxed">
                  The physics-based 4-element Windkessel first transforms raw pressure and flow into deterministic biomechanical variables (resistance, compliance, inertia). The analytics layer then screens for patterns across these explainable metrics, guaranteeing clinical interpretability.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Close / Dismiss Action */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500">
          Source references: Nichols et al. · Kingwell et al. · Paisal et al. (2019)
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition shadow-xs"
          >
            Acknowledge &amp; Return
          </button>
        )}
      </div>
    </div>
  );
};
