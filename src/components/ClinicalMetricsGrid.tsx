import React from 'react';
import { SimulationResult, RiskClassification } from '../types';
import {
  Heart,
  Activity,
  Maximize2,
  TrendingUp,
  Percent,
  Compass,
  Gauge,
  Info,
} from 'lucide-react';
import { cvFromGeometry, NBP_ANCHOR } from '../services/physicsEngine';

interface ClinicalMetricsGridProps {
  result: SimulationResult;
  riskBand: RiskClassification;
  useMeasuredGeometry: boolean;
}

export const ClinicalMetricsGrid: React.FC<ClinicalMetricsGridProps> = ({
  result,
  riskBand,
  useMeasuredGeometry,
}) => {
  const healthyCv = cvFromGeometry(NBP_ANCHOR.Ri, NBP_ANCHOR.h, NBP_ANCHOR.E);
  const cvRatioPct = ((result.Cv / healthyCv) * 100).toFixed(0);
  const complianceDelta = ((result.Cv - result.cvAnchor) / result.cvAnchor) * 100;
  const wallToLumenRatio = ((result.h / result.Ri) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Augmentation Index */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            Augmentation Index
          </span>
          <span className="p-1 rounded-md bg-slate-50 text-slate-400">
            <Percent size={14} />
          </span>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: riskBand.color }}>
              {result.ai.toFixed(1)}%
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskBand.badgeClass}`}>
              {riskBand.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Weber Criteria</span>
          </div>
        </div>
      </div>

      {/* 2. Blood Pressure & MAP */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            Arterial Blood Pressure
          </span>
          <span className="p-1 rounded-md bg-slate-50 text-slate-400">
            <Activity size={14} />
          </span>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
              {result.PP + Math.round(result.MAP - result.PP / 3)}
            </span>
            <span className="text-lg font-mono text-slate-400">/</span>
            <span className="text-xl font-bold font-mono text-slate-600">
              {Math.round(result.MAP - result.PP / 3)}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1">mmHg</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">MAP: <b className="text-slate-800 font-semibold">{result.MAP}</b></span>
            <span className="text-slate-500">PP: <b className="text-indigo-600 font-semibold">{result.PP}</b> mmHg</span>
          </div>
        </div>
      </div>

      {/* 3. Arterial Compliance Cv */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            Carotid Compliance (Cv)
          </span>
          <span className="p-1 rounded-md bg-slate-50 text-slate-400">
            <Compass size={14} />
          </span>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
              {result.Cv.toFixed(4)}
            </span>
            <span className="text-[10px] font-mono text-slate-400">cm³/mmHg</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className={complianceDelta >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {complianceDelta >= 0 ? '+' : ''}{complianceDelta.toFixed(1)}% {useMeasuredGeometry ? 'vs BP est.' : 'baseline'}
            </span>
            <span className="text-slate-500">
              <b>{cvRatioPct}%</b> of NBP
            </span>
          </div>
        </div>
      </div>

      {/* 4. Hemodynamics & Flow */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            Cardiac Flow / Stroke
          </span>
          <span className="p-1 rounded-md bg-slate-50 text-slate-400">
            <Heart size={14} />
          </span>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
              {result.CO}
            </span>
            <span className="text-xs font-mono text-slate-500">L/min</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">SV: <b className="text-slate-800">{result.SV}</b> mL</span>
            <span className="text-slate-500">Womersley: <b className="text-slate-800">{result.womersleyAlpha}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
