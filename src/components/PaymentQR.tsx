import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Zap, IndianRupee, Clock } from 'lucide-react';

interface PaymentQRProps {
  amount: number;
  urgentAmount: number;
  requestId: string;
  isUrgent: boolean;
  onSelectUrgent: (urgent: boolean) => void;
  onConfirmPayment: () => void;
}

const PaymentQR: React.FC<PaymentQRProps> = ({ amount, urgentAmount, requestId, isUrgent, onSelectUrgent, onConfirmPayment }) => {
  const displayAmount = isUrgent ? urgentAmount : amount;
  const upiString = `upi://pay?pa=aquabid@upi&pn=AquaBid&am=${displayAmount}&cu=INR&tn=WaterTanker-${requestId}${isUrgent ? '-URGENT' : ''}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 space-y-5">
      <h3 className="font-heading font-semibold text-foreground text-center text-lg">Payment</h3>

      {/* Toggle normal vs urgent */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSelectUrgent(false)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${!isUrgent ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30'}`}>
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="font-heading font-semibold text-foreground text-sm">Normal Delivery</div>
          <div className="text-2xl font-heading font-bold text-primary mt-1">₹{amount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Standard delivery time</div>
        </motion.button>

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onSelectUrgent(true)}
          className={`p-4 rounded-xl border-2 transition-all text-center relative overflow-hidden ${isUrgent ? 'border-accent bg-accent/5 shadow-md' : 'border-border hover:border-accent/30'}`}>
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-bl-lg">PREMIUM</div>
          <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
          <div className="font-heading font-semibold text-foreground text-sm">Urgent Delivery</div>
          <div className="text-2xl font-heading font-bold text-accent mt-1">₹{urgentAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Within 30 minutes ⚡</div>
        </motion.button>
      </div>

      {isUrgent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <Zap className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="text-xs text-accent">Premium surcharge of <span className="font-bold">₹100</span> added for guaranteed delivery within 30 minutes</p>
        </motion.div>
      )}

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <QRCodeSVG value={upiString} size={180} level="H"
            imageSettings={{ src: '', height: 0, width: 0, excavate: false }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">Scan QR to pay <span className="font-bold text-foreground">₹{displayAmount.toLocaleString()}</span></p>
        <p className="text-xs text-muted-foreground">UPI ID: aquabid@upi</p>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 p-3 rounded-lg bg-secondary/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base amount</span>
          <span className="text-foreground font-medium">₹{amount.toLocaleString()}</span>
        </div>
        {isUrgent && (
          <div className="flex justify-between text-sm">
            <span className="text-accent flex items-center gap-1"><Zap className="w-3 h-3" /> Premium surcharge</span>
            <span className="text-accent font-medium">+ ₹100</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">₹{displayAmount.toLocaleString()}</span>
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onConfirmPayment}
        className={`w-full py-3 rounded-xl font-heading font-semibold text-primary-foreground text-sm ${isUrgent ? 'bg-accent hover:bg-accent/90' : 'gradient-primary'}`}>
        <IndianRupee className="w-4 h-4 inline mr-1" />
        Confirm Payment — ₹{displayAmount.toLocaleString()}
      </motion.button>
    </motion.div>
  );
};

export default PaymentQR;
