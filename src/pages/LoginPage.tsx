import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, User, Truck, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/data/types';

const roles: { role: UserRole; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { role: 'customer', icon: <User className="w-8 h-8" />, label: 'Customer', desc: 'Post water requests & accept bids', color: 'from-primary to-accent' },
  { role: 'vendor', icon: <Truck className="w-8 h-8" />, label: 'Vendor', desc: 'Bid on requests & manage deliveries', color: 'from-accent to-teal' },
  { role: 'admin', icon: <Shield className="w-8 h-8" />, label: 'Admin', desc: 'Monitor platform & analytics', color: 'from-aqua-dark to-primary' },
];

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = () => {
    if (selectedRole) login(selectedRole);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-ocean relative overflow-hidden">
      {/* Water effect bg */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-primary/30 animate-float" style={{
            width: `${100 + i * 60}px`, height: `${100 + i * 60}px`,
            left: `${10 + i * 18}%`, top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 1.2}s`,
          }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold font-heading text-primary-foreground">AquaBid</h1>
          </div>
          <p className="text-primary-foreground/70 text-lg">Smart Water Tanker Bidding & Logistics</p>
        </div>

        <div className="glass-card p-8" style={{ background: 'hsla(0,0%,100%,0.95)' }}>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6 text-center">Choose your role</h2>

          <div className="grid gap-3 mb-6">
            {roles.map(({ role, icon, label, desc, color }) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === role
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-primary-foreground`}>
                  {icon}
                </div>
                <div>
                  <div className="font-heading font-semibold text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{desc}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-1 block">Email (demo)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter any email..."
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={!selectedRole}
            className="w-full py-3 rounded-xl font-heading font-semibold text-primary-foreground gradient-primary disabled:opacity-40 transition-opacity"
          >
            Login as {selectedRole ? roles.find(r => r.role === selectedRole)?.label : '...'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
