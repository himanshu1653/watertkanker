import React from 'react';
import { motion } from 'framer-motion';

interface DeliveryTrackerProps {
  progress: number;
  driverName: string;
  stops: { address: string; status: string }[];
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ progress, driverName, stops }) => {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-semibold text-foreground mb-1">Delivery Progress</h3>
      <p className="text-sm text-muted-foreground mb-4">Driver: {driverName}</p>

      {/* Progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Stops */}
      <div className="space-y-3">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              stop.status === 'delivered' ? 'bg-success' : stop.status === 'delivering' ? 'bg-warning animate-pulse' : 'bg-muted-foreground/30'
            }`} />
            <span className={`text-sm ${stop.status === 'delivered' ? 'text-success line-through' : 'text-foreground'}`}>
              {stop.address}
            </span>
            <span className="text-xs text-muted-foreground ml-auto capitalize">{stop.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryTracker;
