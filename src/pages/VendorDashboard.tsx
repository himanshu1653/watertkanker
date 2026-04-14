import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, MapPin, Clock, IndianRupee, Send, Truck, Users, MessageSquare, Zap, CheckCircle2, History } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BidCard from '@/components/BidCard';
import MapView from '@/components/MapView';
import DeliveryTracker from '@/components/DeliveryTracker';
import { toast } from 'sonner';

const VendorDashboard: React.FC = () => {
  const { currentUser, requests, bids, routes, addBid, sendCounterOffer } = useApp();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidEta, setBidEta] = useState('45');
  const [tab, setTab] = useState<'requests' | 'mybids' | 'deliveries'>('requests');

  // Counter offer state
  const [bargainReq, setBargainReq] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMsg, setCounterMsg] = useState('');

  const openRequests = requests.filter(r => r.status === 'open' || r.status === 'bidding');
  const myBids = bids.filter(b => b.vendorId === currentUser?.id);
  const myAccepted = myBids.filter(b => b.status === 'accepted');
  const myRoutes = routes.filter(r => r.vendorId === currentUser?.id);

  const handlePlaceBid = (requestId: string, overridePrice?: number) => {
    const price = overridePrice || parseInt(bidPrice);
    if (!price) {
      toast.error('Please enter a valid price');
      return;
    }
    
    addBid({
      requestId,
      vendorId: currentUser!.id,
      vendorName: currentUser!.name,
      price: price,
      eta: parseInt(bidEta),
    });
    
    toast.success(overridePrice ? 'Order Accepted!' : 'Bid Submitted Successfully', {
      description: `Notification sent to the customer for ₹${price.toLocaleString()}`
    });
    
    setBidPrice('');
    setSelectedReq(null);
  };

  const handleSendCounterOffer = (requestId: string) => {
    if (!counterPrice || !counterMsg) {
      toast.error('Please fill in both price and message');
      return;
    }
    
    sendCounterOffer(requestId, currentUser!.id, currentUser!.name, parseInt(counterPrice), counterMsg);
    
    toast.info('Counter Offer Sent', {
      description: `Customer will be notified of your price: ₹${parseInt(counterPrice).toLocaleString()}`
    });
    
    setCounterPrice('');
    setCounterMsg('');
    setBargainReq(null);
  };

  const tabs = [
    { key: 'requests', label: 'Open Requests', icon: <Droplets className="w-4 h-4" /> },
    { key: 'mybids', label: 'My Bids & Offers', icon: <History className="w-4 h-4" /> },
    { key: 'deliveries', label: 'Active Deliveries', icon: <Truck className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available Jobs', value: openRequests.length, icon: <Droplets className="w-5 h-5" /> },
          { label: 'Pending Bids', value: myBids.filter(b => b.status === 'pending').length, icon: <IndianRupee className="w-5 h-5" /> },
          { label: 'Orders Won', value: myAccepted.length, icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: 'Live Deliveries', value: myRoutes.length, icon: <Truck className="w-5 h-5" /> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center gap-2 text-primary">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <div className="text-2xl font-heading font-bold text-foreground">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Open Requests */}
      {tab === 'requests' && (
        <div className="space-y-4">
          <MapView height="250px"
            markers={openRequests.map(r => ({ position: r.location, label: `${r.quantity}L - ₹${r.offeredPrice}`, type: 'request' }))}
          />
          <div className="grid gap-4">
            {openRequests.map(req => (
              <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                      <Droplets className="w-8 h-8 text-primary" />
                    </div>
                     <div>
                      <div className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                        {req.customerName}
                        {req.isUrgent && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-destructive text-white rounded-full animate-pulse">
                            <Zap className="w-3 h-3" /> URGENT
                          </span>
                        )}
                        {req.paymentStatus === 'paid' && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-success/10 text-success border border-success/20 rounded-md">PRE-PAID</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-primary" /> {req.location.address}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:flex items-center gap-4 lg:gap-8">
                    <div className="text-center md:text-left">
                      <div className="text-lg font-heading font-bold text-foreground">{req.quantity.toLocaleString()}L</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Volume</div>
                    </div>
                    <div className="text-center md:text-left">
                     <div className="text-lg font-heading font-bold text-accent flex items-center justify-center md:justify-start gap-1">
                        <IndianRupee className="w-4 h-4" />{(req.isUrgent ? (req.urgentPrice || req.offeredPrice + 100) : req.offeredPrice).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target Budget</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-lg font-heading font-bold text-foreground flex items-center justify-center md:justify-start gap-1"><Clock className="w-4 h-4 text-primary" />{req.requiredTime}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Timeline</div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlaceBid(req.id, req.isUrgent ? (req.urgentPrice || req.offeredPrice + 100) : req.offeredPrice)}
                      className="flex-1 md:w-full px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                      <CheckCircle2 className="w-4 h-4" /> Accept Job
                    </motion.button>
                    <div className="flex gap-2 flex-1">
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedReq(selectedReq === req.id ? null : req.id); setBargainReq(null); }}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${selectedReq === req.id ? 'bg-secondary border-primary' : 'bg-secondary/50 border-border hover:border-primary/50'}`}>
                        Custom Bid
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setBargainReq(bargainReq === req.id ? null : req.id); setSelectedReq(null); setCounterPrice(String(Math.round(req.offeredPrice * 1.2))); }}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border flex items-center justify-center gap-1 transition-colors ${bargainReq === req.id ? 'bg-accent/10 border-accent text-accent' : 'bg-secondary/50 border-border hover:border-accent/50'}`}>
                        <MessageSquare className="w-3.5 h-3.5" /> Bargain
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Bid form */}
                <AnimatePresence>
                  {selectedReq === req.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} 
                      className="mt-6 pt-6 border-t border-border space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Custom Price (₹)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} placeholder={`e.g. ${req.offeredPrice + 200}`} className="w-full pl-9 pr-4 py-3 rounded-xl border border-input bg-background" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Estimated Arrival (min)</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="number" value={bidEta} onChange={e => setBidEta(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-xl border border-input bg-background" />
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handlePlaceBid(req.id)}
                          className="md:mt-6 px-8 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" /> Submit Proposal
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bargain / Counter Offer form */}
                <AnimatePresence>
                  {bargainReq === req.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-accent/20 bg-accent/5 -mx-6 -mb-6 px-6 pb-6 space-y-4">
                      <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase transition-all">
                        <MessageSquare className="w-4 h-4" /> Negotiate with {req.customerName}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-accent uppercase mb-1.5 block">Requested Counter Price (₹)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                            <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)}
                              className="w-full pl-9 pr-4 py-3 rounded-xl border-accent/30 bg-white text-foreground font-bold focus:ring-accent" />
                          </div>
                        </div>
                        <div className="flex-2 flex-[2]">
                          <label className="text-xs font-bold text-accent uppercase mb-1.5 block">Message for Customer</label>
                          <input value={counterMsg} onChange={e => setCounterMsg(e.target.value)}
                            placeholder="I'm slightly far away, hence the extra cost for fuel..."
                            className="w-full px-4 py-3 rounded-xl border-accent/30 bg-white" />
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSendCounterOffer(req.id)}
                          className="md:mt-6 px-8 py-3 rounded-xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" /> Send Message
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {openRequests.length === 0 && <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">No open water requests in your area.</div>}
          </div>
        </div>
      )}

      {/* My Bids */}
      {tab === 'mybids' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBids.map(bid => (
              <BidCard key={bid.id} bid={bid} showActions={false} />
            ))}
          </div>
          {myBids.length === 0 && (
             <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
               You haven't placed any bids yet.
             </div>
          )}
        </div>
      )}

      {/* Deliveries */}
      {tab === 'deliveries' && (
        <div className="space-y-6">
          {myRoutes.map(route => (
            <div key={route.id} className="glass-card p-6 space-y-4 border-l-4 border-success">
               <div className="flex items-center justify-between">
                 <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                   <Truck className="w-5 h-5 text-success" /> Active Route: {route.driverName}
                 </h3>
                 <div className="text-sm font-bold text-success bg-success/10 px-3 py-1 rounded-full">
                   {route.progress}% Complete
                 </div>
               </div>
              <div className="grid md:grid-cols-2 gap-6">
                <MapView height="300px"
                  markers={[
                    { position: route.currentPosition, label: route.driverName, type: 'truck' },
                    ...route.stops.map(s => ({ position: s.location, label: s.location.address, type: 'request' as const })),
                  ]}
                  route={[route.currentPosition, ...route.stops.map(s => s.location)]}
                />
                <DeliveryTracker progress={route.progress} driverName={route.driverName}
                  stops={route.stops.map(s => ({ address: s.location.address, status: s.status }))} />
              </div>
            </div>
          ))}
          {myRoutes.length === 0 && (
             <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">
               No active deliveries assigned to you.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
