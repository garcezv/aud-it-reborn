// CalibrationService: CRUD for calibration settings and their values

import { supabase } from "@/integrations/supabase/client";
import type {
  CalibrationSetting,
  CalibrationSettingValue,
  CalibrationWithValues,
  CorrectionFactors,
} from "@/types/audiometry";
import { DEFAULT_EXPECTED_LEVELS, DEFAULT_PRESENTATION_LEVELS, DEFAULT_FREQUENCIES } from "@/constants/audio";

export const calibrationService = {
  async list(): Promise<CalibrationSetting[]> {
    const { data, error } = await supabase
      .from("calibration_settings")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getWithValues(id: string): Promise<CalibrationWithValues | null> {
    const { data: setting, error: sErr } = await supabase
      .from("calibration_settings")
      .select("*")
      .eq("id", id)
      .single();
    if (sErr) return null;

    const { data: values, error: vErr } = await supabase
      .from("calibration_setting_values")
      .select("*")
      .eq("calibration_setting_id", id)
      .order("frequency", { ascending: true });
    if (vErr) throw vErr;

    return { ...setting!, values: values ?? [] };
  },

  async create(name: string): Promise<CalibrationWithValues> {
    const { data: setting, error: sErr } = await supabase
      .from("calibration_settings")
      .insert({ name })
      .select()
      .single();
    if (sErr) throw sErr;

    const rows = DEFAULT_FREQUENCIES.map((freq) => ({
      calibration_setting_id: setting!.id,
      frequency: freq,
      expected_lv: DEFAULT_EXPECTED_LEVELS[freq] ?? 70,
      presentation_lv: DEFAULT_PRESENTATION_LEVELS[freq] ?? 70,
      measured_lv_l: 0,
      measured_lv_r: 0,
    }));

    const { data: values, error: vErr } = await supabase
      .from("calibration_setting_values")
      .insert(rows)
      .select();
    if (vErr) throw vErr;

    return { ...setting!, values: values ?? [] };
  },

  async updateName(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from("calibration_settings")
      .update({ name })
      .eq("id", id);
    if (error) throw error;
  },

  async updateValue(
    valueId: string,
    updates: Partial<Pick<CalibrationSettingValue, "presentation_lv" | "measured_lv_l" | "measured_lv_r">>
  ): Promise<void> {
    const { error } = await supabase
      .from("calibration_setting_values")
      .update(updates)
      .eq("id", valueId);
    if (error) throw error;
  },

  async clearMeasured(calibrationId: string): Promise<void> {
    const { error } = await supabase
      .from("calibration_setting_values")
      .update({ measured_lv_l: 0, measured_lv_r: 0 })
      .eq("calibration_setting_id", calibrationId);
    if (error) throw error;
  },

  async fillDefaultPresentation(calibrationId: string): Promise<void> {
    for (const freq of DEFAULT_FREQUENCIES) {
      await supabase
        .from("calibration_setting_values")
        .update({
          presentation_lv: DEFAULT_PRESENTATION_LEVELS[freq] ?? 70,
          expected_lv: DEFAULT_EXPECTED_LEVELS[freq] ?? 70,
        })
        .eq("calibration_setting_id", calibrationId)
        .eq("frequency", freq);
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("calibration_settings")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  /** Calculate correction factors for a given frequency from calibration values */
  getCorrectionFactors(values: CalibrationSettingValue[], frequency: number): CorrectionFactors {
    const row = values.find((v) => v.frequency === frequency);
    if (!row) return { left: 0, right: 0 };
    return {
      left: row.expected_lv - row.measured_lv_l,
      right: row.expected_lv - row.measured_lv_r,
    };
  },
};
