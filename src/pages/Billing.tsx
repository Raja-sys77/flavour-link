import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  FileText, 
  Download, 
  Send, 
  Eye,
  Plus,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  vendor_id: string;
  supplier_id: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  status: string;
  payment_terms: string;
  notes?: string;
  vendor_profile?: any;
  supplier_profile?: any;
}

interface PaymentMethod {
  id: string;
  type: string;
  provider: string;
  account_details: any;
  is_default: boolean;
  is_active: boolean;
}

interface CreditLimit {
  credit_limit: number;
  used_credit: number;
  available_credit: number;
}

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [creditLimit, setCreditLimit] = useState<CreditLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("invoices");

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    order_id: "",
    due_date: "",
    subtotal: "",
    tax_rate: "18",
    discount_amount: "0",
    shipping_cost: "0",
    payment_terms: "NET_30",
    notes: ""
  });

  // Payment method form state
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "",
    provider: "",
    account_number: "",
    account_holder: "",
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchPaymentMethods();
      fetchCreditLimit();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          vendor_profile:profiles!invoices_vendor_id_fkey(*),
          supplier_profile:profiles!invoices_supplier_id_fkey(*)
        `)
        .or(`vendor_id.eq.${user?.id},supplier_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchCreditLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_limits')
        .select('*')
        .eq('vendor_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCreditLimit(data);
    } catch (error) {
      console.error('Error fetching credit limit:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      const subtotal = parseFloat(newInvoice.subtotal);
      const taxRate = parseFloat(newInvoice.tax_rate) / 100;
      const discountAmount = parseFloat(newInvoice.discount_amount);
      const shippingCost = parseFloat(newInvoice.shipping_cost);
      
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          order_id: newInvoice.order_id,
          vendor_id: user?.id || '',
          supplier_id: user?.id || '', // This should be dynamic based on the order
          due_date: newInvoice.due_date,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          payment_terms: newInvoice.payment_terms,
          notes: newInvoice.notes || '',
          invoice_number: '' // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      setNewInvoice({
        order_id: "",
        due_date: "",
        subtotal: "",
        tax_rate: "18",
        discount_amount: "0",
        shipping_cost: "0",
        payment_terms: "NET_30",
        notes: ""
      });

      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  const addPaymentMethod = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user?.id,
          type: newPaymentMethod.type,
          provider: newPaymentMethod.provider,
          account_details: {
            account_number: newPaymentMethod.account_number,
            account_holder: newPaymentMethod.account_holder
          },
          is_default: newPaymentMethod.is_default
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      setNewPaymentMethod({
        type: "",
        provider: "",
        account_number: "",
        account_holder: "",
        is_default: false
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'upi': return <DollarSign className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate a new invoice for an order
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="order_id">Order ID</Label>
                  <Input
                    id="order_id"
                    value={newInvoice.order_id}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, order_id: e.target.value }))}
                    placeholder="Enter order ID"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="subtotal">Subtotal (₹)</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    value={newInvoice.subtotal}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, subtotal: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Select value={newInvoice.tax_rate} onValueChange={(value) => setNewInvoice(prev => ({ ...prev, tax_rate: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Exempt)</SelectItem>
                      <SelectItem value="5">5% (GST)</SelectItem>
                      <SelectItem value="12">12% (GST)</SelectItem>
                      <SelectItem value="18">18% (GST)</SelectItem>
                      <SelectItem value="28">28% (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={newInvoice.payment_terms} onValueChange={(value) => setNewInvoice(prev => ({ ...prev, payment_terms: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NET_15">NET 15</SelectItem>
                      <SelectItem value="NET_30">NET 30</SelectItem>
                      <SelectItem value="NET_60">NET 60</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="ADVANCE">Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createInvoice} className="w-full">
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total_amount : 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {invoices.filter(inv => inv.status === 'paid').length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.total_amount : 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {invoices.filter(inv => inv.status !== 'paid').length} unpaid invoices
            </p>
          </CardContent>
        </Card>

        {creditLimit && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Available</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{creditLimit.available_credit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                of ₹{creditLimit.credit_limit.toLocaleString()} limit
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage and track all your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>₹{invoice.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for secure transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new payment method for transactions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Payment Type</Label>
                      <Select value={newPaymentMethod.type} onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="netbanking">Net Banking</SelectItem>
                          <SelectItem value="wallet">Digital Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={newPaymentMethod.provider}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, provider: e.target.value }))}
                        placeholder="e.g., HDFC, Paytm, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_number">Account Number/UPI ID</Label>
                      <Input
                        id="account_number"
                        value={newPaymentMethod.account_number}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="Enter account details"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_holder">Account Holder Name</Label>
                      <Input
                        id="account_holder"
                        value={newPaymentMethod.account_holder}
                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, account_holder: e.target.value }))}
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <Button onClick={addPaymentMethod} className="w-full">
                      Add Payment Method
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <p className="font-medium">{method.provider}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.type.toUpperCase()} • ****{method.account_details.account_number?.slice(-4)}
                          </p>
                        </div>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all financial transactions and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>No transactions found</p>
                <p className="text-sm">Transaction history will appear here once you start making payments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}