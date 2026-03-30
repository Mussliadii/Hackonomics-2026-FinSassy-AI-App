'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'mood' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg hover:shadow-brand-primary/25 text-white',
    secondary: 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] backdrop-blur-sm',
    mood: 'bg-[var(--mood-primary)] hover:opacity-90 text-white shadow-lg',
    danger: 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl gap-2',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`font-semibold transition-all duration-200 inline-flex items-center justify-center
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed saturate-0' : ''}
        ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
