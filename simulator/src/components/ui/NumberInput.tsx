'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  className?: string;
  id?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, value, onChange, suffix = '€', min, max, step = 1, error, className, id }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className={clsx(
              'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              error ? 'border-red-300' : 'border-gray-300',
              suffix && 'pr-10',
              className
            )}
          />
          {suffix && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
export default NumberInput;
