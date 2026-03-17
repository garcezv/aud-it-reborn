// PatientProfileService: CRUD for patient profiles and their per-frequency values

import { supabase } from "@/integrations/supabase/client";
import type {
  PatientProfile,
  PatientProfileValue,
  PatientProfileWithValues,
  PatientProfileInsert,
  EarOrder,
} from "@/types/audiometry";

export const patientProfileService = {
  async list(): Promise<PatientProfile[]> {
    const { data, error } = await supabase
      .from("patient_profiles")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getWithValues(id: string): Promise<PatientProfileWithValues | null> {
    const { data: profile, error: pErr } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (pErr) return null;

    const { data: values, error: vErr } = await supabase
      .from("patient_profile_values")
      .select("*")
      .eq("patient_profile_id", id)
      .order("frequency", { ascending: true });
    if (vErr) throw vErr;

    return { ...profile!, values: values ?? [] };
  },

  async create(
    name: string,
    patientGroup: string,
    earOrder: EarOrder,
    frequencyOrder: number[],
    isAdult: boolean,
    isPractice: boolean
  ): Promise<PatientProfileWithValues> {
    const insert: PatientProfileInsert = {
      name,
      patient_group: patientGroup,
      ear_order: earOrder,
      frequency_order: frequencyOrder as unknown as any,
      is_adult: isAdult,
      is_practice: isPractice,
    };

    const { data: profile, error: pErr } = await supabase
      .from("patient_profiles")
      .insert(insert)
      .select()
      .single();
    if (pErr) throw pErr;

    // Create value rows for each frequency
    const valueRows = frequencyOrder.map((freq) => ({
      patient_profile_id: profile!.id,
      frequency: freq,
    }));

    const { data: values, error: vErr } = await supabase
      .from("patient_profile_values")
      .insert(valueRows)
      .select();
    if (vErr) throw vErr;

    return { ...profile!, values: values ?? [] };
  },

  async updateValue(
    valueId: string,
    updates: Partial<PatientProfileValue>
  ): Promise<void> {
    const { error } = await supabase
      .from("patient_profile_values")
      .update(updates)
      .eq("id", valueId);
    if (error) throw error;
  },

  async endExam(profileId: string): Promise<void> {
    const profile = await this.getWithValues(profileId);
    if (!profile) return;

    const startTime = new Date(profile.timestamp).getTime();
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    const { error } = await supabase
      .from("patient_profiles")
      .update({
        end_time: new Date(endTime).toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", profileId);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("patient_profiles")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async deleteAll(): Promise<void> {
    const { error } = await supabase
      .from("patient_profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
    if (error) throw error;
  },
};
