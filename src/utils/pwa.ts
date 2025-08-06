export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.registerServiceWorker();
      await this.setupPushNotifications();
      this.setupInstallPrompt();
      console.log('PWA initialized successfully');
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', this.registration);

        // Handle service worker updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
  }

  private async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted' && this.registration) {
          console.log('Push notifications enabled');
          
          // Subscribe to push notifications
          const subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              'BEl62iUYgUivxIkv69yViEuiBIa40HI80NMzUdJf8pn'
            )
          });

          // Send subscription to server
          await this.sendSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error('Push notification setup failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Page visibility for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncWhenOnline();
      }
    });
  }

  public addOnlineStatusListener(callback: (isOnline: boolean) => void): void {
    this.listeners.add(callback);
  }

  public removeOnlineStatusListener(callback: (isOnline: boolean) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  private async syncWhenOnline(): Promise<void> {
    if (this.registration && 'sync' in this.registration) {
      try {
        await this.registration.sync.register('background-sync-orders');
        await this.registration.sync.register('background-sync-products');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  public async cacheOfflineData(key: string, data: any): Promise<void> {
    try {
      const cache = await caches.open('vendora-dynamic-v1.0.0');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/offline-data/${key}`, response);
    } catch (error) {
      console.error('Failed to cache offline data:', error);
    }
  }

  public async getOfflineData(key: string): Promise<any> {
    try {
      const cache = await caches.open('vendora-dynamic-v1.0.0');
      const response = await cache.match(`/offline-data/${key}`);
      return response ? await response.json() : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (this.registration && 'showNotification' in this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // TODO: Send subscription to your server
    console.log('Push subscription:', subscription);
  }

  private showUpdateAvailable(): void {
    // Show update notification to user
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  private showInstallPrompt(deferredPrompt: any): void {
    // Show install prompt to user
    const event = new CustomEvent('pwa-install-available', { detail: deferredPrompt });
    window.dispatchEvent(event);
  }

  private handleServiceWorkerMessage(data: any): void {
    console.log('Service Worker message:', data);
    
    if (data.type === 'SYNC_COMPLETE') {
      this.showNotification('Sync Complete', {
        body: 'Your offline changes have been synced successfully.'
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}