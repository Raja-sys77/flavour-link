import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, TrendingUp, Users, ShoppingCart } from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  price_per_kg: number;
  avgRating: number;
  orderCount: number;
  reason: string;
  confidence: number;
}

interface RecommendationEngineProps {
  className?: string;
}

const RecommendationEngine = ({ className }: RecommendationEngineProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Get user's order history
      const { data: userOrders } = await supabase
        .from('orders')
        .select(`
          order_items(
            product_id,
            products(*)
          )
        `)
        .eq('vendor_id', user?.id);

      // Get all products with reviews and order counts
      const { data: allProducts } = await supabase
        .from('products')
        .select(`
          *,
          reviews(rating),
          order_items(quantity)
        `);

      if (!allProducts || !userOrders) return;

      // Analyze user preferences
      const userProductIds = new Set();
      const userCategories = new Map<string, number>();
      const userPriceRange = { min: Infinity, max: 0 };

      userOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.products) {
            userProductIds.add(item.products.id);
            const category = item.products.category;
            userCategories.set(category, (userCategories.get(category) || 0) + 1);
            userPriceRange.min = Math.min(userPriceRange.min, item.products.price_per_kg);
            userPriceRange.max = Math.max(userPriceRange.max, item.products.price_per_kg);
          }
        });
      });

      // Calculate recommendations
      const productScores = allProducts.map(product => {
        let score = 0;
        let reason = '';
        
        // Skip if user already ordered this product
        if (userProductIds.has(product.id)) return null;

        // Category preference score
        const categoryCount = userCategories.get(product.category) || 0;
        if (categoryCount > 0) {
          score += categoryCount * 20;
          reason = `Popular in your preferred category: ${product.category}`;
        }

        // Price range preference
        if (product.price_per_kg >= userPriceRange.min * 0.8 && 
            product.price_per_kg <= userPriceRange.max * 1.2) {
          score += 15;
          if (!reason) reason = 'Within your usual price range';
        }

        // Product popularity (order count)
        const orderCount = product.order_items?.length || 0;
        score += Math.min(orderCount * 2, 30);
        if (!reason && orderCount > 5) reason = 'Popular among other customers';

        // Rating score
        const ratings = product.reviews || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, review: any) => sum + review.rating, 0) / ratings.length 
          : 0;
        score += avgRating * 10;
        if (!reason && avgRating > 4) reason = 'Highly rated by customers';

        // Stock availability
        if (product.stock_available > 10) {
          score += 5;
        }

        // Default reason if none assigned
        if (!reason) reason = 'Trending product';

        return {
          ...product,
          avgRating,
          orderCount,
          reason,
          confidence: Math.min(score, 100),
        };
      }).filter(Boolean) as RecommendedProduct[];

      // Sort by score and take top 6
      const topRecommendations = productScores
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6);

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    // Implementation would depend on your cart system
    console.log('Adding to cart:', productId);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>Loading personalized suggestions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              Products you might be interested in based on your purchase history
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateRecommendations}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No recommendations available. Start ordering to get personalized suggestions!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium line-clamp-2">{product.name}</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{product.price_per_kg}/kg</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {product.avgRating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {product.orderCount} orders
                  </div>
                  
                  <div className="text-xs text-primary font-medium">
                    {product.reason}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="flex items-center">
                      <div className="w-16 h-1 bg-muted rounded-full mr-2">
                        <div 
                          className="h-1 bg-primary rounded-full" 
                          style={{ width: `${product.confidence}%` }}
                        />
                      </div>
                      <span className="font-medium">{product.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => addToCart(product.id)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;