'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  fullWidth = false
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-dark)] text-white hover:shadow-lg focus:ring-[var(--color-sage)]',
    secondary: 'bg-[var(--color-warm-white)] text-[var(--color-charcoal)] border-2 border-[var(--color-sage-light)] hover:bg-[var(--color-sage-light)] focus:ring-[var(--color-sage-light)]',
    ghost: 'bg-transparent text-[var(--color-charcoal)] hover:bg-[var(--color-sand)] focus:ring-[var(--color-sand)]'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-7 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-spin mr-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}

interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  pulse?: boolean;
}

export function FloatingButton({
  onClick,
  icon,
  label,
  size = 'lg',
  variant = 'primary',
  pulse = false
}: FloatingButtonProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const variants = {
    primary: 'bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-sage-dark)] text-white shadow-lg',
    secondary: 'bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)] text-white shadow-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        ${pulse ? 'gentle-pulse' : ''}
        rounded-full flex flex-col items-center justify-center gap-1
      `}
    >
      {icon}
      {label && <span className="text-xs font-medium">{label}</span>}
    </motion.button>
  );
}

