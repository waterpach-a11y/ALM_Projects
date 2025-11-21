import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  return (
    <input
      className={`bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all duration-200 shadow-sm hover:border-slate-400 ${
        error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-600' : ''
      } ${className}`}
      {...props}
    />
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ error, className = '', ...props }) => {
  return (
    <textarea
      className={`bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all duration-200 shadow-sm hover:border-slate-400 resize-none ${
        error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-600' : ''
      } ${className}`}
      {...props}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select: React.FC<SelectProps> = ({ error, className = '', ...props }) => {
  return (
    <select
      className={`bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 w-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all duration-200 shadow-sm hover:border-slate-400 cursor-pointer ${
        error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-600' : ''
      } ${className}`}
      {...props}
    />
  );
};

