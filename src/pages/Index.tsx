import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const stats = useStats();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Hero Section */}
      <div className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Simple Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              India's Leading B2B Marketplace
            </div>

            {/* Clean Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-foreground leading-tight">
              Vendora
              <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
                Streamline your street food business
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with verified suppliers, streamline procurement, and grow your business with our intelligent marketplace platform.
            </p>

            {/* Clean CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="px-8 py-3 text-base font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-base font-medium rounded-md border border-border hover:bg-muted/50 transition-all duration-200"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Real Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stats.loading ? '...' : stats.vendorCount}
                </div>
                <div className="text-sm text-muted-foreground">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stats.loading ? '...' : stats.supplierCount}
                </div>
                <div className="text-sm text-muted-foreground">Verified Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stats.loading ? '...' : stats.completedOrdersCount}
                </div>
                <div className="text-sm text-muted-foreground">Orders Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Simple Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Why Choose Vendora?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a successful street food business
            </p>
          </div>

          {/* Clean Features Grid */}
          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Card className="p-6 text-center border border-border hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">Smart Ordering</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Streamlined ordering system with price comparison and bulk discounts.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center border border-border hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">Inventory Control</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Real-time stock tracking and automated alerts for better management.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center border border-border hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">Verified Network</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Connect with {stats.loading ? 'verified suppliers' : `${stats.supplierCount} verified suppliers`} with quality ratings.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center border border-border hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">Market Intelligence</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Real-time pricing and market trends to maximize profitability.
              </CardDescription>
            </Card>
          </div>

          {/* Clean CTA Section */}
          <div className="bg-card border border-border rounded-lg p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join {stats.loading ? 'our growing community' : `${stats.vendorCount} vendors`} already growing their business with Vendora's marketplace platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="px-8 py-3 text-base font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-base font-medium rounded-md border border-border hover:bg-muted/50 transition-all duration-200"
                onClick={() => navigate('/contact')}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
