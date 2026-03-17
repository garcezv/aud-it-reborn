// TestModel: Core test engine implementing the adaptive threshold algorithm
// Controls frequency progression, ear switching, trial management, and persistence

import type {
  TestCase,
  UserResponse,
  TrialRecord,
  CalibrationSettingValue,
  PatientProfileValue,
  EarOrder,
  CorrectionFactors,
} from "@/types/audiometry";
import {
  DB_START,
  DB_SYSTEM_MAX,
  DB_SYSTEM_MIN,
  STEP_INITIAL_DOWN,
  STEP_INITIAL_UP,
  STEP_FINE_DOWN,
  STEP_FINE_UP,
  MAX_FAILURES_AT_MAX,
  SPAM_THRESHOLD,
} from "@/constants/audio";
import { calibrationService } from "@/services/calibrationService";
import { patientProfileService } from "@/services/patientProfileService";

export interface TestModelState {
  currentFrequencyIndex: number;
  currentFrequency: number;
  currentEar: "left" | "right";
  currentDb: number;
  currentCase: TestCase;
  isPaused: boolean;
  isComplete: boolean;
  needsEarSwitch: boolean;
  trials: TrialRecord[];
  spamCount: number;
  showSpamWarning: boolean;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

export class TestModel {
  private frequencies: number[] = [];
  private earOrder: EarOrder = "left_first";
  private isAdult = true;
  private isPractice = false;
  private patientProfileId = "";
  private profileValues: PatientProfileValue[] = [];
  private calibrationValues: CalibrationSettingValue[] = [];

  // Current state
  private freqIndex = 0;
  private currentEar: "left" | "right" = "left";
  private currentDb = DB_START;
  private hasReversed = false;
  private reversalCount = 0;
  private failuresAtMax = 0;
  private ascendingConfirmations = 0;
  private lastDirection: "up" | "down" | null = null;
  private trials: TrialRecord[] = [];
  private consecutiveSameResponse = 0;
  private lastResponse: UserResponse | null = null;
  private spamCount = 0;
  private isPaused = false;
  private isComplete = false;
  private needsEarSwitch = false;
  private completedSteps = 0;
  private totalSteps = 0;

  // Case balancing
  private caseCounts: Record<TestCase, number> = { 0: 0, 1: 0, 2: 0 };
  private lastCase: TestCase = 1;
  private currentCase: TestCase = 1;

  initialize(
    frequencies: number[],
    earOrder: EarOrder,
    isAdult: boolean,
    isPractice: boolean,
    patientProfileId: string,
    profileValues: PatientProfileValue[],
    calibrationValues: CalibrationSettingValue[]
  ): void {
    this.frequencies = frequencies;
    this.earOrder = earOrder;
    this.isAdult = isAdult;
    this.isPractice = isPractice;
    this.patientProfileId = patientProfileId;
    this.profileValues = profileValues;
    this.calibrationValues = calibrationValues;

    // Determine starting ear
    this.currentEar =
      earOrder === "right_first" || earOrder === "right_only" ? "right" : "left";

    // Calculate total steps
    const earCount =
      earOrder === "left_only" || earOrder === "right_only" ? 1 : 2;
    this.totalSteps = frequencies.length * earCount;
    this.completedSteps = 0;

    this.resetForFrequency();
    this.pickCase();
  }

  private resetForFrequency(): void {
    this.currentDb = DB_START;
    this.hasReversed = false;
    this.reversalCount = 0;
    this.failuresAtMax = 0;
    this.ascendingConfirmations = 0;
    this.lastDirection = null;
    this.caseCounts = { 0: 0, 1: 0, 2: 0 };
  }

  /** Pick next case (0=silence, 1=first, 2=second) with balancing */
  private pickCase(): void {
    if (this.isPractice) {
      // In practice mode, alternate clearly
      const cases: TestCase[] = [1, 2, 0];
      this.currentCase = cases[this.trials.length % 3];
      return;
    }

    // Balance cases, avoid repeating same case >2 times
    const candidates: TestCase[] = [0, 1, 2];

    // Remove the last case if it's been repeated
    let filtered = candidates;
    if (this.lastCase === this.currentCase) {
      filtered = candidates.filter((c) => c !== this.lastCase);
    }

    // Weight toward under-represented cases
    const totalCases = this.caseCounts[0] + this.caseCounts[1] + this.caseCounts[2];
    if (totalCases > 0) {
      const minCount = Math.min(...filtered.map((c) => this.caseCounts[c]));
      const underRep = filtered.filter((c) => this.caseCounts[c] === minCount);
      if (underRep.length > 0) {
        filtered = underRep;
      }
    }

    this.lastCase = this.currentCase;
    this.currentCase = filtered[Math.floor(Math.random() * filtered.length)];
    this.caseCounts[this.currentCase]++;
  }

