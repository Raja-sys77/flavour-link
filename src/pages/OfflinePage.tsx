import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home, Package, ShoppingCart } from 'lucide-react';

const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('background-sync-retry');
      });
    }
    window.location.reload();
  };

  const quickActions = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
          <p className="text-muted-foreground">
            It looks like you're not connected to the internet. Some features may be limited.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium">What you can do offline:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• View cached products and orders</li>
              <li>• Browse your profile information</li>
              <li>• Access recently viewed content</li>
              <li>• Take notes for later sync</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Quick Actions:</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-3"
                  onClick={() => window.location.href = action.path}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Your actions will be synced automatically when you're back online.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;