import React from 'react';
import { Bell, LogOut, Droplets } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const AppHeader: React.FC = () => {
  const { currentUser, logout, notifications, markNotificationRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Droplets className="w-7 h-7 text-primary" />
        <span className="font-heading font-bold text-xl text-foreground">AquaBid</span>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full capitalize ml-2">
          {currentUser.role}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 gradient-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-border font-heading font-semibold text-sm text-foreground">Notifications</div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No notifications yet</div>}
                  {notifications.map(n => (
                    <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`w-full text-left p-3 border-b border-border/50 hover:bg-secondary/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className="text-sm text-foreground">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.time).toLocaleTimeString()}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block">{currentUser.name}</span>
        </div>

        <button onClick={logout} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
