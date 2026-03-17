// TestSettingService: CRUD for protocol/test setting templates

import { supabase } from "@/integrations/supabase/client";
import type { TestSetting } from "@/types/audiometry";

export const testSettingService = {
  async list(): Promise<TestSetting[]> {
    const { data, error } = await supabase
      .from("test_settings")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async get(id: string): Promise<TestSetting | null> {
    const { data, error } = await supabase
      .from("test_settings")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  async create(
    name: string,
    frequencySequence: number[],
    isTestBoth: boolean,
    isTestLeftFirst: boolean
  ): Promise<TestSetting> {
    const { data, error } = await supabase
      .from("test_settings")
      .insert({
        name,
        frequency_sequence: frequencySequence as unknown as any,
        is_test_both: isTestBoth,
        is_test_left_first: isTestLeftFirst,
      })
      .select()
      .single();
    if (error) throw error;
    return data!;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      frequency_sequence: number[];
      is_test_both: boolean;
      is_test_left_first: boolean;
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from("test_settings")
      .update(updates as any)
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("test_settings")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
