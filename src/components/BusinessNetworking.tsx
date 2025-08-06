import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building, 
  Star, 
  MapPin, 
  Globe, 
  Calendar,
  Award,
  TrendingUp,
  MessageCircle,
  UserPlus,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  industry: string;
  company_size: string;
  description: string;
  website: string;
  founded_year: number;
  logo_url: string;
  cover_image_url: string;
  certifications: string[];
  specializations: string[];
  service_areas: string[];
  languages: string[];
  business_hours: any;
  social_links: any;
  verification_status: string;
  verification_documents: any;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    role: string;
    location: string;
    phone: string;
  };
  relationship?: {
    id: string;
    relationship_type: string;
    status: string;
    overall_score: number;
  };
}

interface BusinessRelationship {
  id: string;
  vendor_id: string;
  supplier_id: string;
  relationship_type: string;
  status: string;
  trust_score: number;
  volume_score: number;
  quality_score: number;
  overall_score: number;
  established_date: string;
  last_interaction: string;
  notes: string;
  vendor_profile?: BusinessProfile;
  supplier_profile?: BusinessProfile;
}

const BusinessNetworking: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [relationships, setRelationships] = useState<BusinessRelationship[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    fetchBusinessProfiles();
    fetchRelationships();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, filterIndustry, filterBusinessType, filterLocation]);

  const fetchBusinessProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          *,
          user:profiles!business_profiles_user_id_fkey(full_name, role, location, phone)
        `)
        .neq('user_id', user?.id) // Exclude current user
        .order('verification_status', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get relationships for these profiles
      const { data: relationshipData } = await supabase
        .from('business_relationships')
        .select('*')
        .or(`vendor_id.eq.${user?.id},supplier_id.eq.${user?.id}`);

      const relationshipMap = new Map();
      relationshipData?.forEach(rel => {
        const otherId = rel.vendor_id === user?.id ? rel.supplier_id : rel.vendor_id;
        relationshipMap.set(otherId, rel);
      });

      const profilesWithRelationships = (data || []).map(profile => ({
        ...profile,
        relationship: relationshipMap.get(profile.user_id)
      }));

      setProfiles(profilesWithRelationships as any);
    } catch (error) {
      console.error('Error fetching business profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationships = async () => {
    try {
      const { data, error } = await supabase
        .from('business_relationships')
        .select(`
          *,
          vendor_profile:business_profiles!business_relationships_vendor_id_fkey(*),
          supplier_profile:business_profiles!business_relationships_supplier_id_fkey(*)
        `)
        .or(`vendor_id.eq.${user?.id},supplier_id.eq.${user?.id}`)
        .order('last_interaction', { ascending: false });

      if (error) throw error;
      setRelationships((data as any) || []);
    } catch (error) {
      console.error('Error fetching relationships:', error);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Industry filter
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(profile => profile.industry === filterIndustry);
    }

    // Business type filter
    if (filterBusinessType !== 'all') {
      filtered = filtered.filter(profile => profile.business_type === filterBusinessType);
    }

    // Location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter(profile => 
        profile.user?.location?.includes(filterLocation)
      );
    }

    setFilteredProfiles(filtered);
  };

  const connectWithBusiness = async (targetUserId: string, relationshipType: string = 'standard') => {
    try {
      const { error } = await supabase
        .from('business_relationships')
        .insert({
          vendor_id: user?.id,
          supplier_id: targetUserId,
          relationship_type: relationshipType,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });

      fetchBusinessProfiles();
      fetchRelationships();
    } catch (error) {
      console.error('Error connecting with business:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const updateRelationshipStatus = async (relationshipId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('business_relationships')
        .update({ 
          status,
          established_date: status === 'active' ? new Date().toISOString() : null
        })
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Relationship ${status}`,
      });

      fetchRelationships();
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to update relationship",
        variant: "destructive",
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  const getRelationshipStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRelationshipTypeIcon = (type: string) => {
    switch (type) {
      case 'preferred':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'strategic':
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get unique values for filters
  const industries = [...new Set(profiles.map(p => p.industry))];
  const businessTypes = [...new Set(profiles.map(p => p.business_type))];
  const locations = [...new Set(profiles.map(p => p.user?.location).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Business Network</h2>
          <p className="text-muted-foreground">
            Connect and collaborate with businesses in your industry
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Business Profile
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterBusinessType} onValueChange={setFilterBusinessType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Business Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {profile.cover_image_url && (
                    <img 
                      src={profile.cover_image_url} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute -bottom-6 left-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src={profile.logo_url} />
                      <AvatarFallback className="bg-white text-black">
                        {profile.company_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-8 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{profile.company_name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.industry}</p>
                    </div>
                    {getVerificationBadge(profile.verification_status)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {profile.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.business_type}</span>
                      <span>•</span>
                      <span>{profile.company_size}</span>
                    </div>
                    
                    {profile.user?.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.user.location}</span>
                      </div>
                    )}

                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Specializations */}
                  {profile.specializations.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {profile.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {profile.relationship ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => connectWithBusiness(profile.user_id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Relationship Status */}
                  {profile.relationship && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRelationshipTypeIcon(profile.relationship.relationship_type)}
                          <span className="text-sm font-medium">
                            {profile.relationship.relationship_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${getRelationshipStatusColor(profile.relationship.status)}`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {profile.relationship.status}
                          </span>
                        </div>
                      </div>
                      {profile.relationship.overall_score > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Relationship Score</span>
                            <span>{profile.relationship.overall_score.toFixed(1)}/5.0</span>
                          </div>
                          <Progress value={(profile.relationship.overall_score / 5) * 100} />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Businesses Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters to find more businesses.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{relationships.length}</div>
                    <p className="text-sm text-muted-foreground">Total Connections</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {relationships.filter(r => r.status === 'active').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Relationships</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {relationships.filter(r => r.status === 'pending').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">My Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {relationships.map((relationship) => {
                      const isVendor = relationship.vendor_id === user?.id;
                      const otherProfile = isVendor ? relationship.supplier_profile : relationship.vendor_profile;
                      
                      return (
                        <div key={relationship.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherProfile?.logo_url} />
                            <AvatarFallback>
                              {otherProfile?.company_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{otherProfile?.company_name}</h4>
                            <p className="text-sm text-muted-foreground">{otherProfile?.industry}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getRelationshipTypeIcon(relationship.relationship_type)}
                              <span className="text-xs">{relationship.relationship_type}</span>
                              <div 
                                className={`w-2 h-2 rounded-full ${getRelationshipStatusColor(relationship.status)}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {relationship.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {relationship.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateRelationshipStatus(relationship.id, 'active')}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateRelationshipStatus(relationship.id, 'terminated')}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {relationship.status === 'active' && (
                              <Button variant="outline" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">+12%</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                  <div className="mt-4">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.4h</div>
                  <p className="text-sm text-muted-foreground">Typical response</p>
                  <div className="mt-4">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relationship Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.2/5</div>
                  <p className="text-sm text-muted-foreground">Average score</p>
                  <div className="mt-4">
                    <Star className="h-8 w-8 text-purple-600 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Industry Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industries.slice(0, 5).map((industry, index) => {
                  const count = relationships.filter(r => {
                    const isVendor = r.vendor_id === user?.id;
                    const otherProfile = isVendor ? r.supplier_profile : r.vendor_profile;
                    return otherProfile?.industry === industry;
                  }).length;
                  const percentage = relationships.length > 0 ? (count / relationships.length) * 100 : 0;
                  
                  return (
                    <div key={industry}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{industry}</span>
                        <span>{count} connections ({percentage.toFixed(0)}%)</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessNetworking;