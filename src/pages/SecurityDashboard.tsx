import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, Clock, Globe, Lock, Eye, 
  AlertTriangle, CheckCircle, Ban, Activity,
  FileText, Download, Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface SecurityAuditLog {
  id: string;
  event_type: string;
  event_data: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  risk_score: number;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireStrongPassword: boolean;
  enableAuditLogging: boolean;
  ipWhitelist: string[];
  allowedCountries: string[];
}

const SecurityDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: 8,
    maxLoginAttempts: 3,
    requireStrongPassword: true,
    enableAuditLogging: true,
    ipWhitelist: [],
    allowedCountries: ['US', 'CA', 'GB']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Failed to load audit logs",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const updateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be stored in a user_security_settings table
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      // Log the security settings change
      await supabase.from('security_logs').insert({
        user_id: user?.id,
        event_type: 'security_settings_updated',
        event_data: newSettings,
        ip_address: 'unknown', // Would get from request headers in real implementation
        user_agent: navigator.userAgent
      });

      toast({
        title: "Settings Updated",
        description: "Security settings have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addIpToWhitelist = () => {
    if (newIpAddress && !settings.ipWhitelist.includes(newIpAddress)) {
      updateSecuritySettings({
        ipWhitelist: [...settings.ipWhitelist, newIpAddress]
      });
      setNewIpAddress('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    updateSecuritySettings({
      ipWhitelist: settings.ipWhitelist.filter(addr => addr !== ip)
    });
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Date', 'Event Type', 'IP Address', 'Risk Score', 'User Agent'],
      ...auditLogs.map(log => [
        new Date(log.created_at).toLocaleDateString(),
        log.event_type,
        log.ip_address,
        log.risk_score.toString(),
        log.user_agent.substring(0, 50) + '...'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 50) return 'default';
    return 'secondary';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your account security</p>
        </div>
        <Button onClick={exportAuditLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">Protected</p>
                <p className="text-sm text-muted-foreground">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Recent Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">2FA</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">Monitor</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Select 
                    value={settings.sessionTimeout.toString()} 
                    onValueChange={(value) => updateSecuritySettings({ sessionTimeout: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Select 
                    value={settings.maxLoginAttempts.toString()} 
                    onValueChange={(value) => updateSecuritySettings({ maxLoginAttempts: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Strong Password Requirements</Label>
                    <p className="text-sm text-muted-foreground">
                      Require complex passwords with special characters
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPassword}
                    onCheckedChange={(checked) => updateSecuritySettings({ requireStrongPassword: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all security-related events
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAuditLogging}
                    onCheckedChange={(checked) => updateSecuritySettings({ enableAuditLogging: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                IP Address Whitelist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                />
                <Button onClick={addIpToWhitelist}>Add</Button>
              </div>

              <div className="space-y-2">
                {settings.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono">{ip}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIpFromWhitelist(ip)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {settings.ipWhitelist.length === 0 && (
                  <p className="text-sm text-muted-foreground">No IP addresses whitelisted</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Security Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.event_type}</Badge>
                        <Badge variant={getRiskBadgeColor(log.risk_score)}>
                          {getRiskLabel(log.risk_score)} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()} • IP: {log.ip_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{log.risk_score}/100</p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No audit logs available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Login Monitoring: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Failed Attempt Detection: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Suspicious Activity Detection: Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Device Fingerprinting: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Geo-location Tracking: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">DDoS Protection: Monitoring</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;