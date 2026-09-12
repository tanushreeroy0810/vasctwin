import {
  PatientInputData,
  CalculatedPhysiology,
  DigitalTwinOutput,
  ConditionAnchor,
  SimulationResult,
  RiskClassification,
} from '../types';

// Paisal et al. 2019 Empirical Anchors
export const NBP_ANCHOR: ConditionAnchor = {
  name: 'Normal Blood Pressure',
  ps: 117,
  pd: 71,
  omega: 8.302,
  Ri: 3.100,
  h: 0.390,
  E: 0.4000,
  R1: 1.6753,
  R2: 5.9953,
  Lv: 0.0640,
  AI: 9.77,
  a: [0.3782, -0.1812, 0.1276, -0.08981, 0.04347, -0.05412, 0.02642, 0.008946, -0.009005],
  b: [0, -0.07725, 0.01466, 0.004295, -0.06679, 0.05679, -0.01878, 0.01869, -0.01888],
};

export const PH_ANCHOR: ConditionAnchor = {
  name: 'Pre-Hypertension',
  ps: 124,
  pd: 81,
  omega: 8.607,
  Ri: 3.027,
  h: 0.463,
  E: 0.4824,
  R1: 2.1278,
  R2: 6.2638,
  Lv: 0.0673,
  AI: 14.94,
  a: [0.4009, -0.1616, 0.1073, -0.08038, 0.06128, -0.06997, 0.03333, -0.01044, 0.01131],
  b: [0, -0.1169, 0.04827, -0.02247, -0.02642, 0.01599, -0.0002684, 0.0136, -0.01632],
};

export const HS1_ANCHOR: ConditionAnchor = {
  name: 'Hypertension Stage 1',
  ps: 148,
  pd: 96,
  omega: 7.878,
  Ri: 2.990,
  h: 0.500,
  E: 0.6521,
  R1: 2.6511,
  R2: 7.1542,
  Lv: 0.0691,
  AI: 25.17,
  a: [0.4119, -0.2122, 0.1478, -0.06878, 0.003649, 0.01622, -0.01642, 0.01418, -0.0152],
  b: [0, -0.07103, -0.02544, 0.03135, -0.05162, 0.05005, -0.02426, -0.001858, 0.0148],
};

// Physical Constants (Paisal et al. Section 2.2)
export const DYNAMIC_VISCOSITY_MU = 0.0035; // N*s/m2
export const BLOOD_DENSITY_RHO = 1060; // kg/m3
export const MM3_MPA_TO_CM3_MMHG = 1.33322e-7;

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const lerpArray = (a: number[], b: number[], f: number) =>
  a.map((v, i) => lerp(v, b[i], f));

export function getBPBracket(sys: number) {
  if (sys <= NBP_ANCHOR.ps) {
    return { A: NBP_ANCHOR, B: NBP_ANCHOR, frac: 0 };
  }
  if (sys <= PH_ANCHOR.ps) {
    return {
      A: NBP_ANCHOR,
      B: PH_ANCHOR,
      frac: (sys - NBP_ANCHOR.ps) / (PH_ANCHOR.ps - NBP_ANCHOR.ps),
    };
  }
  if (sys <= HS1_ANCHOR.ps) {
    return {
      A: PH_ANCHOR,
      B: HS1_ANCHOR,
      frac: (sys - PH_ANCHOR.ps) / (HS1_ANCHOR.ps - PH_ANCHOR.ps),
    };
  }
  return {
    A: PH_ANCHOR,
    B: HS1_ANCHOR,
    frac: Math.min(1 + (sys - HS1_ANCHOR.ps) / 30, 1.8),
  };
}

/**
 * Calculates Compliance Cv using Eq. 14 from measured geometry:
 * Cv = (3 * pi * Ri^3 * L) / (2 * E * h)
 */
export function calculateCv(Ri_mm: number, h_mm: number, L_mm: number = 192.5, E_MPa: number = 0.48): number {
  const numerator = (3 * Math.PI / 2) * Math.pow(Ri_mm, 3) * L_mm;
  const denominator = Math.max(E_MPa, 0.01) * Math.max(h_mm, 0.01);
  return (numerator / denominator) * MM3_MPA_TO_CM3_MMHG;
}

export function cvFromGeometry(Ri_mm: number, h_mm: number, E_MPa: number = 0.48): number {
  return calculateCv(Ri_mm, h_mm, 192.5, E_MPa);
}

/**
 * Calculates Womersley Number alpha (Eq. 9)
 */
export function calculateWomersley(Ri_mm: number, hr: number): number {
  const Ri_m = Ri_mm * 1e-3;
  const f = hr / 60;
  const omega_HR = 2 * Math.PI * f;
  return Ri_m * Math.sqrt((omega_HR * BLOOD_DENSITY_RHO) / DYNAMIC_VISCOSITY_MU);
}

