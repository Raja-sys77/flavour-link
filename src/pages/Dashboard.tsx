import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  role: string;
  location: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  price_per_kg: number;
  stock_available: number;
  category: string;
}

interface Order {
  id: string;
  vendor_id: string;
  supplier_id: string;
  total_price: number;
  status: string;
  created_at: string;
  vendor_profile?: Profile;
  supplier_profile?: Profile;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData.role === 'supplier') {
        // Fetch supplier's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('supplier_id', user?.id);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_profile:profiles!orders_vendor_id_fkey(*),
          supplier_profile:profiles!orders_supplier_id_fkey(*)
        `)
        .or(`vendor_id.eq.${user?.id},supplier_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const isSupplier = profile?.role === 'supplier';
  const totalRevenue = orders
    .filter(order => isSupplier ? order.supplier_id === user?.id : order.vendor_id === user?.id)
    .reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8 border border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-xl text-muted-foreground">
              {isSupplier ? 'Supplier Dashboard' : 'Vendor Dashboard'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge 
              variant={isSupplier ? 'default' : 'secondary'} 
              className="text-sm px-4 py-2 rounded-full bg-primary/10 text-primary border-primary/20"
            >
              {profile?.role?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full filter blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSupplier ? 'Total Products' : 'Orders Placed'}
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isSupplier ? products.length : orders.filter(o => o.vendor_id === user?.id).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSupplier ? 'Active products' : 'Total orders'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card backdrop-blur-sm border-secondary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full filter blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSupplier ? 'Orders Received' : 'Total Spent'}
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isSupplier ? 
                orders.filter(o => o.supplier_id === user?.id).length :
                `₹${totalRevenue.toFixed(2)}`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {isSupplier ? 'Orders received' : 'Total expenditure'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card backdrop-blur-sm border-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full filter blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSupplier ? 'Revenue' : 'Pending Orders'}
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {isSupplier ? 
                `₹${totalRevenue.toFixed(2)}` :
                orders.filter(o => o.vendor_id === user?.id && o.status === 'pending').length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {isSupplier ? 'Total revenue' : 'Awaiting confirmation'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full filter blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">{profile?.location}</div>
            <p className="text-xs text-muted-foreground">Operating location</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-gradient-to-br from-card/50 to-card backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Recent Orders
          </CardTitle>
          <CardDescription className="text-base">
            {isSupplier ? 'Orders received from vendors' : 'Your recent orders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">
                      Order from {isSupplier ? order.vendor_profile?.full_name : order.supplier_profile?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(order.total_price).toFixed(2)}</p>
                    <Badge variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'confirmed' ? 'secondary' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Products */}
      {isSupplier && (
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage your product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No products added yet.</p>
                <Button>Add Your First Product</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div key={product.id} className="border rounded p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="mt-2">
                      <p className="text-lg font-bold">₹{Number(product.price_per_kg).toFixed(2)}/kg</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock_available} kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;