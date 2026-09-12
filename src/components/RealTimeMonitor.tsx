import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  Sliders,
} from 'lucide-react';
import { SimulationResult, PatientProfile } from '../types';

interface RealTimeMonitorProps {
  patient: PatientProfile;
  result: SimulationResult;
  wallColor: string;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  patient,
  result,
  wallColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [gainLevel, setGainLevel] = useState(1.0);
  const [sweepSpeed, setSweepSpeed] = useState(25); // mm/s (standard: 25 mm/s)
  const [lastBpmPulse, setLastBpmPulse] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq = 880, duration = 0.06) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch {
      // Audio not permitted or interrupted
    }
  }, [soundEnabled]);

  // Real-time animation sweep state
  const stateRef = useRef({
    sweepX: 0,
    time: 0,
    lastBeatTime: 0,
    frozen: false,
    historyECG: [] as number[],
    historyABP: [] as number[],
    historyPPG: [] as number[],
  });

  useEffect(() => {
    stateRef.current.frozen = isFrozen;
  }, [isFrozen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let prevTimestamp = performance.now();

    // Sizing canvas to display resolution
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);

    const period = 60 / Math.max(patient.heartRate, 30); // period in seconds

    // Mathematical formula for ECG Lead II waveform given normalized cycle phase tau (0 to 1)
    const getECGValue = (tau: number): number => {
      // P wave around 0.15, PR segment around 0.22, QRS around 0.32-0.38, ST around 0.45, T wave around 0.55
      let val = 0;
      // P wave
      if (tau >= 0.12 && tau <= 0.22) {
        val += 0.25 * Math.sin(((tau - 0.12) / 0.1) * Math.PI);
      }
      // Q wave (small dip)
      if (tau > 0.29 && tau <= 0.32) {
        val -= 0.3 * Math.sin(((tau - 0.29) / 0.03) * Math.PI);
      }
      // R wave (sharp systolic spike)
      if (tau > 0.32 && tau <= 0.36) {
        val += 2.4 * Math.sin(((tau - 0.32) / 0.04) * Math.PI);
      }
      // S wave (negative deflection)
      if (tau > 0.36 && tau <= 0.40) {
        val -= 0.6 * Math.sin(((tau - 0.36) / 0.04) * Math.PI);
      }
      // T wave (ventricular repolarization)
      if (tau >= 0.48 && tau <= 0.68) {
        val += 0.55 * Math.sin(((tau - 0.48) / 0.2) * Math.PI);
      }
      return val;
    };

    // Arterial Blood Pressure value derived from patient's 4-element Windkessel waveform
    const getABPValue = (tau: number): number => {
      if (!result.waveform || result.waveform.length === 0) return patient.diastolicBP;
      const idx = Math.min(
        result.waveform.length - 1,
        Math.floor(tau * result.waveform.length)
      );
      return result.waveform[idx]?.P ?? patient.diastolicBP;
    };

    // PPG Photoplethysmography waveform (optical peripheral pulse)
    const getPPGValue = (tau: number): number => {
      // delayed peak from radial pulse, smooth dicrotic notch
      const delayedTau = (tau - 0.08 + 1) % 1;
      let val = Math.exp(-delayedTau * 3.5) * Math.sin(delayedTau * Math.PI);
      if (delayedTau > 0.35 && delayedTau < 0.65) {
        val += 0.22 * Math.sin(((delayedTau - 0.35) / 0.3) * Math.PI);
      }
      return Math.max(0, val);
    };

    const drawGrid = (w: number, h: number) => {
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Hospital phosphor monitor fine grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 0.5;

      const gridSize = 20;
      ctx.beginPath();
      for (let x = 0; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Major grid divisions
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += gridSize * 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize * 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - prevTimestamp) / 1000, 0.1);
      prevTimestamp = timestamp;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!stateRef.current.frozen) {
        stateRef.current.time += dt;

        // Advance sweep bar
        // Speed in pixels per second: ~140 px/s at 25 mm/s standard
        const sweepSpeedPx = 140 * (sweepSpeed / 25);
        stateRef.current.sweepX = (stateRef.current.sweepX + sweepSpeedPx * dt) % w;

        // Current phase in cardiac cycle
        const tau = (stateRef.current.time % period) / period;

        // Check for heart beat R-spike trigger
        if (tau >= 0.32 && tau <= 0.36) {
          if (timestamp - stateRef.current.lastBeatTime > 400) {
            stateRef.current.lastBeatTime = timestamp;
            setLastBpmPulse(true);
            setTimeout(() => setLastBpmPulse(false), 120);
            playBeep(880, 0.05);
          }
        }

        // Channels layout:
        // Channel 1: Lead II ECG (top 35% of monitor)
        // Channel 2: Arterial Blood Pressure ABP (middle 35% of monitor)
        // Channel 3: Plethysmogram PPG SpO2 (bottom 30% of monitor)
        const curX = Math.floor(stateRef.current.sweepX);

        const ecgRaw = getECGValue(tau);
        const abpRaw = getABPValue(tau);
        const ppgRaw = getPPGValue(tau);

        stateRef.current.historyECG[curX] = ecgRaw;
        stateRef.current.historyABP[curX] = abpRaw;
        stateRef.current.historyPPG[curX] = ppgRaw;
      }

      // Draw Screen
      drawGrid(w, h);

      const ch1BaseY = h * 0.20;
      const ch2BaseY = h * 0.55;
      const ch3BaseY = h * 0.85;

      const sweepCur = stateRef.current.sweepX;
      const eraseWidth = 24;

      // Draw Lead II ECG (Phosphor Green #10b981)
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 6;
      ctx.beginPath();

      let started = false;
      for (let x = 0; x < w; x++) {
        // Skip pixels inside the sweeping erase head
        if (x >= sweepCur && x <= sweepCur + eraseWidth) {
          started = false;
          continue;
        }
        const val = stateRef.current.historyECG[x];
        if (val === undefined) continue;

        const y = ch1BaseY - val * 24 * gainLevel;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw Arterial Blood Pressure Waveform (Deep Indigo / Cyan #38bdf8)
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2.4;
      ctx.beginPath();

      started = false;
      for (let x = 0; x < w; x++) {
        if (x >= sweepCur && x <= sweepCur + eraseWidth) {
          started = false;
          continue;
        }
        const val = stateRef.current.historyABP[x];
        if (val === undefined) continue;

        // Map pressure 50 - 180 mmHg to channel height
        const normP = (val - 50) / 130;
        const y = ch2BaseY + 30 - normP * 55;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw PPG Plethysmogram (Warm Amber #f59e0b)
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 5;
      ctx.lineWidth = 2.0;
      ctx.beginPath();

      started = false;
      for (let x = 0; x < w; x++) {
        if (x >= sweepCur && x <= sweepCur + eraseWidth) {
          started = false;
          continue;
        }
        const val = stateRef.current.historyPPG[x];
        if (val === undefined) continue;

        const y = ch3BaseY + 15 - val * 35;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Draw Phosphor Beam Sweep Head Glow
      if (!stateRef.current.frozen) {
        const grad = ctx.createLinearGradient(sweepCur, 0, sweepCur + eraseWidth, 0);
        grad.addColorStop(0, 'rgba(6, 10, 18, 0)');
        grad.addColorStop(0.8, 'rgba(6, 10, 18, 0.95)');
        grad.addColorStop(1, 'rgba(6, 10, 18, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(sweepCur, 0, eraseWidth, h);

        // Glowing vertical sweep line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepCur, 0);
        ctx.lineTo(sweepCur, h);
        ctx.stroke();
      }

      // Channel Labels Overlay
      ctx.font = '10px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText('ECG LEAD II (1mV / cm)', 12, 22);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ART PRESSURE (CCA): ${patient.systolicBP}/${patient.diastolicBP} mmHg`, 12, ch2BaseY - 24);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText('PPG PLETH (SpO2 99%)', 12, ch3BaseY - 22);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [patient, result, isFrozen, gainLevel, sweepSpeed, playBeep]);

  // Alert conditions
  const isTachycardic = patient.heartRate > 100;
  const isBradycardic = patient.heartRate < 60;
  const isHypertensive = patient.systolicBP >= 140 || patient.diastolicBP >= 90;

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl text-slate-100 flex flex-col gap-3">
      {/* Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200">
              BEDSIDE TELEMETRY · MONITOR #04
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">PT:</span>
            <span className="text-xs font-semibold text-white">{patient.name}</span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {patient.medicalRecordNumber}
            </span>
          </div>
        </div>

        {/* Action Controls: Sound, Freeze, Gain */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute QRS tone' : 'Enable QRS acoustic tone'}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'BEEP ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => setIsFrozen((prev) => !prev)}
            title={isFrozen ? 'Resume live stream' : 'Freeze waveform for calipers'}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isFrozen
                ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {isFrozen ? <Play size={13} /> : <Pause size={13} />}
            <span>{isFrozen ? 'FROZEN' : 'FREEZE'}</span>
          </button>

          <select
            value={gainLevel}
            onChange={(e) => setGainLevel(+e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs font-mono border border-slate-800 rounded-lg px-2 py-1.5 outline-hidden"
          >
            <option value={0.5}>Gain x0.5</option>
            <option value={1.0}>Gain x1.0</option>
            <option value={1.5}>Gain x1.5</option>
            <option value={2.0}>Gain x2.0</option>
          </select>
        </div>
      </div>

      {/* Main Display: Waveform Oscilloscope & Real-Time Digital Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Real-time Oscilloscope Canvas */}
        <div className="lg:col-span-3 relative h-72 sm:h-84 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Frozen Watermark if active */}
          {isFrozen && (
            <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded-md backdrop-blur-xs">
              HOLD / FROZEN WAVEFORM
            </div>
          )}
        </div>

        {/* Live Clinical Digital Parameter Gauges */}
        <div className="flex flex-col gap-2.5 justify-between">
          {/* Heart Rate Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                <Heart
                  size={14}
                  className={`text-rose-500 transition-transform ${
                    lastBpmPulse ? 'scale-130 fill-rose-500' : 'scale-100'
                  }`}
                />
                PULSE / HR
              </span>
              <span className="text-[10px] font-mono text-slate-400">BPM</span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {patient.heartRate}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {patient.heartRate < 60
                  ? 'Bradycardia'
                  : patient.heartRate > 100
                  ? 'Tachycardia'
                  : 'Sinus Normal'}
              </span>
            </div>
          </div>

          {/* Blood Pressure NIBP / Arterial Line */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-sky-400 flex items-center gap-1.5">
                <Activity size={14} />
                ART BP (CCA)
              </span>
              <span className="text-[10px] font-mono text-slate-400">mmHg</span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black font-mono text-white">
                {patient.systolicBP}
              </span>
              <span className="text-lg font-mono text-slate-400">/</span>
              <span className="text-2xl font-black font-mono text-sky-300">
                {patient.diastolicBP}
              </span>
              <span className="ml-auto text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                ({result.MAP})
              </span>
            </div>
          </div>

          {/* Pulse Pressure & Augmentation Index */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-amber-400">
                PULSE PRESSURE
              </span>
              <span className="text-[10px] font-mono text-slate-400">PP</span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-white">
                {result.PP} <span className="text-xs font-normal text-slate-400">mmHg</span>
              </span>
              <div className="text-right">
                <span className="text-[10px] block text-slate-400 font-mono">Augmentation AI</span>
                <span className="text-sm font-bold font-mono text-rose-400">{result.ai}%</span>
              </div>
            </div>
          </div>

          {/* SpO2 Pleth Pulse Saturation */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-emerald-300">
                O2 SATURATION
              </span>
              <span className="text-[10px] font-mono text-slate-400">% SpO2</span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-emerald-400">99%</span>
              <span className="text-[11px] font-mono text-slate-400">Pleth Index: 4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Clinical Diagnostic Warnings */}
      {(isTachycardic || isBradycardic || isHypertensive || result.ai > 17.2) && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg px-3 py-2 flex items-center gap-2.5 text-xs font-mono text-rose-300">
          <AlertTriangle size={15} className="text-rose-400 shrink-0" />
          <span>
            <b>CLINICAL NOTIFICATION:</b>{' '}
            {isHypertensive && 'Elevated arterial pressure exceeds stage-1 threshold (≥140/90). '}
            {result.ai > 17.2 && 'Augmentation index > 17.2% indicates marked reflected wave amplitude and carotid stiffness. '}
            {isTachycardic && 'Sinus tachycardia detected (>100 bpm). '}
            {isBradycardic && 'Sinus bradycardia detected (<60 bpm). '}
          </span>
        </div>
      )}
    </div>
  );
};