/**
 * Fry coefficients cv and cu from Figure 6
 */
export function calculateFry(alpha: number): { cv: number; cu: number } {
  const cv = Math.max(1.12, 1.34 - 0.022 * alpha);
  const cu = Math.max(1.0, 0.92 + 0.125 * alpha);
  return { cv, cu };
}

/**
 * Velocity Fourier evaluation (Eq. 1)
 */
export function evalFourierVelocity(t: number, o: { omega: number; a: number[]; b: number[] }): number {
  let v = o.a[0];
  for (let n = 1; n <= 8; n++) {
    const angle = n * o.omega * t;
    v += o.a[n] * Math.cos(angle) + o.b[n] * Math.sin(angle);
  }
  return v;
}

export function evalFourierDV(t: number, o: { omega: number; a: number[]; b: number[] }): number {
  let v = 0;
  for (let n = 1; n <= 8; n++) {
    const nw = n * o.omega;
    const angle = nw * t;
    v += -o.a[n] * nw * Math.sin(angle) + o.b[n] * nw * Math.cos(angle);
  }
  return v;
}

export function evalFourierD2V(t: number, o: { omega: number; a: number[]; b: number[] }): number {
  let v = 0;
  for (let n = 1; n <= 8; n++) {
    const nw = n * o.omega;
    const angle = nw * t;
    v += -o.a[n] * nw * nw * Math.cos(angle) - o.b[n] * nw * nw * Math.sin(angle);
  }
  return v;
}

/**
 * Calculate Screen 2 Physiology values
 */
export function calculatePhysiology(input: PatientInputData): CalculatedPhysiology {
  const sbp = Number(input.sbp) > 0 ? Number(input.sbp) : 120;
  const dbp = Number(input.dbp) > 0 ? Number(input.dbp) : 80;
  const hr = Number(input.heartRate) > 0 ? Number(input.heartRate) : 72;
  const Ri = Number(input.arteryRadius) > 0 ? Number(input.arteryRadius) : 3.05;
  const h = Number(input.wallThickness) > 0 ? Number(input.wallThickness) : 0.45;
  const L = Number(input.arteryLength) > 0 ? Number(input.arteryLength) : 192.5;
  const E = Number(input.elasticModulus) > 0 ? Number(input.elasticModulus) : 0.48;

  // Eq. 2: MAP = Pd + 1/3*(Ps - Pd)
  const map = +(dbp + (sbp - dbp) / 3).toFixed(1);

  // Eq. 3: Tc = 60 / HR
  const cardiacCycle = +(60 / Math.max(hr, 30)).toFixed(2);

  // Cross section area A in cm^2 (Ri in mm => Ri/10 in cm)
  const A_cm2 = Math.PI * Math.pow(Ri / 10, 2);

  // Bracket for cohort parameters
  const { A: condA, B: condB, frac } = getBPBracket(sbp);

  // Womersley & Fry parameters
  const alpha = calculateWomersley(Ri, hr);
  const { cv: fryCv, cu: fryCu } = calculateFry(alpha);

  // Arterial compliance Cv (Eq. 14)
  const cv = +calculateCv(Ri, h, L, E).toFixed(4);

  // Arterial resistance Rv (Eq. 12)
  const Ri_m = Ri * 1e-3;
  const L_m = L * 1e-3;
  const Rv_Pa = L_m * ((8 * DYNAMIC_VISCOSITY_MU * fryCv) / (Math.PI * Math.pow(Ri_m, 4)));
  const rv = +(Rv_Pa * 7.50062e-9).toFixed(4);

  // Arterial inductance Lv (Eq. 13)
  const lv = +lerp(condA.Lv, condB.Lv, frac).toFixed(4);

  // Proximal R1 and Peripheral R2
  const r1 = +lerp(condA.R1, condB.R1, frac).toFixed(4);
  const r2 = +lerp(condA.R2, condB.R2, frac).toFixed(4);
  const totalR = +(r1 + r2).toFixed(4);

  // Flow computation
  let meanVelocity = 0.39; // m/s
  let peakVelocity = 0.92; // m/s

  if (input.velocitySource === 'csv' && input.customVelocityData && input.customVelocityData.length > 0) {
    const sum = input.customVelocityData.reduce((acc, p) => acc + p.v, 0);
    meanVelocity = sum / input.customVelocityData.length;
    peakVelocity = Math.max(...input.customVelocityData.map((p) => p.v));
  } else {
    meanVelocity = lerp(condA.a[0], condB.a[0], frac);
    peakVelocity = 0.94;
  }

  // Flow rate Q = A * V * 100 in mL/s
  const flow = +(100 * A_cm2 * meanVelocity).toFixed(1);
  const peakFlow = +(100 * A_cm2 * peakVelocity).toFixed(1);

  const strokeVolume = +(flow * cardiacCycle).toFixed(1);
  const cardiacOutput = +((strokeVolume * hr) / 1000).toFixed(2);

  return {
    map,
    cardiacCycle,
    flow,
    peakFlow,
    rv: rv > 0 ? rv : 0.1795,
    lv,
    cv,
    r1,
    r2,
    totalR,
    strokeVolume,
    cardiacOutput,
    womersleyAlpha: +alpha.toFixed(2),
    fryCv: +fryCv.toFixed(2),
    fryCu: +fryCu.toFixed(2),
  };
}

