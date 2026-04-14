import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Clock, MapPin, ChevronRight, IndianRupee, MessageSquare, Check, X, Zap, Truck, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BidCard from '@/components/BidCard';
import MapView from '@/components/MapView';
import DeliveryTracker from '@/components/DeliveryTracker';
import PaymentQR from '@/components/PaymentQR';

const CustomerDashboard: React.FC = () => {
  const { currentUser, users, requests, bids, routes, acceptBid, addRequest, counterOffers, respondToCounterOffer, confirmPayment } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('5000');
  const [newPrice, setNewPrice] = useState('1000');
  const [newTime, setNewTime] = useState('2 hours');
  const [newAddress, setNewAddress] = useState('');
  const [mapLat, setMapLat] = useState(28.6139);
  const [mapLng, setMapLng] = useState(77.209);

  // Payment state
  const [payingRequest, setPayingRequest] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  const myRequests = requests.filter(r => r.customerId === currentUser?.id);
  const viewingRequest = selectedRequest ? requests.find(r => r.id === selectedRequest) : null;
  const requestBids = selectedRequest ? bids.filter(b => b.requestId === selectedRequest) : [];
  const activeDelivery = routes.find(rt => rt.stops.some(s => myRequests.some(r => r.id === s.requestId)));

  const myCounterOffers = counterOffers.filter(co =>
    co.status === 'pending' && myRequests.some(r => r.id === co.requestId)
  );

  const vendors = users.filter(u => u.role === 'vendor');
  const marketStats = [
    { qty: '2,000L', avg: '₹450 - ₹600', trend: 'stable' },
    { qty: '5,000L', avg: '₹1,000 - ₹1,300', trend: 'up' },
    { qty: '10,000L', avg: '₹1,800 - ₹2,200', trend: 'down' },
  ];

  const handleCreate = () => {
    addRequest({
      customerId: currentUser!.id,
      customerName: currentUser!.name,
      location: { lat: mapLat, lng: mapLng, address: newAddress || 'Selected Location, Delhi' },
      quantity: parseInt(newQty),
      offeredPrice: parseInt(newPrice),
      requiredTime: newTime,
    });
    setShowCreate(false);
    setNewAddress('');
    setNewPrice('1000');
  };

  const handleAcceptBid = (bidId: string) => {
    if (selectedRequest) {
      acceptBid(bidId, selectedRequest);
      setPayingRequest(selectedRequest);
      setIsUrgent(false);
    }
  };

  const handleConfirmPayment = () => {
    if (payingRequest) {
      confirmPayment(payingRequest, isUrgent);
      setPayingRequest(null);
    }
  };

  const payingReq = payingRequest ? requests.find(r => r.id === payingRequest) : null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Requests', value: myRequests.length, icon: <Droplets className="w-5 h-5" /> },
          { label: 'Active Bids', value: bids.filter(b => myRequests.some(r => r.id === b.requestId) && b.status === 'pending').length, icon: <Clock className="w-5 h-5" /> },
          { label: 'Accepted', value: myRequests.filter(r => r.status === 'accepted' || r.status === 'in_delivery').length, icon: <MapPin className="w-5 h-5" /> },
          { label: 'Delivered', value: myRequests.filter(r => r.status === 'delivered').length, icon: <Droplets className="w-5 h-5" /> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center gap-2 text-primary">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <div className="text-2xl font-heading font-bold text-foreground">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Market & Vendor Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-b-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> Available Vendors
            </h3>
            <span className="text-xs font-bold px-2 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="text-3xl font-heading font-bold text-foreground">{vendors.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Vendors</div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Tankers:</span>
                <span className="font-bold text-foreground">{vendors.length * 2 + 3}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Response Rate:</span>
                <span className="font-bold text-success">98%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex -space-x-2">
            {vendors.slice(0, 5).map((v, i) => (
              <div key={i} title={v.name} className="w-8 h-8 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] font-bold text-primary shadow-sm uppercase">
                {v.name.charAt(0)}
              </div>
            ))}
            {vendors.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                +{vendors.length - 5}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-b-4 border-accent">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" /> Market Price Index
          </h3>
          <div className="space-y-3">
            {marketStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{stat.qty}</div>
                    <div className="text-[10px] text-muted-foreground">Avg. Market Rate</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-accent">{stat.avg}</div>
                  <div className={`text-[10px] flex items-center justify-end gap-1 font-bold ${
                    stat.trend === 'up' ? 'text-destructive' : stat.trend === 'down' ? 'text-success' : 'text-primary'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : stat.trend === 'down' ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                    {stat.trend.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payment QR Modal */}
      <AnimatePresence>
        {payingRequest && payingReq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && setPayingRequest(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md">
              <PaymentQR
                amount={payingReq.offeredPrice}
                urgentAmount={payingReq.offeredPrice + 100}
                requestId={payingReq.id}
                isUrgent={isUrgent}
                onSelectUrgent={setIsUrgent}
                onConfirmPayment={handleConfirmPayment}
              />
              <button onClick={() => setPayingRequest(null)} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter Offers Received */}
      {myCounterOffers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" /> Counter Offers from Vendors
          </h3>
          {myCounterOffers.map(co => {
            const req = requests.find(r => r.id === co.requestId);
            return (
              <motion.div key={co.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-4 border-l-4 border-accent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-heading font-semibold text-foreground">{co.vendorName}</div>
                    <p className="text-sm text-muted-foreground mt-1">"{co.message}"</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">Your price: <span className="font-semibold text-foreground">₹{req?.offeredPrice}</span></span>
                      <span className="text-accent font-bold">→ Counter: ₹{co.counterPrice}</span>
                      <span className="text-muted-foreground">for {req?.quantity?.toLocaleString()}L</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => respondToCounterOffer(co.id, true)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-success text-white text-sm font-semibold">
                      <Check className="w-4 h-4" /> Accept
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => respondToCounterOffer(co.id, false)}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-destructive text-white text-sm font-semibold">
                      <X className="w-4 h-4" /> Reject
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-foreground">My Water Requests</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">
          <Plus className="w-4 h-4" /> New Request
        </motion.button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground">Create Water Request</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Quantity (Liters)</label>
              <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> Your Budget (₹)
              </label>
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 1000"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Required Time</label>
              <select value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground">
                <option>1 hour</option><option>2 hours</option><option>3 hours</option><option>4 hours</option><option>Same day</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Location (click map)</label>
            <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Enter address..." className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground mb-3" />
            <MapView height="200px" markers={[{ position: { lat: mapLat, lng: mapLng, address: '' }, label: 'Selected', type: 'request' }]}
              onMapClick={(lat, lng) => { setMapLat(lat); setMapLng(lng); }} />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">
            Post Request
          </motion.button>
        </motion.div>
      )}

      {/* Request list */}
      <div className="grid gap-3">
        {myRequests.map(req => (
          <motion.button key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
            className={`glass-card p-4 flex items-center justify-between text-left w-full transition-all ${selectedRequest === req.id ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-heading font-semibold text-foreground flex items-center gap-2">
                  {req.quantity.toLocaleString()}L
                  {req.isUrgent && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-accent text-white rounded-full">
                      <Zap className="w-3 h-3" /> URGENT
                    </span>
                  )}
                  {req.paymentStatus === 'paid' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-success/10 text-success rounded-full">PAID</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{req.location.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <div className="text-sm font-heading font-bold text-accent flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />{(req.isUrgent ? (req.urgentPrice || req.offeredPrice + 100) : req.offeredPrice).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">{req.isUrgent ? 'urgent price' : 'budget'}</div>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                req.status === 'open' ? 'bg-warning/10 text-warning' :
                req.status === 'bidding' ? 'bg-primary/10 text-primary' :
                req.status === 'accepted' ? 'bg-success/10 text-success' :
                req.status === 'in_delivery' ? 'bg-accent/10 text-accent' :
                'bg-muted text-muted-foreground'
              }`}>
                {req.status.replace('_', ' ')}
              </span>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${selectedRequest === req.id ? 'rotate-90' : ''}`} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bid details for selected request */}
      {viewingRequest && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-heading font-semibold text-foreground">
            Bids for {viewingRequest.quantity.toLocaleString()}L — {viewingRequest.location.address}
            <span className="ml-2 text-accent text-sm font-normal">(Your budget: ₹{viewingRequest.offeredPrice.toLocaleString()})</span>
          </h3>
          {requestBids.length === 0 && <p className="text-muted-foreground text-sm">No bids yet. Waiting for vendors...</p>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestBids.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0)).map(bid => (
              <BidCard key={bid.id} bid={bid} onAccept={handleAcceptBid} showActions={viewingRequest.status === 'bidding'} />
            ))}
          </div>

          {/* Show payment button for accepted requests without payment */}
          {viewingRequest.status === 'accepted' && viewingRequest.paymentStatus !== 'paid' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setPayingRequest(viewingRequest.id); setIsUrgent(false); }}
                className="px-8 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center gap-2">
                <IndianRupee className="w-5 h-5" /> Proceed to Payment
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Active delivery tracker */}
      {activeDelivery && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-foreground">Live Delivery Tracking</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <MapView height="250px"
              markers={[
                { position: activeDelivery.currentPosition, label: activeDelivery.driverName, type: 'truck' },
                ...activeDelivery.stops.map(s => ({ position: s.location, label: s.location.address, type: 'request' as const })),
              ]}
              route={[activeDelivery.currentPosition, ...activeDelivery.stops.map(s => s.location)]}
            />
            <DeliveryTracker progress={activeDelivery.progress} driverName={activeDelivery.driverName}
              stops={activeDelivery.stops.map(s => ({ address: s.location.address, status: s.status }))} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
