import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground">
          Get in touch with the Vendora team for support and inquiries
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About Vendora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vendora is India's premier B2B marketplace connecting food suppliers directly 
              with vendors. We eliminate middlemen to ensure fresh produce reaches businesses 
              at competitive prices while supporting local suppliers.
            </p>
            <p className="text-muted-foreground">
              Our platform streamlines the ordering process, provides transparent pricing, 
              and builds trust between suppliers and vendors across the country.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">support@vendora.in</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground">
                  123 Business District,<br />
                  Mumbai, Maharashtra 400001
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Business Hours</p>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 2:00 PM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-primary mb-2">Suppliers</h3>
              <p className="text-sm text-muted-foreground">
                Food producers, farmers, and distributors who list their products on Vendora. 
                Suppliers can manage inventory, set prices, and fulfill orders from vendors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Vendors</h3>
              <p className="text-sm text-muted-foreground">
                Restaurants, retailers, and businesses who purchase products from suppliers. 
                Vendors can browse products, place orders, and track deliveries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;