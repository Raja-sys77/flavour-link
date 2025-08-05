-- Create messaging and collaboration system

-- Message threads (conversations between users)
CREATE TABLE public.message_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  type text NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'workspace'
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Thread participants
CREATE TABLE public.thread_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member', -- 'admin', 'member', 'observer'
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text', -- 'text', 'file', 'image', 'order', 'template'
  reply_to uuid REFERENCES public.messages(id),
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  edited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Message templates
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Workspaces for collaboration
CREATE TABLE public.workspaces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  workspace_type text NOT NULL DEFAULT 'project', -- 'project', 'supplier_onboarding', 'negotiation'
  status text NOT NULL DEFAULT 'active', -- 'active', 'archived', 'completed'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Workspace members
CREATE TABLE public.workspace_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member', -- 'admin', 'member', 'observer'
  permissions jsonb DEFAULT '[]'::jsonb,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Documents and files
CREATE TABLE public.workspace_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  version integer NOT NULL DEFAULT 1,
  uploaded_by uuid NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tasks and assignments
CREATE TABLE public.workspace_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid,
  assigned_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Business relationships
CREATE TABLE public.business_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  relationship_type text NOT NULL DEFAULT 'standard', -- 'standard', 'preferred', 'strategic', 'blocked'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'terminated'
  trust_score numeric(3,2) DEFAULT 0.00,
  volume_score numeric(3,2) DEFAULT 0.00,
  quality_score numeric(3,2) DEFAULT 0.00,
  overall_score numeric(3,2) DEFAULT 0.00,
  established_date timestamp with time zone,
  last_interaction timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, supplier_id)
);

