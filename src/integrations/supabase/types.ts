export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cloudstream_content: {
        Row: {
          backdrop: string | null
          created_at: string | null
          external_id: string | null
          id: string
          plot: string | null
          poster: string | null
          rating: number | null
          source_id: string | null
          title: string
          type: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          backdrop?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          plot?: string | null
          poster?: string | null
          rating?: number | null
          source_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          backdrop?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          plot?: string | null
          poster?: string | null
          rating?: number | null
          source_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cloudstream_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "cloudstream_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      cloudstream_plugins: {
        Row: {
          author: string | null
          categories: string[] | null
          description: string | null
          id: string
          installed_at: string | null
          is_enabled: boolean | null
          is_installed: boolean | null
          language: string | null
          name: string
          repository: string | null
          url: string
          version: string | null
        }
        Insert: {
          author?: string | null
          categories?: string[] | null
          description?: string | null
          id?: string
          installed_at?: string | null
          is_enabled?: boolean | null
          is_installed?: boolean | null
          language?: string | null
          name: string
          repository?: string | null
          url: string
          version?: string | null
        }
        Update: {
          author?: string | null
          categories?: string[] | null
          description?: string | null
          id?: string
          installed_at?: string | null
          is_enabled?: boolean | null
          is_installed?: boolean | null
          language?: string | null
          name?: string
          repository?: string | null
          url?: string
          version?: string | null
        }
        Relationships: []
      }
      cloudstream_repositories: {
        Row: {
          author: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          last_synced: string | null
          name: string
          plugin_count: number | null
          url: string
        }
        Insert: {
          author?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_synced?: string | null
          name: string
          plugin_count?: number | null
          url: string
        }
        Update: {
          author?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          last_synced?: string | null
          name?: string
          plugin_count?: number | null
          url?: string
        }
        Relationships: []
      }
      cloudstream_sources: {
        Row: {
          categories: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          language: string | null
          logo: string | null
          name: string
          repo: string
          url: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          language?: string | null
          logo?: string | null
          name: string
          repo: string
          url: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          language?: string | null
          logo?: string | null
          name?: string
          repo?: string
          url?: string
        }
        Relationships: []
      }
      telegram_files: {
        Row: {
          file_id: string
          file_name: string
          id: string
          metadata: Json | null
          mime_type: string
          size: number
          upload_date: string | null
          url: string | null
        }
        Insert: {
          file_id: string
          file_name: string
          id?: string
          metadata?: Json | null
          mime_type: string
          size: number
          upload_date?: string | null
          url?: string | null
        }
        Update: {
          file_id?: string
          file_name?: string
          id?: string
          metadata?: Json | null
          mime_type?: string
          size?: number
          upload_date?: string | null
          url?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
