import React from 'react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(
  ({ className, label, error, id, options = [], ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'flex h-11 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-sm text-text ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent focus-visible:bg-surface disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm appearance-none hover:border-border-light',
              error && 'border-danger focus-visible:ring-danger text-danger',
              className
            )}
            {...props}
          >
            {options.length > 0 ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )) : props.children}
          </select>
          {/* Custom arrow for select since appearance is none */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-sm text-danger font-semibold">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
