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
  users: User[];
  requests: WaterRequest[];
  bids: Bid[];
  routes: DeliveryRoute[];
  notifications: Notification[];
  counterOffers: CounterOffer[];
  login: (email: string, password: string, role: UserRole) => boolean;
  signup: (userData: Omit<User, 'id'>) => boolean;
  logout: () => void;
  addRequest: (req: Omit<WaterRequest, 'id' | 'createdAt' | 'status'>) => void;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  acceptBid: (bidId: string, requestId: string) => void;
  confirmPayment: (requestId: string, isUrgent: boolean) => void;
  addNotification: (msg: string, type: Notification['type'], data?: Notification['data']) => void;
  markNotificationRead: (id: string) => void;
  sendCounterOffer: (requestId: string, vendorId: string, vendorName: string, counterPrice: number, message: string) => void;
  respondToCounterOffer: (counterOfferId: string, accept: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);
const APP_STATE_STORAGE_KEY = 'watertkanker_app_state_v1';

interface PersistedAppState {
  currentUser: User | null;
  users: User[];
  requests: WaterRequest[];
  bids: Bid[];
  routes: DeliveryRoute[];
  notifications: Notification[];
  counterOffers: CounterOffer[];
}

const loadPersistedState = (): PersistedAppState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const persisted = loadPersistedState();
  const [currentUser, setCurrentUser] = useState<User | null>(persisted?.currentUser ?? null);
  const [users, setUsers] = useState<User[]>(persisted?.users ?? mockUsers);
  const [requests, setRequests] = useState<WaterRequest[]>(persisted?.requests ?? mockRequests);
  const [bids, setBids] = useState<Bid[]>(persisted?.bids ?? mockBids);
  const [routes] = useState<DeliveryRoute[]>(persisted?.routes ?? mockRoutes);
  const [notifications, setNotifications] = useState<Notification[]>(persisted?.notifications ?? []);
  const [counterOffers, setCounterOffers] = useState<CounterOffer[]>(persisted?.counterOffers ?? [
    { id: 'co1', requestId: 'r1', vendorId: 'v1', vendorName: 'AquaFlow Suppliers', counterPrice: 1300, message: 'I can deliver premium quality water. ₹1300 is fair for 5000L.', status: 'pending', createdAt: '2026-04-14T08:30:00Z' },
  ]);

  const login = useCallback((email: string, password: string, role: UserRole) => {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && 
           u.password === password && 
           u.role === role
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const signup = useCallback((userData: Omit<User, 'id'>) => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return false;

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  }, [users]);

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
    if (req.quantity <= 0 || req.offeredPrice <= 0 || !req.requiredTime.trim()) return;
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
    if (bid.price <= 0 || bid.eta <= 0) return;
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

  const confirmPayment = useCallback((requestId: string, isUrgent: boolean) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const urgentPrice = r.offeredPrice + 100;
      return {
        ...r,
        isUrgent,
        urgentPrice: isUrgent ? urgentPrice : undefined,
        paymentStatus: 'paid',
      };
    }));
    const req = requests.find(r => r.id === requestId);
    const totalAmount = isUrgent ? (req?.offeredPrice || 0) + 100 : (req?.offeredPrice || 0);
    if (isUrgent) {
      addNotification(
        `⚡ Premium urgent delivery confirmed! ₹${totalAmount} paid. Your tanker will arrive within 30 minutes.`,
        'accepted'
      );
    } else {
      addNotification(`✅ Payment of ₹${totalAmount} confirmed for your water request.`, 'accepted');
    }
  }, [addNotification, requests]);

  const sendCounterOffer = useCallback((requestId: string, vendorId: string, vendorName: string, counterPrice: number, message: string) => {
    if (counterPrice <= 0 || !message.trim()) return;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stateToPersist: PersistedAppState = {
      currentUser,
      users,
      requests,
      bids,
      routes,
      notifications,
      counterOffers,
    };
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(stateToPersist));
  }, [currentUser, users, requests, bids, routes, notifications, counterOffers]);

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
      currentUser, users, requests, bids, routes, notifications, counterOffers,
      login, signup, logout, addRequest, addBid, acceptBid, confirmPayment, addNotification, markNotificationRead,
      sendCounterOffer, respondToCounterOffer,
    }}>
      {children}
    </AppContext.Provider>
  );
};
