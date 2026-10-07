import React, { useState } from 'react';
import { SimulationResult, PatientProfile, RiskClassification } from '../types';
import { Download, FileText, Printer, Check, TrendingDown, AlertCircle, Share2 } from 'lucide-react';

interface QuickDataAnalysisProps {
  patient: PatientProfile;
  result: SimulationResult;
  riskBand: RiskClassification;
}

export const QuickDataAnalysis: React.FC<QuickDataAnalysisProps> = ({
  patient,
  result,
  riskBand,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate CSV download
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Time_sec,BloodPressure_mmHg,FlowVelocity_cms,FlowRate_mLs\n';

    result.waveform.forEach((pt, idx) => {
      const velVal = result.velocityWaveform?.[idx]?.V ?? result.velocityWaveform?.[idx]?.v;
      const v = velVal !== undefined ? (velVal * 100).toFixed(2) : '0';
      const q = pt.Q !== undefined ? pt.Q.toFixed(2) : '0';
      csvContent += `${pt.t},${pt.P},${v},${q}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `vasctwin_${patient.name.toLowerCase().replace(/\s+/g, '_')}_hemodynamics.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Clinical Data Analysis & Biometric Reporting
          </h3>
          <p className="text-xs text-slate-500">
            Export numerical time-series or generate printable hemodynamic clinical summary
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
            <span>{downloadSuccess ? 'CSV Exported' : 'Download Raw CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-300 transition"
          >
            <Printer size={14} />
            <span>Print Clinical Brief</span>
          </button>
        </div>
      </div>

      {/* Structured Clinical Report Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              VASCTWIN CARDIOVASCULAR DIGITAL TWIN REPORT
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Patient Hemodynamic & Wave Reflection Evaluation
            </h2>
            <p className="text-xs text-slate-500">
              Department of Vascular Neurology & Hemodynamic Biomechanics
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500">
            <div>MRN: <b className="text-slate-800">{patient.medicalRecordNumber}</b></div>
            <div>Date: <b className="text-slate-800">{new Date().toLocaleDateString()}</b></div>
            <div>Status: <span className={`font-bold ${riskBand.color}`}>{riskBand.name}</span></div>
          </div>
        </div>

        {/* Demographics & Physical Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
            <span className="font-bold text-slate-800 text-sm">{patient.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">AGE / GENDER</span>
            <span className="font-bold text-slate-800 text-sm">{patient.age} yrs · {patient.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">LUMEN RADIUS (Ri)</span>
            <span className="font-bold text-slate-800 text-sm">{result.Ri.toFixed(2)} mm</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">WALL THICKNESS (h)</span>
            <span className="font-bold text-slate-800 text-sm">{result.h.toFixed(3)} mm</span>
          </div>
        </div>

        {/* Hemodynamic Findings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
              Blood Pressure Dynamics
            </h4>
            <div className="space-y-1.5 text-xs font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Brachial Systolic / Diastolic:</span>
                <b className="text-slate-900">{patient.systolicBP} / {patient.diastolicBP} mmHg</b>
              </div>
              <div className="flex justify-between">
                <span>Mean Arterial Pressure (MAP):</span>
                <b className="text-slate-900">{result.MAP} mmHg</b>
              </div>
              <div className="flex justify-between">
                <span>Pulse Pressure (PP):</span>
                <b className="text-indigo-600 font-bold">{result.PP} mmHg</b>
              </div>
              <div className="flex justify-between">
                <span>Heart Rate (HR):</span>
                <b className="text-slate-900">{patient.heartRate} bpm</b>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
              Wave Reflection & Stiffness
            </h4>
            <div className="space-y-1.5 text-xs font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Augmentation Index (AI):</span>
                <b className="font-bold" style={{ color: riskBand.color }}>{result.ai}%</b>
              </div>
              <div className="flex justify-between">
                <span>First Systolic Peak (P1):</span>
                <b className="text-slate-900">{result.p1} mmHg</b>
              </div>
              <div className="flex justify-between">
                <span>Reflected Peak (P2):</span>
                <b className="text-slate-900">{result.p2} mmHg</b>
              </div>
              <div className="flex justify-between">
                <span>Arterial Compliance (Cv):</span>
                <b className="text-slate-900">{result.Cv.toFixed(4)}</b>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
              Lumped Circuit Impedance
            </h4>
            <div className="space-y-1.5 text-xs font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Proximal Resistance R1:</span>
                <b className="text-slate-900">{result.R1}</b>
              </div>
              <div className="flex justify-between">
                <span>Peripheral Resistance R2:</span>
                <b className="text-slate-900">{result.R2}</b>
              </div>
              <div className="flex justify-between">
                <span>Blood Inertia Lv:</span>
                <b className="text-slate-900">{result.Lv}</b>
              </div>
              <div className="flex justify-between">
                <span>Womersley Number (α):</span>
                <b className="text-slate-900">{result.womersleyAlpha}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Assessment & Recommendations */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={15} className="text-indigo-600" />
            Automated Clinical Impression & Guidelines
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.ai < 11.7
              ? 'Patient demonstrates normal central wave reflection and favorable arterial elasticity. Left ventricular afterload is within healthy physiologic ranges. Routine preventive wellness monitoring recommended.'
              : result.ai <= 17.2
              ? 'Patient exhibits elevated wave reflection (Weber criteria 11.7–17.2%), characteristic of early carotid wall stiffening or pre-hypertensive vascular remodeling. Recommend 6-month follow-up, sodium intake restriction, and aerobic exercise regimen.'
              : 'Patient exhibits high augmentation index (>17.2%) with augmented central systolic pressure. Elevated vascular impedance increases myocardial oxygen demand and stroke risk. Comprehensive cardiovascular risk workup and antihypertensive optimization advised.'}
          </p>
        </div>
      </div>
    </div>
  );
};
