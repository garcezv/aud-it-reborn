export type AppLanguage = "English" | "Portuguese";
export type TestMode = "adult" | "children";
export type EarOrder = "L. Ear Only" | "R. Ear Only" | "L. Ear -> R. Ear" | "R. Ear -> L. Ear";

export interface Protocol {
  id: string;
  patientGroup: string;
  patientName: string;
  frequencies: number[];
  earOrder: EarOrder;
  language: AppLanguage;
  mode: TestMode;
}

export interface CalibrationRow {
  frequency: number;
  expected: number;
  presentation: number;
  leftMeasured: number;
  rightMeasured: number;
  enabled: boolean;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  rows: CalibrationRow[];
}

export interface ResultPoint {
  frequency: number;
  left: number;
  right: number;
}

export interface HearingResult {
  id: string;
  frequencySummary: string;
  thresholdSummary: string;
  reliabilitySummary: string;
  points: ResultPoint[];
}

export interface Patient {
  id: string;
  name: string;
  group: string;
  results: HearingResult[];
}

export interface TestRound {
  frequency: number;
  visual: "trapezoid" | "rectangle" | "oval" | "illustrated";
  correctTarget: "top" | "bottom" | "no_sound";
}
