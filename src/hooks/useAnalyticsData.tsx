import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  profit: number;
  avgRating: number;
  stockLevel: number;
}

export interface CustomerAnalytics {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  avgOrderValue: number;
  segment: 'high-value' | 'frequent' | 'at-risk' | 'new';
}

export interface GeographicData {
  location: string;
  orders: number;
  revenue: number;
  customers: number;
}

export interface SupplierPerformance {
  id: string;
  name: string;
  totalOrders: number;
  avgDeliveryTime: number;
  onTimeDelivery: number;
  qualityRating: number;
  revenue: number;
}

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRevenueData(),
        fetchProductPerformance(),
        fetchCustomerAnalytics(),
        fetchGeographicData(),
        fetchSupplierPerformance(),
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    const ranges = {
      daily: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      weekly: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000), // Last 12 weeks
      monthly: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000), // Last 12 months
      yearly: new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000), // Last 5 years
    };
    return ranges[timeRange];
  };

  const fetchRevenueData = async () => {
    const startDate = getDateFilter();
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total_price, status')
      .or(`vendor_id.eq.${user?.id},supplier_id.eq.${user?.id}`)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'delivered');

    if (!orders) return;

    const groupedData = orders.reduce((acc: Record<string, { revenue: number; orders: number }>, order) => {
      const date = new Date(order.created_at);
      let key = '';
      
      switch (timeRange) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = String(date.getFullYear());
          break;
      }

      if (!acc[key]) {
        acc[key] = { revenue: 0, orders: 0 };
      }
      acc[key].revenue += Number(order.total_price);
      acc[key].orders += 1;
      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    })).sort((a, b) => a.date.localeCompare(b.date));

    setRevenueData(chartData);
  };

  const fetchProductPerformance = async () => {
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        order_items!inner(quantity, price_per_kg),
        reviews(rating)
      `)
      .eq('supplier_id', user?.id);

    if (!products) return;

    const performance = products.map(product => {
      const totalSold = product.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const revenue = product.order_items.reduce((sum: number, item: any) => sum + (item.quantity * item.price_per_kg), 0);
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        totalSold,
        revenue,
        profit: revenue * 0.2, // Assuming 20% profit margin
        avgRating,
        stockLevel: product.stock_available,
      };
    });

    setProductPerformance(performance);
  };

  const fetchCustomerAnalytics = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        vendor_id,
        total_price,
        created_at,
        profiles!orders_vendor_id_fkey(full_name)
      `)
      .eq('supplier_id', user?.id);

    if (!orders) return;

    const customerData = orders.reduce((acc: Record<string, any>, order) => {
      const customerId = order.vendor_id;
      if (!acc[customerId]) {
        acc[customerId] = {
          id: customerId,
          name: order.profiles?.full_name || 'Unknown',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.created_at,
          orders: [],
        };
      }
      acc[customerId].totalOrders += 1;
      acc[customerId].totalSpent += Number(order.total_price);
      acc[customerId].orders.push(order.created_at);
      if (order.created_at > acc[customerId].lastOrderDate) {
        acc[customerId].lastOrderDate = order.created_at;
      }
      return acc;
    }, {});

    const analytics = Object.values(customerData).map((customer: any) => {
      const avgOrderValue = customer.totalSpent / customer.totalOrders;
      const daysSinceLastOrder = Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
      
      let segment: CustomerAnalytics['segment'] = 'new';
      if (customer.totalSpent > 10000) segment = 'high-value';
      else if (customer.totalOrders > 10) segment = 'frequent';
      else if (daysSinceLastOrder > 90) segment = 'at-risk';

      return {
        ...customer,
        avgOrderValue,
        segment,
      };
    });

    setCustomerAnalytics(analytics);
  };

  const fetchGeographicData = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        total_price,
        profiles!orders_vendor_id_fkey(location)
      `)
      .eq('supplier_id', user?.id);

    if (!orders) return;

    const locationData = orders.reduce((acc: Record<string, any>, order) => {
      const location = order.profiles?.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = { location, orders: 0, revenue: 0, customers: new Set() };
      }
      acc[location].orders += 1;
      acc[location].revenue += Number(order.total_price);
      return acc;
    }, {});

    const geographic = Object.values(locationData).map((data: any) => ({
      location: data.location,
      orders: data.orders,
      revenue: data.revenue,
      customers: data.customers.size,
    }));

    setGeographicData(geographic);
  };

  const fetchSupplierPerformance = async () => {
    // This would be for vendors viewing supplier performance
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        supplier_id,
        total_price,
        created_at,
        status,
        delivery_date,
        profiles!orders_supplier_id_fkey(full_name)
      `)
      .eq('vendor_id', user?.id);

    if (!orders) return;

    const supplierData = orders.reduce((acc: Record<string, any>, order) => {
      const supplierId = order.supplier_id;
      if (!acc[supplierId]) {
        acc[supplierId] = {
          id: supplierId,
          name: order.profiles?.full_name || 'Unknown',
          totalOrders: 0,
          onTimeDeliveries: 0,
          revenue: 0,
          deliveryTimes: [],
        };
      }
      acc[supplierId].totalOrders += 1;
      acc[supplierId].revenue += Number(order.total_price);
      
      if (order.delivery_date && order.status === 'delivered') {
        const deliveryTime = Math.floor((new Date(order.delivery_date).getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
        acc[supplierId].deliveryTimes.push(deliveryTime);
        if (deliveryTime <= 3) { // On time if delivered within 3 days
          acc[supplierId].onTimeDeliveries += 1;
        }
      }
      return acc;
    }, {});

    const performance = Object.values(supplierData).map((supplier: any) => ({
      id: supplier.id,
      name: supplier.name,
      totalOrders: supplier.totalOrders,
      avgDeliveryTime: supplier.deliveryTimes.length > 0 
        ? supplier.deliveryTimes.reduce((sum: number, time: number) => sum + time, 0) / supplier.deliveryTimes.length 
        : 0,
      onTimeDelivery: supplier.totalOrders > 0 ? (supplier.onTimeDeliveries / supplier.totalOrders) * 100 : 0,
      qualityRating: 4.2, // Mock data - would come from reviews
      revenue: supplier.revenue,
    }));

    setSupplierPerformance(performance);
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    // Low stock alerts
    const lowStockProducts = productPerformance.filter(p => p.stockLevel < 10);
    if (lowStockProducts.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} products are running low on stock`,
        action: 'Restock products',
      });
    }

    // High-performing products
    const topProducts = productPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
    if (topProducts.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Top Performers',
        message: `${topProducts[0].name} is your best-selling product`,
        action: 'Increase marketing for similar products',
      });
    }

    // At-risk customers
    const atRiskCustomers = customerAnalytics.filter(c => c.segment === 'at-risk');
    if (atRiskCustomers.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Customer Retention',
        message: `${atRiskCustomers.length} customers haven't ordered recently`,
        action: 'Send re-engagement campaigns',
      });
    }

    return recommendations;
  };

  return {
    loading,
    revenueData,
    productPerformance,
    customerAnalytics,
    geographicData,
    supplierPerformance,
    timeRange,
    setTimeRange,
    recommendations: getRecommendations(),
    refreshData: fetchAnalyticsData,
  };
};