/**
 * Calculate Screen 3 Digital Twin Waveform and Landmarks
 */
export function calculateDigitalTwin(
  input: PatientInputData,
  phys: CalculatedPhysiology
): DigitalTwinOutput {
  const sbp = Number(input.sbp) > 0 ? Number(input.sbp) : 120;
  const dbp = Number(input.dbp) > 0 ? Number(input.dbp) : 80;
  const hr = Number(input.heartRate) > 0 ? Number(input.heartRate) : 72;
  const Ri = Number(input.arteryRadius) > 0 ? Number(input.arteryRadius) : 3.05;

  const { A: condA, B: condB, frac } = getBPBracket(sbp);
  const omega = lerp(condA.omega, condB.omega, frac) * (hr / 75);
  const a = lerpArray(condA.a, condB.a, frac);
  const b = lerpArray(condA.b, condB.b, frac);

  const A_cm2 = Math.PI * Math.pow(Ri / 10, 2);
  const Tc = phys.cardiacCycle;
  const steps = 360;
  const dt = Tc / steps;
  const cycles = 4;

  let t = 0;
  let P = phys.map;
  const pts: { t: number; P: number; V: number; Q: number }[] = [];

  const getV = (time: number) => {
    if (input.velocitySource === 'csv' && input.customVelocityData && input.customVelocityData.length > 0) {
      const cycleTime = time % Tc;
      const fracTime = cycleTime / Tc;
      const idx = Math.min(
        input.customVelocityData.length - 1,
        Math.floor(fracTime * input.customVelocityData.length)
      );
      return input.customVelocityData[idx].v;
    }
    return evalFourierVelocity(time, { omega, a, b });
  };

  const getDV = (time: number) => {
    return evalFourierDV(time, { omega, a, b });
  };

  const getD2V = (time: number) => {
    return evalFourierD2V(time, { omega, a, b });
  };

  const dPdt = (time: number, pressure: number) => {
    const vVal = getV(time);
    const dvVal = getDV(time);
    const d2vVal = getD2V(time);

    const i = 100 * A_cm2 * vVal;
    const di = 100 * A_cm2 * dvVal;
    const d2i = 100 * A_cm2 * d2vVal;

    const term1 = ((phys.r2 + phys.r1) / (phys.r2 * phys.cv)) * i;
    const term2 = (phys.r1 + 1 / (phys.cv * phys.r2)) * di;
    const term3 = phys.lv * d2i;
    const term4 = -pressure / (phys.cv * phys.r2);

    return term1 + term2 + term3 + term4;
  };

  const totalSteps = cycles * steps;
  for (let s = 0; s <= totalSteps; s++) {
    const curV = getV(t);
    const curQ = 100 * A_cm2 * curV;
    pts.push({ t, P, V: curV, Q: curQ });

    const k1 = dPdt(t, P);
    const k2 = dPdt(t + dt / 2, P + (dt / 2) * k1);
    const k3 = dPdt(t + dt / 2, P + (dt / 2) * k2);
    const k4 = dPdt(t + dt, P + dt * k3);

    P += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t += dt;
  }

  const lastStart = (cycles - 1) * Tc;
  const rawCycle = pts.filter((p) => p.t >= lastStart);

  const rawPs = Math.max(...rawCycle.map((p) => p.P));
  const rawPd = Math.min(...rawCycle.map((p) => p.P));
  const scale = (input.sbp - input.dbp) / Math.max(rawPs - rawPd, 1e-5);

  const calibratedWaveform = rawCycle.map((p) => ({
    t: +(p.t - lastStart).toFixed(4),
    P: +(input.dbp + (p.P - rawPd) * scale).toFixed(2),
    V: +p.V.toFixed(3),
    Q: +p.Q.toFixed(1),
  }));

  let maxIdx = 0;
  let maxP = -Infinity;
  calibratedWaveform.forEach((p, idx) => {
    if (p.P > maxP) {
      maxP = p.P;
      maxIdx = idx;
    }
  });

  const p1 = maxP;
  const tP1 = calibratedWaveform[maxIdx]?.t ?? 0.38;

  let p2 = +(p1 * 0.93).toFixed(1);
  let tP2 = +(tP1 + 0.12).toFixed(3);

  for (let i = maxIdx + 12; i < Math.min(calibratedWaveform.length - 15, maxIdx + 85); i++) {
    const prev = calibratedWaveform[i - 1]?.P ?? 0;
    const curr = calibratedWaveform[i]?.P ?? 0;
    const next = calibratedWaveform[i + 1]?.P ?? 0;
    if (curr >= prev && curr >= next && curr > input.dbp + (input.sbp - input.dbp) * 0.4) {
      p2 = curr;
      tP2 = calibratedWaveform[i].t;
      break;
    }
  }

  const reflectionTime = Math.round(Math.abs(tP2 - tP1) * 1000) || 120; // ms

  let tDicrotic = +(tP1 + 0.24).toFixed(3);
  for (let i = maxIdx + 20; i < calibratedWaveform.length - 20; i++) {
    const prev = calibratedWaveform[i - 1]?.P ?? 0;
    const curr = calibratedWaveform[i]?.P ?? 0;
    const next = calibratedWaveform[i + 1]?.P ?? 0;
    if (curr <= prev && curr <= next) {
      tDicrotic = calibratedWaveform[i].t;
      break;
    }
  }

  const pulsePressure = input.sbp - input.dbp;
  const baseAI = lerp(condA.AI, condB.AI, frac);
  const stiffnessRatio = (input.wallThickness / input.arteryRadius) / (condA.h / condA.Ri);
  const augmentationIndex = +Math.max(5, Math.min(42, baseAI * Math.pow(stiffnessRatio, 0.65))).toFixed(1);

  return {
    waveform: calibratedWaveform,
    pulsePressure,
    reflectionTime,
    p1: +p1.toFixed(1),
    p2: +p2.toFixed(1),
    augmentationIndex,
    tP1,
    tP2,
    tDicrotic,
  };
}

