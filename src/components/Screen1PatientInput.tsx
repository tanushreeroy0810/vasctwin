import React, { useRef, useState, useEffect } from 'react';
import { PatientInputData, PatientProfile } from '../types';
import { PATIENT_PRESETS } from '../data/patientPresets';
import { SAMPLE_VELOCITY_CSV } from '../services/physicsEngine';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Ruler,
  Activity,
  Heart,
  User,
  Sliders,
  Sparkles,
  RotateCcw,
  PlusCircle,
  FileSpreadsheet,
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
  const [dragOver, setDragOver] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showSliders, setShowSliders] = useState(true);
  const [entryMode, setEntryMode] = useState<'manual' | 'preset'>('manual');
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
    arteryLength: inputData.arteryLength ? String(inputData.arteryLength) : '',
    elasticModulus: inputData.elasticModulus ? String(inputData.elasticModulus) : '',
  });

  // Keep fields synchronized when parent inputData changes externally (e.g. preset clicked)
  useEffect(() => {
    setFields({
      patientId: inputData.patientId || '',
      age: inputData.age ? String(inputData.age) : '',
      heartRate: inputData.heartRate ? String(inputData.heartRate) : '',
      sbp: inputData.sbp ? String(inputData.sbp) : '',
      dbp: inputData.dbp ? String(inputData.dbp) : '',
      arteryRadius: inputData.arteryRadius ? String(inputData.arteryRadius) : '',
      wallThickness: inputData.wallThickness ? String(inputData.wallThickness) : '',
      arteryLength: inputData.arteryLength ? String(inputData.arteryLength) : '',
      elasticModulus: inputData.elasticModulus ? String(inputData.elasticModulus) : '',
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
    setEntryMode('manual');
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
    const standard = {
      patientId: 'PT-NEW-01',
      age: 40,
      heartRate: 72,
      sbp: 120,
      dbp: 80,
      arteryRadius: 3.05,
      wallThickness: 0.45,
      arteryLength: 192.5,
      elasticModulus: 0.48,
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
      setValidationWarning('Please enter patient vitals (Heart Rate, SBP, DBP) and carotid geometry (Radius, Wall thickness) before computing.');
      return;
    }
    setValidationWarning(null);
    onProceed();
  };

  const parseCSV = (text: string, fileName: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setCsvError('CSV file must have a header row and at least one data row.');
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
        setCsvError('No valid numerical (time, velocity) rows found in CSV.');
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSV(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    parseCSV(SAMPLE_VELOCITY_CSV, 'azhim_carotid_velocity.csv');
  };

  const currentRi = parseFloat(fields.arteryRadius) || 3.05;
  const currentH = parseFloat(fields.wallThickness) || 0.45;
  const ratio = ((currentH / currentRi) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              SCREEN 1 OF 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Patient Input Parameters
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Input patient-specific biometrics, measured common carotid artery (CCA) geometry, and ultrasound blood velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 flex items-center gap-2 transition shadow-2xs"
          >
            <Sliders size={14} />
            <span>{showSliders ? 'Compact View' : 'Slider View'}</span>
          </button>
        </div>
      </div>

      {/* Input Mode Selector: Manual Direct Entry vs Preset Case Studies */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-700 uppercase tracking-wider">
              Data Entry Mode
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold">
              <button
                type="button"
                onClick={() => setEntryMode('manual')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  entryMode === 'manual'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Manual Input
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('preset')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  entryMode === 'preset'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Load Preset Case Study
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearToBlank}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 transition"
              title="Clear all fields to start entering fresh patient data"
            >
              <PlusCircle size={14} className="text-indigo-600" />
              <span>Blank Form</span>
            </button>

            <button
              type="button"
              onClick={handleLoadNormals}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 transition"
              title="Fill standard reference normal vitals (120/80 mmHg, 72 bpm)"
            >
              <RotateCcw size={14} className="text-slate-500" />
              <span>Reference Normals</span>
            </button>
          </div>
        </div>

        {/* Optional Presets Tray if user toggled or wants quick sample */}
        {entryMode === 'preset' && (
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Select Clinical Case to Populate:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {PATIENT_PRESETS.map((p) => {
                const isSelected = fields.patientId === p.medicalRecordNumber || fields.patientId.includes(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPresetProfile(p);
                      setEntryMode('manual');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          p.clinicalCategory === 'Normal'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.clinicalCategory === 'Pre-Hypertension'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {p.clinicalCategory}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-1.5">
                      {p.age}yo {p.gender} · {p.systolicBP}/{p.diastolicBP} mmHg · {p.heartRate} bpm
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Ri: {p.lumenRadius}mm · Wall h: {p.wallThickness}mm
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Validation alert banner */}
      {validationWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>{validationWarning}</span>
          </div>
          <button
            type="button"
            onClick={handleLoadNormals}
            className="px-3 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold font-mono transition shrink-0"
          >
            Apply Reference Normals
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Demographics & Hemodynamics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Heart size={20} className="text-rose-500" />
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              Patient Vitals & Demographics
            </h3>
          </div>

          <div className="space-y-5">
            {/* Patient ID */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Patient ID
              </label>
              <input
                type="text"
                value={fields.patientId}
                onChange={(e) => handleFieldChange('patientId', e.target.value)}
                placeholder="e.g. PT-8029 or John Doe"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition"
              />
            </div>

            {/* Age & Heart Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Age</span>
                  <span className="font-mono text-slate-500 font-bold">{fields.age || '—'} yr</span>
                </div>
                <input
                  type="number"
                  min={18}
                  max={95}
                  value={fields.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    min={18}
                    max={90}
                    value={parseFloat(fields.age) || 40}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Heart Rate</span>
                  <span className="font-mono text-rose-600 font-bold">{fields.heartRate || '—'} bpm</span>
                </div>
                <input
                  type="number"
                  min={35}
                  max={160}
                  value={fields.heartRate}
                  onChange={(e) => handleFieldChange('heartRate', e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-rose-600 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    min={45}
                    max={130}
                    value={parseFloat(fields.heartRate) || 72}
                    onChange={(e) => handleFieldChange('heartRate', e.target.value)}
                    className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>
            </div>

            {/* SBP and DBP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>SBP (Systolic)</span>
                  <span className="font-mono text-indigo-700 font-bold">{fields.sbp || '—'} mmHg</span>
                </div>
                <input
                  type="number"
                  min={70}
                  max={230}
                  value={fields.sbp}
                  onChange={(e) => handleFieldChange('sbp', e.target.value)}
                  placeholder="e.g. 124"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-indigo-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    min={85}
                    max={190}
                    value={parseFloat(fields.sbp) || 120}
                    onChange={(e) => handleFieldChange('sbp', e.target.value)}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>DBP (Diastolic)</span>
                  <span className="font-mono text-indigo-700 font-bold">{fields.dbp || '—'} mmHg</span>
                </div>
                <input
                  type="number"
                  min={40}
                  max={140}
                  value={fields.dbp}
                  onChange={(e) => handleFieldChange('dbp', e.target.value)}
                  placeholder="e.g. 84"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-indigo-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    min={45}
                    max={120}
                    value={parseFloat(fields.dbp) || 80}
                    onChange={(e) => handleFieldChange('dbp', e.target.value)}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Measured Carotid Artery Geometry & Material Properties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <Ruler size={20} className="text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
                Artery Geometry & Elasticity
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              h/Ri ratio: {ratio}%
            </span>
          </div>

          <div className="space-y-5">
            {/* Artery radius & Wall thickness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Artery radius (Ri)</span>
                  <span className="font-mono text-emerald-700 font-bold">{fields.arteryRadius || '—'} mm</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min={1.5}
                  max={5.0}
                  value={fields.arteryRadius}
                  onChange={(e) => handleFieldChange('arteryRadius', e.target.value)}
                  placeholder="e.g. 3.05"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-emerald-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    step="0.01"
                    min={2.2}
                    max={4.0}
                    value={parseFloat(fields.arteryRadius) || 3.05}
                    onChange={(e) => handleFieldChange('arteryRadius', e.target.value)}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Wall thickness (h)</span>
                  <span className="font-mono text-amber-700 font-bold">{fields.wallThickness || '—'} mm</span>
                </div>
                <input
                  type="number"
                  step="0.005"
                  min={0.2}
                  max={1.0}
                  value={fields.wallThickness}
                  onChange={(e) => handleFieldChange('wallThickness', e.target.value)}
                  placeholder="e.g. 0.45"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-amber-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                {showSliders && (
                  <input
                    type="range"
                    step="0.01"
                    min={0.25}
                    max={0.75}
                    value={parseFloat(fields.wallThickness) || 0.45}
                    onChange={(e) => handleFieldChange('wallThickness', e.target.value)}
                    className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                )}
              </div>
            </div>

            {/* Artery length & Elastic modulus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Artery length</span>
                  <span className="font-mono text-slate-600 font-bold">{fields.arteryLength || '—'} mm</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min={80}
                  max={350}
                  value={fields.arteryLength}
                  onChange={(e) => handleFieldChange('arteryLength', e.target.value)}
                  placeholder="e.g. 192.5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-mono mt-1.5 block">Standard carotid segment L = 192.5 mm</span>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1.5">
                  <span>Elastic modulus</span>
                  <span className="font-mono text-slate-600 font-bold">{fields.elasticModulus || '—'} MPa</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min={0.15}
                  max={2.0}
                  value={fields.elasticModulus}
                  onChange={(e) => handleFieldChange('elasticModulus', e.target.value)}
                  placeholder="e.g. 0.48"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-mono mt-1.5 block">E = 0.40 (Normal) to 0.65 (Hypertension)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Blood velocity data [Upload CSV] */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Activity size={20} className="text-sky-600" />
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              Blood Velocity Data
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSampleCSV}
              className="text-xs sm:text-sm font-mono text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              Load Sample Clinical CSV
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
                className="text-xs sm:text-sm font-mono text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Reset to 8-Harmonic Fourier
              </button>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/50'
              : inputData.velocitySource === 'csv'
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                inputData.velocitySource === 'csv'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {inputData.velocitySource === 'csv' ? (
                <CheckCircle2 size={24} />
              ) : (
                <Upload size={24} />
              )}
            </div>

            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 block">
                {inputData.velocitySource === 'csv'
                  ? `Velocity File Attached: ${inputData.velocityCsvFileName || 'velocity_data.csv'}`
                  : 'Click or drag & drop ultrasound Doppler velocity CSV file'}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 block mt-1">
                {inputData.velocitySource === 'csv'
                  ? `${inputData.customVelocityData?.length || 0} discrete velocity points successfully parsed`
                  : 'Format: time (seconds), velocity (m/s) across carotid cardiac cycle'}
              </span>
            </div>

            <span className="mt-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold font-mono shadow-xs">
              Upload CSV
            </span>
          </div>
        </div>

        {csvError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5 font-mono">
            <AlertCircle size={16} className="shrink-0" />
            <span>{csvError}</span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <span className="text-xs sm:text-sm text-slate-500 font-mono">
          Ready to compute 4-element Windkessel cardiovascular parameters
        </span>
        <button
          type="button"
          onClick={handleProceedCheck}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-bold font-mono tracking-wide flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
        >
          <span>Calculate Physiology</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
