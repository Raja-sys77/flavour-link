import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScheduleDelivery from './ScheduleDelivery';

interface CartItem {
  id: string;
  name: string;
  price_per_kg: number;
  supplier_name: string;
  supplier_id: string;
  stock_available: number;
  quantity: number;
}

interface CartProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

export const Cart = ({ cart, setCart }: CartProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stockValidation, setStockValidation] = useState<{[key: string]: number}>({});
  const [showScheduling, setShowScheduling] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    deliveryDate: string;
    timeSlot: string;
    instructions: string;
  } | null>(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price_per_kg * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.id === productId);
    if (item && newQuantity > item.stock_available) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.stock_available} kg available`,
        variant: "destructive"
      });
      return;
    }

    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };


  // Validate stock availability
  const validateStock = async () => {
    const stockCheck: {[key: string]: number} = {};
    
    for (const item of cart) {
      const { data, error } = await supabase
        .from('products')
        .select('stock_available')
        .eq('id', item.id)
        .single();
        
      if (!error && data) {
        stockCheck[item.id] = data.stock_available;
      }
    }
    
    setStockValidation(stockCheck);
    return stockCheck;
  };
  const placeOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to place an order",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to your cart before placing an order",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryInfo) {
      setShowScheduling(true);
      return;
    }

    setLoading(true);
    
    // Validate stock first
    const stockCheck = await validateStock();
    const hasStockIssues = cart.some(item => 
      (stockCheck[item.id] || 0) < item.quantity
    );
    
    if (hasStockIssues) {
      toast({
        title: "Stock Validation Failed",
        description: "Some items don't have sufficient stock available",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Group cart items by supplier
      const ordersBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplier_id]) {
          acc[item.supplier_id] = [];
        }
        acc[item.supplier_id].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create separate orders for each supplier
      for (const [supplierId, items] of Object.entries(ordersBySupplier)) {
        const totalPrice = items.reduce((total, item) => total + (item.price_per_kg * item.quantity), 0);

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            vendor_id: user.id,
            supplier_id: supplierId,
            total_price: totalPrice,
            status: 'pending',
            delivery_date: deliveryInfo.deliveryDate,
            preferred_time_slot: deliveryInfo.timeSlot,
            delivery_instructions: deliveryInfo.instructions || null
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price_per_kg: item.price_per_kg
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Update stock for each product
        for (const item of items) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock_available: (stockCheck[item.id] || 0) - item.quantity 
            })
            .eq('id', item.id);

          if (stockError) throw stockError;
        }
      }

      toast({
        title: "Order Placed Successfully!",
        description: "Your orders have been placed with scheduled delivery."
      });

      setCart([]);
      setDeliveryInfo(null);
      setShowScheduling(false);
      navigate('/orders');

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

  const handleSchedule = (info: { deliveryDate: string; timeSlot: string; instructions: string }) => {
    setDeliveryInfo(info);
    setShowScheduling(false);
    toast({
      title: "Delivery Scheduled",
      description: `Delivery set for ${new Date(info.deliveryDate).toLocaleDateString()} at ${info.timeSlot}`
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="secondary">{cart.length} items</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">
                      Supplier: {item.supplier_name}
                    </p>
                    <p className="text-primary font-medium">
                      ₹{item.price_per_kg.toFixed(2)} per kg
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="1"
                        max={item.stock_available}
                        disabled={loading}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading || item.quantity >= item.stock_available}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(item.price_per_kg * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} kg
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              {deliveryInfo && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">Scheduled Delivery:</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(deliveryInfo.deliveryDate).toLocaleDateString()} at {deliveryInfo.timeSlot}
                  </p>
                </div>
              )}

              {showScheduling ? (
                <ScheduleDelivery onSchedule={handleSchedule} />
              ) : (
                <Button 
                  onClick={placeOrder} 
                  disabled={loading} 
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Placing Order..." : deliveryInfo ? "Place Order" : "Schedule & Order"}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')} 
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};