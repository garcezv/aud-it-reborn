// Title Screen: Main entry point with Start, Practice, Calibration, View Results
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import type { GlobalSettings, AppLanguage } from "@/types/audiometry";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [hasPatients, setHasPatients] = useState(false);
  const [loading, setLoading] = useState(true);

  const language = (settings?.test_language as AppLanguage) ?? "English";

  useEffect(() => {
    const load = async () => {
      try {
        const gs = await globalSettingService.getOrCreate();
        setSettings(gs);
        const patients = await patientProfileService.list();
        setHasPatients(patients.filter((p) => !p.is_practice && p.end_time).length > 0);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasCalibration = !!settings?.active_calibration_setting_id;

  const handleStart = () => {
    if (!hasCalibration) {
      toast.warning(t("noCalibration", language));
      return;
    }
    navigate("/protocol");
  };

  const handlePractice = () => {
    if (!hasCalibration) {
      toast.warning(t("noCalibration", language));
      return;
    }
    navigate("/practice");
  };

  const handleResults = () => {
    navigate("/results");
  };

  const toggleLanguage = async () => {
    if (!settings) return;
    const newLang: AppLanguage = language === "English" ? "Portuguese" : "English";
    const updated = await globalSettingService.setLanguage(settings.id, newLang);
    setSettings(updated);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-3xl text-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-8">
      <h1 className="text-6xl font-bold text-foreground">
        🔊 Audiometry Screener
      </h1>
      <p className="text-2xl text-muted-foreground">
        {language === "English"
          ? "Behavioral Hearing Screening System"
          : "Sistema de Triagem Auditiva Comportamental"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <Button
          size="tablet"
          variant="default"
          onClick={handleStart}
          className={!hasCalibration ? "opacity-50" : ""}
        >
          {t("start", language)}
        </Button>
        <Button
          size="tablet"
          variant="secondary"
          onClick={handlePractice}
          className={!hasCalibration ? "opacity-50" : ""}
        >
          {t("practice", language)}
        </Button>
        <Button
          size="tablet"
          variant="warning"
          onClick={() => navigate("/calibration")}
        >
          {t("calibration", language)}
        </Button>
        <Button
          size="tablet"
          variant="success"
          onClick={handleResults}
        >
          {t("viewResults", language)}
        </Button>
      </div>

      <Button variant="ghost" className="mt-4 text-xl" onClick={toggleLanguage}>
        {language === "English" ? "🇧🇷 Português" : "🇺🇸 English"}
      </Button>
    </main>
  );
};

export default Index;
