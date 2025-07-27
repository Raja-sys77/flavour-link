import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Layout from '@/components/Layout';
import { Cart } from '@/components/Cart';

interface CartItem {
  id: string;
  name: string;
  price_per_kg: number;
  supplier_name: string;
  supplier_id: string;
  stock_available: number;
  quantity: number;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout cart={cart}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <Layout cart={cart}>
              <Products cart={cart} setCart={setCart} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <Layout cart={cart}>
              <Cart cart={cart} setCart={setCart} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Layout cart={cart}>
              <Orders />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout cart={cart}>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;