  getCorrectionFactors(): CorrectionFactors {
    return calibrationService.getCorrectionFactors(
      this.calibrationValues,
      this.frequencies[this.freqIndex]
    );
  }

  /** Process user response and advance the algorithm */
  async processResponse(response: UserResponse): Promise<void> {
    if (this.isPaused || this.isComplete) return;

    // Determine correctness
    const expectedResponse: UserResponse =
      this.currentCase === 0
        ? "no_sound"
        : this.currentCase === 1
        ? "first"
        : "second";
    const correct = response === expectedResponse;

    // Record trial
    const trial: TrialRecord = {
      frequency: this.frequencies[this.freqIndex],
      ear: this.currentEar,
      db: this.currentDb,
      casePresented: this.currentCase,
      userResponse: response,
      correct,
      timestamp: new Date().toISOString(),
    };
    this.trials.push(trial);

    // Spam detection
    if (response === this.lastResponse) {
      this.consecutiveSameResponse++;
    } else {
      this.consecutiveSameResponse = 1;
    }
    this.lastResponse = response;

    if (this.consecutiveSameResponse >= SPAM_THRESHOLD) {
      this.spamCount++;
      this.consecutiveSameResponse = 0;
    }

    // Handle silence trials separately
    if (this.currentCase === 0) {
      // Update no-sound counts
      await this.updateNoSoundCounts(correct);
      this.pickCase();
      return;
    }

    // Adaptive threshold algorithm
    if (correct) {
      // Move down
      const step = this.hasReversed ? STEP_FINE_DOWN : STEP_INITIAL_DOWN;
      const prevDirection = this.lastDirection;
      this.lastDirection = "down";

      if (prevDirection === "up") {
        this.hasReversed = true;
        this.reversalCount++;
      }

      this.currentDb = Math.max(DB_SYSTEM_MIN, this.currentDb - step);

      // Check ascending confirmation
      if (this.hasReversed && this.lastDirection === "down") {
        this.ascendingConfirmations = 0;
      }

      this.failuresAtMax = 0;
    } else {
      // Move up
      const step = this.hasReversed ? STEP_FINE_UP : STEP_INITIAL_UP;
      const prevDirection = this.lastDirection;
      this.lastDirection = "up";

      if (prevDirection === "down") {
        this.hasReversed = true;
        this.reversalCount++;
        this.ascendingConfirmations++;
      }

      this.currentDb = Math.min(DB_SYSTEM_MAX, this.currentDb + step);

      if (this.currentDb >= DB_SYSTEM_MAX) {
        this.failuresAtMax++;
      }
    }

    // Check termination criteria
    const shouldEnd = this.checkTermination();
    if (shouldEnd) {
      await this.endFrequency();
      return;
    }

    this.pickCase();
  }

  private checkTermination(): boolean {
    // 1. Confirmed at minimum
    if (this.currentDb <= DB_SYSTEM_MIN && this.lastDirection === "down" && this.hasReversed) {
      return true;
    }

    // 2. 3 failures at maximum → NR
    if (this.failuresAtMax >= MAX_FAILURES_AT_MAX) {
      return true;
    }

    // 3. Ascending consistency (2+ reversals with stable threshold)
    if (this.reversalCount >= 3 && this.ascendingConfirmations >= 2) {
      return true;
    }

    // Practice mode: end after a few trials
    if (this.isPractice && this.trials.filter((t) => t.frequency === this.frequencies[this.freqIndex] && t.ear === this.currentEar).length >= 6) {
      return true;
    }

    return false;
  }

  private async endFrequency(): Promise<void> {
    // Determine threshold
    const threshold =
      this.failuresAtMax >= MAX_FAILURES_AT_MAX ? -1 : this.currentDb;

    // Save to patient profile value
    await this.saveFrequencyResult(threshold);

    this.completedSteps++;

    // Check if we need to move to next frequency or switch ear
    if (this.freqIndex < this.frequencies.length - 1) {
      this.freqIndex++;
      this.resetForFrequency();
      this.pickCase();
    } else {
      // All frequencies done for this ear
      if (this.shouldSwitchEar()) {
        this.needsEarSwitch = true;
      } else {
        // All done
        this.isComplete = true;
        await patientProfileService.endExam(this.patientProfileId);
      }
    }
  }

