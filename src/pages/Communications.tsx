import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Users, FolderOpen, Bell, Video, Search, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import MessagingInterface from '@/components/MessagingInterface';
import WorkspaceManager from '@/components/WorkspaceManager';
import AnnouncementCenter from '@/components/AnnouncementCenter';
import BusinessNetworking from '@/components/BusinessNetworking';

interface MessageThread {
  id: string;
  title: string;
  type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  participants: Array<{
    user_id: string;
    role: string;
    last_read_at: string;
    profile?: {
      full_name: string;
      role: string;
    };
  }>;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  workspace_type: string;
  status: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  task_count?: number;
}

const Communications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMessageThreads();
      fetchWorkspaces();
      subscribeToUpdates();
    }
  }, [user]);

  const fetchMessageThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMessageThreads(data || []);
    } catch (error) {
      console.error('Error fetching message threads:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch message threads",
        variant: "destructive",
      });
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workspaces", 
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // Subscribe to message updates
    const messageChannel = supabase
      .channel('messages-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchMessageThreads();
      })
      .subscribe();

    // Subscribe to workspace updates
    const workspaceChannel = supabase
      .channel('workspace-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspaces'
      }, () => {
        fetchWorkspaces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(workspaceChannel);
    };
  };

  const getThreadDisplayName = (thread: MessageThread) => {
    if (thread.title) return thread.title;
    
    const otherParticipants = thread.participants.filter(p => p.user_id !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].profile?.full_name || 'Unknown User';
    }
    return `Group Chat (${otherParticipants.length + 1} members)`;
  };

  const filteredThreads = messageThreads.filter(thread =>
    getThreadDisplayName(thread).toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communication Hub</h1>
          <p className="text-muted-foreground">Collaborate and communicate with your business network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 min-w-[20px] h-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Workspaces
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="networking" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          {selectedThread ? (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedThread(null)}
                className="mb-4"
              >
                ← Back to Messages
              </Button>
              <MessagingInterface 
                threadId={selectedThread} 
                onBack={() => setSelectedThread(null)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Conversations
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filteredThreads.map((thread) => (
                        <div
                          key={thread.id}
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedThread(thread.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getThreadDisplayName(thread).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">
                                {getThreadDisplayName(thread)}
                              </h4>
                              <div className="flex items-center gap-2">
                                {thread.last_message && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(thread.last_message.created_at), 'MMM d')}
                                  </span>
                                )}
                                {thread.unread_count && thread.unread_count > 0 && (
                                  <Badge variant="destructive" className="px-1 min-w-[20px] h-5 text-xs">
                                    {thread.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {thread.last_message?.content || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {thread.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {thread.participants.length} members
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Create Group Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    New Workspace
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-6">
          {selectedWorkspace ? (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedWorkspace(null)}
                className="mb-4"
              >
                ← Back to Workspaces
              </Button>
              <WorkspaceManager 
                workspaceId={selectedWorkspace} 
                onBack={() => setSelectedWorkspace(null)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <Card 
                  key={workspace.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedWorkspace(workspace.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <Badge variant="outline">
                        {workspace.workspace_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workspace.description || 'No description'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{workspace.member_count} members</span>
                      <span>{workspace.task_count} tasks</span>
                      <Badge 
                        variant={workspace.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {workspace.status}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Updated {format(new Date(workspace.updated_at), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Create New Workspace</h3>
                  <p className="text-sm text-muted-foreground">
                    Start collaborating on a new project
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementCenter />
        </TabsContent>

        <TabsContent value="networking">
          <BusinessNetworking />
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Scheduler</CardTitle>
              <p className="text-muted-foreground">
                Schedule and manage video calls with your business partners
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Meeting Feature Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  Video conferencing and meeting scheduler will be available soon
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Early Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communications;