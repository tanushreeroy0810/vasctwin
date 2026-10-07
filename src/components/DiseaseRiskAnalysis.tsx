import React, { useState } from 'react';
import { PatientInputData, CalculatedPhysiology, DigitalTwinOutput } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Heart,
  Brain,
  Activity,
  Flame,
  Stethoscope,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Scale,
  Sparkles,
} from 'lucide-react';
import { ClinicalValidationHub } from './ClinicalValidationHub';

export interface DiseaseAssessment {
  id: string;
  name: string;
  category: 'Vascular' | 'Hypertension' | 'Cardiac' | 'Cerebrovascular' | 'Metabolic & Renal';
  riskLevel: 'Low / Optimal' | 'Borderline' | 'Elevated' | 'High Risk';
  riskScore: number; // 0 to 100
  summary: string;
  primaryBiomarkers: {
    name: string;
    patientValue: string;
    normalThreshold: string;
    status: 'normal' | 'borderline' | 'abnormal';
  }[];
  physiologicalMechanism: string;
  clinicalAction: string;
}

interface DiseaseRiskAnalysisProps {
  inputData: PatientInputData;
  physiology: CalculatedPhysiology;
  twinOutput: DigitalTwinOutput;
  onOpenValidationHub?: () => void;
}

export const evaluateDiseases = (
  inputData: PatientInputData,
  physiology: CalculatedPhysiology,
  twinOutput: DigitalTwinOutput
): DiseaseAssessment[] => {
  const { age, sbp, dbp, arteryRadius, wallThickness, elasticModulus } = inputData;
  const { map, cv, r1, r2, totalR } = physiology;
  const { pulsePressure, reflectionTime, p1, p2, augmentationIndex } = twinOutput;

  // 1. Arterial Stiffening & Vascular Aging (Arteriosclerosis)
  let stiffScore = 0;
  if (cv < 0.016) stiffScore += 35;
  else if (cv < 0.021) stiffScore += 20;
  if (elasticModulus > 0.55) stiffScore += 30;
  else if (elasticModulus > 0.45) stiffScore += 15;
  if (augmentationIndex > 17.2) stiffScore += 25;
  else if (augmentationIndex > 11.7) stiffScore += 12;
  if (reflectionTime < 130) stiffScore += 10;
  const stiffLevel = stiffScore >= 60 ? 'High Risk' : stiffScore >= 35 ? 'Elevated' : stiffScore >= 15 ? 'Borderline' : 'Low / Optimal';

  // 2. Isolated Systolic & Essential Hypertension
  let htnScore = 0;
  if (sbp >= 140 || dbp >= 90) htnScore += 40;
  else if (sbp >= 130 || dbp >= 80) htnScore += 25;
  if (map >= 105) htnScore += 30;
  else if (map >= 98) htnScore += 15;
  if (pulsePressure >= 60) htnScore += 20;
  else if (pulsePressure >= 50) htnScore += 10;
  if (r2 >= 0.88) htnScore += 15;
  const htnLevel = htnScore >= 60 ? 'High Risk' : htnScore >= 35 ? 'Elevated' : htnScore >= 15 ? 'Borderline' : 'Low / Optimal';

  // 3. Carotid Stenosis & Atherosclerotic Remodeling
  let stenosisScore = 0;
  if (arteryRadius < 2.7) stenosisScore += 40;
  else if (arteryRadius < 2.95) stenosisScore += 20;
  if (wallThickness >= 0.55) stenosisScore += 35;
  else if (wallThickness >= 0.48) stenosisScore += 20;
  if (r1 >= 0.095) stenosisScore += 25;
  else if (r1 >= 0.082) stenosisScore += 12;
  const stenosisLevel = stenosisScore >= 60 ? 'High Risk' : stenosisScore >= 35 ? 'Elevated' : stenosisScore >= 15 ? 'Borderline' : 'Low / Optimal';

  // 4. Left Ventricular Hypertrophy (LVH) & Diastolic Overload
  let lvhScore = 0;
  if (p2 >= p1) lvhScore += 40;
  else if (p2 >= p1 - 3) lvhScore += 20;
  if (augmentationIndex >= 17.2) lvhScore += 30;
  else if (augmentationIndex >= 11.7) lvhScore += 15;
  if (totalR >= 0.95) lvhScore += 20;
  else if (totalR >= 0.85) lvhScore += 10;
  if (reflectionTime < 135) lvhScore += 10;
  const lvhLevel = lvhScore >= 60 ? 'High Risk' : lvhScore >= 35 ? 'Elevated' : lvhScore >= 15 ? 'Borderline' : 'Low / Optimal';

  // 5. Diabetic Vasculopathy & Chronic Kidney Disease (CKD)
  let diabeticScore = 0;
  if (cv < 0.015) diabeticScore += 40;
  else if (cv < 0.019) diabeticScore += 20;
  if (pulsePressure >= 60) diabeticScore += 30;
  else if (pulsePressure >= 48) diabeticScore += 15;
  if (elasticModulus >= 0.58) diabeticScore += 20;
  if (r2 >= 0.88) diabeticScore += 15;
  const diabeticLevel = diabeticScore >= 60 ? 'High Risk' : diabeticScore >= 35 ? 'Elevated' : diabeticScore >= 15 ? 'Borderline' : 'Low / Optimal';

  // 6. Cerebrovascular Pulsatility & Microvascular Stroke Risk
  let strokeScore = 0;
  if (pulsePressure >= 55) strokeScore += 35;
  else if (pulsePressure >= 45) strokeScore += 20;
  if (cv < 0.018) strokeScore += 30;
  else if (cv < 0.022) strokeScore += 15;
  if (augmentationIndex >= 16) strokeScore += 25;
  if (reflectionTime < 130) strokeScore += 15;
  const strokeLevel = strokeScore >= 60 ? 'High Risk' : strokeScore >= 35 ? 'Elevated' : strokeScore >= 15 ? 'Borderline' : 'Low / Optimal';

  return [
    {
      id: 'arterial-stiffening',
      name: 'Arterial Stiffening & Vascular Aging',
      category: 'Vascular',
      riskLevel: stiffLevel,
      riskScore: Math.min(stiffScore, 100),
      summary: 'Biological elastance loss in the central carotid arterial conduit wall.',
      primaryBiomarkers: [
        {
          name: 'Compliance (Cv)',
          patientValue: `${cv} cm³/mmHg`,
          normalThreshold: '≥ 0.022 cm³/mmHg',
          status: cv < 0.016 ? 'abnormal' : cv < 0.022 ? 'borderline' : 'normal',
        },
        {
          name: 'Elastic Modulus (E)',
          patientValue: `${elasticModulus} MPa`,
          normalThreshold: '< 0.45 MPa',
          status: elasticModulus > 0.55 ? 'abnormal' : elasticModulus > 0.45 ? 'borderline' : 'normal',
        },
        {
          name: 'Augmentation Index (AI)',
          patientValue: `${augmentationIndex}%`,
          normalThreshold: '< 11.7%',
          status: augmentationIndex > 17.2 ? 'abnormal' : augmentationIndex > 11.7 ? 'borderline' : 'normal',
        },
        {
          name: 'Reflection Time (TR)',
          patientValue: `${reflectionTime} ms`,
          normalThreshold: '≥ 140 ms',
          status: reflectionTime < 130 ? 'abnormal' : reflectionTime < 140 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'Loss of elastin fibers and collagen deposition in the arterial media stiffens the common carotid artery, increasing pulse wave velocity and causing reflected pressure waves to return prematurely during systole.',
      clinicalAction:
        stiffLevel === 'High Risk' || stiffLevel === 'Elevated'
          ? 'Recommended vascular ultrasound screening, evaluation of arterial age discrepancy, reduction of dietary sodium, aerobic exercise, and consideration of RAS inhibitor therapy.'
          : 'Normal vascular compliance for age; maintain current cardiovascular lifestyle and periodic annual monitoring.',
    },
    {
      id: 'hypertension',
      name: 'Isolated Systolic & Essential Hypertension',
      category: 'Hypertension',
      riskLevel: htnLevel,
      riskScore: Math.min(htnScore, 100),
      summary: 'Differentiates vascular resistance-driven vs. compliance-loss hypertension.',
      primaryBiomarkers: [
        {
          name: 'Mean Arterial Pressure (MAP)',
          patientValue: `${map} mmHg`,
          normalThreshold: '< 95 mmHg',
          status: map >= 105 ? 'abnormal' : map >= 98 ? 'borderline' : 'normal',
        },
        {
          name: 'Pulse Pressure (PP)',
          patientValue: `${pulsePressure} mmHg`,
          normalThreshold: '< 50 mmHg',
          status: pulsePressure >= 60 ? 'abnormal' : pulsePressure >= 50 ? 'borderline' : 'normal',
        },
        {
          name: 'Peripheral Resistance (R2)',
          patientValue: `${r2} mmHg/cm³/s`,
          normalThreshold: '< 0.85 mmHg/cm³/s',
          status: r2 >= 0.88 ? 'abnormal' : r2 >= 0.83 ? 'borderline' : 'normal',
        },
        {
          name: 'Resting Blood Pressure',
          patientValue: `${sbp}/${dbp} mmHg`,
          normalThreshold: '< 120/80 mmHg',
          status: sbp >= 140 || dbp >= 90 ? 'abnormal' : sbp >= 130 || dbp >= 80 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'Elevated distal peripheral resistance (R2) increases the steady-state baseline pressure, while diminished proximal compliance exacerbates systolic peak amplitude.',
      clinicalAction:
        htnLevel === 'High Risk' || htnLevel === 'Elevated'
          ? 'Clinical blood pressure confirmation via 24h ambulatory BP monitoring (ABPM), therapeutic titration targeting MAP < 95 mmHg, and lifestyle interventions.'
          : 'Hemodynamics within optimal range; continue preventive routine blood pressure surveillance.',
    },
    {
      id: 'carotid-atherosclerosis',
      name: 'Carotid Stenosis & Atherosclerotic Remodeling',
      category: 'Vascular',
      riskLevel: stenosisLevel,
      riskScore: Math.min(stenosisScore, 100),
      summary: 'Detects luminal encroachment, wall thickening, and characteristic resistance.',
      primaryBiomarkers: [
        {
          name: 'Carotid Lumen Radius (Ri)',
          patientValue: `${arteryRadius} mm`,
          normalThreshold: '≥ 3.00 mm',
          status: arteryRadius < 2.7 ? 'abnormal' : arteryRadius < 2.95 ? 'borderline' : 'normal',
        },
        {
          name: 'Intima-Media Thickness (h)',
          patientValue: `${wallThickness} mm`,
          normalThreshold: '< 0.48 mm',
          status: wallThickness >= 0.55 ? 'abnormal' : wallThickness >= 0.48 ? 'borderline' : 'normal',
        },
        {
          name: 'Proximal Resistance (R1)',
          patientValue: `${r1} mmHg/cm³/s`,
          normalThreshold: '< 0.082 mmHg/cm³/s',
          status: r1 >= 0.095 ? 'abnormal' : r1 >= 0.082 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'Atheromatous plaque accumulation and intimal hyperplasia reduce lumen caliber and thicken vessel walls, accelerating local viscous shear dissipation and elevating proximal impedance R1.',
      clinicalAction:
        stenosisLevel === 'High Risk' || stenosisLevel === 'Elevated'
          ? 'Order high-resolution duplex carotid B-mode ultrasound, assess peak systolic velocity (PSV), evaluate lipid panel, and initiate statin therapy if indicated.'
          : 'No evidence of subclinical luminal remodeling or pathological intimomedial thickening.',
    },
    {
      id: 'lvh-heart-failure',
      name: 'Left Ventricular Hypertrophy & Diastolic Overload',
      category: 'Cardiac',
      riskLevel: lvhLevel,
      riskScore: Math.min(lvhScore, 100),
      summary: 'Calculates myocardial systolic afterload and reflected peak augmentations.',
      primaryBiomarkers: [
        {
          name: 'Reflected Peak (P2 vs P1)',
          patientValue: `P2: ${p2} vs P1: ${p1} mmHg`,
          normalThreshold: 'P2 < P1 (Type C wave)',
          status: p2 >= p1 ? 'abnormal' : p2 >= p1 - 3 ? 'borderline' : 'normal',
        },
        {
          name: 'Augmentation Index (AI)',
          patientValue: `${augmentationIndex}%`,
          normalThreshold: '< 11.7%',
          status: augmentationIndex >= 17.2 ? 'abnormal' : augmentationIndex >= 11.7 ? 'borderline' : 'normal',
        },
        {
          name: 'Total Vascular Impedance',
          patientValue: `${totalR} mmHg/cm³/s`,
          normalThreshold: '< 0.88 mmHg/cm³/s',
          status: totalR >= 0.95 ? 'abnormal' : totalR >= 0.85 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'When wave reflection arrives before aortic valve closure, late-systolic cardiac workload is boosted, compelling left ventricular concentric hypertrophy and impairing diastolic active relaxation.',
      clinicalAction:
        lvhLevel === 'High Risk' || lvhLevel === 'Elevated'
          ? 'Echocardiographic assessment of LV mass index (LVMI), E/e′ ratio for diastolic function, afterload reduction via ACEi/ARB or vasodilating beta-blockers.'
          : 'Low cardiac afterload strain; systolic and diastolic unloading preserved.',
    },
    {
      id: 'diabetic-vasculopathy',
      name: 'Diabetic Vasculopathy & Chronic Kidney Disease',
      category: 'Metabolic & Renal',
      riskLevel: diabeticLevel,
      riskScore: Math.min(diabeticScore, 100),
      summary: 'Tracks severe compliance degradation and microvascular pressure transmission.',
      primaryBiomarkers: [
        {
          name: 'Arterial Compliance (Cv)',
          patientValue: `${cv} cm³/mmHg`,
          normalThreshold: '≥ 0.020 cm³/mmHg',
          status: cv < 0.015 ? 'abnormal' : cv < 0.020 ? 'borderline' : 'normal',
        },
        {
          name: 'Carotid Pulse Pressure (PP)',
          patientValue: `${pulsePressure} mmHg`,
          normalThreshold: '< 50 mmHg',
          status: pulsePressure >= 60 ? 'abnormal' : pulsePressure >= 48 ? 'borderline' : 'normal',
        },
        {
          name: 'Wall Elastic Modulus (E)',
          patientValue: `${elasticModulus} MPa`,
          normalThreshold: '< 0.48 MPa',
          status: elasticModulus >= 0.58 ? 'abnormal' : elasticModulus >= 0.48 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'Advanced glycation end-products (AGEs) cross-link collagen and induce medial calcification (Mönckeberg sclerosis), depriving downstream renal glomerular capillaries of normal pulse attenuation.',
      clinicalAction:
        diabeticLevel === 'High Risk' || diabeticLevel === 'Elevated'
          ? 'Perform urinary albumin-to-creatinine ratio (uACR), eGFR assessment, strict glycemic control, and hemodynamic nephroprotection via SGLT2i/RAS blockade.'
          : 'Vascular elasticity provides adequate hydraulic dampening for microvascular end-organs.',
    },
    {
      id: 'stroke-pulsatility',
      name: 'Cerebrovascular Pulsatility & Microvascular Stroke',
      category: 'Cerebrovascular',
      riskLevel: strokeLevel,
      riskScore: Math.min(strokeScore, 100),
      summary: 'Evaluates hydraulic pulse energy transmission into fragile cerebral microvasculature.',
      primaryBiomarkers: [
        {
          name: 'Carotid Pulse Pressure (PP)',
          patientValue: `${pulsePressure} mmHg`,
          normalThreshold: '< 48 mmHg',
          status: pulsePressure >= 55 ? 'abnormal' : pulsePressure >= 45 ? 'borderline' : 'normal',
        },
        {
          name: 'Arterial Compliance (Cv)',
          patientValue: `${cv} cm³/mmHg`,
          normalThreshold: '≥ 0.021 cm³/mmHg',
          status: cv < 0.018 ? 'abnormal' : cv < 0.022 ? 'borderline' : 'normal',
        },
        {
          name: 'Augmentation Index (AI)',
          patientValue: `${augmentationIndex}%`,
          normalThreshold: '< 11.7%',
          status: augmentationIndex >= 16 ? 'abnormal' : augmentationIndex >= 11.7 ? 'borderline' : 'normal',
        },
      ],
      physiologicalMechanism:
        'The brain is a high-flow, low-impedance organ. Impaired Windkessel buffering in the carotid conduit permits high pulsatile kinetic energy to penetrate penetrator arterioles, causing lipohyalinosis, microbleeds, and lacunes.',
      clinicalAction:
        strokeLevel === 'High Risk' || strokeLevel === 'Elevated'
          ? 'Cerebral MRI consideration for white matter hyperintensities (WMH) or silent lacunar infarcts, aggressive blood pressure modulation, and neurovascular assessment.'
          : 'Carotid conduit provides effective pulse dampening protecting cerebral microcirculation.',
    },
  ];
};

export const DiseaseRiskAnalysis: React.FC<DiseaseRiskAnalysisProps> = ({
  inputData,
  physiology,
  twinOutput,
  onOpenValidationHub,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('arterial-stiffening');
  const [showInternalValidationHub, setShowInternalValidationHub] = useState(false);

  const assessments = evaluateDiseases(inputData, physiology, twinOutput);

  const categories = ['All', 'Vascular', 'Hypertension', 'Cardiac', 'Cerebrovascular', 'Metabolic & Renal'];

  const filteredAssessments = selectedCategory === 'All'
    ? assessments
    : assessments.filter((a) => a.category === selectedCategory);

  const activeDisease = assessments.find((a) => a.id === selectedDiseaseId) || assessments[0];

  const handleOpenHub = () => {
    if (onOpenValidationHub) {
      onOpenValidationHub();
    } else {
      setShowInternalValidationHub(true);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High Risk':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: ShieldAlert,
          color: 'text-rose-600',
          barColor: 'bg-rose-600',
        };
      case 'Elevated':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: AlertTriangle,
          color: 'text-amber-600',
          barColor: 'bg-amber-500',
        };
      case 'Borderline':
        return {
          bg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: Info,
          color: 'text-yellow-600',
          barColor: 'bg-yellow-500',
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: ShieldCheck,
          color: 'text-emerald-600',
          barColor: 'bg-emerald-500',
        };
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Cardiac':
        return Heart;
      case 'Cerebrovascular':
        return Brain;
      case 'Hypertension':
        return Activity;
      case 'Metabolic & Renal':
        return Flame;
      default:
        return Stethoscope;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top Regulatory & Scientific Disclaimer Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-200/60 text-amber-900">
              <Scale size={16} />
            </span>
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-amber-900">
              Clinical Validation Status &amp; Scope Boundary
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenHub}
            className="text-xs font-mono font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
          >
            <span>Doctor Benefits &amp; Benchmarks</span>
            <ChevronRight size={13} />
          </button>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed font-sans text-amber-900/95">
          “The underlying Windkessel model demonstrated <strong>2.51–6.45% reported validation error</strong> in the source study;
          however, our proposed carotid digital twin has not yet been clinically validated for disease diagnosis.
          Further validation against real patient Doppler/ultrasound data is required. Our current prototype should be considered
          an <strong>early-stage computational risk-assessment system</strong>. Its main limitation is that it models hemodynamic behavior
          rather than directly observing disease; therefore, real patient data, imaging and clinical validation are required before it can be used for diagnosis.”
        </p>
      </div>

      {/* Header with Professional Medical Typography */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-cyan-400">
              <Stethoscope size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 tracking-tight">
                  Computational Risk-Assessment &amp; Vascular Pattern Screening
                </h3>
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Non-Diagnostic Prototype
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Multi-parameter hemodynamic biomarker classification derived from 4-element Windkessel compliance, impedance, and wave reflection.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left List + Right Deep-Dive Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Disease Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold px-1">
            Modeled Vascular Pathologies ({filteredAssessments.length})
          </div>
          {filteredAssessments.map((disease) => {
            const badge = getRiskBadge(disease.riskLevel);
            const CatIcon = getCategoryIcon(disease.category);
            const isSelected = disease.id === activeDisease.id;

            return (
              <div
                key={disease.id}
                onClick={() => setSelectedDiseaseId(disease.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900/10'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CatIcon size={15} className="text-slate-500" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {disease.category}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badge.bg}`}>
                    {disease.riskLevel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2 font-mono">{disease.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-sans">{disease.summary}</p>

                {/* Score progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Severity Index</span>
                    <span className="font-bold text-slate-800">{disease.riskScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${badge.barColor}`}
                      style={{ width: `${Math.max(disease.riskScore, 6)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Disease Clinical Details */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-2xl border border-slate-200 p-6 space-y-5">
          {(() => {
            const activeBadge = getRiskBadge(activeDisease.riskLevel);
            const ActiveIcon = getCategoryIcon(activeDisease.category);

            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ActiveIcon size={18} className="text-indigo-600" />
                      <span className="text-xs font-mono text-indigo-700 uppercase font-bold tracking-wider">
                        {activeDisease.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold font-mono text-slate-900 mt-1">{activeDisease.name}</h4>
                  </div>
                  <div className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${activeBadge.bg} flex items-center gap-1.5`}>
                    <activeBadge.icon size={14} />
                    <span>{activeDisease.riskLevel}</span>
                  </div>
                </div>

                {/* Primary Biomarkers Table */}
                <div className="space-y-2">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Calculated Biomarkers vs. Reference Normals
                  </h5>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                          <th className="p-3 font-bold">Biomarker</th>
                          <th className="p-3 font-bold text-center">Patient Value</th>
                          <th className="p-3 font-bold text-center">Target Threshold</th>
                          <th className="p-3 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeDisease.primaryBiomarkers.map((bm) => (
                          <tr key={bm.name} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 font-bold text-slate-800">{bm.name}</td>
                            <td className="p-3 text-center font-black text-slate-900">{bm.patientValue}</td>
                            <td className="p-3 text-center text-slate-500">{bm.normalThreshold}</td>
                            <td className="p-3 text-center">
                              {bm.status === 'abnormal' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Abnormal
                                </span>
                              ) : bm.status === 'borderline' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Borderline
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pathophysiological Mechanism */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                    <TrendingUp size={14} className="text-indigo-600" />
                    <span>Pathophysiological Hemodynamic Rationale</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {activeDisease.physiologicalMechanism}
                  </p>
                </div>

                {/* Recommended Clinical Action Plan */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Decision Support &amp; Investigational Care Guidance</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {activeDisease.clinicalAction}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Internal Modal Fallback if not opened at top-level */}
      {showInternalValidationHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-5xl my-auto">
            <ClinicalValidationHub onClose={() => setShowInternalValidationHub(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
