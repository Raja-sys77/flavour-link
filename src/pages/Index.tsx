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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-orange-600">Vendora</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The B2B marketplace connecting Indian street food vendors with suppliers. 
            Streamline your supply chain and grow your business.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/auth')} size="lg" className="px-8">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Easy Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse products, compare prices, and place orders with just a few clicks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suppliers can easily manage their product listings and stock levels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Verified Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with trusted suppliers in your area for reliable sourcing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get real-time market prices and trends to make informed decisions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of vendors and suppliers already using Vendora.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="px-8">
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
