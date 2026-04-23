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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boss_battles: {
        Row: {
          boss_lore: string | null
          boss_name: string
          boss_sigil: string
          created_at: string
          current_hp: number
          defeated_at: string | null
          id: string
          loot: string[]
          max_hp: number
          month_key: string
          status: string
          user_id: string
        }
        Insert: {
          boss_lore?: string | null
          boss_name: string
          boss_sigil?: string
          created_at?: string
          current_hp: number
          defeated_at?: string | null
          id?: string
          loot?: string[]
          max_hp: number
          month_key: string
          status?: string
          user_id: string
        }
        Update: {
          boss_lore?: string | null
          boss_name?: string
          boss_sigil?: string
          created_at?: string
          current_hp?: number
          defeated_at?: string | null
          id?: string
          loot?: string[]
          max_hp?: number
          month_key?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          coin_reward: number
          completed: boolean
          created_at: string
          description: string | null
          id: string
          progress: number
          quest_date: string
          target: number
          title: string
          type: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          quest_date?: string
          target?: number
          title: string
          type: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          quest_date?: string
          target?: number
          title?: string
          type?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          carbs_g: number | null
          created_at: string
          daily_calories: number | null
          fats_g: number | null
          id: string
          is_active: boolean
          meals: Json
          protein_g: number | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          carbs_g?: number | null
          created_at?: string
          daily_calories?: number | null
          fats_g?: number | null
          id?: string
          is_active?: boolean
          meals?: Json
          protein_g?: number | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          carbs_g?: number | null
          created_at?: string
          daily_calories?: number | null
          fats_g?: number | null
          id?: string
          is_active?: boolean
          meals?: Json
          protein_g?: number | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      heroes: {
        Row: {
          age: number | null
          available_days: number
          body_type: string
          class: string
          coins: number
          created_at: string
          equipment: string
          experience_level: string
          gender: string | null
          goal: string
          height_cm: number | null
          hero_name: string
          id: string
          injuries: string[]
          level: number
          sleep_quality: string
          streak_days: number
          streak_freezes: number
          stress_level: string
          units: string
          updated_at: string
          user_id: string
          weight_kg: number | null
          xp: number
        }
        Insert: {
          age?: number | null
          available_days?: number
          body_type: string
          class: string
          coins?: number
          created_at?: string
          equipment: string
          experience_level: string
          gender?: string | null
          goal: string
          height_cm?: number | null
          hero_name: string
          id?: string
          injuries?: string[]
          level?: number
          sleep_quality: string
          streak_days?: number
          streak_freezes?: number
          stress_level: string
          units?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          xp?: number
        }
        Update: {
          age?: number | null
          available_days?: number
          body_type?: string
          class?: string
          coins?: number
          created_at?: string
          equipment?: string
          experience_level?: string
          gender?: string | null
          goal?: string
          height_cm?: number | null
          hero_name?: string
          id?: string
          injuries?: string[]
          level?: number
          sleep_quality?: string
          streak_days?: number
          streak_freezes?: number
          stress_level?: string
          units?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          xp?: number
        }
        Relationships: []
      }
      muscle_realms: {
        Row: {
          created_at: string
          id: string
          muscle: string
          rank: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          muscle: string
          rank?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          muscle?: string
          rank?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          exercise: string
          id: string
          intensity: number
          muscles: string[]
          notes: string | null
          reps: number
          sets: number
          user_id: string
          weight_kg: number
          xp_earned: number
        }
        Insert: {
          created_at?: string
          exercise: string
          id?: string
          intensity?: number
          muscles?: string[]
          notes?: string | null
          reps?: number
          sets?: number
          user_id: string
          weight_kg?: number
          xp_earned?: number
        }
        Update: {
          created_at?: string
          exercise?: string
          id?: string
          intensity?: number
          muscles?: string[]
          notes?: string | null
          reps?: number
          sets?: number
          user_id?: string
          weight_kg?: number
          xp_earned?: number
        }
        Relationships: []
      }
      workout_routines: {
        Row: {
          created_at: string
          days_per_week: number
          id: string
          is_active: boolean
          schedule: Json
          source: string
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_per_week?: number
          id?: string
          is_active?: boolean
          schedule?: Json
          source?: string
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_per_week?: number
          id?: string
          is_active?: boolean
          schedule?: Json
          source?: string
          summary?: string | null
          title?: string
          user_id?: string
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
