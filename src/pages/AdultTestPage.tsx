// Adult Test Screen: Two interval targets + No Sound button, with adaptive algorithm
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { t } from "@/i18n/translations";
import { globalSettingService } from "@/services/globalSettingService";
import { patientProfileService } from "@/services/patientProfileService";
import { calibrationService } from "@/services/calibrationService";
import { AdultTestPlayer } from "@/audio/adultTestPlayer";
import { TestModel, type TestModelState } from "@/models/testModel";
import type { GlobalSettings, AppLanguage, UserResponse } from "@/types/audiometry";
import { toast } from "sonner";

const AdultTestScreen = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [state, setState] = useState<TestModelState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInterval, setActiveInterval] = useState<1 | 2 | null>(null);
  const modelRef = useRef(new TestModel());
  const playerRef = useRef(new AdultTestPlayer());
  const language = (settings?.test_language as AppLanguage) ?? "English";

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
      toast.error("Failed to load data");
      navigate("/");
      return;
    }

    const freqs = (profile.frequency_order as number[]) ?? [];
    const model = modelRef.current;
    model.initialize(
      freqs,
      profile.ear_order as any,
      true,
      profile.is_practice,
      profile.id,
      profile.values,
      calibration.values
    );

    const correction = model.getCorrectionFactors();
    playerRef.current.setCorrection(correction.left, correction.right);

    setState(model.getState());
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
      // Sound in first interval
      setActiveInterval(1);
      await player.playFirstInterval();
      setActiveInterval(null);
      setActiveInterval(2);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(null);
    } else if (s.currentCase === 2) {
      // Sound in second interval
      setActiveInterval(1);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(null);
      setActiveInterval(2);
      await player.playSecondInterval();
      setActiveInterval(null);
    } else {
      // Silence - show both intervals without sound
      setActiveInterval(1);
      await new Promise((r) => setTimeout(r, 700));
      setActiveInterval(null);
      setActiveInterval(2);
      await new Promise((r) => setTimeout(r, 700));
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
    if (model.getState().isPaused) {
      model.resume();
    } else {
      model.pause();
    }
    setState({ ...model.getState() });
  };

  const handleRepeat = () => {
    const model = modelRef.current;
    model.repeatTrial();
    setState({ ...model.getState() });
  };

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-3xl">Loading test...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xl text-muted-foreground">
          {t("currentFrequency", language)}: <span className="font-bold text-foreground">{state.currentFrequency} Hz</span>
          {" | "}
          {t("currentEar", language)}: <span className="font-bold text-foreground">
            {state.currentEar === "left" ? t("leftEar", language) : t("rightEar", language)}
          </span>
          {" | "}
          {state.currentDb} dB
        </div>
        <div className="text-xl">
          {t("testProgress", language)}: {state.progress}%
        </div>
      </div>
      <Progress value={state.progress} className="mt-2 h-3" />

      {/* Instructions */}
      <p className="mt-4 text-center text-2xl text-muted-foreground">
        {t("adultInstruction", language)}
      </p>

      {/* Test area */}
      <div className="mt-6 flex flex-1 items-center justify-center gap-8">
        {/* First interval button */}
        <button
          className={`flex h-64 w-64 items-center justify-center rounded-2xl border-4 text-5xl font-bold transition-all ${
            activeInterval === 1
              ? "border-primary bg-primary/20 scale-95"
              : "border-border bg-card hover:border-primary/50"
          }`}
          onClick={() => handleResponse("first")}
          disabled={isPlaying}
        >
          {t("firstInterval", language)}
        </button>

        {/* Second interval button */}
        <button
          className={`flex h-64 w-64 items-center justify-center rounded-2xl border-4 text-5xl font-bold transition-all ${
            activeInterval === 2
              ? "border-primary bg-primary/20 scale-95"
              : "border-border bg-card hover:border-primary/50"
          }`}
          onClick={() => handleResponse("second")}
          disabled={isPlaying}
        >
          {t("secondInterval", language)}
        </button>

        {/* No Sound button */}
        <button
          className="flex h-64 w-48 items-center justify-center rounded-full border-4 border-muted bg-card text-3xl text-muted-foreground hover:border-destructive hover:text-destructive transition-all"
          onClick={() => handleResponse("no_sound")}
          disabled={isPlaying}
        >
          {t("noSound", language)}
        </button>
      </div>

      {/* Controls */}
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

export default AdultTestScreen;
