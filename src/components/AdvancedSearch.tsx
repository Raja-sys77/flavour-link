import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Filter, Star, MapPin, Clock, TrendingUp, 
  Bookmark, History, Camera, Upload, X 
} from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  minRating: number;
  location: string;
  availability: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popularity';
  timeRange: 'all' | 'week' | 'month' | 'quarter';
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  created_at: string;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  className?: string;
}

const AdvancedSearch = ({ filters, onFiltersChange, onSearch, className }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [trendingQueries, setTrendingQueries] = useState<string[]>([]);
  const [imageSearch, setImageSearch] = useState<File | null>(null);

  useEffect(() => {
    loadSearchData();
    loadRecentSearches();
  }, []);

  const loadSearchData = async () => {
    try {
      // Load categories
      const { data: products } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (products) {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCategories);
      }

      // Load locations
      const { data: profiles } = await supabase
        .from('profiles')
        .select('location')
        .not('location', 'is', null);
      
      if (profiles) {
        const uniqueLocations = [...new Set(profiles.map(p => p.location))];
        setLocations(uniqueLocations);
      }

      // Mock trending queries (in real app, this would come from analytics)
      setTrendingQueries(['Rice', 'Wheat', 'Vegetables', 'Spices', 'Pulses']);
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const recent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const handleSearch = () => {
    saveRecentSearch(filters.query);
    onSearch();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageSearch(file);
      // In a real app, you'd process the image here
      // For now, we'll just simulate a search query
      const simulatedQuery = 'Rice'; // Mock result from image recognition
      onFiltersChange({ ...filters, query: simulatedQuery });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      category: '',
      priceRange: [0, 1000],
      minRating: 0,
      location: '',
      availability: false,
      sortBy: 'relevance',
      timeRange: 'all',
    });
  };

  const applyQuickFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
    onSearch();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Advanced Search
            </CardTitle>
            <CardDescription>Find exactly what you're looking for</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Search Bar */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, suppliers, categories..."
              value={filters.query}
              onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-search"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('image-search')?.click()}
              title="Search by image"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Image Search Preview */}
        {imageSearch && (
          <div className="flex items-center space-x-2 p-2 bg-muted rounded">
            <Upload className="h-4 w-4" />
            <span className="text-sm">Searching by image: {imageSearch.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageSearch(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Quick filters:</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('availability', true)}
            >
              In Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('minRating', 4)}
            >
              4+ Stars
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('sortBy', 'price_low')}
            >
              Low Price
            </Button>
          </div>
        </div>

        {/* Recent & Trending Searches */}
        {!isExpanded && (recentSearches.length > 0 || trendingQueries.length > 0) && (
          <div className="space-y-3">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Recent Searches</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => onFiltersChange({ ...filters, query: search })}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Trending</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingQueries.map((query, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => onFiltersChange({ ...filters, query })}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6">
            <Separator />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => onFiltersChange({ ...filters, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => onFiltersChange({ ...filters, sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label>Price Range (₹ per kg)</Label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label>Minimum Rating</Label>
              <div className="flex items-center space-x-4">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onFiltersChange({ ...filters, minRating: rating })}
                    className={`flex items-center space-x-1 px-2 py-1 rounded ${
                      filters.minRating === rating ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${rating > 0 ? 'text-yellow-500 fill-current' : ''}`} />
                    <span className="text-sm">{rating === 0 ? 'Any' : `${rating}+`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="availability"
                checked={filters.availability}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, availability: checked })}
              />
              <Label htmlFor="availability">Only show available products</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
                <Button onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;