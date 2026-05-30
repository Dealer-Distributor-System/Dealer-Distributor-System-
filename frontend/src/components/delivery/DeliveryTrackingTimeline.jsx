import React from 'react';
import { CheckCircle2, Circle, Truck, Package, MapPin, Check, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const stages = [
  { id: 'assigned', label: 'Assigned', icon: Package },
  { id: 'accepted', label: 'Accepted', icon: Check },
  { id: 'picked_up', label: 'Picked Up', icon: MapPin },
  { id: 'in_transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

const DeliveryTrackingTimeline = ({ tracking = [], currentStatus }) => {
  // Sort tracking by time
  const sortedTracking = [...tracking].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Determine if a stage is completed
  const getStageStatus = (stageId) => {
    if (currentStatus === 'failed' && stageId === 'delivered') return 'failed';
    
    const found = tracking.find(t => t.status === stageId);
    if (found) return 'completed';
    
    // Check if it's the current active stage (if not found in tracking yet but matches currentStatus)
    if (currentStatus === stageId) return 'current';
    
    return 'pending';
  };

  return (
    <div className="py-8 px-4">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;
          const trackingEntry = tracking.find(t => t.status === stage.id);

          return (
            <div key={stage.id} className="flex flex-col items-center flex-1 relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                status === 'completed' ? "bg-primary border-primary text-white" :
                status === 'current' ? "bg-white border-primary text-primary animate-pulse" :
                status === 'failed' ? "bg-danger border-danger text-white" :
                "bg-white border-gray-300 text-gray-300"
              )}>
                {status === 'completed' ? <Check className="w-5 h-5" /> : 
                 status === 'failed' ? <XCircle className="w-5 h-5" /> :
                 <Icon className="w-5 h-5" />}
              </div>
              
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  status !== 'pending' ? "text-gray-900" : "text-gray-400"
                )}>
                  {stage.label}
                </p>
                {trackingEntry && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(trackingEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History List */}
      <div className="mt-12 space-y-6">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Tracking Updates</h4>
        <div className="space-y-4">
          {sortedTracking.reverse().map((entry, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                {idx !== tracking.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 capitalize">{entry.status.replace('_', ' ')}</span>
                  <span className="text-[10px] font-medium text-gray-400">{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{entry.location}</p>
                {entry.remark && <p className="text-xs text-gray-500 italic mt-1">"{entry.remark}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingTimeline;
