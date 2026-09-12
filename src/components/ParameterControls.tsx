import React from 'react';
import { PatientProfile } from '../types';
import { PATIENT_PRESETS } from '../data/patientPresets';
import { Sliders, User, Ruler, Activity, RefreshCw, Sparkles } from 'lucide-react';

interface ParameterControlsProps {
  patient: PatientProfile;
  onPatientChange: (updated: Partial<PatientProfile>) => void;
  onSelectPreset: (preset: PatientProfile) => void;
  useMeasuredGeometry: boolean;
  onToggleMeasuredGeometry: (val: boolean) => void;
  onResetToBaseline: () => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  patient,
  onPatientChange,
  onSelectPreset,
  useMeasuredGeometry,
  onToggleMeasuredGeometry,
  onResetToBaseline,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
            Patient Parameters & Biometrics
          </h3>
        </div>
        <button
          onClick={onResetToBaseline}
          title="Reset to Healthy Young Baseline"
          className="text-slate-400 hover:text-slate-600 transition p-1 rounded hover:bg-slate-100"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Preset Patient Quick Select */}
      <div>
        <label className="text-[11px] font-mono text-slate-500 font-semibold mb-2 block">
          CLINICAL COHORT PROFILES
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PATIENT_PRESETS.map((preset) => {
            const isSelected = patient.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate">{preset.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      preset.clinicalCategory === 'Normal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : preset.clinicalCategory === 'Pre-Hypertension'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {preset.clinicalCategory}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {preset.systolicBP}/{preset.diastolicBP} · {preset.heartRate} bpm
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Physiological Sliders */}
      <div className="space-y-3.5 pt-1">
        {/* Heart Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Activity size={13} className="text-rose-500" /> Heart Rate (HR)
            </span>
            <span className="font-mono font-bold text-indigo-600">
              {patient.heartRate} <span className="font-normal text-slate-400">bpm</span>
            </span>
          </div>
          <input
            type="range"
            min={45}
            max={120}
            step={1}
            value={patient.heartRate}
            onChange={(e) => onPatientChange({ heartRate: +e.target.value })}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>45 bpm</span>
            <span>75 (ref)</span>
            <span>120 bpm</span>
          </div>
        </div>

        {/* Systolic Blood Pressure */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-700">Systolic BP (Ps)</span>
            <span className="font-mono font-bold text-indigo-600">
              {patient.systolicBP} <span className="font-normal text-slate-400">mmHg</span>
            </span>
          </div>
          <input
            type="range"
            min={90}
            max={180}
            step={1}
            value={patient.systolicBP}
            onChange={(e) => onPatientChange({ systolicBP: +e.target.value })}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>90 mmHg</span>
            <span>117 (NBP)</span>
            <span>180 mmHg</span>
          </div>
        </div>

        {/* Diastolic Blood Pressure */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-700">Diastolic BP (Pd)</span>
            <span className="font-mono font-bold text-indigo-600">
              {patient.diastolicBP} <span className="font-normal text-slate-400">mmHg</span>
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={115}
            step={1}
            value={patient.diastolicBP}
            onChange={(e) => onPatientChange({ diastolicBP: +e.target.value })}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
            <span>50 mmHg</span>
            <span>71 (NBP)</span>
            <span>115 mmHg</span>
          </div>
        </div>

        {/* Patient Age */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <User size={13} className="text-slate-400" /> Patient Age
            </span>
            <span className="font-mono font-bold text-slate-700">
              {patient.age} <span className="font-normal text-slate-400">years</span>
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={85}
            step={1}
            value={patient.age}
            onChange={(e) => onPatientChange({ age: +e.target.value })}
            className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Ultrasound Geometry Personalization Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="pr-2">
            <span className="text-xs font-bold text-slate-800 block">
              Patient Ultrasound Geometry (Eq. 14)
            </span>
            <span className="text-[10px] text-slate-500 block">
              {useMeasuredGeometry
                ? 'Personalized lumen Ri & wall thickness h'
                : 'Using BP-interpolated cohort baseline'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleMeasuredGeometry(!useMeasuredGeometry)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              useMeasuredGeometry ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                useMeasuredGeometry ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Geometry Inputs (Active when toggle is ON) */}
        <div
          className={`space-y-3 mt-3 transition-opacity duration-200 ${
            useMeasuredGeometry ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
        >
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Ruler size={13} className="text-emerald-500" /> Lumen Radius (Ri)
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {patient.lumenRadius.toFixed(2)} mm
              </span>
            </div>
            <input
              type="range"
              min={2.4}
              max={3.8}
              step={0.01}
              value={patient.lumenRadius}
              onChange={(e) => onPatientChange({ lumenRadius: +e.target.value })}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Ruler size={13} className="text-amber-500" /> Wall Thickness (h)
              </span>
              <span className="font-mono font-bold text-amber-700">
                {patient.wallThickness.toFixed(3)} mm
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={0.7}
              step={0.005}
              value={patient.wallThickness}
              onChange={(e) => onPatientChange({ wallThickness: +e.target.value })}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