-- Relationship evaluations
CREATE TABLE public.relationship_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id uuid NOT NULL REFERENCES public.business_relationships(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL,
  evaluation_type text NOT NULL, -- 'performance', 'delivery', 'quality', 'communication'
  score numeric(3,2) NOT NULL,
  comments text,
  evaluation_period_start timestamp with time zone,
  evaluation_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Announcements
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  announcement_type text NOT NULL DEFAULT 'general', -- 'general', 'maintenance', 'feature', 'urgent'
  target_audience jsonb NOT NULL DEFAULT '{"roles": ["vendor", "supplier"]}'::jsonb,
  priority text NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  published_by uuid NOT NULL,
  published_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  read_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Announcement reads
CREATE TABLE public.announcement_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Business profiles (enhanced)
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  business_type text NOT NULL, -- 'vendor', 'supplier', 'both'
  industry text NOT NULL,
  company_size text, -- 'startup', 'small', 'medium', 'large', 'enterprise'
  description text,
  website text,
  founded_year integer,
  logo_url text,
  cover_image_url text,
  certifications text[] DEFAULT '{}',
  specializations text[] DEFAULT '{}',
  service_areas text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  business_hours jsonb DEFAULT '{}'::jsonb,
  social_links jsonb DEFAULT '{}'::jsonb,
  verification_status text NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'premium'
  verification_documents jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Communication preferences
CREATE TABLE public.communication_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  announcement_notifications boolean DEFAULT true,
  newsletter_subscription boolean DEFAULT false,
  notification_schedule jsonb DEFAULT '{"start": "09:00", "end": "18:00", "timezone": "UTC"}'::jsonb,
  preferred_language text DEFAULT 'en',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message threads
CREATE POLICY "Users can view threads they participate in" ON public.message_threads
FOR SELECT USING (
  id IN (
    SELECT thread_id FROM public.thread_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create threads" ON public.message_threads
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Thread creators can update threads" ON public.message_threads
FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for thread participants
CREATE POLICY "Users can view participants in their threads" ON public.thread_participants
FOR SELECT USING (
  thread_id IN (
    SELECT thread_id FROM public.thread_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Thread admins can manage participants" ON public.thread_participants
FOR ALL USING (
  thread_id IN (
    SELECT tp.thread_id FROM public.thread_participants tp
    JOIN public.message_threads mt ON tp.thread_id = mt.id
    WHERE tp.user_id = auth.uid() AND (tp.role = 'admin' OR mt.created_by = auth.uid())
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their threads" ON public.messages
FOR SELECT USING (
  thread_id IN (
    SELECT thread_id FROM public.thread_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their threads" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  thread_id IN (
    SELECT thread_id FROM public.thread_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for message templates
CREATE POLICY "Users can manage their own templates" ON public.message_templates
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they're members of" ON public.workspaces
FOR SELECT USING (
  id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspaces" ON public.workspaces
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace admins can update workspaces" ON public.workspaces
FOR UPDATE USING (
  id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  ) OR auth.uid() = created_by
);

-- RLS Policies for workspace members
CREATE POLICY "Users can view members in their workspaces" ON public.workspace_members
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Workspace admins can manage members" ON public.workspace_members
FOR ALL USING (
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    JOIN public.workspaces w ON wm.workspace_id = w.id
    WHERE wm.user_id = auth.uid() AND (wm.role = 'admin' OR w.created_by = auth.uid())
  )
);

-- RLS Policies for workspace documents
CREATE POLICY "Users can view documents in their workspaces" ON public.workspace_documents
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their workspaces" ON public.workspace_documents
FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for workspace tasks
CREATE POLICY "Users can view tasks in their workspaces" ON public.workspace_tasks
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks in their workspaces" ON public.workspace_tasks
FOR INSERT WITH CHECK (
  auth.uid() = assigned_by AND
  workspace_id IN (
    SELECT workspace_id FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their assigned tasks" ON public.workspace_tasks
FOR UPDATE USING (
  auth.uid() = assigned_to OR auth.uid() = assigned_by OR
  workspace_id IN (
    SELECT wm.workspace_id FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

-- RLS Policies for business relationships
CREATE POLICY "Users can view their business relationships" ON public.business_relationships
FOR SELECT USING (auth.uid() = vendor_id OR auth.uid() = supplier_id);

CREATE POLICY "Users can create relationships as vendors" ON public.business_relationships
FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Relationship participants can update" ON public.business_relationships
FOR UPDATE USING (auth.uid() = vendor_id OR auth.uid() = supplier_id);

-- RLS Policies for relationship evaluations
CREATE POLICY "Users can view evaluations for their relationships" ON public.relationship_evaluations
FOR SELECT USING (
  relationship_id IN (
    SELECT id FROM public.business_relationships 
    WHERE vendor_id = auth.uid() OR supplier_id = auth.uid()
  )
);

CREATE POLICY "Users can create evaluations for their relationships" ON public.relationship_evaluations
FOR INSERT WITH CHECK (
  auth.uid() = evaluator_id AND
  relationship_id IN (
    SELECT id FROM public.business_relationships 
    WHERE vendor_id = auth.uid() OR supplier_id = auth.uid()
  )
);

-- RLS Policies for announcements
CREATE POLICY "Users can view active announcements" ON public.announcements
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "System can manage announcements" ON public.announcements
FOR ALL USING (true);

-- RLS Policies for announcement reads
CREATE POLICY "Users can manage their own announcement reads" ON public.announcement_reads
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for business profiles
CREATE POLICY "Users can view all business profiles" ON public.business_profiles
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own business profile" ON public.business_profiles
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for communication preferences
CREATE POLICY "Users can manage their own communication preferences" ON public.communication_preferences
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_message_threads_created_by ON public.message_threads(created_by);
CREATE INDEX idx_thread_participants_user_id ON public.thread_participants(user_id);
CREATE INDEX idx_thread_participants_thread_id ON public.thread_participants(thread_id);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_business_relationships_vendor_id ON public.business_relationships(vendor_id);
CREATE INDEX idx_business_relationships_supplier_id ON public.business_relationships(supplier_id);

-- Create triggers for updated_at
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_documents_updated_at
  BEFORE UPDATE ON public.workspace_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_tasks_updated_at
  BEFORE UPDATE ON public.workspace_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_relationships_updated_at
  BEFORE UPDATE ON public.business_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communication_preferences_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();