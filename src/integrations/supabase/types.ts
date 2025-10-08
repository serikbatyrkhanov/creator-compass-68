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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
