import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LogOut, Package, User, LayoutDashboard, ShoppingCart, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  cart: { id: string; quantity: number; }[];
}

const Layout = ({ children, cart }: LayoutProps) => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackUserAction } = useAnalytics();
  
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSignOut = async () => {
    trackUserAction('logout');
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen animated-gradient">
      <header className="glass-effect border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-3xl font-black gradient-text pulse-glow">
            🚀 VENDORA
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-sm">{t('nav.dashboard')}</span>
            </Link>
            
            <Link 
              to="/products" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/products' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="text-sm">{t('nav.products')}</span>
            </Link>

            <Link 
              to="/cart" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors relative ${
                location.pathname === '/cart' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">{t('nav.cart')}</span>
              {cartCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 text-xs flex items-center justify-center bg-destructive text-destructive-foreground">
                  {cartCount}
                </Badge>
              )}
            </Link>

            <Link 
              to="/orders" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/orders' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm">{t('nav.orders')}</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/profile' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <User className="h-4 w-4" />
              <span className="text-sm">{t('nav.profile')}</span>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <LanguageSelector />
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t('nav.logout')}</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-12">
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;