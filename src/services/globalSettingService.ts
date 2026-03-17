// GlobalSettingService: manages the singleton global settings record

import { supabase } from "@/integrations/supabase/client";
import type { GlobalSettings, GlobalSettingsUpdate, AppLanguage } from "@/types/audiometry";

export const globalSettingService = {
  /** Ensure a global settings row exists and return it */
  async getOrCreate(): Promise<GlobalSettings> {
    const { data, error } = await supabase
      .from("global_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) return data;

    if (error && error.code === "PGRST116") {
      // No rows — create one
      const { data: created, error: createErr } = await supabase
        .from("global_settings")
        .insert({})
        .select()
        .single();
      if (createErr) throw createErr;
      return created!;
    }

    throw error;
  },

  async update(id: string, updates: GlobalSettingsUpdate): Promise<GlobalSettings> {
    const { data, error } = await supabase
      .from("global_settings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data!;
  },

  async setLanguage(id: string, language: AppLanguage): Promise<GlobalSettings> {
    return this.update(id, { test_language: language });
  },

  async setFrequencySequence(id: string, sequence: number[]): Promise<GlobalSettings> {
    return this.update(id, { test_frequency_sequence: sequence as unknown as any });
  },

  async setActiveCalibration(id: string, calibrationId: string | null): Promise<GlobalSettings> {
    return this.update(id, { active_calibration_setting_id: calibrationId });
  },

  async setCurrentPatient(id: string, patientId: string | null): Promise<GlobalSettings> {
    return this.update(id, { current_patient_profile_id: patientId });
  },

  async setTestProgress(id: string, current: number, total: number): Promise<GlobalSettings> {
    return this.update(id, { current_test_count: current, total_test_count: total });
  },

  async setEarConfig(id: string, isBoth: boolean, isLeft: boolean): Promise<GlobalSettings> {
    return this.update(id, { is_testing_both: isBoth, is_testing_left: isLeft });
  },
};
