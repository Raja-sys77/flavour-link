import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Megaphone, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Plus,
  Filter,
  Search,
  Eye,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  target_audience: any;
  priority: string;
  published_by: string;
  published_at?: string;
  expires_at?: string;
  is_active: boolean;
  read_count: number;
  created_at: string;
  publisher?: {
    full_name: string;
    role: string;
  };
  is_read?: boolean;
}

const AnnouncementCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showNewAnnouncementDialog, setShowNewAnnouncementDialog] = useState(false);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'normal',
    target_audience: { roles: ['vendor', 'supplier'] },
    expires_at: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    subscribeToAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, filterType, filterPriority]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          publisher:profiles(full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which announcements the user has read
      const { data: readData } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user?.id);

      const readAnnouncementIds = new Set(readData?.map(r => r.announcement_id));

      const announcementsWithReadStatus = (data || []).map(announcement => ({
        ...announcement,
        is_read: readAnnouncementIds.has(announcement.id)
      }));

      setAnnouncements(announcementsWithReadStatus as any);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAnnouncements = () => {
    const channel = supabase
      .channel('announcements-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(announcement => announcement.announcement_type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(announcement => announcement.priority === filterPriority);
    }

    setFilteredAnnouncements(filtered);
  };

  const markAsRead = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          announcement_id: announcementId,
          user_id: user?.id
        });

      if (error) throw error;

      // Update local state
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === announcementId 
            ? { ...announcement, is_read: true }
            : announcement
        )
      );

      // Update read count (find the announcement and increment manually)
      const announcement = announcements.find(a => a.id === announcementId);
      if (announcement) {
        await supabase
          .from('announcements')
          .update({ read_count: (announcement.read_count || 0) + 1 })
          .eq('id', announcementId);
      }

    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          announcement_type: newAnnouncement.announcement_type,
          priority: newAnnouncement.priority,
          target_audience: newAnnouncement.target_audience,
          published_by: user?.id,
          published_at: new Date().toISOString(),
          expires_at: newAnnouncement.expires_at || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement published successfully",
      });

      setNewAnnouncement({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        target_audience: { roles: ['vendor', 'supplier'] },
        expires_at: ''
      });
      setShowNewAnnouncementDialog(false);
      fetchAnnouncements();

    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to publish announcement",
        variant: "destructive",
      });
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'feature':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadCount = announcements.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-muted-foreground">
            Stay updated with the latest news and updates
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        <Dialog open={showNewAnnouncementDialog} onOpenChange={setShowNewAnnouncementDialog}>
          <DialogTrigger asChild>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  placeholder="Announcement content"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newAnnouncement.announcement_type} 
                    onValueChange={(value) => setNewAnnouncement({...newAnnouncement, announcement_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="feature">New Feature</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newAnnouncement.priority} 
                    onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={newAnnouncement.expires_at}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, expires_at: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewAnnouncementDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createAnnouncement}>
                  Publish Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="feature">New Feature</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              !announcement.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
            }`}
            onClick={() => !announcement.is_read && markAsRead(announcement.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getAnnouncementIcon(announcement.announcement_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {!announcement.is_read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {announcement.publisher?.full_name || 'System'}</span>
                        <span>•</span>
                        <span>{format(new Date(announcement.created_at), 'MMM d, yyyy HH:mm')}</span>
                        {announcement.expires_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {format(new Date(announcement.expires_at), 'MMM d, yyyy')}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {announcement.read_count} views
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={getPriorityColor(announcement.priority) as any}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant="outline">
                        {announcement.announcement_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAnnouncements.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Announcements Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no announcements at the moment.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCenter;