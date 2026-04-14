import React from 'react';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Star, CheckCircle, XCircle } from 'lucide-react';
import { Bid } from '@/data/types';

interface BidCardProps {
  bid: Bid;
  onAccept?: (bidId: string) => void;
  showActions?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({ bid, onAccept, showActions = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={bid.isRecommended ? 'bid-card-recommended' : 'bid-card'}
    >
      {bid.isRecommended && (
        <div className="absolute -top-3 left-4 px-3 py-1 gradient-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" /> Best Value
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-heading font-semibold text-foreground">{bid.vendorName}</h4>
        {bid.status === 'accepted' && <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle className="w-4 h-4" /> Accepted</span>}
        {bid.status === 'rejected' && <span className="flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="w-4 h-4" /> Rejected</span>}
        {bid.status === 'pending' && <span className="text-xs font-medium text-warning px-2 py-0.5 bg-warning/10 rounded-full">Pending</span>}
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          <div>
            <div className="text-2xl font-heading font-bold text-foreground">₹{bid.price.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Price</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          <div>
            <div className="text-2xl font-heading font-bold text-foreground">{bid.eta}m</div>
            <div className="text-xs text-muted-foreground">ETA</div>
          </div>
        </div>
      </div>

      {showActions && bid.status === 'pending' && onAccept && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAccept(bid.id)}
          className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
        >
          Accept Bid
        </motion.button>
      )}
    </motion.div>
  );
};

export default BidCard;
