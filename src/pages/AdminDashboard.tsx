import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, IndianRupee, Truck, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MapView from '@/components/MapView';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const priceData = [
  { name: 'Mon', avg: 1100 }, { name: 'Tue', avg: 1250 }, { name: 'Wed', avg: 980 },
  { name: 'Thu', avg: 1300 }, { name: 'Fri', avg: 1150 }, { name: 'Sat', avg: 900 }, { name: 'Sun', avg: 1050 },
];
const requestData = [
  { name: 'Mon', count: 12 }, { name: 'Tue', count: 19 }, { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 }, { name: 'Fri', count: 18 }, { name: 'Sat', count: 25 }, { name: 'Sun', count: 14 },
];
const vendorPerf = [
  { name: 'AquaFlow', rating: 4.5, deliveries: 45 },
  { name: 'BlueWave', rating: 4.8, deliveries: 38 },
  { name: 'PureDrops', rating: 4.2, deliveries: 29 },
];
const statusPie = [
  { name: 'Open', value: 15, color: 'hsl(38, 92%, 55%)' },
  { name: 'Bidding', value: 25, color: 'hsl(192, 82%, 35%)' },
  { name: 'Accepted', value: 18, color: 'hsl(145, 60%, 42%)' },
  { name: 'Delivered', value: 42, color: 'hsl(210, 50%, 10%)' },
];

const AdminDashboard: React.FC = () => {
  const { requests, bids, routes } = useApp();

  const allMarkers = [
    ...requests.map(r => ({ position: r.location, label: `${r.quantity}L - ${r.status}`, type: 'request' as const })),
    ...routes.flatMap(r => [{ position: r.currentPosition, label: r.driverName, type: 'truck' as const }]),
  ];

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: <Droplets className="w-5 h-5" />, change: '+12%', up: true },
    { label: 'Active Bids', value: bids.filter(b => b.status === 'pending').length, icon: <IndianRupee className="w-5 h-5" />, change: '+8%', up: true },
    { label: 'Accepted Orders', value: bids.filter(b => b.status === 'accepted').length, icon: <Truck className="w-5 h-5" />, change: '+5%', up: true },
    { label: 'Total Users', value: 156, icon: <Users className="w-5 h-5" />, change: '-2%', up: false },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-success' : 'text-destructive'}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {s.change}
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-foreground">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Price Trends (Avg ₹/delivery)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={priceData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210,15%,50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210,15%,50%)" />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="hsl(192, 82%, 35%)" strokeWidth={3} dot={{ fill: 'hsl(192, 82%, 35%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Requests per Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={requestData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210,15%,50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210,15%,50%)" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(168, 60%, 40%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Status pie */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor performance */}
        <div className="glass-card p-6 col-span-1">
          <h3 className="font-heading font-semibold text-foreground mb-4">Vendor Performance</h3>
          <div className="space-y-4">
            {vendorPerf.map((v, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground text-sm">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.deliveries} deliveries</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">{v.rating}</span>
                  <span className="text-gold">★</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User management static */}
        <div className="glass-card p-6 col-span-1">
          <h3 className="font-heading font-semibold text-foreground mb-4">User Management</h3>
          <div className="space-y-3">
            {[
              { name: 'Customers', count: 89, color: 'bg-primary' },
              { name: 'Vendors', count: 34, color: 'bg-accent' },
              { name: 'Drivers', count: 28, color: 'bg-warning' },
              { name: 'Admins', count: 5, color: 'bg-ocean' },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${u.color}`} />
                  <span className="text-sm text-foreground">{u.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{u.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">All Deliveries Map</h3>
        <MapView height="350px" markers={allMarkers}
          route={routes.length > 0 ? [routes[0].currentPosition, ...routes[0].stops.map(s => s.location)] : undefined} />
      </div>
    </div>
  );
};

export default AdminDashboard;
