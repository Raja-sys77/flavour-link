import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = async (eventType: string, data?: Record<string, any>, metadata?: Record<string, any>) => {
    if (!user) return;

    try {
      await supabase.from('analytics').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: data,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
        },
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = (page: string) => {
    track('page_view', { page });
  };

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    track('user_action', { action, ...details });
  };

  const trackOrderEvent = (event: string, orderId: string, details?: Record<string, any>) => {
    track('order_event', { event, order_id: orderId, ...details });
  };

  const trackProductEvent = (event: string, productId: string, details?: Record<string, any>) => {
    track('product_event', { event, product_id: productId, ...details });
  };

  return {
    track,
    trackPageView,
    trackUserAction,
    trackOrderEvent,
    trackProductEvent,
  };
};