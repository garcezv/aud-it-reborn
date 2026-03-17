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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      calibration_setting_values: {
        Row: {
          calibration_setting_id: string
          created_at: string
          expected_lv: number
          frequency: number
          id: string
          measured_lv_l: number
          measured_lv_r: number
          presentation_lv: number
          updated_at: string
        }
        Insert: {
          calibration_setting_id: string
          created_at?: string
          expected_lv?: number
          frequency: number
          id?: string
          measured_lv_l?: number
          measured_lv_r?: number
          presentation_lv?: number
          updated_at?: string
        }
        Update: {
          calibration_setting_id?: string
          created_at?: string
          expected_lv?: number
          frequency?: number
          id?: string
          measured_lv_l?: number
          measured_lv_r?: number
          presentation_lv?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibration_setting_values_calibration_setting_id_fkey"
            columns: ["calibration_setting_id"]
            isOneToOne: false
            referencedRelation: "calibration_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      calibration_settings: {
        Row: {
          created_at: string
          id: string
          name: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          active_calibration_setting_id: string | null
          created_at: string
          current_patient_profile_id: string | null
          current_test_count: number
          id: string
          is_testing_both: boolean
          is_testing_left: boolean
          test_frequency_sequence: Json
          test_language: string
          total_test_count: number
          updated_at: string
        }
        Insert: {
          active_calibration_setting_id?: string | null
          created_at?: string
          current_patient_profile_id?: string | null
          current_test_count?: number
          id?: string
          is_testing_both?: boolean
          is_testing_left?: boolean
          test_frequency_sequence?: Json
          test_language?: string
          total_test_count?: number
          updated_at?: string
        }
        Update: {
          active_calibration_setting_id?: string | null
          created_at?: string
          current_patient_profile_id?: string | null
          current_test_count?: number
          id?: string
          is_testing_both?: boolean
          is_testing_left?: boolean
          test_frequency_sequence?: Json
          test_language?: string
          total_test_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_settings_active_calibration_setting_id_fkey"
            columns: ["active_calibration_setting_id"]
            isOneToOne: false
            referencedRelation: "calibration_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_settings_current_patient_profile_id_fkey"
            columns: ["current_patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profile_values: {
        Row: {
          created_at: string
          duration_seconds_l: number | null
          duration_seconds_r: number | null
          end_time_l: string | null
          end_time_r: string | null
          frequency: number
          id: string
          no_sound_correct_l: number
          no_sound_correct_r: number
          no_sound_count_l: number
          no_sound_count_r: number
          patient_profile_id: string
          responses_l: Json
          responses_r: Json
          results_l: Json
          results_r: Json
          spam_count_l: number
          spam_count_r: number
          start_time_l: string | null
          start_time_r: string | null
          threshold_l: number | null
          threshold_r: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds_l?: number | null
          duration_seconds_r?: number | null
          end_time_l?: string | null
          end_time_r?: string | null
          frequency: number
          id?: string
          no_sound_correct_l?: number
          no_sound_correct_r?: number
          no_sound_count_l?: number
          no_sound_count_r?: number
          patient_profile_id: string
          responses_l?: Json
          responses_r?: Json
          results_l?: Json
          results_r?: Json
          spam_count_l?: number
          spam_count_r?: number
          start_time_l?: string | null
          start_time_r?: string | null
          threshold_l?: number | null
          threshold_r?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds_l?: number | null
          duration_seconds_r?: number | null
          end_time_l?: string | null
          end_time_r?: string | null
          frequency?: number
          id?: string
          no_sound_correct_l?: number
          no_sound_correct_r?: number
          no_sound_count_l?: number
          no_sound_count_r?: number
          patient_profile_id?: string
          responses_l?: Json
          responses_r?: Json
          results_l?: Json
          results_r?: Json
          spam_count_l?: number
          spam_count_r?: number
          start_time_l?: string | null
          start_time_r?: string | null
          threshold_l?: number | null
          threshold_r?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_profile_values_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ear_order: string
          end_time: string | null
          frequency_order: Json
          id: string
          is_adult: boolean
          is_practice: boolean
          name: string
          patient_group: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ear_order?: string
          end_time?: string | null
          frequency_order?: Json
          id?: string
          is_adult?: boolean
          is_practice?: boolean
          name: string
          patient_group?: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ear_order?: string
          end_time?: string | null
          frequency_order?: Json
          id?: string
          is_adult?: boolean
          is_practice?: boolean
          name?: string
          patient_group?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_settings: {
        Row: {
          created_at: string
          frequency_sequence: Json
          id: string
          is_test_both: boolean
          is_test_left_first: boolean
          name: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency_sequence?: Json
          id?: string
          is_test_both?: boolean
          is_test_left_first?: boolean
          name: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency_sequence?: Json
          id?: string
          is_test_both?: boolean
          is_test_left_first?: boolean
          name?: string
          timestamp?: string
          updated_at?: string
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
