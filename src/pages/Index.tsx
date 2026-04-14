import React from 'react';
import { useApp } from '@/context/AppContext';
import LoginPage from '@/pages/LoginPage';
import CustomerDashboard from '@/pages/CustomerDashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AppHeader from '@/components/AppHeader';

const Index: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return <LoginPage />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {currentUser.role === 'customer' && <CustomerDashboard />}
      {currentUser.role === 'vendor' && <VendorDashboard />}
      {currentUser.role === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Index;
