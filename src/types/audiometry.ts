// Domain types for the audiometry/hearing screening application

import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Re-export Supabase row types for convenience
export type GlobalSettings = Tables<"global_settings">;
export type CalibrationSetting = Tables<"calibration_settings">;
export type CalibrationSettingValue = Tables<"calibration_setting_values">;
export type TestSetting = Tables<"test_settings">;
export type PatientProfile = Tables<"patient_profiles">;
export type PatientProfileValue = Tables<"patient_profile_values">;

// Insert types
export type GlobalSettingsInsert = TablesInsert<"global_settings">;
export type CalibrationSettingInsert = TablesInsert<"calibration_settings">;
export type CalibrationSettingValueInsert = TablesInsert<"calibration_setting_values">;
export type TestSettingInsert = TablesInsert<"test_settings">;
export type PatientProfileInsert = TablesInsert<"patient_profiles">;
export type PatientProfileValueInsert = TablesInsert<"patient_profile_values">;

// Update types
export type GlobalSettingsUpdate = TablesUpdate<"global_settings">;
export type CalibrationSettingUpdate = TablesUpdate<"calibration_settings">;
export type CalibrationSettingValueUpdate = TablesUpdate<"calibration_setting_values">;
export type TestSettingUpdate = TablesUpdate<"test_settings">;
export type PatientProfileUpdate = TablesUpdate<"patient_profiles">;
export type PatientProfileValueUpdate = TablesUpdate<"patient_profile_values">;

// Application-level types
export type AppLanguage = "English" | "Portuguese";
export type EarOrder = "left_first" | "right_first" | "left_only" | "right_only";
export type TestCase = 0 | 1 | 2; // 0=silence, 1=first interval, 2=second interval
export type UserResponse = "first" | "second" | "no_sound";

export interface TrialRecord {
  frequency: number;
  ear: "left" | "right";
  db: number;
  casePresented: TestCase;
  userResponse: UserResponse;
  correct: boolean;
  timestamp: string;
}

export interface CorrectionFactors {
  left: number;
  right: number;
}

// Calibration with nested values
export interface CalibrationWithValues extends CalibrationSetting {
  values: CalibrationSettingValue[];
}

// Patient profile with nested values
export interface PatientProfileWithValues extends PatientProfile {
  values: PatientProfileValue[];
}
