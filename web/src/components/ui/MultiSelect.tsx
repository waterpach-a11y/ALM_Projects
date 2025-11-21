import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';

interface Option {
  id: string;
  label: string;
  email?: string;
  avatar?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select members...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (optionId: string) => {
    if (disabled) return;
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.id));
  const availableOptions = options.filter((opt) => !selected.includes(opt.id));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected members display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`bg-white border-2 border-slate-300 rounded-xl px-4 py-3 min-h-[56px] cursor-pointer transition-all duration-200 shadow-sm hover:border-slate-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/30 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border-2 border-indigo-200 rounded-lg text-sm"
              >
                <Avatar name={option.email || option.label} size="xs" />
                <span className="font-medium text-indigo-900">{option.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option.id);
                    }}
                    className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
                {availableOptions.length > 0 && (
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(!isOpen);
                    }}
                  >
                    {isOpen ? 'Hide' : `+ ${availableOptions.length} more`}
                  </button>
                )}
          </div>
        ) : (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-large max-h-80 overflow-auto animate-scale-in">
          {availableOptions.length > 0 ? (
            <div className="p-2">
              {availableOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-left border-2 border-transparent hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={option.email || option.label} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{option.label}</div>
                      {option.email && <div className="text-sm text-slate-500">{option.email}</div>}
                    </div>
                  </div>
                  <div className="w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center bg-white">
                    <svg className="w-3 h-3 text-white hidden" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">All members selected</div>
          )}
        </div>
      )}
    </div>
  );
};

