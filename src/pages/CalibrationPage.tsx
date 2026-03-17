// Calibration Screen: frequency grid with play/expected/presentation/measured per channel
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/translations";
import { calibrationService } from "@/services/calibrationService";
import { globalSettingService } from "@/services/globalSettingService";
import { CalibrationPlayer } from "@/audio/calibrationPlayer";
import type { CalibrationWithValues, GlobalSettings, AppLanguage } from "@/types/audiometry";
import { toast } from "sonner";

const player = new CalibrationPlayer();

const CalibrationPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [calibrations, setCalibrations] = useState<{ id: string; name: string }[]>([]);
  const [current, setCurrent] = useState<CalibrationWithValues | null>(null);
  const [newName, setNewName] = useState("");
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const [playChannel, setPlayChannel] = useState<"left" | "right" | "both">("both");

  const language = (settings?.test_language as AppLanguage) ?? "English";

  const loadData = useCallback(async () => {
    const gs = await globalSettingService.getOrCreate();
    setSettings(gs);
    const list = await calibrationService.list();
    setCalibrations(list.map((c) => ({ id: c.id, name: c.name })));

    if (gs.active_calibration_setting_id) {
      const cal = await calibrationService.getWithValues(gs.active_calibration_setting_id);
      setCurrent(cal);
      setNewName(cal?.name ?? "");
    } else if (list.length > 0) {
      const cal = await calibrationService.getWithValues(list[0].id);
      setCurrent(cal);
      setNewName(cal?.name ?? "");
    }
  }, []);

  useEffect(() => {
    loadData();
    return () => player.dispose();
  }, [loadData]);

  const handlePlay = (freq: number) => {
    if (playingFreq === freq) {
      player.stop();
      setPlayingFreq(null);
    } else {
      const row = current?.values.find((v) => v.frequency === freq);
      const db = row?.presentation_lv ?? 70;
      player.play(freq, db, playChannel);
      setPlayingFreq(freq);
    }
  };

  const handleValueChange = async (valueId: string, key: "presentation_lv" | "measured_lv_l" | "measured_lv_r", val: number) => {
    await calibrationService.updateValue(valueId, { [key]: val });
    if (current) {
      setCurrent({
        ...current,
        values: current.values.map((v) => (v.id === valueId ? { ...v, [key]: val } : v)),
      });
    }
  };

  const handleSaveNew = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const cal = await calibrationService.create(newName.trim());
    if (settings) {
      await globalSettingService.setActiveCalibration(settings.id, cal.id);
    }
    toast.success("Calibration saved");
    await loadData();
  };

  const handleSetActive = async (id: string) => {
    if (settings) {
      await globalSettingService.setActiveCalibration(settings.id, id);
      const cal = await calibrationService.getWithValues(id);
      setCurrent(cal);
      setNewName(cal?.name ?? "");
      setSettings({ ...settings, active_calibration_setting_id: id });
      toast.success("Calibration loaded");
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    await calibrationService.delete(current.id);
    if (settings && settings.active_calibration_setting_id === current.id) {
      await globalSettingService.setActiveCalibration(settings.id, null);
    }
    toast.success("Calibration deleted");
    setCurrent(null);
    await loadData();
  };

  const handleClearMeasured = async () => {
    if (!current) return;
    await calibrationService.clearMeasured(current.id);
    toast.success("Measured levels cleared");
    await loadData();
  };

  const handleFillDefaults = async () => {
    if (!current) return;
    await calibrationService.fillDefaultPresentation(current.id);
    toast.success("Defaults filled");
    await loadData();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <Button variant="link" className="text-xl" onClick={() => navigate("/")}>
          ← {t("returnToTitle", language)}
        </Button>
        <h1 className="text-4xl font-bold text-foreground">{t("calibrationTitle", language)}</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={playChannel === "left" ? "default" : "outline"} onClick={() => setPlayChannel("left")}>L</Button>
          <Button size="sm" variant={playChannel === "both" ? "default" : "outline"} onClick={() => setPlayChannel("both")}>L+R</Button>
          <Button size="sm" variant={playChannel === "right" ? "default" : "outline"} onClick={() => setPlayChannel("right")}>R</Button>
        </div>
      </div>

      {/* Calibration selector */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t("calibrationName", language)}
          className="w-56 text-lg"
        />
        <Button size="sm" onClick={handleSaveNew}>{t("saveNew", language)}</Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>{t("deleteCurrent", language)}</Button>
        <Button size="sm" variant="secondary" onClick={handleFillDefaults}>{t("fillDefaults", language)}</Button>
        <Button size="sm" variant="secondary" onClick={handleClearMeasured}>{t("clearMeasured", language)}</Button>
      </div>

      {/* Saved calibrations */}
      <div className="mt-2 flex flex-wrap gap-2">
        {calibrations.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={current?.id === c.id ? "default" : "outline"}
            onClick={() => handleSetActive(c.id)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      {/* Calibration grid */}
      {current && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-lg">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-2">{t("frequency", language)}</th>
                <th className="px-2 py-2">{t("play", language)}</th>
                <th className="px-2 py-2">{t("expectedLevel", language)}</th>
                <th className="px-2 py-2">{t("presentationLevel", language)}</th>
                <th className="px-2 py-2">{t("measuredLeft", language)}</th>
                <th className="px-2 py-2">{t("measuredRight", language)}</th>
              </tr>
            </thead>
            <tbody>
              {current.values.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="px-2 py-2 font-mono text-xl">{row.frequency} Hz</td>
                  <td className="px-2 py-2">
                    <Button
                      size="sm"
                      variant={playingFreq === row.frequency ? "destructive" : "default"}
                      onClick={() => handlePlay(row.frequency)}
                    >
                      {playingFreq === row.frequency ? "⏹" : "▶"}
                    </Button>
                  </td>
                  <td className="px-2 py-2 font-mono">{row.expected_lv}</td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      value={row.presentation_lv}
                      onChange={(e) => handleValueChange(row.id, "presentation_lv", Number(e.target.value))}
                      className="w-24 font-mono"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      value={row.measured_lv_l}
                      onChange={(e) => handleValueChange(row.id, "measured_lv_l", Number(e.target.value))}
                      className="w-24 font-mono"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      value={row.measured_lv_r}
                      onChange={(e) => handleValueChange(row.id, "measured_lv_r", Number(e.target.value))}
                      className="w-24 font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default CalibrationPage;
