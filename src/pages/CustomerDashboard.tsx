import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplets, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BidCard from '@/components/BidCard';
import MapView from '@/components/MapView';
import DeliveryTracker from '@/components/DeliveryTracker';

const CustomerDashboard: React.FC = () => {
  const { currentUser, requests, bids, routes, acceptBid, addRequest } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('5000');
  const [newTime, setNewTime] = useState('2 hours');
  const [newAddress, setNewAddress] = useState('');
  const [mapLat, setMapLat] = useState(28.6139);
  const [mapLng, setMapLng] = useState(77.209);

  const myRequests = requests.filter(r => r.customerId === currentUser?.id);
  const viewingRequest = selectedRequest ? requests.find(r => r.id === selectedRequest) : null;
  const requestBids = selectedRequest ? bids.filter(b => b.requestId === selectedRequest) : [];
  const activeDelivery = routes.find(rt => rt.stops.some(s => myRequests.some(r => r.id === s.requestId)));

  const handleCreate = () => {
    addRequest({
      customerId: currentUser!.id,
      customerName: currentUser!.name,
      location: { lat: mapLat, lng: mapLng, address: newAddress || 'Selected Location, Delhi' },
      quantity: parseInt(newQty),
      requiredTime: newTime,
    });
    setShowCreate(false);
    setNewAddress('');
  };

  const handleAcceptBid = (bidId: string) => {
    if (selectedRequest) acceptBid(bidId, selectedRequest);
  };

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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Quantity (Liters)</label>
              <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground" />
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
                <div className="font-heading font-semibold text-foreground">{req.quantity.toLocaleString()}L</div>
                <div className="text-sm text-muted-foreground">{req.location.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
          </h3>
          {requestBids.length === 0 && <p className="text-muted-foreground text-sm">No bids yet. Waiting for vendors...</p>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestBids.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0)).map(bid => (
              <BidCard key={bid.id} bid={bid} onAccept={handleAcceptBid} showActions={viewingRequest.status === 'bidding'} />
            ))}
          </div>
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
