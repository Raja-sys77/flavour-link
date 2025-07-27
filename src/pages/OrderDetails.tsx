import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  quantity: number;
  price_per_kg: number;
  product: {
    name: string;
    category: string;
  };
}

interface Order {
  id: string;
  vendor_id: string;
  supplier_id: string;
  status: string;
  total_price: number;
  created_at: string;
  vendor_profile: {
    full_name: string;
    location: string;
    phone: string;
  };
  supplier_profile: {
    full_name: string;
    location: string;
    phone: string;
  };
  order_items: OrderItem[];
}

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_profile:profiles!orders_vendor_id_fkey(full_name, location, phone),
          supplier_profile:profiles!orders_supplier_id_fkey(full_name, location, phone),
          order_items(
            *,
            product:products(name, category)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
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

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order cancelled successfully"
      });
      
      navigate('/orders');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found.</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {order.status === 'pending' && order.vendor_id === user?.id && (
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>₹{Number(order.total_price).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Vendor:</p>
              <p>{order.vendor_profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{order.vendor_profile.location}</p>
              <p className="text-sm text-muted-foreground">{order.vendor_profile.phone}</p>
            </div>
            <div>
              <p className="font-semibold">Supplier:</p>
              <p>{order.supplier_profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{order.supplier_profile.location}</p>
              <p className="text-sm text-muted-foreground">{order.supplier_profile.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">{item.product.category}</p>
                  <p className="text-sm">₹{Number(item.price_per_kg).toFixed(2)} per kg</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} kg</p>
                  <p className="text-sm">₹{(item.quantity * Number(item.price_per_kg)).toFixed(2)}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
              <span>Total:</span>
              <span>₹{Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;