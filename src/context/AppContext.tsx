import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, WaterRequest, Bid, DeliveryRoute, UserRole } from '@/data/types';
import { mockUsers, mockRequests, mockBids, mockRoutes } from '@/data/mockData';

interface Notification {
  id: string;
  message: string;
  type: 'bid' | 'accepted' | 'delivery' | 'info';
  time: string;
  read: boolean;
}

interface AppState {
  currentUser: User | null;
  requests: WaterRequest[];
  bids: Bid[];
  routes: DeliveryRoute[];
  notifications: Notification[];
  login: (role: UserRole, userId?: string) => void;
  logout: () => void;
  addRequest: (req: Omit<WaterRequest, 'id' | 'createdAt' | 'status'>) => void;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  acceptBid: (bidId: string, requestId: string) => void;
  addNotification: (msg: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
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

  const login = useCallback((role: UserRole, userId?: string) => {
    const user = userId
      ? mockUsers.find(u => u.id === userId)
      : mockUsers.find(u => u.role === role);
    if (user) setCurrentUser(user);
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    setNotifications(prev => [
      { id: `n${Date.now()}`, message, type, time: new Date().toISOString(), read: false },
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
    addNotification(`New water request: ${req.quantity}L at ${req.location.address}`, 'info');
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
      currentUser, requests, bids, routes, notifications,
      login, logout, addRequest, addBid, acceptBid, addNotification, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};
