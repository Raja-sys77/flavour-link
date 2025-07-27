import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, RefreshCw, Clock, CheckCircle, Truck } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_per_kg: number;
  products?: {
    name: string;
    category: string;
  };
}

interface Order {
  id: string;
  vendor_id: string;
  supplier_id: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered';
  created_at: string;
  vendor_profile?: {
    full_name: string;
    location: string;
    phone: string;
  };
  supplier_profile?: {
    full_name: string;
    location: string;
    phone: string;
  };
  order_items?: OrderItem[];
}

interface Profile {
  role: string;
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch orders based on user role
      let query = supabase
        .from('orders')
        .select(`
          *,
          vendor_profile:profiles!orders_vendor_id_fkey(full_name, location, phone),
          supplier_profile:profiles!orders_supplier_id_fkey(full_name, location, phone),
          order_items(
            *,
            products(name, category)
          )
        `)
        .order('created_at', { ascending: false });

      if (profileData.role === 'supplier') {
        query = query.eq('supplier_id', user?.id);
      } else {
        query = query.eq('vendor_id', user?.id);
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'confirmed' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: `Order status updated to ${newStatus}`
      });

      fetchData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'delivered':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      // Add items to cart (this would need to be passed from parent component)
      // For now, show success message
      toast({
        title: "Reorder Feature",
        description: "Reorder functionality would add these items to your cart",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  const isSupplier = profile?.role === 'supplier';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isSupplier ? 'Incoming Orders' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground">
          {isSupplier ? 'Manage customer orders' : 'Track your order history'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-muted-foreground">
            {isSupplier ? 'You have no incoming orders yet.' : 'You haven\'t placed any orders yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.id.slice(-8)}
                      <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {isSupplier ? (
                        <>From: {order.vendor_profile?.full_name} - {order.vendor_profile?.location}</>
                      ) : (
                        <>Supplier: {order.supplier_profile?.full_name} - {order.supplier_profile?.location}</>
                      )}
                    </CardDescription>
                    <CardDescription>
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{Number(order.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Order Items:</h4>
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.products?.category} • ₹{Number(item.price_per_kg).toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.quantity} kg</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(Number(item.price_per_kg) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {isSupplier && order.status !== 'delivered' && (
                  <div className="flex gap-2 pt-4 border-t">
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="flex-1"
                      >
                        Confirm Order
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        variant="outline"
                        className="flex-1"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                )}

                {!isSupplier && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Contact: {order.supplier_profile?.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;