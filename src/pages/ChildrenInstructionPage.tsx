// Children Instruction Screen: playful instructions before starting the children's test
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import type { GlobalSettings, AppLanguage } from "@/types/audiometry";

const ChildrenInstructionPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const language = (settings?.test_language as AppLanguage) ?? "English";

  useEffect(() => {
    globalSettingService.getOrCreate().then(setSettings);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-8">
      <h1 className="text-5xl font-bold text-foreground">
        {language === "English" ? "🐾 Animal Sound Game!" : "🐾 Jogo dos Sons dos Animais!"}
      </h1>

      <div className="max-w-3xl rounded-lg border border-border bg-card p-8">
        <p className="text-3xl leading-relaxed text-foreground">
          {t("childrenInstruction", language)}
        </p>
      </div>

      {/* Playful visual preview */}
      <div className="flex gap-8">
        <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-4 border-stimulus-green bg-card text-8xl">
          🐶
        </div>
        <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-4 border-stimulus-orange bg-card text-8xl">
          🐱
        </div>
        <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-muted bg-card text-8xl">
          🤔
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="touch" onClick={() => navigate(-1)}>
          ← {t("returnToTitle", language)}
        </Button>
        <Button size="touch" onClick={() => navigate("/test/children")}>
          {t("startTesting", language)} →
        </Button>
      </div>
    </main>
  );
};

export default ChildrenInstructionPage;
