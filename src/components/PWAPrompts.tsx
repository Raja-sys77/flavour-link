import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, RefreshCw, WifiOff, Wifi } from 'lucide-react';
import { PWAManager } from '@/utils/pwa';
import { useToast } from '@/components/ui/use-toast';

const PWAPrompts: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();
  const pwaManager = PWAManager.getInstance();

  useEffect(() => {
    // Listen for PWA events
    const handleInstallPrompt = (event: CustomEvent) => {
      setDeferredPrompt(event.detail);
      setShowInstallPrompt(true);
    };

    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    const handleOnlineStatus = (online: boolean) => {
      setIsOnline(online);
      if (online) {
        toast({
          title: "Back Online",
          description: "Syncing your offline changes...",
        });
      } else {
        toast({
          title: "You're Offline",
          description: "Some features may be limited",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('pwa-install-available', handleInstallPrompt as EventListener);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    pwaManager.addOnlineStatusListener(handleOnlineStatus);

    // Initial online status
    setIsOnline(pwaManager.getOnlineStatus());

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallPrompt as EventListener);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      pwaManager.removeOnlineStatusListener(handleOnlineStatus);
    };
  }, [toast, pwaManager]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App Installed",
          description: "Vendora has been added to your home screen!",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdate = async () => {
    await pwaManager.updateServiceWorker();
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Online Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
          isOnline 
            ? 'bg-green-100 text-green-800 shadow-sm' 
            : 'bg-red-100 text-red-800 shadow-md'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
          <Card className="shadow-lg border-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Install Vendora</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Get the full app experience with offline access, push notifications, and faster loading.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleInstall} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInstallPrompt(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
          <Card className="shadow-lg border-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Update Available</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdatePrompt(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                A new version of Vendora is available with improvements and bug fixes.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdatePrompt(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default PWAPrompts;