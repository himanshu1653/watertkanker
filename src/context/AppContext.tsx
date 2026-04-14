import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, WaterRequest, Bid, DeliveryRoute, UserRole, CounterOffer } from '@/data/types';
import { mockUsers, mockRequests, mockBids, mockRoutes } from '@/data/mockData';

interface Notification {
  id: string;
  message: string;
  type: 'bid' | 'accepted' | 'delivery' | 'info' | 'counter_offer';
  time: string;
  read: boolean;
  data?: {
    counterOfferId?: string;
    requestId?: string;
  };
}

interface AppState {
  currentUser: User | null;
  requests: WaterRequest[];
  bids: Bid[];
  routes: DeliveryRoute[];
  notifications: Notification[];
  counterOffers: CounterOffer[];
  login: (role: UserRole, userId?: string) => void;
  logout: () => void;
  addRequest: (req: Omit<WaterRequest, 'id' | 'createdAt' | 'status'>) => void;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  acceptBid: (bidId: string, requestId: string) => void;
  addNotification: (msg: string, type: Notification['type'], data?: Notification['data']) => void;
  markNotificationRead: (id: string) => void;
  sendCounterOffer: (requestId: string, vendorId: string, vendorName: string, counterPrice: number, message: string) => void;
  respondToCounterOffer: (counterOfferId: string, accept: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<WaterRequest[]>(mockRequests);
  const [bids, setBids] = useState<Bid[]>(mockBids);
  const [routes] = useState<DeliveryRoute[]>(mockRoutes);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counterOffers, setCounterOffers] = useState<CounterOffer[]>([
    { id: 'co1', requestId: 'r1', vendorId: 'v1', vendorName: 'AquaFlow Suppliers', counterPrice: 1300, message: 'I can deliver premium quality water. ₹1300 is fair for 5000L.', status: 'pending', createdAt: '2026-04-14T08:30:00Z' },
  ]);

  const login = useCallback((role: UserRole, userId?: string) => {
    const user = userId
      ? mockUsers.find(u => u.id === userId)
      : mockUsers.find(u => u.role === role);
    if (user) setCurrentUser(user);
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addNotification = useCallback((message: string, type: Notification['type'], data?: Notification['data']) => {
    setNotifications(prev => [
      { id: `n${Date.now()}`, message, type, time: new Date().toISOString(), read: false, data },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addRequest = useCallback((req: Omit<WaterRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: WaterRequest = {
      ...req,
      id: `r${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);
    addNotification(`New water request: ${req.quantity}L at ${req.location.address} — Budget: ₹${req.offeredPrice}`, 'info');
  }, [addNotification]);

  const addBid = useCallback((bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    const newBid: Bid = { ...bid, id: `b${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    setBids(prev => [...prev, newBid]);
    setRequests(prev => prev.map(r => r.id === bid.requestId && r.status === 'open' ? { ...r, status: 'bidding' } : r));
    addNotification(`New bid of ₹${bid.price} from ${bid.vendorName}`, 'bid');
  }, [addNotification]);

  const acceptBid = useCallback((bidId: string, requestId: string) => {
    setBids(prev => prev.map(b => {
      if (b.id === bidId) return { ...b, status: 'accepted' };
      if (b.requestId === requestId && b.id !== bidId) return { ...b, status: 'rejected' };
      return b;
    }));
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted', acceptedBidId: bidId } : r));
    addNotification('Bid accepted! Delivery will start soon.', 'accepted');
  }, [addNotification]);

  const sendCounterOffer = useCallback((requestId: string, vendorId: string, vendorName: string, counterPrice: number, message: string) => {
    const co: CounterOffer = {
      id: `co${Date.now()}`,
      requestId,
      vendorId,
      vendorName,
      counterPrice,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setCounterOffers(prev => [...prev, co]);
    const req = requests.find(r => r.id === requestId);
    addNotification(
      `💬 ${vendorName} sent a counter offer of ₹${counterPrice} for your ${req?.quantity || ''}L request`,
      'counter_offer',
      { counterOfferId: co.id, requestId }
    );
  }, [addNotification, requests]);

  const respondToCounterOffer = useCallback((counterOfferId: string, accept: boolean) => {
    setCounterOffers(prev => prev.map(co =>
      co.id === counterOfferId ? { ...co, status: accept ? 'accepted' : 'rejected' } : co
    ));
    const co = counterOffers.find(c => c.id === counterOfferId);
    if (co && accept) {
      // Update the request's offered price to the counter price and auto-place a bid
      setRequests(prev => prev.map(r => r.id === co.requestId ? { ...r, offeredPrice: co.counterPrice } : r));
      addBid({
        requestId: co.requestId,
        vendorId: co.vendorId,
        vendorName: co.vendorName,
        price: co.counterPrice,
        eta: 45,
      });
      addNotification(`You accepted ${co.vendorName}'s counter offer of ₹${co.counterPrice}`, 'accepted');
    } else if (co) {
      addNotification(`Counter offer from ${co?.vendorName} was rejected`, 'info');
    }
  }, [counterOffers, addBid, addNotification]);

  // Simulate bid appearing after 10s for open requests
  useEffect(() => {
    const timer = setTimeout(() => {
      const openReq = requests.find(r => r.status === 'open');
      if (openReq) {
        addBid({
          requestId: openReq.id,
          vendorId: 'v2',
          vendorName: 'BlueWave Tankers',
          price: Math.round(openReq.quantity * 0.22),
          eta: 45,
          isRecommended: true,
        });
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [requests, addBid]);

  return (
    <AppContext.Provider value={{
      currentUser, requests, bids, routes, notifications, counterOffers,
      login, logout, addRequest, addBid, acceptBid, addNotification, markNotificationRead,
      sendCounterOffer, respondToCounterOffer,
    }}>
      {children}
    </AppContext.Provider>
  );
};
