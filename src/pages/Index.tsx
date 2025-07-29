import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-90"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center mb-20">
            <div className="hero-glow inline-block p-8 rounded-3xl mb-8">
              <h1 className="text-6xl font-bold text-primary-foreground mb-6">
                Welcome to <span className="text-accent">Vendora</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                The premium B2B marketplace connecting Indian street food vendors with suppliers. 
                Streamline your supply chain and transform your business.
              </p>
              <div className="flex gap-6 justify-center">
                <Button onClick={() => navigate('/auth')} size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300">
                  Get Started
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="px-10 py-4 text-lg font-semibold rounded-xl glass-effect hover:scale-105 transition-all duration-300"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="card-minimal text-center hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Easy Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Browse products, compare prices, and place orders with just a few clicks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-minimal text-center hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Suppliers can easily manage their product listings and stock levels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-minimal text-center hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Verified Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Connect with trusted suppliers in your area for reliable sourcing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-minimal text-center hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get real-time market prices and trends to make informed decisions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center card-minimal p-12 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of vendors and suppliers already using Vendora to revolutionize their supply chain.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="px-12 py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300">
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
