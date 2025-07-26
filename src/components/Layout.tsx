import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Vendora
          </Link>
          
          {user && (
            <nav className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/products"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/products' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Products</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/profile' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;