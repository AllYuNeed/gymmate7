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
      custom_diet_plans: {
        Row: {
          carbs_g: number | null
          created_at: string
          daily_calories: number | null
          fats_g: number | null
          guild_id: string | null
          id: string
          is_template: boolean
          meals: Json
          owner_user_id: string
          protein_g: number | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          carbs_g?: number | null
          created_at?: string
          daily_calories?: number | null
          fats_g?: number | null
          guild_id?: string | null
          id?: string
          is_template?: boolean
          meals?: Json
          owner_user_id: string
          protein_g?: number | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          carbs_g?: number | null
          created_at?: string
          daily_calories?: number | null
          fats_g?: number | null
          guild_id?: string | null
          id?: string
          is_template?: boolean
          meals?: Json
          owner_user_id?: string
          protein_g?: number | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_diet_plans_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_workout_plans: {
        Row: {
          created_at: string
          days_per_week: number
          guild_id: string | null
          id: string
          is_template: boolean
          owner_user_id: string
          schedule: Json
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_per_week?: number
          guild_id?: string | null
          id?: string
          is_template?: boolean
          owner_user_id: string
          schedule?: Json
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_per_week?: number
          guild_id?: string | null
          id?: string
          is_template?: boolean
          owner_user_id?: string
          schedule?: Json
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_workout_plans_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
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
      guild_members: {
        Row: {
          contributed_xp: number
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          contributed_xp?: number
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          contributed_xp?: number
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_quests: {
        Row: {
          created_at: string
          current_xp: number
          description: string | null
          ends_at: string
          guild_id: string
          id: string
          reward: string | null
          starts_at: string
          target_xp: number
          title: string
        }
        Insert: {
          created_at?: string
          current_xp?: number
          description?: string | null
          ends_at?: string
          guild_id: string
          id?: string
          reward?: string | null
          starts_at?: string
          target_xp?: number
          title: string
        }
        Update: {
          created_at?: string
          current_xp?: number
          description?: string | null
          ends_at?: string
          guild_id?: string
          id?: string
          reward?: string | null
          starts_at?: string
          target_xp?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_quests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          invite_code: string
          leader_user_id: string
          name: string
          total_xp: number
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          invite_code: string
          leader_user_id: string
          name: string
          total_xp?: number
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          invite_code?: string
          leader_user_id?: string
          name?: string
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      heroes: {
        Row: {
          age: number | null
          available_days: number
          body_type: string
          city: string | null
          class: string
          coins: number
          country: string | null
          created_at: string
          equipment: string
          experience_level: string
          gender: string | null
          goal: string
          gym_name: string | null
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
          username: string | null
          weekly_xp: number
          weekly_xp_reset_at: string
          weight_kg: number | null
          xp: number
        }
        Insert: {
          age?: number | null
          available_days?: number
          body_type: string
          city?: string | null
          class: string
          coins?: number
          country?: string | null
          created_at?: string
          equipment: string
          experience_level: string
          gender?: string | null
          goal: string
          gym_name?: string | null
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
          username?: string | null
          weekly_xp?: number
          weekly_xp_reset_at?: string
          weight_kg?: number | null
          xp?: number
        }
        Update: {
          age?: number | null
          available_days?: number
          body_type?: string
          city?: string | null
          class?: string
          coins?: number
          country?: string | null
          created_at?: string
          equipment?: string
          experience_level?: string
          gender?: string | null
          goal?: string
          gym_name?: string | null
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
          username?: string | null
          weekly_xp?: number
          weekly_xp_reset_at?: string
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
      plan_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          created_at: string
          diet_plan_id: string | null
          id: string
          note: string | null
          plan_kind: string
          workout_plan_id: string | null
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          created_at?: string
          diet_plan_id?: string | null
          id?: string
          note?: string | null
          plan_kind: string
          workout_plan_id?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          created_at?: string
          diet_plan_id?: string | null
          id?: string
          note?: string | null
          plan_kind?: string
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "custom_diet_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "custom_workout_plans"
            referencedColumns: ["id"]
          },
        ]
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
      has_diet_plan_access: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
      has_workout_plan_access: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_leader: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_member: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
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