export function getRiskBand(ai: number): RiskClassification {
  if (ai < 11.7) {
    return {
      name: 'Normal',
      color: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Typical wave reflection amplitude for healthy young arteries.',
    };
  }
  if (ai <= 17.2) {
    return {
      name: 'Elevated',
      color: 'text-amber-700',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Borderline augmentation index. Early reflection velocity increase.',
    };
  }
  return {
    name: 'High Risk',
    color: 'text-rose-700',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Significant pulse wave augmentation indicating advanced vascular stiffness.',
  };
}

export function runSimulation(
  sys: number,
  dia: number,
  hr: number,
  customRi?: number,
  customH?: number
): SimulationResult {
  const dummyInput: PatientInputData = {
    patientId: 'SIM',
    age: 40,
    heartRate: hr,
    sbp: sys,
    dbp: dia,
    arteryRadius: customRi ?? 3.05,
    wallThickness: customH ?? 0.45,
    arteryLength: 192.5,
    elasticModulus: 0.48,
    velocitySource: 'preset',
  };
  const phys = calculatePhysiology(dummyInput);
  const twin = calculateDigitalTwin(dummyInput, phys);
  const { A, B, frac } = getBPBracket(sys);

  return {
    p1: twin.p1,
    p2: twin.p2,
    ai: twin.augmentationIndex,
    tP1: twin.tP1,
    tP2: twin.tP2,
    MAP: phys.map,
    PP: twin.pulsePressure,
    Tc: phys.cardiacCycle,
    R1: phys.r1,
    R2: phys.r2,
    Lv: phys.lv,
    Cv: phys.cv,
    Ri: dummyInput.arteryRadius,
    h: dummyInput.wallThickness,
    E: dummyInput.elasticModulus,
    waveform: twin.waveform,
    bracketA: A.ps,
    bracketB: B.ps,
    frac,
    alpha: phys.womersleyAlpha,
  };
}

export function getAnchorResults() {
  const nbp = runSimulation(NBP_ANCHOR.ps, NBP_ANCHOR.pd, 75, NBP_ANCHOR.Ri, NBP_ANCHOR.h);
  const ph = runSimulation(PH_ANCHOR.ps, PH_ANCHOR.pd, 75, PH_ANCHOR.Ri, PH_ANCHOR.h);
  const hs1 = runSimulation(HS1_ANCHOR.ps, HS1_ANCHOR.pd, 75, HS1_ANCHOR.Ri, HS1_ANCHOR.h);
  return { nbp, ph, hs1 };
}

export const SAMPLE_VELOCITY_CSV = `time_s,velocity_m_s
0.00,0.22
0.05,0.24
0.10,0.25
0.15,0.24
0.20,0.22
0.25,0.20
0.30,0.48
0.35,0.92
0.40,0.76
0.45,0.54
0.50,0.48
0.55,0.38
0.60,0.28
0.65,0.38
0.70,0.32
0.75,0.26
0.80,0.22`;
