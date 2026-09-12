import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';
import { WaveformPoint, SimulationResult } from '../types';
import { Activity, Gauge, HelpCircle, ZoomIn, ArrowDownUp } from 'lucide-react';

interface WaveformChartProps {
  result: SimulationResult;
  sys: number;
  dia: number;
  wallColor: string;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  result,
  sys,
  dia,
  wallColor,
}) => {
  const [showVelocity, setShowVelocity] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Merge velocity with pressure for combined Recharts data
  const chartData = result.waveform.map((p, idx) => ({
    t: p.t,
    pressure: p.P,
    velocity: result.velocityWaveform[idx]?.V !== undefined ? +(result.velocityWaveform[idx].V! * 100).toFixed(1) : undefined, // in cm/s for readability
    flowRate: p.Q,
  }));

  const yMin = Math.floor((dia - 15) / 10) * 10;
  const yMax = Math.ceil((sys + 25) / 10) * 10;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Activity size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Common Carotid Artery (CCA) Waveform
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Pausal et al. 4-Element Windkessel
              </span>
            </h3>
            <p className="text-[12px] text-slate-500">
              Calibrated continuous cardiac cycle ($T_c = {result.Tc}$s, $T_s = {result.Ts}$s)
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVelocity((prev) => !prev)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              showVelocity
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ArrowDownUp size={13} />
            <span>Velocity Wave V(t)</span>
          </button>

          <button
            onClick={() => setShowLandmarks((prev) => !prev)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              showLandmarks
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Gauge size={13} />
            <span>Clinical Landmarks</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="t"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${(+v).toFixed(2)}s`}
              label={{
                value: 'Cardiac Cycle Time t (seconds)',
                position: 'insideBottom',
                offset: -2,
                fill: '#94a3b8',
                fontSize: 11,
              }}
            />

            {/* Left Axis: Blood Pressure in mmHg */}
            <YAxis
              yAxisId="pressureAxis"
              domain={[yMin, yMax]}
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

            {/* Optional Right Axis: Flow Velocity in cm/s */}
            {showVelocity && (
              <YAxis
                yAxisId="velocityAxis"
                orientation="right"
                domain={[0, 120]}
                tick={{ fill: '#d97706', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: 'Velocity (cm/s)',
                  angle: 90,
                  position: 'insideRight',
                  offset: 22,
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(val) => `Time in Cycle: ${(+val).toFixed(3)}s`}
              formatter={(val: any, name: string) => {
                if (name === 'pressure') return [`${val} mmHg`, 'Blood Pressure P(t)'];
                if (name === 'velocity') return [`${val} cm/s`, 'Flow Velocity V(t)'];
                return [val, name];
              }}
            />

            {/* Clinical Reference Lines */}
            <ReferenceLine
              yAxisId="pressureAxis"
              y={sys}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              label={{
                value: `Systolic: ${sys} mmHg`,
                position: 'insideTopRight',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />

            <ReferenceLine
              yAxisId="pressureAxis"
              y={dia}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              label={{
                value: `Diastolic: ${dia} mmHg`,
                position: 'insideBottomRight',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />

            <ReferenceLine
              yAxisId="pressureAxis"
              y={result.MAP}
              stroke="#93c5fd"
              strokeDasharray="2 2"
              label={{
                value: `MAP: ${result.MAP} mmHg`,
                position: 'right',
                fill: '#3b82f6',
                fontSize: 10,
              }}
            />

            {/* Key Landmark X lines if enabled */}
            {showLandmarks && (
              <>
                <ReferenceLine
                  yAxisId="pressureAxis"
                  x={result.tP1}
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{
                    value: `P1 (${result.p1} mmHg)`,
                    position: 'top',
                    fill: '#4338ca',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <ReferenceLine
                  yAxisId="pressureAxis"
                  x={result.tDicrotic}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  label={{
                    value: 'Dicrotic Notch',
                    position: 'insideBottom',
                    fill: '#059669',
                    fontSize: 10,
                  }}
                />
              </>
            )}

            {/* Pressure Trace (Paisal 4-Element Windkessel) */}
            <Line
              yAxisId="pressureAxis"
              type="monotone"
              dataKey="pressure"
              stroke="#4338ca"
              strokeWidth={2.8}
              dot={false}
              activeDot={{ r: 5, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2 }}
              name="pressure"
            />

            {/* Velocity Trace (Fourier 8-Harmonic series) */}
            {showVelocity && (
              <Line
                yAxisId="velocityAxis"
                type="monotone"
                dataKey="velocity"
                stroke="#f59e0b"
                strokeWidth={1.8}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                name="velocity"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Landmark Annotations Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-600">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px]">1st Systolic Peak (P1)</span>
          <span className="font-bold text-indigo-700 text-sm">{result.p1} mmHg</span>
          <span className="text-[10px] text-slate-400 block">at t = {result.tP1}s</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px]">Reflected Peak (P2)</span>
          <span className="font-bold text-indigo-700 text-sm">{result.p2} mmHg</span>
          <span className="text-[10px] text-slate-400 block">at t = {result.tP2}s</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px]">Augmentation Index (AI)</span>
          <span className="font-bold text-rose-600 text-sm">{result.ai}%</span>
          <span className="text-[10px] text-slate-400 block">|P2 - P1| / PP</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-400 block text-[10px]">Dicrotic Notch Closure</span>
          <span className="font-bold text-emerald-700 text-sm">Aortic Valve</span>
          <span className="text-[10px] text-slate-400 block">at t = {result.tDicrotic}s</span>
        </div>
      </div>
    </div>
  );
};
