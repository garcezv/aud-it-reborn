// Adult Instruction Screen: shows instructions before starting the adult test
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import type { GlobalSettings, AppLanguage } from "@/types/audiometry";

const AdultInstructionPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const language = (settings?.test_language as AppLanguage) ?? "English";

  useEffect(() => {
    globalSettingService.getOrCreate().then(setSettings);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-8">
      <h1 className="text-5xl font-bold text-foreground">
        {language === "English" ? "Adult Hearing Test" : "Teste Auditivo Adulto"}
      </h1>

      <div className="max-w-3xl rounded-lg border border-border bg-card p-8">
        <p className="text-3xl leading-relaxed text-foreground">
          {t("adultInstruction", language)}
        </p>
      </div>

      {/* Visual preview of the interface */}
      <div className="flex gap-8">
        <div className="flex h-40 w-40 items-center justify-center rounded-lg border-4 border-primary bg-card text-4xl font-bold text-primary">
          {t("firstInterval", language)}
        </div>
        <div className="flex h-40 w-40 items-center justify-center rounded-lg border-4 border-primary bg-card text-4xl font-bold text-primary">
          {t("secondInterval", language)}
        </div>
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-muted bg-card text-2xl text-muted-foreground">
          {t("noSound", language)}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="touch" onClick={() => navigate(-1)}>
          ← {t("returnToTitle", language)}
        </Button>
        <Button size="touch" onClick={() => navigate("/test/adult")}>
          {t("startTesting", language)} →
        </Button>
      </div>
    </main>
  );
};

export default AdultInstructionPage;
