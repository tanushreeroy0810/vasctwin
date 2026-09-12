export interface PatientInputData {
  patientId: string;
  age: number;
  heartRate: number; // HR in bpm
  sbp: number; // SBP in mmHg
  dbp: number; // DBP in mmHg
  arteryRadius: number; // Ri in mm
  wallThickness: number; // h in mm
  arteryLength: number; // L in mm (e.g. 192.5 mm)
  elasticModulus: number; // E in MPa (e.g. 0.40 - 0.65 MPa)
  velocitySource: 'preset' | 'csv';
  velocityCsvFileName?: string;
  customVelocityData?: { t: number; v: number }[];
}

export interface CalculatedPhysiology {
  map: number; // MAP (mmHg)
  cardiacCycle: number; // Tc (s)
  flow: number; // Mean flow (mL/s)
  peakFlow: number; // Peak flow (mL/s)
  rv: number; // Arterial resistance (mmHg/cm3/s)
  lv: number; // Arterial inductance (mmHg/cm3/s2)
  cv: number; // Arterial compliance (cm3/mmHg)
  r1: number; // Proximal characteristic resistance (mmHg/cm3/s)
  r2: number; // Peripheral resistance (mmHg/cm3/s)
  totalR: number; // Total peripheral resistance R = R1 + R2
  strokeVolume: number; // SV in mL/beat
  cardiacOutput: number; // CO in L/min
  womersleyAlpha: number; // alpha
  fryCv: number;
  fryCu: number;
}

export interface DigitalTwinOutput {
  waveform: { t: number; P: number; V?: number; Q?: number }[];
  pulsePressure: number; // PP in mmHg
  reflectionTime: number; // TR in ms or s (e.g. 120 ms)
  p1: number; // First systolic peak (mmHg)
  p2: number; // Second systolic peak (mmHg)
  augmentationIndex: number; // AI in %
  tP1: number;
  tP2: number;
  tDicrotic: number;
}

export interface VisitRecord {
  id: string;
  visitLabel: string;
  date: string;
  hr: number;
  map: number;
  resistance: number; // R (total resistance)
  compliance: number; // Cv
  ai: number; // AI %
  sbp: number;
  dbp: number;
  ri: number;
  h: number;
}

export interface ConditionAnchor {
  name: string;
  ps: number;
  pd: number;
  omega: number;
  Ri: number;
  h: number;
  E: number;
  R1: number;
  R2: number;
  Lv: number;
  AI: number;
  a: number[];
  b: number[];
}

export interface WaveformPoint {
  t: number;
  P: number;
  V?: number;
  Q?: number;
}

export interface SimulationResult {
  p1: number;
  p2: number;
  ai: number;
  tP1: number;
  tP2: number;
  MAP: number;
  PP: number;
  Tc: number;
  R1: number;
  R2: number;
  Lv: number;
  Cv: number;
  Ri: number;
  h: number;
  E: number;
  waveform: WaveformPoint[];
  bracketA: number;
  bracketB: number;
  frac: number;
  alpha: number;
}

export interface RiskClassification {
  name: 'Normal' | 'Elevated' | 'High Risk';
  color: string;
  badgeClass: string;
  description: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  medicalRecordNumber: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  lumenRadius: number;
  wallThickness: number;
  clinicalCategory?: string;
  notes: string;
}
