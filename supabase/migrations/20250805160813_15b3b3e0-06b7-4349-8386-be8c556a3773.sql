-- Create storage buckets for file sharing
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('message-attachments', 'message-attachments', false),
  ('workspace-documents', 'workspace-documents', false),
  ('business-profiles', 'business-profiles', true);

-- Storage policies for message attachments
CREATE POLICY "Users can view attachments in their threads" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT tp.thread_id::text FROM public.thread_participants tp
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload attachments to their threads" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT tp.thread_id::text FROM public.thread_participants tp
    WHERE tp.user_id = auth.uid()
  )
);

-- Storage policies for workspace documents  
CREATE POLICY "Users can view documents in their workspaces" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'workspace-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT wm.workspace_id::text FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their workspaces" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'workspace-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT wm.workspace_id::text FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
  )
);

-- Storage policies for business profiles (public)
CREATE POLICY "Business profile images are publicly accessible" ON storage.objects 
FOR SELECT USING (bucket_id = 'business-profiles');

CREATE POLICY "Users can upload their own business profile images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'business-profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own business profile images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'business-profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);