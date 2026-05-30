import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => {

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95',
      secondary: 'bg-gradient-to-r from-secondary to-primary text-white hover:shadow-lg hover:shadow-secondary/40 hover:scale-105 active:scale-95',
      outline: 'border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary-light transition-all',
      danger: 'bg-danger text-white hover:bg-red-600 hover:shadow-lg hover:shadow-danger/40 active:scale-95',
      ghost: 'hover:bg-surface text-text hover:text-primary border border-transparent hover:border-border transition-all',
      success: 'bg-success text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-success/40 active:scale-95',
    };

    const sizes = {
      default: 'h-11 px-6 py-2 text-sm font-semibold',
      sm: 'h-9 px-3 text-xs font-semibold',
      lg: 'h-12 px-8 text-base font-bold',
      xl: 'h-14 px-10 text-lg font-bold',
      icon: 'h-10 w-10 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
