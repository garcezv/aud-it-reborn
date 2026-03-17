// Ear Switch Screen: Explicit message to switch earphone side
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import type { GlobalSettings, AppLanguage } from "@/types/audiometry";

const EarSwitchPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const language = (settings?.test_language as AppLanguage) ?? "English";

  useEffect(() => {
    globalSettingService.getOrCreate().then(setSettings);
  }, []);

  const handleContinue = async () => {
    if (!settings?.current_patient_profile_id) {
      navigate("/");
      return;
    }

    const profile = await patientProfileService.getWithValues(settings.current_patient_profile_id);
    if (!profile) {
      navigate("/");
      return;
    }

    // Navigate back to the appropriate test page
    if (profile.is_adult) {
      navigate("/test/adult");
    } else {
      navigate("/test/children");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-background px-8">
      <h1 className="text-5xl font-bold text-foreground">
        🎧 {t("earSwitchTitle", language)}
      </h1>

      <div className="max-w-2xl rounded-lg border-4 border-primary bg-card p-10">
        <p className="text-center text-4xl leading-relaxed text-foreground">
          {t("earSwitchMessage", language)}
        </p>
      </div>

      <div className="flex gap-12">
        <div className="text-center">
          <div className="text-8xl">👈</div>
          <p className="mt-2 text-2xl text-muted-foreground">{t("leftEar", language)}</p>
        </div>
        <div className="text-center">
          <div className="text-8xl">👉</div>
          <p className="mt-2 text-2xl text-muted-foreground">{t("rightEar", language)}</p>
        </div>
      </div>

      <Button size="tablet" onClick={handleContinue}>
        {t("continueAfterSwitch", language)}
      </Button>
    </main>
  );
};

export default EarSwitchPage;
