// Children Test Screen: Playful visual interface with animals
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import { calibrationService } from "@/services/calibrationService";
import { ChildrenTestPlayer } from "@/audio/childrenTestPlayer";
import { TestModel, type TestModelState } from "@/models/testModel";
import type { GlobalSettings, AppLanguage, UserResponse } from "@/types/audiometry";
import { toast } from "sonner";

const ANIMALS = ["🐶", "🐱", "🐰", "🐻", "🐸", "🦊", "🐼", "🐨", "🦁", "🐮"];

const ChildrenTestScreen = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [state, setState] = useState<TestModelState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInterval, setActiveInterval] = useState<1 | 2 | null>(null);
  const [animalPair, setAnimalPair] = useState<[string, string]>(["🐶", "🐱"]);
  const modelRef = useRef(new TestModel());
  const playerRef = useRef(new ChildrenTestPlayer());
  const language = (settings?.test_language as AppLanguage) ?? "English";

  const pickAnimals = () => {
    const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
    setAnimalPair([shuffled[0], shuffled[1]]);
  };

  const loadAndInit = useCallback(async () => {
    const gs = await globalSettingService.getOrCreate();
    setSettings(gs);

    if (!gs.current_patient_profile_id || !gs.active_calibration_setting_id) {
      toast.error("Missing patient or calibration");
      navigate("/");
      return;
    }

    const profile = await patientProfileService.getWithValues(gs.current_patient_profile_id);
    const calibration = await calibrationService.getWithValues(gs.active_calibration_setting_id);

    if (!profile || !calibration) {
      navigate("/");
      return;
    }

    const freqs = (profile.frequency_order as number[]) ?? [];
    const model = modelRef.current;
    model.initialize(
      freqs,
      profile.ear_order as any,
      false,
      profile.is_practice,
      profile.id,
      profile.values,
      calibration.values
    );

    const correction = model.getCorrectionFactors();
    playerRef.current.setCorrection(correction.left, correction.right);

    // Preload audio for all frequencies
    for (const freq of freqs) {
      await playerRef.current.preloadFrequency(freq);
    }

    setState(model.getState());
    pickAnimals();
  }, [navigate]);

  useEffect(() => {
    loadAndInit();
    return () => playerRef.current.dispose();
  }, [loadAndInit]);

  const presentTrial = useCallback(async () => {
    if (!state) return;
    const model = modelRef.current;
    const s = model.getState();
    const player = playerRef.current;

    player.updateFreq(s.currentFrequency);
    player.updateVolume(s.currentDb, s.currentEar === "left");

    const correction = model.getCorrectionFactors();
    player.setCorrection(correction.left, correction.right);

    setIsPlaying(true);

    if (s.currentCase === 1) {
      setActiveInterval(1);
      await player.playFirstInterval();
      setActiveInterval(null);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(2);
      await new Promise((r) => setTimeout(r, 500));
      setActiveInterval(null);
    } else if (s.currentCase === 2) {
      setActiveInterval(1);
      await new Promise((r) => setTimeout(r, 500));
      setActiveInterval(null);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(2);
      await player.playSecondInterval();
      setActiveInterval(null);
    } else {
      setActiveInterval(1);
      await new Promise((r) => setTimeout(r, 500));
      setActiveInterval(null);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(2);
      await new Promise((r) => setTimeout(r, 500));
      setActiveInterval(null);
    }

    setIsPlaying(false);
  }, [state]);

  useEffect(() => {
    if (state && !state.isPaused && !state.isComplete && !state.needsEarSwitch) {
      presentTrial();
    }
  }, [state?.currentCase, state?.currentFrequency, state?.currentDb]);

  const handleResponse = async (response: UserResponse) => {
    if (isPlaying) return;
    const model = modelRef.current;
    await model.processResponse(response);
    const newState = model.getState();
    setState({ ...newState });
    pickAnimals();

    if (newState.showSpamWarning) {
      toast.warning(t("spamWarning", language));
    }

    if (newState.needsEarSwitch) {
      navigate("/ear-switch");
      return;
    }

    if (newState.isComplete) {
      toast.success("Test complete!");
      navigate("/results");
      return;
    }
  };

  const handlePause = () => {
    const model = modelRef.current;
    if (model.getState().isPaused) model.resume();
    else model.pause();
    setState({ ...model.getState() });
  };

  const handleRepeat = () => {
    modelRef.current.repeatTrial();
    setState({ ...modelRef.current.getState() });
  };

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-3xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-3">
      {/* Minimal header for examiner */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{state.currentFrequency} Hz | {state.currentEar === "left" ? "L" : "R"} | {state.currentDb} dB</span>
        <span>{state.progress}%</span>
      </div>
      <Progress value={state.progress} className="mt-1 h-2" />

      {/* Large playful test area */}
      <div className="mt-4 flex flex-1 items-center justify-center gap-10">
        {/* First animal */}
        <button
          className={`flex h-72 w-72 items-center justify-center rounded-3xl border-8 text-[120px] transition-all ${
            activeInterval === 1
              ? "border-stimulus-green bg-stimulus-green/20 scale-90"
              : "border-border bg-card hover:border-stimulus-green/50"
          }`}
          onClick={() => handleResponse("first")}
          disabled={isPlaying}
        >
          {animalPair[0]}
        </button>

        {/* Second animal */}
        <button
          className={`flex h-72 w-72 items-center justify-center rounded-3xl border-8 text-[120px] transition-all ${
            activeInterval === 2
              ? "border-stimulus-orange bg-stimulus-orange/20 scale-90"
              : "border-border bg-card hover:border-stimulus-orange/50"
          }`}
          onClick={() => handleResponse("second")}
          disabled={isPlaying}
        >
          {animalPair[1]}
        </button>

        {/* No Sound */}
        <button
          className="flex h-72 w-52 items-center justify-center rounded-full border-8 border-muted bg-card text-[100px] hover:border-destructive transition-all"
          onClick={() => handleResponse("no_sound")}
          disabled={isPlaying}
        >
          🤔
        </button>
      </div>

      {/* Examiner controls */}
      <div className="mt-4 flex justify-between pb-4">
        <Button size="touch" variant="warning" onClick={handleRepeat} disabled={isPlaying}>
          {t("repeat", language)}
        </Button>
        <Button size="touch" variant="secondary" onClick={handlePause}>
          {state.isPaused ? t("resume", language) : t("pause", language)}
        </Button>
        <Button size="touch" variant="outline" onClick={() => navigate("/")}>
          {t("returnToTitle", language)}
        </Button>
      </div>
    </main>
  );
};

export default ChildrenTestScreen;
