import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Paperclip, Image, Smile, MoreVertical, Users, Phone, Video, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  reply_to?: string;
  attachments: any[];
  metadata: any;
  edited_at?: string;
  created_at: string;
  sender?: {
    full_name: string;
    role: string;
  };
}

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  variables: string[];
}

interface MessagingInterfaceProps {
  threadId: string;
  onBack: () => void;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ threadId, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [threadInfo, setThreadInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (threadId) {
      fetchThreadInfo();
      fetchMessages();
      fetchMessageTemplates();
      subscribeToMessages();
      markAsRead();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThreadInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          participants:thread_participants(
            user_id,
            role,
            last_read_at,
            profile:profiles(full_name, role, location)
          )
        `)
        .eq('id', threadId)
        .single();

      if (error) throw error;
      setThreadInfo(data);
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching thread info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, role)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setMessageTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`
      }, (payload) => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async () => {
    try {
      await supabase
        .from('thread_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update thread's updated_at
      await supabase
        .from('message_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      setNewMessage('');
      markAsRead();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const useTemplate = async (template: MessageTemplate) => {
    setNewMessage(template.content);
    setShowTemplates(false);
    
    // Update usage count
    try {
      await supabase
        .from('message_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    }
    return format(date, 'MMM d, HH:mm');
  };

  const getThreadTitle = () => {
    if (threadInfo?.title) return threadInfo.title;
    
    const otherParticipants = participants.filter(p => p.user_id !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].profile?.full_name || 'Unknown User';
    }
    return `Group Chat (${participants.length} members)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getThreadTitle().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{getThreadTitle()}</h3>
            <p className="text-sm text-muted-foreground">
              {participants.length} participants
              {isTyping && ' • Someone is typing...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thread Participants</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.user_id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {participant.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{participant.profile?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{participant.profile?.role}</p>
                    </div>
                    <Badge variant="outline">{participant.role}</Badge>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        {message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`space-y-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {message.sender?.full_name || 'Unknown'}
                      </p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </p>
                      {message.edited_at && (
                        <p className="text-xs text-muted-foreground">(edited)</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            {showTemplates && messageTemplates.length > 0 && (
              <div className="border rounded-lg p-2 bg-background">
                <p className="text-sm font-medium mb-2">Message Templates:</p>
                <div className="space-y-1">
                  {messageTemplates.slice(0, 3).map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => useTemplate(template)}
                    >
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.content}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[40px] max-h-32 resize-none"
                rows={1}
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={showTemplates ? 'bg-muted' : ''}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingInterface;