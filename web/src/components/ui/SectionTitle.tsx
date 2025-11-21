import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, subtitle, className = '' }) => {
  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-bold text-slate-900 mb-1">{children}</h2>
      {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};

