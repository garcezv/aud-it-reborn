// Results Screen: patient list, thresholds, per-frequency detail charts, CSV export
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import { generateCSV, downloadCSV } from "@/services/csvExport";
import type { GlobalSettings, AppLanguage, PatientProfile, PatientProfileWithValues, PatientProfileValue } from "@/types/audiometry";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  Cell,
  Legend,
} from "recharts";

/** Build per-trial scatter data for a given frequency value row and ear */
function buildTrialData(value: PatientProfileValue, ear: "left" | "right") {
  const responses = (ear === "left" ? value.responses_l : value.responses_r) as any[];
  if (!responses || !Array.isArray(responses)) return [];

  return responses.map((r: any, i: number) => ({
    trial: i + 1,
    db: r.db ?? 0,
    type: r.case === 0 ? "silence" : r.correct ? "correct" : "incorrect",
  }));
}

const TRIAL_COLORS: Record<string, string> = {
  correct: "hsl(142, 76%, 37%)",    // green
  incorrect: "hsl(0, 72%, 51%)",     // red
  silence: "hsl(215, 16%, 46%)",     // gray
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PatientProfileWithValues | null>(null);
  const [selectedFreqIndex, setSelectedFreqIndex] = useState<number | null>(null);

  const language = (settings?.test_language as AppLanguage) ?? "English";

  const loadData = useCallback(async () => {
    const gs = await globalSettingService.getOrCreate();
    setSettings(gs);
    const list = await patientProfileService.list();
    setPatients(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedId) {
      patientProfileService.getWithValues(selectedId).then((p) => {
        setSelectedProfile(p);
        setSelectedFreqIndex(null);
      });
    }
  }, [selectedId]);

  const chartData = useMemo(() => {
    if (!selectedProfile) return [];
    return selectedProfile.values.map((v) => ({
      frequency: v.frequency,
      left: v.threshold_l === -1 ? null : v.threshold_l,
      right: v.threshold_r === -1 ? null : v.threshold_r,
    }));
  }, [selectedProfile]);

  // Selected frequency detail
  const selectedValue = selectedProfile && selectedFreqIndex !== null
    ? selectedProfile.values[selectedFreqIndex]
    : null;

  const leftTrialData = useMemo(() => selectedValue ? buildTrialData(selectedValue, "left") : [], [selectedValue]);
  const rightTrialData = useMemo(() => selectedValue ? buildTrialData(selectedValue, "right") : [], [selectedValue]);

  const handleExport = async () => {
    const allProfiles: PatientProfileWithValues[] = [];
    for (const p of patients) {
      const full = await patientProfileService.getWithValues(p.id);
      if (full) allProfiles.push(full);
    }
    const csv = generateCSV(allProfiles);
    downloadCSV(csv, `audiometry_results_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("CSV exported");
  };

  const handleDeletePatient = async () => {
    if (!selectedId) return;
    await patientProfileService.delete(selectedId);
    setSelectedId(null);
    setSelectedProfile(null);
    toast.success("Patient deleted");
    await loadData();
  };

  const handleDeleteAll = async () => {
    await patientProfileService.deleteAll();
    setPatients([]);
    setSelectedId(null);
    setSelectedProfile(null);
    toast.success("All patients deleted");
  };

  const renderTrialChart = (data: any[], title: string, color: string) => {
    if (data.length === 0) return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        {t("noData", language)}
      </div>
    );

    return (
      <div>
        <h4 className="mb-1 text-lg font-medium text-foreground">{title}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid stroke="hsl(var(--border))" />
            <XAxis dataKey="trial" name="Trial" type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="db" name="dB" reversed tick={{ fontSize: 12 }} domain={[-10, 110]} />
            <Tooltip
              formatter={(value: any, name: string) => [value, name]}
              labelFormatter={(label) => `Trial ${label}`}
            />
            <Scatter data={data} shape="circle">
              {data.map((entry, index) => (
                <Cell key={index} fill={TRIAL_COLORS[entry.type] ?? TRIAL_COLORS.silence} r={6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: TRIAL_COLORS.correct }} />
            {language === "English" ? "Correct" : "Acerto"}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: TRIAL_COLORS.incorrect }} />
            {language === "English" ? "Incorrect" : "Erro"}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: TRIAL_COLORS.silence }} />
            {language === "English" ? "Silence" : "Silêncio"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <Button variant="link" className="text-xl" onClick={() => navigate("/")}>
          ← {t("returnToTitle", language)}
        </Button>
        <h1 className="text-4xl font-bold text-foreground">{t("results", language)}</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleExport}>{t("exportCSV", language)}</Button>
          <Button size="sm" variant="destructive" onClick={handleDeleteAll}>{t("deleteAllProfiles", language)}</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_2.5fr] gap-4">
        {/* Patient list */}
        <div className="space-y-1 overflow-y-auto rounded-md border border-border bg-card p-2" style={{ maxHeight: "80vh" }}>
          {patients.length === 0 && <p className="p-4 text-muted-foreground">{t("noData", language)}</p>}
          {patients.map((p) => (
            <button
              key={p.id}
              className={`w-full rounded-sm px-3 py-2 text-left text-lg transition ${
                selectedId === p.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-sm opacity-70">
                {p.patient_group} | {p.is_adult ? "Adult" : "Children"} | {p.is_practice ? "Practice" : "Test"}
              </div>
            </button>
          ))}
        </div>

        {/* Results detail */}
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "80vh" }}>
          {selectedProfile ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{selectedProfile.name}</h2>
                  <p className="text-lg text-muted-foreground">
                    {selectedProfile.patient_group} | {selectedProfile.ear_order} |{" "}
                    {selectedProfile.duration_seconds ? `${selectedProfile.duration_seconds}s` : "In progress"}
                  </p>
                </div>
                <Button size="sm" variant="destructive" onClick={handleDeletePatient}>
                  {t("deleteCurrentProfile", language)}
                </Button>
              </div>

              {/* Threshold table with clickable frequencies */}
              <div className="overflow-x-auto">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left">{t("frequency", language)}</th>
                      <th className="px-3 py-2">{t("leftChannel", language)} (dB)</th>
                      <th className="px-3 py-2">{t("rightChannel", language)} (dB)</th>
                      <th className="px-3 py-2">{t("reliability", language)} L</th>
                      <th className="px-3 py-2">{t("reliability", language)} R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProfile.values.map((v, idx) => (
                      <tr
                        key={v.id}
                        className={`cursor-pointer border-b border-border/50 transition ${
                          selectedFreqIndex === idx ? "bg-primary/10" : "hover:bg-accent/50"
                        }`}
                        onClick={() => setSelectedFreqIndex(selectedFreqIndex === idx ? null : idx)}
                      >
                        <td className="px-3 py-2 font-mono">{v.frequency} Hz</td>
                        <td className="px-3 py-2 text-center font-mono">
                          {v.threshold_l === -1 ? t("noResponse", language) : v.threshold_l}
                        </td>
                        <td className="px-3 py-2 text-center font-mono">
                          {v.threshold_r === -1 ? t("noResponse", language) : v.threshold_r}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {v.no_sound_count_l > 0 ? `${v.no_sound_correct_l}/${v.no_sound_count_l}` : "-"}
                          {v.spam_count_l > 0 && <span className="ml-1 text-destructive">⚠{v.spam_count_l}</span>}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {v.no_sound_count_r > 0 ? `${v.no_sound_correct_r}/${v.no_sound_count_r}` : "-"}
                          {v.spam_count_r > 0 && <span className="ml-1 text-destructive">⚠{v.spam_count_r}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Per-frequency detail charts (when a frequency is selected) */}
              {selectedValue && (
                <div className="rounded-md border-2 border-primary/30 bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-foreground">
                      {selectedValue.frequency} Hz — {language === "English" ? "Trial History" : "Histórico de Ensaios"}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={selectedFreqIndex === 0}
                        onClick={() => setSelectedFreqIndex((selectedFreqIndex ?? 0) - 1)}
                      >
                        ← {language === "English" ? "Prev" : "Ant"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={selectedFreqIndex === (selectedProfile.values.length - 1)}
                        onClick={() => setSelectedFreqIndex((selectedFreqIndex ?? 0) + 1)}
                      >
                        {language === "English" ? "Next" : "Próx"} →
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderTrialChart(leftTrialData, `${t("leftChannel", language)} — ${selectedValue.frequency} Hz`, "hsl(var(--primary))")}
                    {renderTrialChart(rightTrialData, `${t("rightChannel", language)} — ${selectedValue.frequency} Hz`, "hsl(var(--destructive))")}
                  </div>
                </div>
              )}

              {/* Audiogram charts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border bg-card p-3">
                  <h3 className="mb-2 text-xl font-medium text-foreground">
                    {t("leftChannel", language)} - {t("threshold", language)}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="hsl(var(--border))" />
                      <XAxis dataKey="frequency" tick={{ fontSize: 14 }} />
                      <YAxis reversed tick={{ fontSize: 14 }} domain={[-10, 110]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="left"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-md border border-border bg-card p-3">
                  <h3 className="mb-2 text-xl font-medium text-foreground">
                    {t("rightChannel", language)} - {t("threshold", language)}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="hsl(var(--border))" />
                      <XAxis dataKey="frequency" tick={{ fontSize: 14 }} />
                      <YAxis reversed tick={{ fontSize: 14 }} domain={[-10, 110]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="right"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center">
              <p className="text-3xl text-muted-foreground">{t("noData", language)}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ResultsPage;
