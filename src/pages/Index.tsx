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
    <div className="min-h-screen animated-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Ultra Modern Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl floating"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/40 rounded-full filter blur-3xl floating delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/30 rounded-full filter blur-3xl floating delay-500"></div>
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl floating delay-700"></div>
        </div>
        
        {/* Futuristic Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='80' height='80' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='%23ff4500' stroke-width='1' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Ultra Modern Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect text-white text-sm font-semibold mb-12 pulse-glow animate-fade-in">
              <span className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></span>
              🚀 India's #1 B2B Marketplace for Street Food Vendors
            </div>

            {/* Spectacular Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black mb-12 gradient-text leading-tight animate-fade-in">
              Welcome to the
              <br />
              <span className="relative inline-block">
                Future of
                <div className="absolute -bottom-4 left-0 right-0 h-2 animated-gradient rounded-full"></div>
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-pulse">
                VENDORA
              </span>
            </h1>

            {/* Epic Subtitle */}
            <p className="text-2xl md:text-3xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light animate-fade-in">
              🎯 Transform your street food empire with AI-powered marketplace technology. 
              Connect with 500+ verified suppliers, automate procurement, and scale beyond limits.
            </p>

            {/* Revolutionary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="px-12 py-6 text-xl font-bold rounded-3xl animated-gradient text-white shadow-2xl hover:shadow-primary/25 transform hover:scale-110 transition-all duration-500 min-w-[220px] pulse-glow"
              >
                🚀 Start Your Empire
                <div className="ml-3 w-3 h-3 bg-white rounded-full animate-bounce"></div>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-12 py-6 text-xl font-bold rounded-3xl border-3 border-white/30 glass-effect text-white hover:border-white/50 hover:bg-white/10 transform hover:scale-110 transition-all duration-500 min-w-[220px]"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                ⚡ Explore Power
              </Button>
            </div>

            {/* Epic Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="text-center glass-effect rounded-2xl p-6 pulse-glow">
                <div className="text-5xl font-black gradient-text mb-3">5000+</div>
                <div className="text-lg text-white/80 font-semibold">💪 Active Vendors</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-6 pulse-glow">
                <div className="text-5xl font-black gradient-text mb-3">1000+</div>
                <div className="text-lg text-white/80 font-semibold">✅ Verified Suppliers</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-6 pulse-glow">
                <div className="text-5xl font-black gradient-text mb-3">100K+</div>
                <div className="text-lg text-white/80 font-semibold">🎯 Orders Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revolutionary Features Section */}
      <div className="relative py-32 animated-gradient">
        <div className="container mx-auto px-4">
          {/* Epic Section Header */}
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-black mb-8 gradient-text">
              🚀 Why Choose VENDORA?
            </h2>
            <p className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto font-light">
              The ultimate AI-powered ecosystem for street food domination 🎯
            </p>
          </div>

          {/* Mind-Blowing Features Grid */}
          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
            <Card className="group relative overflow-hidden border-0 glass-effect hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 pulse-glow">
              <div className="absolute inset-0 animated-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <CardHeader className="relative pb-6 text-center">
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl animated-gradient flex items-center justify-center group-hover:scale-125 transition-transform duration-500 floating">
                  <ShoppingCart className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-white">🤖 Smart Ordering</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-lg leading-relaxed text-white/80 font-medium">
                  Revolutionary AI ordering with price prediction, bulk optimization, and quantum-speed automation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 glass-effect hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 pulse-glow">
              <div className="absolute inset-0 animated-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <CardHeader className="relative pb-6 text-center">
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl animated-gradient flex items-center justify-center group-hover:scale-125 transition-transform duration-500 floating">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-white">📦 Inventory Control</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-lg leading-relaxed text-white/80 font-medium">
                  Next-gen stock tracking with predictive analytics, automated alerts, and real-time optimization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 glass-effect hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 pulse-glow">
              <div className="absolute inset-0 animated-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <CardHeader className="relative pb-6 text-center">
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl animated-gradient flex items-center justify-center group-hover:scale-125 transition-transform duration-500 floating">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-white">🌟 Verified Network</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-lg leading-relaxed text-white/80 font-medium">
                  Elite network of 1000+ verified suppliers with quality ratings, certifications, and performance metrics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 glass-effect hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 pulse-glow">
              <div className="absolute inset-0 animated-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <CardHeader className="relative pb-6 text-center">
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl animated-gradient flex items-center justify-center group-hover:scale-125 transition-transform duration-500 floating">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-white">📊 Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-lg leading-relaxed text-white/80 font-medium">
                  Advanced market analytics with real-time pricing, demand forecasting, and profit optimization.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Ultimate CTA Section */}
          <div className="relative">
            <div className="absolute inset-0 animated-gradient rounded-3xl blur-3xl"></div>
            <div className="relative glass-effect border border-white/20 rounded-3xl p-16 text-center max-w-5xl mx-auto pulse-glow">
              <h2 className="text-5xl md:text-6xl font-black mb-8 gradient-text">
                🚀 Ready to Dominate the Market?
              </h2>
              <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Join 5000+ vendors already building their empires with VENDORA's revolutionary platform 🎯
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <Button 
                  onClick={() => navigate('/auth')} 
                  size="lg" 
                  className="px-16 py-8 text-2xl font-black rounded-3xl animated-gradient text-white shadow-2xl hover:shadow-primary/25 transform hover:scale-110 transition-all duration-500 pulse-glow"
                >
                  💥 Start Your Empire NOW
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-16 py-8 text-2xl font-black rounded-3xl border-3 border-white/30 glass-effect text-white hover:border-white/50 hover:bg-white/10 transform hover:scale-110 transition-all duration-500"
                >
                  🎯 Book VIP Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
