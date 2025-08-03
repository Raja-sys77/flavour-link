import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  vendorCount: number;
  supplierCount: number;
  completedOrdersCount: number;
  loading: boolean;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    vendorCount: 0,
    supplierCount: 0,
    completedOrdersCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get vendor count
        const { count: vendorCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'vendor');

        // Get supplier count
        const { count: supplierCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'supplier');

        // Get completed orders count
        const { count: completedOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'delivered');

        setStats({
          vendorCount: vendorCount || 0,
          supplierCount: supplierCount || 0,
          completedOrdersCount: completedOrdersCount || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};