import React from 'react';
import { Check, Clock, Package, Truck, Home, User } from 'lucide-react';
import { cn } from '../../utils/cn';

const TrackingTimeline = ({ status, trackingData = [] }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'assigned', label: 'Assigned to Traveller', icon: User },
    { key: 'picked_up', label: 'Picked Up', icon: Clock },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
  ];

  const getStatusIndex = (s) => {
    const map = {
      'pending': 0,
      'confirmed': 0, // confirmed is same level as pending for tracking
      'assigned': 1,
      'picked_up': 2,
      'in_transit': 3,
      'delivered': 4,
    };
    return map[s] ?? -1;
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="py-8 px-4">
      <div className="relative flex flex-col space-y-12">
        {/* Connection Line */}
        <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex || status === 'delivered';
          const isCurrent = index === currentIndex && status !== 'delivered';
          const Icon = step.icon;
          
          // Find timestamp for this status in trackingData
          const update = trackingData.find(t => t.status === step.key);
          const timestamp = update ? new Date(update.created_at).toLocaleString() : null;

          return (
            <div key={step.key} className="relative flex items-start group">
              {/* Circle / Icon Container */}
              <div 
                className={cn(
                  "relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white shadow-sm",
                  isCompleted ? "bg-success text-white" : 
                  isCurrent ? "bg-primary text-white scale-110 shadow-lg" : 
                  "bg-gray-100 text-gray-400"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="ml-6 pt-1">
                <h4 className={cn(
                  "text-sm font-bold transition-colors duration-300",
                  isCompleted ? "text-success" : isCurrent ? "text-primary" : "text-gray-400"
                )}>
                  {step.label}
                </h4>
                {timestamp && (
                  <p className="text-[11px] text-text-light mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded-full">
                    {timestamp}
                  </p>
                )}
                {isCurrent && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Now</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
