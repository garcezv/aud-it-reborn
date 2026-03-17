
-- ============================================================
-- PHASE 1: Complete Audiometry Schema
-- ============================================================

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 1. calibration_settings
-- ============================================================
CREATE TABLE public.calibration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calibration_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to calibration_settings" ON public.calibration_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_calibration_settings_updated_at BEFORE UPDATE ON public.calibration_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. calibration_setting_values
-- ============================================================
CREATE TABLE public.calibration_setting_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calibration_setting_id UUID NOT NULL REFERENCES public.calibration_settings(id) ON DELETE CASCADE,
  frequency INTEGER NOT NULL,
  expected_lv DOUBLE PRECISION NOT NULL DEFAULT 0,
  presentation_lv DOUBLE PRECISION NOT NULL DEFAULT 0,
  measured_lv_l DOUBLE PRECISION NOT NULL DEFAULT 0,
  measured_lv_r DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calibration_setting_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to calibration_setting_values" ON public.calibration_setting_values FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_csv_calibration_id ON public.calibration_setting_values(calibration_setting_id);
CREATE INDEX idx_csv_frequency ON public.calibration_setting_values(frequency);
CREATE TRIGGER update_calibration_setting_values_updated_at BEFORE UPDATE ON public.calibration_setting_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. test_settings (protocol templates)
-- ============================================================
CREATE TABLE public.test_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  frequency_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_test_both BOOLEAN NOT NULL DEFAULT true,
  is_test_left_first BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to test_settings" ON public.test_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_test_settings_updated_at BEFORE UPDATE ON public.test_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. patient_profiles
-- ============================================================
CREATE TABLE public.patient_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  patient_group TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  ear_order TEXT NOT NULL DEFAULT 'left_first',
  frequency_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_adult BOOLEAN NOT NULL DEFAULT true,
  is_practice BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to patient_profiles" ON public.patient_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_pp_timestamp ON public.patient_profiles(timestamp);
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. patient_profile_values
-- ============================================================
CREATE TABLE public.patient_profile_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  frequency INTEGER NOT NULL,
  threshold_l DOUBLE PRECISION DEFAULT -1,
  threshold_r DOUBLE PRECISION DEFAULT -1,
  results_l JSONB NOT NULL DEFAULT '[]'::jsonb,
  results_r JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses_l JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses_r JSONB NOT NULL DEFAULT '[]'::jsonb,
  no_sound_count_l INTEGER NOT NULL DEFAULT 0,
  no_sound_count_r INTEGER NOT NULL DEFAULT 0,
  no_sound_correct_l INTEGER NOT NULL DEFAULT 0,
  no_sound_correct_r INTEGER NOT NULL DEFAULT 0,
  spam_count_l INTEGER NOT NULL DEFAULT 0,
  spam_count_r INTEGER NOT NULL DEFAULT 0,
  start_time_l TIMESTAMP WITH TIME ZONE,
  start_time_r TIMESTAMP WITH TIME ZONE,
  end_time_l TIMESTAMP WITH TIME ZONE,
  end_time_r TIMESTAMP WITH TIME ZONE,
  duration_seconds_l INTEGER DEFAULT 0,
  duration_seconds_r INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_profile_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to patient_profile_values" ON public.patient_profile_values FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_ppv_profile_id ON public.patient_profile_values(patient_profile_id);
CREATE INDEX idx_ppv_frequency ON public.patient_profile_values(frequency);
CREATE TRIGGER update_patient_profile_values_updated_at BEFORE UPDATE ON public.patient_profile_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. global_settings (singleton)
-- ============================================================
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_test_count INTEGER NOT NULL DEFAULT 0,
  total_test_count INTEGER NOT NULL DEFAULT 0,
  is_testing_both BOOLEAN NOT NULL DEFAULT true,
  is_testing_left BOOLEAN NOT NULL DEFAULT true,
  test_frequency_sequence JSONB NOT NULL DEFAULT '[250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]'::jsonb,
  test_language TEXT NOT NULL DEFAULT 'English',
  active_calibration_setting_id UUID REFERENCES public.calibration_settings(id) ON DELETE SET NULL,
  current_patient_profile_id UUID REFERENCES public.patient_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to global_settings" ON public.global_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON public.global_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED: initial global_settings row
-- ============================================================
INSERT INTO public.global_settings (
  current_test_count, total_test_count, is_testing_both, is_testing_left,
  test_frequency_sequence, test_language
) VALUES (
  0, 0, true, true,
  '[250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]'::jsonb,
  'English'
);
