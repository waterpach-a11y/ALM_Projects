import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-2 border-slate-300',
  success: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-2 border-emerald-300',
  warning: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-2 border-amber-300',
  error: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-300',
  info: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-2 border-indigo-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

