import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Smartphone, Mail, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface TwoFactorSetupProps {
  className?: string;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ className }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-2fa-otp', {
        body: {
          phoneNumber,
          userId: user?.id
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });

      // For demo purposes - show the OTP in toast (remove in production)
      if (data.debug_otp) {
        toast({
          title: "Demo OTP",
          description: `Your verification code is: ${data.debug_otp}`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-otp', {
        body: {
          phoneNumber,
          otp: otpCode,
          userId: user?.id
        }
      });

      if (error) throw error;

      setTwoFactorEnabled(true);
      setIsSetupMode(false);
      setOtpSent(false);
      setOtpCode('');
      setPhoneNumber('');
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    try {
      // Disable 2FA in user profile (cast to any to handle type mismatch)
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: false } as any)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTwoFactorEnabled(false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Failed to Disable 2FA",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Two-Factor Authentication
          {twoFactorEnabled && (
            <Badge variant="default" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Enhanced Security</p>
            <p className="text-blue-700">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
          </div>
        </div>

        {!twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Secure your account with SMS verification
                </p>
              </div>
              <Switch
                checked={isSetupMode}
                onCheckedChange={setIsSetupMode}
              />
            </div>

            {isSetupMode && (
              <Tabs defaultValue="sms" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS
                  </TabsTrigger>
                  <TabsTrigger value="email" disabled className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (Coming Soon)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sms" className="space-y-4 mt-4">
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={sendOTP} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter the 6-digit code sent to {phoneNumber}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={verifyOTP} 
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? 'Verifying...' : 'Verify & Enable'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setOtpSent(false)}
                          disabled={isLoading}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">2FA is Active</p>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recovery Options</h3>
              <div className="grid gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  Generate Backup Codes
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Change Phone Number
                </Button>
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={disable2FA}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;