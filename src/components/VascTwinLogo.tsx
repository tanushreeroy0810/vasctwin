import React from 'react';

interface VascTwinLogoProps {
  className?: string;
  size?: number;
}

export const VascTwinLogo: React.FC<VascTwinLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Modern radial glow gradient */}
        <radialGradient id="vascBgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        
        {/* Arterial Pulse Stream Gradient */}
        <linearGradient id="arterialStream" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>

        {/* Digital Twin Reflection Gradient */}
        <linearGradient id="twinReflection" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#4f46e5" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Rounded squircle icon container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#vascBgGlow)"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Background subtle arterial grid lines */}
      <line x1="8" y1="24" x2="40" y2="24" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="2 3" />
      <line x1="24" y1="8" x2="24" y2="40" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="2 3" />

      {/* Primary Arterial Carotid Pulse Wave (Forward wave P1) */}
      <path
        d="M 6 25 Q 12 25 15 22 L 18 12 L 22 34 L 26 17 L 30 26 Q 34 25 42 25"
        stroke="url(#arterialStream)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />

      {/* Reflected Wave Twin Curve (P2 wave creating bifurcation) */}
      <path
        d="M 18 25 C 22 25 25 19 28 19 C 32 19 35 23 42 22"
        stroke="url(#twinReflection)"
        strokeWidth="2"
        strokeDasharray="1.5 2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Peak systolic marker node */}
      <circle cx="18" cy="12" r="2.5" fill="#38bdf8" />
      <circle cx="18" cy="12" r="1.2" fill="#ffffff" />

      {/* Reflected P2 landmark node */}
      <circle cx="26" cy="17" r="2" fill="#ec4899" />

      {/* Dicrotic notch pulse node */}
      <circle cx="30" cy="26" r="1.5" fill="#10b981" />
    </svg>
  );
};
