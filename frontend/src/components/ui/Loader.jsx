import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Loader = ({ className, size = 'default' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 
        className={cn('animate-spin text-primary', sizes[size], className)} 
      />
    </div>
  );
};

export { Loader };
