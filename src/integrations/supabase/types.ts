export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          announcement_type: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          priority: string
          published_at: string | null
          published_by: string
          read_count: number | null
          target_audience: Json
          title: string
        }
        Insert: {
          announcement_type?: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string | null
          published_by: string
          read_count?: number | null
          target_audience?: Json
          title: string
        }
        Update: {
          announcement_type?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string
          published_at?: string | null
          published_by?: string
          read_count?: number | null
          target_audience?: Json
          title?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_hours: Json | null
          business_type: string
          certifications: string[] | null
          company_name: string
          company_size: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          industry: string
          languages: string[] | null
          logo_url: string | null
          service_areas: string[] | null
          social_links: Json | null
          specializations: string[] | null
          updated_at: string
          user_id: string
          verification_documents: Json | null
          verification_status: string
          website: string | null
        }
        Insert: {
          business_hours?: Json | null
          business_type: string
          certifications?: string[] | null
          company_name: string
          company_size?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry: string
          languages?: string[] | null
          logo_url?: string | null
          service_areas?: string[] | null
          social_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          verification_documents?: Json | null
          verification_status?: string
          website?: string | null
        }
        Update: {
          business_hours?: Json | null
          business_type?: string
          certifications?: string[] | null
          company_name?: string
          company_size?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string
          languages?: string[] | null
          logo_url?: string | null
          service_areas?: string[] | null
          social_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          verification_documents?: Json | null
          verification_status?: string
          website?: string | null
        }
        Relationships: []
      }
      business_relationships: {
        Row: {
          created_at: string
          established_date: string | null
          id: string
          last_interaction: string | null
          notes: string | null
          overall_score: number | null
          quality_score: number | null
          relationship_type: string
          status: string
          supplier_id: string
          trust_score: number | null
          updated_at: string
          vendor_id: string
          volume_score: number | null
        }
        Insert: {
          created_at?: string
          established_date?: string | null
          id?: string
          last_interaction?: string | null
          notes?: string | null
          overall_score?: number | null
          quality_score?: number | null
          relationship_type?: string
          status?: string
          supplier_id: string
          trust_score?: number | null
          updated_at?: string
          vendor_id: string
          volume_score?: number | null
        }
        Update: {
          created_at?: string
          established_date?: string | null
          id?: string
          last_interaction?: string | null
          notes?: string | null
          overall_score?: number | null
          quality_score?: number | null
          relationship_type?: string
          status?: string
          supplier_id?: string
          trust_score?: number | null
          updated_at?: string
          vendor_id?: string
          volume_score?: number | null
        }
        Relationships: []
      }
      communication_preferences: {
        Row: {
          announcement_notifications: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          message_notifications: boolean | null
          newsletter_subscription: boolean | null
          notification_schedule: Json | null
          order_updates: boolean | null
          preferred_language: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          newsletter_subscription?: boolean | null
          notification_schedule?: Json | null
          order_updates?: boolean | null
          preferred_language?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          newsletter_subscription?: boolean | null
          notification_schedule?: Json | null
          order_updates?: boolean | null
          preferred_language?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_limits: {
        Row: {
          available_credit: number | null
          credit_limit: number
          id: string
          last_updated: string
          used_credit: number
          vendor_id: string
        }
        Insert: {
          available_credit?: number | null
          credit_limit?: number
          id?: string
          last_updated?: string
          used_credit?: number
          vendor_id: string
        }
        Update: {
          available_credit?: number | null
          credit_limit?: number
          id?: string
          last_updated?: string
          used_credit?: number
          vendor_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          order_id: string
          payment_terms: string
          shipping_cost: number
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          order_id: string
          payment_terms?: string
          shipping_cost?: number
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string
          payment_terms?: string
          shipping_cost?: number
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          title: string
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string
          created_by: string
          id: string
          metadata: Json | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          metadata?: Json | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          metadata?: Json | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          reply_to: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_per_kg: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_per_kg: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_per_kg?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          delivery_instructions: string | null
          id: string
          preferred_time_slot: string | null
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          total_price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          delivery_instructions?: string | null
          id?: string
          preferred_time_slot?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          total_price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          delivery_instructions?: string | null
          id?: string
          preferred_time_slot?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string
          total_price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_details: Json
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          provider: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_details: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          provider: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_details?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          provider?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gateway_response: Json | null
          id: string
          invoice_id: string
          payment_date: string | null
          payment_method_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          invoice_id: string
          payment_date?: string | null
          payment_method_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          invoice_id?: string
          payment_date?: string | null
          payment_method_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          market_average: number | null
          name: string
          price_per_kg: number
          stock_available: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          market_average?: number | null
          name: string
          price_per_kg: number
          stock_available?: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          market_average?: number | null
          name?: string
          price_per_kg?: number
          stock_available?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          created_at: string
          failed_login_attempts: number | null
          full_name: string
          id: string
          language_preference: string | null
          last_login_at: string | null
          location: string
          password_changed_at: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string
          failed_login_attempts?: number | null
          full_name: string
          id?: string
          language_preference?: string | null
          last_login_at?: string | null
          location: string
          password_changed_at?: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          language_preference?: string | null
          last_login_at?: string | null
          location?: string
          password_changed_at?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_evaluations: {
        Row: {
          comments: string | null
          created_at: string
          evaluation_period_end: string | null
          evaluation_period_start: string | null
          evaluation_type: string
          evaluator_id: string
          id: string
          relationship_id: string
          score: number
        }
        Insert: {
          comments?: string | null
          created_at?: string
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          evaluation_type: string
          evaluator_id: string
          id?: string
          relationship_id: string
          score: number
        }
        Update: {
          comments?: string | null
          created_at?: string
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          evaluation_type?: string
          evaluator_id?: string
          id?: string
          relationship_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "relationship_evaluations_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "business_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string | null
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          location_data: Json | null
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          location_data?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          token_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          created_at: string
          current_location: string
          estimated_delivery: string | null
          id: string
          order_id: string
          status: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_location?: string
          estimated_delivery?: string | null
          id?: string
          order_id: string
          status?: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_location?: string
          estimated_delivery?: string | null
          id?: string
          order_id?: string
          status?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          rate: number
          tax_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          rate: number
          tax_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          rate?: number
          tax_type?: string
          user_id?: string
        }
        Relationships: []
      }
      thread_participants: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string | null
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          attempts: number
          created_at: string
          email: string | null
          expires_at: string
          id: string
          otp_code: string
          phone_number: string | null
          updated_at: string
          user_id: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          otp_code: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: []
      }
      workspace_documents: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by: string
          version?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          permissions: Json | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_tasks: {
        Row: {
          assigned_by: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_by: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          status: string
          updated_at: string
          workspace_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          status?: string
          updated_at?: string
          workspace_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: string
          updated_at?: string
          workspace_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      order_status: "pending" | "confirmed" | "delivered"
      user_role: "vendor" | "supplier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "confirmed", "delivered"],
      user_role: ["vendor", "supplier"],
    },
  },
} as const
