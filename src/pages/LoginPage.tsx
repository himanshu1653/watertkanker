import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, User, Truck, Shield, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/data/types';

const roles: { role: UserRole; icon: React.ReactNode; label: string; desc: string; color: string; accent: string }[] = [
  { 
    role: 'customer', 
    icon: <User className="w-6 h-6" />, 
    label: 'Customer', 
    desc: 'Order water & track delivery', 
    color: 'from-blue-500 to-cyan-400',
    accent: 'blue'
  },
  { 
    role: 'vendor', 
    icon: <Truck className="w-6 h-6" />, 
    label: 'Vendor', 
    desc: 'Give bids & manage tankers', 
    color: 'from-teal-500 to-emerald-400',
    accent: 'teal'
  },
  { 
    role: 'admin', 
    icon: <Shield className="w-6 h-6" />, 
    label: 'Admin', 
    desc: 'Platform control & insights', 
    color: 'from-ocean-dark to-primary',
    accent: 'ocean'
  },
];

const LoginPage: React.FC = () => {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIST = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  // Load remembered credentials
  React.useEffect(() => {
    const saved = localStorage.getItem('aquabid_remembered');
    if (saved) {
      try {
        const { email, password, role } = JSON.parse(saved);
        if (email) setEmail(email);
        if (password) setPassword(password);
        if (role) setSelectedRole(role);
        setRememberMe(true);
      } catch (e) {
        console.error('Failed to parse remembered credentials');
      }
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Save or clear remember me setting
    if (rememberMe) {
      localStorage.setItem('aquabid_remembered', JSON.stringify({ email, password, role: selectedRole }));
    } else {
      localStorage.removeItem('aquabid_remembered');
    }

    // Small delay to simulate auth
    setTimeout(() => {
      if (isSignUp) {
        const success = signup({ name, email, password, role: selectedRole, phone });
        if (!success) {
          setError('User with this email already exists.');
        }
      } else {
        const success = login(email, password, selectedRole);
        if (!success) {
          setError('Invalid email or password for this role.');
        }
      }
      setLoading(false);
    }, 800);
  };

  const getRoleAccent = () => roles.find(r => r.role === selectedRole)?.accent || 'blue';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-ocean relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, 50, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute rounded-full bg-white/5 blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${i * 20}%`,
              top: `${(i % 3) * 40}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[1000px] grid md:grid-cols-2 bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/20"
      >
        {/* Left Side: Brand & Visuals */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/80 to-ocean-dark/90 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <Droplets className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight leading-none">AquaBid</h1>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mt-1">
                  INDIA · {formatIST(currentTime).split(',')[0]}
                </div>
              </div>
            </div>
            
            {/* Live Clock Display */}
            <div className="mb-10 bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-inner">
               <div className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-2 font-mono">Real-time Network Status</div>
               <div className="text-3xl font-mono font-bold tracking-tight">
                 {formatIST(currentTime).split(',')[1]} 
               </div>
               <div className="text-[10px] text-white/40 mt-1 italic">Synced with IST (UTC +5:30)</div>
            </div>

            <div className="space-y-6">
              <motion.h2 
                key={`${selectedRole}-${isSignUp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-heading font-bold leading-tight"
              >
                {isSignUp ? 'Create your' : 'Welcome back,'} <br />
                <span className="text-accent">{isSignUp ? 'Account' : (selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1))}</span>
              </motion.h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Connect with reliable water tanker providers and manage your requirements with ease.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/50 bg-black/10 p-4 rounded-xl border border-white/5">
              <Shield className="w-4 h-4" />
              <span>Enterprise-grade security for every drop.</span>
            </div>
          </div>

          {/* Decorative water wave SVG */}
          <div className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 400 150" fill="white">
              <path d="M0,100 C150,200 250,0 400,100 L400,150 L0,150 Z" />
            </svg>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 bg-white/95 backdrop-blur-md">
          <div className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Droplets className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold text-foreground">AquaBid</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider">{formatIST(currentTime).split(',')[1]}</div>
              <div className="text-[8px] text-muted-foreground uppercase">{formatIST(currentTime).split(',')[0]}</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
              {isSignUp ? 'Join AquaBid' : 'Login to your account'}
            </h3>
            <p className="text-muted-foreground">
              {isSignUp ? 'Fill in your details to get started' : 'Choose your role and enter credentials'}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex p-1.5 bg-secondary rounded-2xl mb-8 gap-1">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${
                  selectedRole === r.role 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:bg-white/50'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${selectedRole === r.role ? 'bg-primary/10 text-primary' : ''}`}>
                  {r.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm border border-destructive/20"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3.5">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-border bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-border bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <ArrowRight className="rotate-90 w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-border bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground/80">Password</label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-border bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember for 30 days</label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-heading font-bold text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'gradient-primary hover:opacity-90'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : `Sign In as ${roles.find(r => r.role === selectedRole)?.label}`}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-bold text-primary hover:underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </form>
          
          {/* Demo Hint */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
              <div className="text-primary mt-0.5"><AlertCircle className="w-4 h-4" /></div>
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-bold block text-foreground mb-0.5 uppercase tracking-tighter">Quick Start:</span>
                Sign up as any role to test, or use:<br />
                Admin: admin@aquabid.com / admin<br />
                User: rajesh@example.com / password123
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
