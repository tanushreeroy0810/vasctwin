import React, { useRef, useState, useEffect } from 'react';
import { PatientInputData, PatientProfile } from '../types';
import { PATIENT_PRESETS } from '../data/patientPresets';
import { SAMPLE_VELOCITY_CSV } from '../services/physicsEngine';
import {
  KaggleCardioRecord,
  KAGGLE_DOPPLER_PROFILES,
} from '../data/kaggleDatasets';
import { KaggleDatasetHub } from './KaggleDatasetHub';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  Heart,
  User,
  RotateCcw,
  PlusCircle,
  Database,
  FileSpreadsheet,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface Screen1PatientInputProps {
  inputData: PatientInputData;
  onChange: (updated: Partial<PatientInputData>) => void;
  onProceed: () => void;
  onSelectPresetProfile: (profile: PatientProfile) => void;
}

export const Screen1PatientInput: React.FC<Screen1PatientInputProps> = ({
  inputData,
  onChange,
  onProceed,
  onSelectPresetProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showKaggleHub, setShowKaggleHub] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Local string representation for input fields so users can clear/type without snapback to 0
  const [fields, setFields] = useState({
    patientId: inputData.patientId || '',
    age: inputData.age ? String(inputData.age) : '',
    heartRate: inputData.heartRate ? String(inputData.heartRate) : '',
    sbp: inputData.sbp ? String(inputData.sbp) : '',
    dbp: inputData.dbp ? String(inputData.dbp) : '',
    arteryRadius: inputData.arteryRadius ? String(inputData.arteryRadius) : '',
    wallThickness: inputData.wallThickness ? String(inputData.wallThickness) : '',
    arteryLength: inputData.arteryLength ? String(inputData.arteryLength) : '192.5',
    elasticModulus: inputData.elasticModulus ? String(inputData.elasticModulus) : '0.48',
  });

  // Keep fields synchronized when parent inputData changes externally
  useEffect(() => {
    setFields({
      patientId: inputData.patientId || '',
      age: inputData.age ? String(inputData.age) : '',
      heartRate: inputData.heartRate ? String(inputData.heartRate) : '',
      sbp: inputData.sbp ? String(inputData.sbp) : '',
      dbp: inputData.dbp ? String(inputData.dbp) : '',
      arteryRadius: inputData.arteryRadius ? String(inputData.arteryRadius) : '',
      wallThickness: inputData.wallThickness ? String(inputData.wallThickness) : '',
      arteryLength: inputData.arteryLength ? String(inputData.arteryLength) : '192.5',
      elasticModulus: inputData.elasticModulus ? String(inputData.elasticModulus) : '0.48',
    });
  }, [inputData]);

  const handleFieldChange = (key: keyof typeof fields, value: string) => {
    setValidationWarning(null);
    setFields((prev) => ({ ...prev, [key]: value }));

    if (key === 'patientId') {
      onChange({ patientId: value });
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange({ [key]: num } as any);
    }
  };

  const handleClearToBlank = () => {
    setValidationWarning(null);
    const blank = {
      patientId: '',
      age: '',
      heartRate: '',
      sbp: '',
      dbp: '',
      arteryRadius: '',
      wallThickness: '',
      arteryLength: '192.5',
      elasticModulus: '0.48',
    };
    setFields(blank);
    onChange({
      patientId: '',
      age: 0,
      heartRate: 0,
      sbp: 0,
      dbp: 0,
      arteryRadius: 0,
      wallThickness: 0,
      arteryLength: 192.5,
      elasticModulus: 0.48,
    });
  };

  const handleLoadNormals = () => {
    setValidationWarning(null);
    const standard: PatientInputData = {
      patientId: 'PT-NORM-101',
      age: 35,
      heartRate: 72,
      sbp: 120,
      dbp: 80,
      arteryRadius: 3.10,
      wallThickness: 0.42,
      arteryLength: 192.5,
      elasticModulus: 0.42,
      velocitySource: 'preset',
    };
    onChange(standard);
  };

  const handleProceedCheck = () => {
    const sbpNum = parseFloat(fields.sbp);
    const dbpNum = parseFloat(fields.dbp);
    const hrNum = parseFloat(fields.heartRate);
    const riNum = parseFloat(fields.arteryRadius);
    const hNum = parseFloat(fields.wallThickness);

    if (isNaN(sbpNum) || isNaN(dbpNum) || isNaN(hrNum) || isNaN(riNum) || isNaN(hNum) || sbpNum <= 0) {
      setValidationWarning('Please enter patient vitals (Heart Rate, SBP, DBP) and carotid geometry (Radius, Wall Thickness) before continuing.');
      return;
    }
    if (sbpNum <= dbpNum) {
      setValidationWarning('Systolic Blood Pressure (SBP) must be higher than Diastolic Blood Pressure (DBP).');
      return;
    }
    setValidationWarning(null);
    onProceed();
  };

  const parseCSV = (text: string, fileName: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setCsvError('CSV file must contain a header row and data rows.');
        return;
      }

      const data: { t: number; v: number }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const t = parseFloat(parts[0].trim());
          const v = parseFloat(parts[1].trim());
          if (!isNaN(t) && !isNaN(v)) {
            data.push({ t, v });
          }
        }
      }

      if (data.length === 0) {
        setCsvError('No valid numerical (time, velocity) rows found.');
        return;
      }

      setCsvError(null);
      onChange({
        velocitySource: 'csv',
        velocityCsvFileName: fileName,
        customVelocityData: data,
      });
    } catch (err: any) {
      setCsvError('Failed to parse CSV: ' + err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSV(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleSelectKaggleRecord = (rec: KaggleCardioRecord) => {
    setValidationWarning(null);
    const doppler = KAGGLE_DOPPLER_PROFILES[rec.velocityProfileId];

    onChange({
      patientId: rec.patientCode,
      age: rec.age,
      heartRate: rec.heartRate,
      sbp: rec.sbp,
      dbp: rec.dbp,
      arteryRadius: rec.arteryRadius,
      wallThickness: rec.wallThickness,
      arteryLength: rec.arteryLength,
      elasticModulus: rec.elasticModulus,
      velocitySource: doppler ? 'csv' : 'preset',
      velocityCsvFileName: doppler ? `${doppler.name}.csv` : undefined,
      customVelocityData: doppler ? doppler.samplePoints.map((p) => ({ t: p.t, v: p.v })) : undefined,
    });

    setShowKaggleHub(false);
  };

  const currentRi = parseFloat(fields.arteryRadius) || 3.05;
  const currentH = parseFloat(fields.wallThickness) || 0.45;
  const sbpVal = parseFloat(fields.sbp) || 120;
  const dbpVal = parseFloat(fields.dbp) || 80;
  const pulsePressure = Math.max(0, sbpVal - dbpVal);
  const wallRatio = ((currentH / currentRi) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Title and Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Step 1 of 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Patient Vitals &amp; Carotid Inputs
            </h1>
          </div>
          <p className="text-base text-slate-600 mt-1">
            Choose a quick clinical preset or enter patient biometrics directly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLoadNormals}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold flex items-center gap-2 border border-slate-300 transition"
          >
            <RotateCcw size={16} />
            <span>Reset to Normals</span>
          </button>

          <button
            type="button"
            onClick={handleClearToBlank}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 border border-slate-300 transition"
          >
            <PlusCircle size={16} />
            <span>Blank Form</span>
          </button>
        </div>
      </div>

      {/* 1-Click Clinical Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Quick Patient Presets (1-Click Load)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowKaggleHub(true)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
          >
            <Database size={15} />
            <span>Browse 70,000+ Kaggle Patient Records →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PATIENT_PRESETS.map((p) => {
            const isSelected = fields.patientId === p.medicalRecordNumber || fields.patientId === p.id;
            const badgeColor =
              p.clinicalCategory === 'Normal'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : p.clinicalCategory === 'Pre-Hypertension'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPresetProfile(p)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-400'
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-base text-slate-900">{p.name}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {p.clinicalCategory}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-2">
                  BP: {p.systolicBP}/{p.diastolicBP} mmHg · {p.heartRate} bpm
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Age: {p.age}y · Radius: {p.lumenRadius} mm · Wall: {p.wallThickness} mm
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Form for Patient Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Patient Vitals & Identification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Heart size={20} className="text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">
              1. Patient Vitals
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Patient ID / Code
              </label>
              <input
                type="text"
                value={fields.patientId}
                onChange={(e) => handleFieldChange('patientId', e.target.value)}
                placeholder="e.g. PT-8029"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={fields.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  placeholder="42"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={fields.heartRate}
                  onChange={(e) => handleFieldChange('heartRate', e.target.value)}
                  placeholder="72"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={fields.sbp}
                  onChange={(e) => handleFieldChange('sbp', e.target.value)}
                  placeholder="124"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={fields.dbp}
                  onChange={(e) => handleFieldChange('dbp', e.target.value)}
                  placeholder="84"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 flex items-center justify-between">
              <span>Pulse Pressure: <b className="text-slate-900">{pulsePressure} mmHg</b></span>
              <span className="text-xs text-slate-500">(Normal target: 30–50 mmHg)</span>
            </div>
          </div>
        </div>

        {/* Column 2: Carotid Artery Geometry */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Activity size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              2. Carotid Artery Geometry
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Lumen Radius Ri (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fields.arteryRadius}
                  onChange={(e) => handleFieldChange('arteryRadius', e.target.value)}
                  placeholder="3.05"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
                <span className="text-xs text-slate-500 mt-1 block">Typical: 2.8 – 3.4 mm</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Wall Thickness h (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fields.wallThickness}
                  onChange={(e) => handleFieldChange('wallThickness', e.target.value)}
                  placeholder="0.45"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
                <span className="text-xs text-slate-500 mt-1 block">Typical: 0.35 – 0.55 mm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Elastic Modulus E (MPa)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fields.elasticModulus}
                  onChange={(e) => handleFieldChange('elasticModulus', e.target.value)}
                  placeholder="0.48"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
                <span className="text-xs text-slate-500 mt-1 block">Normal: ~0.40 – 0.50</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Vessel Length L (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fields.arteryLength}
                  onChange={(e) => handleFieldChange('arteryLength', e.target.value)}
                  placeholder="192.5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-medium text-slate-900 transition"
                />
                <span className="text-xs text-slate-500 mt-1 block">Standard CCA: 192.5 mm</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 flex items-center justify-between">
              <span>Wall-to-Lumen Ratio (h/Ri): <b className="text-indigo-700">{wallRatio}%</b></span>
              <span className="text-xs text-slate-500">Normal: 12% – 16%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doppler Blood Velocity Section (Clean & Straight to the Point) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gauge size={20} className="text-cyan-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Ultrasound Doppler Velocity
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Currently using:{' '}
              <span className="font-semibold text-slate-900">
                {inputData.velocitySource === 'csv'
                  ? `Custom CSV (${inputData.velocityCsvFileName || 'Uploaded'})`
                  : 'Calibrated Common Carotid Velocity Profile'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold flex items-center gap-2 border border-slate-300 transition"
            >
              <Upload size={16} />
              <span>Upload CSV</span>
            </button>

            {inputData.velocitySource === 'csv' && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    velocitySource: 'preset',
                    velocityCsvFileName: undefined,
                    customVelocityData: undefined,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
              >
                Use Standard Profile
              </button>
            )}
          </div>
        </div>

        {csvError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{csvError}</span>
          </div>
        )}
      </div>

      {/* Validation Warning Alert */}
      {validationWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-base font-semibold flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Primary Proceed Action Button */}
      <div className="flex items-center justify-end pt-2 pb-6">
        <button
          type="button"
          onClick={handleProceedCheck}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>Calculate Physiology</span>
          <ArrowRight size={22} />
        </button>
      </div>

      {/* Global Kaggle Dataset Hub Modal Overlay */}
      {showKaggleHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <KaggleDatasetHub
              currentInputData={inputData}
              onSelectKaggleRecord={handleSelectKaggleRecord}
              onClose={() => setShowKaggleHub(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
