export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_post_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          post_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          post_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_featured: boolean | null
          language: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_plans: {
        Row: {
          created_at: string
          duration: number
          id: string
          plan: Json
          posting_days: string[] | null
          quiz_response_id: string | null
          start_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number
          id?: string
          plan: Json
          posting_days?: string[] | null
          quiz_response_id?: string | null
          start_date?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          plan?: Json
          posting_days?: string[] | null
          quiz_response_id?: string | null
          start_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_plans_quiz_response_id_fkey"
            columns: ["quiz_response_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_ideas: {
        Row: {
          created_at: string
          favorited: boolean
          id: string
          ideas: Json
          quiz_response_id: string | null
          saved: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          favorited?: boolean
          id?: string
          ideas: Json
          quiz_response_id?: string | null
          saved?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          favorited?: boolean
          id?: string
          ideas?: Json
          quiz_response_id?: string | null
          saved?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_ideas_quiz_response_id_fkey"
            columns: ["quiz_response_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          content_created: boolean
          content_edited: boolean
          content_published: boolean
          created_at: string
          day_number: number
          id: string
          notes: string | null
          plan_id: string
          platform: string | null
          post_description: string | null
          post_title: string | null
          script_completed: boolean
          task_title: string
          time_spent_estimated: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          content_created?: boolean
          content_edited?: boolean
          content_published?: boolean
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          plan_id: string
          platform?: string | null
          post_description?: string | null
          post_title?: string | null
          script_completed?: boolean
          task_title: string
          time_spent_estimated?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          content_created?: boolean
          content_edited?: boolean
          content_published?: boolean
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          plan_id?: string
          platform?: string | null
          post_description?: string | null
          post_title?: string | null
          script_completed?: boolean
          task_title?: string
          time_spent_estimated?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          instagram_url: string | null
          last_name: string | null
          last_sms_sent_date: string | null
          phone: string | null
          sms_consent: boolean | null
          sms_notifications_enabled: boolean | null
          tiktok_url: string | null
          timezone: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          instagram_url?: string | null
          last_name?: string | null
          last_sms_sent_date?: string | null
          phone?: string | null
          sms_consent?: boolean | null
          sms_notifications_enabled?: boolean | null
          tiktok_url?: string | null
          timezone?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          last_sms_sent_date?: string | null
          phone?: string | null
          sms_consent?: boolean | null
          sms_notifications_enabled?: boolean | null
          tiktok_url?: string | null
          timezone?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          answers: Json
          archetype_scores: Json
          created_at: string
          gear: string[] | null
          id: string
          posting_days: string[] | null
          primary_archetype: string
          secondary_archetype: string | null
          selected_topics: string[] | null
          target_audience: string | null
          time_bucket: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          archetype_scores: Json
          created_at?: string
          gear?: string[] | null
          id?: string
          posting_days?: string[] | null
          primary_archetype: string
          secondary_archetype?: string | null
          selected_topics?: string[] | null
          target_audience?: string | null
          time_bucket?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          archetype_scores?: Json
          created_at?: string
          gear?: string[] | null
          id?: string
          posting_days?: string[] | null
          primary_archetype?: string
          secondary_archetype?: string | null
          selected_topics?: string[] | null
          target_audience?: string | null
          time_bucket?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_links: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          metadata: Json | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          metadata?: Json | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_signups: {
        Row: {
          conversion_date: string | null
          converted_to_paid: boolean
          id: string
          ip_address: string | null
          referral_link_id: string
          signup_date: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          conversion_date?: string | null
          converted_to_paid?: boolean
          id?: string
          ip_address?: string | null
          referral_link_id: string
          signup_date?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          conversion_date?: string | null
          converted_to_paid?: boolean
          id?: string
          ip_address?: string | null
          referral_link_id?: string
          signup_date?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_signups_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
        ]
      }
      script_documents: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          last_edited_at: string | null
          task_id: string
          title: string
          user_id: string
          version: number | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          last_edited_at?: string | null
          task_id: string
          title?: string
          user_id: string
          version?: number | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          last_edited_at?: string | null
          task_id?: string
          title?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "script_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "plan_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      slider_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number
          filename: string
          id: string
          is_active: boolean | null
          storage_path: string
          updated_at: string | null
          used_in_pages: string[] | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order: number
          filename: string
          id?: string
          is_active?: boolean | null
          storage_path: string
          updated_at?: string | null
          used_in_pages?: string[] | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number
          filename?: string
          id?: string
          is_active?: boolean | null
          storage_path?: string
          updated_at?: string | null
          used_in_pages?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