  private shouldSwitchEar(): boolean {
    if (this.earOrder === "left_only" || this.earOrder === "right_only") {
      return false;
    }
    // If we've only done one ear
    const doneEar = this.currentEar;
    if (
      (this.earOrder === "left_first" && doneEar === "left") ||
      (this.earOrder === "right_first" && doneEar === "right")
    ) {
      return true;
    }
    return false;
  }

  /** Called after ear switch confirmation */
  continueAfterEarSwitch(): void {
    this.needsEarSwitch = false;
    this.currentEar = this.currentEar === "left" ? "right" : "left";
    this.freqIndex = 0;
    this.resetForFrequency();
    this.pickCase();
  }

  private async saveFrequencyResult(threshold: number): Promise<void> {
    const freq = this.frequencies[this.freqIndex];
    const value = this.profileValues.find(
      (v) => v.frequency === freq
    );
    if (!value) return;

    const freqTrials = this.trials.filter(
      (t) => t.frequency === freq && t.ear === this.currentEar
    );
    const noSoundTrials = freqTrials.filter((t) => t.casePresented === 0);

    const updates: Record<string, any> = {};
    if (this.currentEar === "left") {
      updates.threshold_l = threshold;
      updates.results_l = freqTrials.map((t) => t.db);
      updates.responses_l = freqTrials.map((t) => ({
        case: t.casePresented,
        response: t.userResponse,
        correct: t.correct,
        db: t.db,
        ts: t.timestamp,
      }));
      updates.no_sound_count_l = noSoundTrials.length;
      updates.no_sound_correct_l = noSoundTrials.filter((t) => t.correct).length;
      updates.spam_count_l = this.spamCount;
      updates.start_time_l = freqTrials[0]?.timestamp;
      updates.end_time_l = freqTrials[freqTrials.length - 1]?.timestamp;
      if (updates.start_time_l && updates.end_time_l) {
        updates.duration_seconds_l = Math.round(
          (new Date(updates.end_time_l).getTime() - new Date(updates.start_time_l).getTime()) / 1000
        );
      }
    } else {
      updates.threshold_r = threshold;
      updates.results_r = freqTrials.map((t) => t.db);
      updates.responses_r = freqTrials.map((t) => ({
        case: t.casePresented,
        response: t.userResponse,
        correct: t.correct,
        db: t.db,
        ts: t.timestamp,
      }));
      updates.no_sound_count_r = noSoundTrials.length;
      updates.no_sound_correct_r = noSoundTrials.filter((t) => t.correct).length;
      updates.spam_count_r = this.spamCount;
      updates.start_time_r = freqTrials[0]?.timestamp;
      updates.end_time_r = freqTrials[freqTrials.length - 1]?.timestamp;
      if (updates.start_time_r && updates.end_time_r) {
        updates.duration_seconds_r = Math.round(
          (new Date(updates.end_time_r).getTime() - new Date(updates.start_time_r).getTime()) / 1000
        );
      }
    }

    await patientProfileService.updateValue(value.id, updates);
  }

  private async updateNoSoundCounts(correct: boolean): Promise<void> {
    // No-sound counts are persisted at frequency end
    // Just tracked in trials for now
  }

  // Getters
  getState(): TestModelState {
    return {
      currentFrequencyIndex: this.freqIndex,
      currentFrequency: this.frequencies[this.freqIndex] ?? 0,
      currentEar: this.currentEar,
      currentDb: this.currentDb,
      currentCase: this.currentCase,
      isPaused: this.isPaused,
      isComplete: this.isComplete,
      needsEarSwitch: this.needsEarSwitch,
      trials: this.trials,
      spamCount: this.spamCount,
      showSpamWarning: this.consecutiveSameResponse >= SPAM_THRESHOLD,
      progress: this.totalSteps > 0 ? Math.round((this.completedSteps / this.totalSteps) * 100) : 0,
      totalSteps: this.totalSteps,
      completedSteps: this.completedSteps,
    };
  }

  getCurrentCase(): TestCase {
    return this.currentCase;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  repeatTrial(): void {
    this.pickCase();
  }

  getIsAdult(): boolean {
    return this.isAdult;
  }

  getPatientProfileId(): string {
    return this.patientProfileId;
  }
}
