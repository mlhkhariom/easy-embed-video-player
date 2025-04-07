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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
