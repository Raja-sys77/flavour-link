import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAuth } from '@/hooks/useAuth';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  AlertTriangle, Star, MapPin, Calendar, Download, Filter, RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const {
    loading,
    revenueData,
    productPerformance,
    customerAnalytics,
    geographicData,
    supplierPerformance,
    timeRange,
    setTimeRange,
    recommendations,
    refreshData,
  } = useAnalyticsData();

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
  const totalOrders = revenueData.reduce((sum, data) => sum + data.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Business Analytics
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Data-driven insights for your business growth
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{avgOrderValue.toFixed(0)}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-muted/10 to-muted/5 border-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customerAnalytics.length}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +15.2% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-white dark:bg-background rounded-lg border">
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.message}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Revenue and order count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Revenue (₹)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productPerformance.reduce((acc: any[], product) => {
                        const existing = acc.find(item => item.category === product.category);
                        if (existing) {
                          existing.value += product.revenue;
                        } else {
                          acc.push({ category: product.category, value: product.revenue });
                        }
                        return acc;
                      }, [])}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Revenue and sales data for your products</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productPerformance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                    <Bar dataKey="totalSold" fill="#82ca9d" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Product Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Units Sold</th>
                        <th className="text-right p-2">Rating</th>
                        <th className="text-right p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPerformance.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{product.name}</td>
                          <td className="p-2">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="p-2 text-right">₹{product.revenue.toLocaleString()}</td>
                          <td className="p-2 text-right">{product.totalSold}</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {product.avgRating.toFixed(1)}
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <Badge variant={product.stockLevel < 10 ? "destructive" : "default"}>
                              {product.stockLevel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution of customer types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerAnalytics.reduce((acc: any[], customer) => {
                        const existing = acc.find(item => item.segment === customer.segment);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ segment: customer.segment, value: 1 });
                        }
                        return acc;
                      }, [])}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerAnalytics.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerAnalytics.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalSpent" fill="#8884d8" name="Total Spent (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Customer</th>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">Total Spent</th>
                      <th className="text-right p-2">Avg Order</th>
                      <th className="text-left p-2">Segment</th>
                      <th className="text-left p-2">Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerAnalytics.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{customer.name}</td>
                        <td className="p-2 text-right">{customer.totalOrders}</td>
                        <td className="p-2 text-right">₹{customer.totalSpent.toLocaleString()}</td>
                        <td className="p-2 text-right">₹{customer.avgOrderValue.toFixed(0)}</td>
                        <td className="p-2">
                          <Badge variant={
                            customer.segment === 'high-value' ? 'default' :
                            customer.segment === 'frequent' ? 'secondary' :
                            customer.segment === 'at-risk' ? 'destructive' : 'outline'
                          }>
                            {customer.segment}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(customer.lastOrderDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Geographic Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geographicData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{location.orders} orders</div>
                        <div className="text-sm text-muted-foreground">₹{location.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Scorecard</CardTitle>
              <CardDescription>Evaluate your suppliers across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Supplier</th>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Avg Delivery</th>
                      <th className="text-right p-2">On-Time %</th>
                      <th className="text-right p-2">Quality Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPerformance.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{supplier.name}</td>
                        <td className="p-2 text-right">{supplier.totalOrders}</td>
                        <td className="p-2 text-right">₹{supplier.revenue.toLocaleString()}</td>
                        <td className="p-2 text-right">{supplier.avgDeliveryTime.toFixed(1)} days</td>
                        <td className="p-2 text-right">
                          <Badge variant={supplier.onTimeDelivery > 90 ? 'default' : 'destructive'}>
                            {supplier.onTimeDelivery.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {supplier.qualityRating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;