'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;   // 0-100
  size?: number;
  strokeWidth?: number;
  mood?: 'green' | 'yellow' | 'red';
  label?: string;
  sublabel?: string;
}

const moodColors = {
  green: { stroke: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  yellow: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  red: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
};

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  mood = 'green',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const { stroke, glow } = moodColors[mood];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Glow layer */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth + 6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `blur(8px)`, opacity: 0.3 }}
          />
          {/* Main progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold"
            style={{ color: stroke }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {Math.round(value)}
          </motion.span>
          {sublabel && <span className="text-[10px] text-slate-500 mt-0.5">{sublabel}</span>}
        </div>
      </div>
      {label && <span className="text-sm text-slate-400 font-medium">{label}</span>}
    </div>
  );
}
