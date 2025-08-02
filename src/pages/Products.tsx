import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ShoppingCart, Edit, Trash2, TrendingUp, TrendingDown, Star, Eye } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductReviews from '@/components/ProductReviews';

interface Product {
  id: string;
  supplier_id: string;
  name: string;
  price_per_kg: number;
  stock_available: number;
  category: string;
  description?: string;
  market_average?: number;
  created_at: string;
  supplier_profile?: {
    full_name: string;
    location: string;
    phone: string;
  };
  reviews?: Array<{
    rating: number;
  }>;
}

interface Profile {
  role: string;
}

interface CartItem {
  id: string;
  name: string;
  price_per_kg: number;
  supplier_name: string;
  supplier_id: string;
  stock_available: number;
  quantity: number;
}

interface ProductsProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

const Products = ({ cart, setCart }: ProductsProps) => {
  const { user } = useAuth();
  const { trackProductEvent, trackUserAction } = useAnalytics();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price_per_kg: '',
    stock_available: '',
    category: '',
    description: '',
    market_average: ''
  });

  const categories = [
    'Vegetables', 'Fruits', 'Spices', 'Grains', 'Oils', 'Dairy', 
    'Snacks', 'Beverages', 'Meat', 'Seafood', 'Other'
  ];

  useEffect(() => {
    if (user) {
      fetchData();
      trackUserAction('view_products_page');
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

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

      // Fetch all products with supplier info and reviews
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          supplier_profile:profiles!products_supplier_id_fkey(full_name, location, phone),
          reviews(rating)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price_per_kg - b.price_per_kg);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price_per_kg - a.price_per_kg);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          supplier_id: user?.id,
          name: newProduct.name,
          price_per_kg: parseFloat(newProduct.price_per_kg),
          stock_available: parseInt(newProduct.stock_available),
          category: newProduct.category,
          description: newProduct.description || null,
          market_average: newProduct.market_average ? parseFloat(newProduct.market_average) : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully!"
      });

      setIsAddDialogOpen(false);
      setNewProduct({
        name: '', price_per_kg: '', stock_available: '', 
        category: '', description: '', market_average: ''
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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_available) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock_available} kg available`,
          variant: "destructive"
        });
        return;
      }
      
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price_per_kg: product.price_per_kg,
        supplier_name: product.supplier_profile?.full_name || 'Unknown',
        supplier_id: product.supplier_id,
        stock_available: product.stock_available,
        quantity: 1
      };
      setCart([...cart, cartItem]);
    }

    trackProductEvent('add_to_cart', product.id, {
      product_name: product.name,
      price: product.price_per_kg,
      supplier_id: product.supplier_id
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price_per_kg: product.price_per_kg.toString(),
      stock_available: product.stock_available.toString(),
      category: product.category,
      description: product.description || '',
      market_average: product.market_average?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          price_per_kg: parseFloat(newProduct.price_per_kg),
          stock_available: parseInt(newProduct.stock_available),
          category: newProduct.category,
          description: newProduct.description || null,
          market_average: newProduct.market_average ? parseFloat(newProduct.market_average) : null
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!"
      });

      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setNewProduct({
        name: '', price_per_kg: '', stock_available: '', 
        category: '', description: '', market_average: ''
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!"
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

  if (loading) {
    return <LoadingSpinner text="Loading products..." />;
  }

  const isSupplier = profile?.role === 'supplier';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl glass-effect p-8 border border-white/10 pulse-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl floating"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black gradient-text mb-4">🛍️ Products Marketplace</h1>
            <p className="text-xl text-white/80 font-medium">
              {isSupplier ? '🚀 Manage your premium inventory empire' : '🎯 Discover and order premium products'}
            </p>
          </div>
          
          {isSupplier && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="animated-gradient px-8 py-4 text-lg font-bold rounded-2xl text-white shadow-xl hover:shadow-primary/25 transform hover:scale-110 transition-all duration-500">
                  <Plus className="h-5 w-5 mr-2" />
                  ✨ Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md glass-effect border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold gradient-text">Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">{/* ... keep existing form content ... */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per kg (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price_per_kg}
                      onChange={(e) => setNewProduct({ ...newProduct, price_per_kg: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock (kg)</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock_available}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_available: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="market_average">Market Average (₹/kg)</Label>
                  <Input
                    id="market_average"
                    type="number"
                    step="0.01"
                    value={newProduct.market_average}
                    onChange={(e) => setNewProduct({ ...newProduct, market_average: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <Button type="submit" className="w-full animated-gradient text-white font-bold py-3">✨ Add Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Product Dialog */}
        {isSupplier && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md glass-effect border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold gradient-text">Edit Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price per kg (₹)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={newProduct.price_per_kg}
                      onChange={(e) => setNewProduct({ ...newProduct, price_per_kg: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Stock (kg)</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={newProduct.stock_available}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_available: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-market-average">Market Average (₹/kg)</Label>
                  <Input
                    id="edit-market-average"
                    type="number"
                    step="0.01"
                    value={newProduct.market_average}
                    onChange={(e) => setNewProduct({ ...newProduct, market_average: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 animated-gradient text-white font-bold">✨ Update Product</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="glass-effect border-white/30 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>

      {/* Ultra Modern Filters */}
      <div className="glass-effect rounded-2xl p-6 border border-white/10 pulse-glow">
        <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-4 h-5 w-5 text-white/60" />
          <Input
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 glass-effect border-white/20 text-white placeholder:text-white/60 text-lg py-3"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-52 glass-effect border-white/20 text-white py-3">
            <SelectValue placeholder="📂 All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-52 glass-effect border-white/20 text-white py-3">
            <SelectValue placeholder="📊 Sort by price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Epic Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 glass-effect rounded-3xl border border-white/10">
          <p className="text-2xl text-white/80 font-medium">🔍 No products found. Try adjusting your filters!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const averageRating = product.reviews && product.reviews.length > 0
              ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
              : 0;

            return (
              <Card key={product.id} className="overflow-hidden glass-effect border border-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 pulse-glow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {product.supplier_profile?.full_name}
                        {averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-xs">{averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ₹{Number(product.price_per_kg).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">per kg</p>
                    </div>
                    {product.market_average && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Market avg:</p>
                        <p className="text-sm">₹{Number(product.market_average).toFixed(2)}</p>
                      </div>
                    )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stock available:</span>
                    <span className={`font-medium ${
                      product.stock_available === 0 
                        ? 'text-red-600' 
                        : product.stock_available < 10 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {product.stock_available === 0 
                        ? 'Out of Stock' 
                        : product.stock_available < 10 
                        ? `Low Stock: ${product.stock_available} kg left` 
                        : `In Stock: ${product.stock_available} kg`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Location:</span>
                    <span>{product.supplier_profile?.location}</span>
                  </div>
                </div>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}

                {product.market_average && (
                  <div className="flex items-center gap-2">
                    {product.price_per_kg < product.market_average ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Below Market</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Above Market</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  {!isSupplier && (
                    <Button 
                      onClick={() => addToCart(product)}
                      className="flex-1 transition-all hover:scale-105"
                      disabled={product.stock_available === 0}
                      variant={product.stock_available === 0 ? "secondary" : "default"}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_available === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedProductId(product.id);
                          trackProductEvent('view_details', product.id, { product_name: product.name });
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{product.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Product Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <span className="ml-2">{product.category}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-2 font-bold">₹{product.price_per_kg}/kg</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="ml-2">{product.stock_available} kg</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Supplier:</span>
                                <span className="ml-2">{product.supplier_profile?.full_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <span className="ml-2">{product.supplier_profile?.location}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {product.description && (
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                              </div>
                            )}
                            {averageRating > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Rating</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= Math.round(averageRating) 
                                            ? 'fill-warning text-warning' 
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm">{averageRating.toFixed(1)} ({product.reviews?.length} reviews)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedProductId && (
                          <ProductReviews productId={selectedProductId} />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {isSupplier && product.supplier_id === user?.id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;