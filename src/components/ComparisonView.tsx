import React, { useMemo } from 'react';
import { SimulationResult, RiskClassification } from '../types';
import { getAnchorResults, NBP_ANCHOR, PH_ANCHOR, HS1_ANCHOR } from '../services/physicsEngine';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Columns3, TrendingUp, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ComparisonViewProps {
  patientResult: SimulationResult;
  patientName: string;
  riskBand: RiskClassification;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  patientResult,
  patientName,
  riskBand,
}) => {
  const anchors = useMemo(() => getAnchorResults(), []);

  // Format combined multi-line data normalized across time
  const combinedChartData = useMemo(() => {
    const steps = 120;
    const maxTime = Math.max(anchors.NBP.Tc, anchors.PH.Tc, anchors.HS1.Tc, patientResult.Tc);
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const t = +(frac * 0.8).toFixed(3); // standard cycle baseline for direct visual overlay

      // Sample each waveform
      const sample = (wf: { t: number; P: number }[], targetFrac: number) => {
        const idx = Math.min(wf.length - 1, Math.floor(targetFrac * wf.length));
        return wf[idx]?.P ?? 0;
      };

      pts.push({
        time: t,
        normalizedFraction: `${Math.round(frac * 100)}%`,
        NBP: sample(anchors.NBP.waveform, frac),
        PH: sample(anchors.PH.waveform, frac),
        HS1: sample(anchors.HS1.waveform, frac),
        Patient: sample(patientResult.waveform, frac),
      });
    }
    return pts;
  }, [anchors, patientResult]);

  const cards = [
    {
      key: 'NBP',
      title: 'Normal (NBP)',
      subtitle: 'Paisal et al. 117/71',
      color: '#10B981',
      bg: 'bg-emerald-50/60 border-emerald-200',
      data: anchors.NBP,
    },
    {
      key: 'PH',
      title: 'Pre-Hypertension (PH)',
      subtitle: 'Paisal et al. 124/81',
      color: '#F59E0B',
      bg: 'bg-amber-50/60 border-amber-200',
      data: anchors.PH,
    },
    {
      key: 'HS1',
      title: 'Hypertension Stage 1 (HS1)',
      subtitle: 'Paisal et al. 148/96',
      color: '#EF4444',
      bg: 'bg-rose-50/60 border-rose-200',
      data: anchors.HS1,
    },
    {
      key: 'Patient',
      title: `${patientName}`,
      subtitle: 'Personalized Digital Twin',
      color: '#4F5FE0',
      bg: 'bg-indigo-50/60 border-indigo-200',
      data: patientResult,
      isPatient: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Superimposed Multi-Line Waveform Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Columns3 size={16} className="text-indigo-600" />
              Superimposed Hemodynamic Pulse Overlay
            </h3>
            <p className="text-xs text-slate-500">
              Comparative pressure wave reflection morphology across physiological cohorts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> NBP (117/71)
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> PH (124/81)
            </span>
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> HS1 (148/96)
            </span>
            <span className="flex items-center gap-1 text-indigo-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Patient Twin
            </span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}s`}
                label={{
                  value: 'Normalized Cardiac Cycle Period (s)',
                  position: 'insideBottom',
                  offset: -2,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <YAxis
                domain={[50, 195]}
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: 'Pressure (mmHg)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 22,
                  fill: '#475569',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any, name: string) => [`${val} mmHg`, name]}
              />
              <Line type="monotone" dataKey="NBP" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="PH" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="HS1" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="Patient" stroke="#4F5FE0" strokeWidth={3.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border p-4 transition-all bg-white ${
              card.isPatient ? 'ring-2 ring-indigo-500/30 border-indigo-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">{card.subtitle}</p>
              </div>
              {card.isPatient && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-2 mt-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Augmentation (AI)</span>
                <b className="text-sm font-bold" style={{ color: card.color }}>
                  {card.data.ai.toFixed(1)}%
                </b>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Pulse Pressure</span>
                <b className="text-slate-800">{card.data.PP} mmHg</b>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Compliance (Cv)</span>
                <b className="text-slate-800">{card.data.Cv.toFixed(4)}</b>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Lumen Radius (Ri)</span>
                <b className="text-slate-800">{card.data.Ri.toFixed(2)} mm</b>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Wall Thickness (h)</span>
                <b className="text-slate-800">{card.data.h.toFixed(3)} mm</b>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Modulus (E)</span>
                <b className="text-slate-800">{card.data.E.toFixed(3)} MPa</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Windkessel Parameters Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
            Windkessel 4-Element & Fluid Mechanics Parameters (Paisal et al. 2019 Table 2 & 3)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">CCA Length L = 192.5 mm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-600">
                <th className="p-3">Parameter Description</th>
                <th className="p-3">Symbol / Unit</th>
                <th className="p-3">NBP (Norm)</th>
                <th className="p-3">PH (Pre-HTN)</th>
                <th className="p-3">HS1 (Stage 1)</th>
                <th className="p-3 bg-indigo-50/50 text-indigo-900 font-bold">Patient Twin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Systolic / Diastolic Pressure</td>
                <td className="p-3 text-slate-500">Ps / Pd (mmHg)</td>
                <td className="p-3">117 / 71</td>
                <td className="p-3">124 / 81</td>
                <td className="p-3">148 / 96</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">
                  {patientResult.PP + Math.round(patientResult.MAP - patientResult.PP / 3)} / {Math.round(patientResult.MAP - patientResult.PP / 3)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Mean Arterial Pressure (Eq. 2)</td>
                <td className="p-3 text-slate-500">MAP (mmHg)</td>
                <td className="p-3">86.33</td>
                <td className="p-3">95.33</td>
                <td className="p-3">113.33</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.MAP}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Proximal Characteristic Resistance</td>
                <td className="p-3 text-slate-500">R1 (mmHg/cm³/s)</td>
                <td className="p-3">1.6753</td>
                <td className="p-3">2.1278</td>
                <td className="p-3">2.6511</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.R1}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Distal Peripheral Resistance</td>
                <td className="p-3 text-slate-500">R2 (mmHg/cm³/s)</td>
                <td className="p-3">5.9953</td>
                <td className="p-3">6.2638</td>
                <td className="p-3">7.1542</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.R2}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Arterial Vessel Resistance (Eq. 12)</td>
                <td className="p-3 text-slate-500">Rv (mmHg/cm³/s)</td>
                <td className="p-3">0.1795</td>
                <td className="p-3">0.1947</td>
                <td className="p-3">0.2031</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.Rv}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Arterial Inertance / Inductance (Eq. 13)</td>
                <td className="p-3 text-slate-500">Lv (mmHg/cm³/s²)</td>
                <td className="p-3">0.0640</td>
                <td className="p-3">0.0673</td>
                <td className="p-3">0.0691</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.Lv}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Vascular Compliance (Eq. 14)</td>
                <td className="p-3 text-slate-500">Cv (cm³/mmHg)</td>
                <td className="p-3">0.0231</td>
                <td className="p-3">0.0150</td>
                <td className="p-3">0.0099</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.Cv}</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-800">Augmentation Index (Eq. 25)</td>
                <td className="p-3 text-slate-500">AI (%)</td>
                <td className="p-3 text-emerald-600 font-bold">9.77%</td>
                <td className="p-3 text-amber-600 font-bold">14.94%</td>
                <td className="p-3 text-rose-600 font-bold">25.17%</td>
                <td className="p-3 bg-indigo-50/30 font-bold text-indigo-700">{patientResult.ai}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
