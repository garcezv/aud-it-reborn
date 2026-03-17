// Protocol Setup Screen: patient info, frequency sequence builder, ear order, language, protocol CRUD
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { testSettingService } from "@/services/testSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import { DEFAULT_FREQUENCIES } from "@/constants/audio";
import type { GlobalSettings, AppLanguage, EarOrder, TestSetting } from "@/types/audiometry";
import { toast } from "sonner";

interface ProtocolSetupProps {
  isPractice?: boolean;
}

const ProtocolSetupPage = ({ isPractice = false }: ProtocolSetupProps) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientGroup, setPatientGroup] = useState("");
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [earOrder, setEarOrder] = useState<EarOrder>("left_first");
  const [protocols, setProtocols] = useState<TestSetting[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [protocolName, setProtocolName] = useState("");

  const language = (settings?.test_language as AppLanguage) ?? "English";

  const loadData = useCallback(async () => {
    const gs = await globalSettingService.getOrCreate();
    setSettings(gs);
    setFrequencies((gs.test_frequency_sequence as number[]) ?? [...DEFAULT_FREQUENCIES]);
    const list = await testSettingService.list();
    setProtocols(list);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addFrequency = (freq: number) => {
    if (!frequencies.includes(freq)) {
      setFrequencies([...frequencies, freq]);
    }
  };

  const removeLast = () => setFrequencies(frequencies.slice(0, -1));
  const clearAll = () => setFrequencies([]);

  const handleSaveProtocol = async () => {
    if (!protocolName.trim()) {
      toast.error("Enter protocol name");
      return;
    }
    await testSettingService.create(
      protocolName.trim(),
      frequencies,
      earOrder === "left_first" || earOrder === "right_first",
      earOrder === "left_first" || earOrder === "left_only"
    );
    toast.success("Protocol saved");
    await loadData();
  };

  const handleLoadProtocol = async (id: string) => {
    const proto = await testSettingService.get(id);
    if (proto) {
      setFrequencies((proto.frequency_sequence as number[]) ?? []);
      setEarOrder(
        proto.is_test_both
          ? proto.is_test_left_first
            ? "left_first"
            : "right_first"
          : proto.is_test_left_first
          ? "left_only"
          : "right_only"
      );
      setSelectedProtocol(id);
      setProtocolName(proto.name);
      toast.success("Protocol loaded");
    }
  };

  const handleDeleteProtocol = async () => {
    if (selectedProtocol) {
      await testSettingService.delete(selectedProtocol);
      setSelectedProtocol(null);
      toast.success("Protocol deleted");
      await loadData();
    }
  };

  const startTest = async (isAdult: boolean) => {
    if (!patientName.trim()) {
      toast.error("Enter patient name");
      return;
    }
    if (frequencies.length === 0) {
      toast.error("Select at least one frequency");
      return;
    }
    if (!settings?.active_calibration_setting_id) {
      toast.error(t("noCalibration", language));
      return;
    }

    // Create patient profile
    const profile = await patientProfileService.create(
      patientName.trim(),
      patientGroup.trim(),
      earOrder,
      frequencies,
      isAdult,
      isPractice
    );

    // Update global settings
    await globalSettingService.setCurrentPatient(settings.id, profile.id);
    await globalSettingService.setFrequencySequence(settings.id, frequencies);
    await globalSettingService.setEarConfig(
      settings.id,
      earOrder === "left_first" || earOrder === "right_first",
      earOrder === "left_first" || earOrder === "left_only"
    );

    // Navigate to instruction page
    if (isAdult) {
      navigate("/instruction/adult");
    } else {
      navigate("/instruction/children");
    }
  };

  const toggleLanguage = async () => {
    if (!settings) return;
    const newLang: AppLanguage = language === "English" ? "Portuguese" : "English";
    const updated = await globalSettingService.setLanguage(settings.id, newLang);
    setSettings(updated);
  };

  const earButtons: { key: EarOrder; label: string }[] = [
    { key: "left_first", label: t("leftFirst", language) },
    { key: "right_first", label: t("rightFirst", language) },
    { key: "left_only", label: t("leftOnly", language) },
    { key: "right_only", label: t("rightOnly", language) },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <Button variant="link" className="text-xl" onClick={() => navigate("/")}>
          ← {t("returnToTitle", language)}
        </Button>
        <h1 className="text-4xl font-bold text-foreground">
          {isPractice ? t("practiceMode", language) : t("protocolSetup", language)}
        </h1>
        <Button variant="ghost" onClick={toggleLanguage}>
          {language === "English" ? "🇧🇷 PT" : "🇺🇸 EN"}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_1.5fr] gap-6">
        {/* Left column: patient info + ear order */}
        <div className="space-y-4">
          <div>
            <label className="text-lg font-medium text-foreground">{t("patientName", language)}</label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="mt-1 text-xl" />
          </div>
          <div>
            <label className="text-lg font-medium text-foreground">{t("patientGroup", language)}</label>
            <Input value={patientGroup} onChange={(e) => setPatientGroup(e.target.value)} className="mt-1 text-xl" />
          </div>

          {/* Ear order */}
          <div className="grid grid-cols-2 gap-2">
            {earButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={earOrder === btn.key ? "default" : "outline"}
                onClick={() => setEarOrder(btn.key)}
                className="text-lg"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Start buttons */}
          <div className="space-y-2 pt-4">
            <Button size="touch" variant="default" className="w-full" onClick={() => startTest(true)}>
              {t("startAdultTest", language)}
            </Button>
            <Button size="touch" variant="secondary" className="w-full" onClick={() => startTest(false)}>
              {t("startChildrenTest", language)}
            </Button>
          </div>
        </div>

        {/* Right column: frequency sequence + protocol management */}
        <div className="space-y-4">
          <div>
            <label className="text-lg font-medium text-foreground">{t("frequencySequence", language)}</label>
            <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-border bg-card p-3 min-h-[60px]">
              {frequencies.map((f, i) => (
                <span key={`${f}-${i}`} className="rounded-sm bg-primary px-3 py-1 text-lg text-primary-foreground">
                  {f} Hz
                </span>
              ))}
              {frequencies.length === 0 && <span className="text-muted-foreground">No frequencies selected</span>}
            </div>
          </div>

          {/* Available frequencies */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FREQUENCIES.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={frequencies.includes(f) ? "default" : "outline"}
                onClick={() => addFrequency(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={removeLast}>{t("removeLast", language)}</Button>
            <Button size="sm" variant="destructive" onClick={clearAll}>{t("clearAll", language)}</Button>
          </div>

          {/* Protocol management */}
          <div className="rounded-md border border-border p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="Protocol name"
                className="w-48"
              />
              <Button size="sm" onClick={handleSaveProtocol}>{t("saveProtocol", language)}</Button>
              <Button size="sm" variant="destructive" onClick={handleDeleteProtocol}>{t("deleteProtocol", language)}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {protocols.map((p) => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={selectedProtocol === p.id ? "default" : "outline"}
                  onClick={() => handleLoadProtocol(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProtocolSetupPage;
