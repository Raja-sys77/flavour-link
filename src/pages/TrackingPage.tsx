import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Package, Truck, MapPin, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Shipment {
  id: string;
  tracking_number: string;
  current_location: string;
  status: 'order_confirmed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimated_delivery: string;
  created_at: string;
  updated_at: string;
  order_id: string;
}

interface Order {
  id: string;
  total_price: number;
  vendor_profile?: {
    full_name: string;
    location: string;
  };
  supplier_profile?: {
    full_name: string;
    location: string;
  };
}

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const { t } = useTranslation();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!trackingNumber) return;

      try {
        // Fetch shipment data
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('tracking_number', trackingNumber)
          .single();

        if (shipmentError) {
          setError('Tracking number not found');
          setLoading(false);
          return;
        }

        setShipment(shipmentData as Shipment);

        // Fetch order data
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            vendor_profile:profiles!orders_vendor_id_fkey(full_name, location),
            supplier_profile:profiles!orders_supplier_id_fkey(full_name, location)
          `)
          .eq('id', shipmentData.order_id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingNumber]);

  const trackingSteps = [
    { key: 'order_confirmed', label: t('tracking.orderConfirmed'), icon: Package },
    { key: 'picked_up', label: t('tracking.pickedUp'), icon: Circle },
    { key: 'in_transit', label: t('tracking.inTransit'), icon: Truck },
    { key: 'out_for_delivery', label: t('tracking.outForDelivery'), icon: MapPin },
    { key: 'delivered', label: t('tracking.delivered'), icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (!shipment) return 0;
    return trackingSteps.findIndex(step => step.key === shipment.status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_confirmed': return 'bg-primary';
      case 'picked_up': return 'bg-warning';
      case 'in_transit': return 'bg-warning';
      case 'out_for_delivery': return 'bg-warning';
      case 'delivered': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Tracking Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || 'The tracking number you entered was not found.'}
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">Tracking: {trackingNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Status</CardTitle>
                <CardDescription>
                  Current location: {shipment.current_location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                    {t(`tracking.${shipment.status}`)}
                  </Badge>
                  {shipment.estimated_delivery && (
                    <span className="text-sm text-muted-foreground">
                      Est. delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {trackingSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted 
                            ? isCurrent 
                              ? getStatusColor(shipment.status) + ' text-white'
                              : 'bg-success text-white'
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground">
                              Last updated: {new Date(shipment.updated_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {order && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{Number(order.total_price).toFixed(2)}
                    </p>
                  </div>
                  
                  {order.supplier_profile && (
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-medium">{order.supplier_profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.supplier_profile.location}</p>
                    </div>
                  )}

                  {order.vendor_profile && (
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-medium">{order.vendor_profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.vendor_profile.location}</p>
                    </div>
                  )}

                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/orders/${order.id}`}>View Order Details</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Having issues with your delivery? Contact us for assistance.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;