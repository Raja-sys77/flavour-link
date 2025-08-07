import { Card } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          
          <Card className="p-8">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Vendora, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of Vendora for personal, 
                non-commercial transitory viewing only.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
              <p className="mb-4">
                The materials on Vendora are provided on an 'as is' basis. Vendora makes no warranties, 
                expressed or implied, and hereby disclaims all other warranties.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
              <p className="mb-4">
                In no event shall Vendora or its suppliers be liable for any damages arising out of 
                the use or inability to use the materials on Vendora.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">5. Account Terms</h2>
              <p className="mb-4">
                You are responsible for safeguarding the password and for all activities that occur 
                under your account.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at legal@vendora.com
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;