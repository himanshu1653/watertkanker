import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, MapPin, Clock, IndianRupee, Send, Truck, Users, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BidCard from '@/components/BidCard';
import MapView from '@/components/MapView';
import DeliveryTracker from '@/components/DeliveryTracker';

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

  const handlePlaceBid = (requestId: string) => {
    if (!bidPrice) return;
    addBid({
      requestId,
      vendorId: currentUser!.id,
      vendorName: currentUser!.name,
      price: parseInt(bidPrice),
      eta: parseInt(bidEta),
    });
    setBidPrice('');
    setSelectedReq(null);
  };

  const handleSendCounterOffer = (requestId: string) => {
    if (!counterPrice || !counterMsg) return;
    sendCounterOffer(requestId, currentUser!.id, currentUser!.name, parseInt(counterPrice), counterMsg);
    setCounterPrice('');
    setCounterMsg('');
    setBargainReq(null);
  };

  const tabs = [
    { key: 'requests', label: 'Open Requests', icon: <Droplets className="w-4 h-4" /> },
    { key: 'mybids', label: 'My Bids', icon: <IndianRupee className="w-4 h-4" /> },
    { key: 'deliveries', label: 'Deliveries', icon: <Truck className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Requests', value: openRequests.length, icon: <Droplets className="w-5 h-5" /> },
          { label: 'My Bids', value: myBids.length, icon: <IndianRupee className="w-5 h-5" /> },
          { label: 'Accepted', value: myAccepted.length, icon: <Users className="w-5 h-5" /> },
          { label: 'Active Routes', value: myRoutes.length, icon: <Truck className="w-5 h-5" /> },
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
          <div className="grid gap-3">
            {openRequests.map(req => (
              <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-foreground">{req.customerName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {req.location.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-heading font-bold text-foreground">{req.quantity.toLocaleString()}L</div>
                      <div className="text-xs text-muted-foreground">Quantity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-heading font-bold text-accent flex items-center justify-center gap-1">
                        <IndianRupee className="w-4 h-4" />{req.offeredPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Customer Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-heading font-bold text-foreground flex items-center gap-1"><Clock className="w-4 h-4 text-accent" />{req.requiredTime}</div>
                      <div className="text-xs text-muted-foreground">Deadline</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedReq(selectedReq === req.id ? null : req.id); setBargainReq(null); }}
                        className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold">
                        Place Bid
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => { setBargainReq(bargainReq === req.id ? null : req.id); setSelectedReq(null); setCounterPrice(String(Math.round(req.offeredPrice * 1.2))); }}
                        className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Bargain
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Bid form */}
                {selectedReq === req.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground block mb-1">Your Price (₹)</label>
                      <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} placeholder={`Customer budget: ₹${req.offeredPrice}`} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground block mb-1">ETA (minutes)</label>
                      <input type="number" value={bidEta} onChange={e => setBidEta(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground" />
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handlePlaceBid(req.id)}
                      className="self-end px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm flex items-center gap-2">
                      <Send className="w-4 h-4" /> Submit Bid
                    </motion.button>
                  </motion.div>
                )}

                {/* Bargain / Counter Offer form */}
                {bargainReq === req.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-accent/30 space-y-3">
                    <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                      <MessageSquare className="w-4 h-4" /> Send Counter Offer to {req.customerName}
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground block mb-1">Your Counter Price (₹)</label>
                        <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-accent/30 bg-background text-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">Customer offered ₹{req.offeredPrice}</p>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground block mb-1">Message</label>
                        <input value={counterMsg} onChange={e => setCounterMsg(e.target.value)}
                          placeholder="Explain why your price is fair..."
                          className="w-full px-4 py-2.5 rounded-lg border border-accent/30 bg-background text-foreground" />
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSendCounterOffer(req.id)}
                        className="self-end px-6 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Offer
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Bids */}
      {tab === 'mybids' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBids.map(bid => (
            <BidCard key={bid.id} bid={bid} showActions={false} />
          ))}
          {myBids.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No bids placed yet</p>}
        </div>
      )}

      {/* Deliveries */}
      {tab === 'deliveries' && (
        <div className="space-y-4">
          {myRoutes.map(route => (
            <div key={route.id} className="grid md:grid-cols-2 gap-4">
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
          ))}
          {myRoutes.length === 0 && <p className="text-muted-foreground text-center py-8">No active deliveries</p>}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
