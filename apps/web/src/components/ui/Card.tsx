'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  mood?: 'green' | 'yellow' | 'red';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const base = 'bg-brand-card/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 shadow-xl shadow-black/10';
  const hoverClass = hover ? 'transition-all duration-300 hover:border-brand-primary/30 hover:shadow-brand-primary/5 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`${base} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface MoodCardProps extends CardProps {
  mood: 'green' | 'yellow' | 'red';
}

const moodBorderColors = {
  green: 'border-emerald-500/20 shadow-emerald-500/5',
  yellow: 'border-amber-500/20 shadow-amber-500/5',
  red: 'border-red-500/20 shadow-red-500/5',
};

export function MoodCard({ children, mood, className = '', onClick }: MoodCardProps) {
  return (
    <Card className={`${moodBorderColors[mood]} ${className}`} onClick={onClick}>
      {children}
    </Card>
  );
}
