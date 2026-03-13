import { createContext, useContext, useMemo, useState } from "react";
import type {
  AppLanguage,
  CalibrationProfile,
  EarOrder,
  HearingResult,
  Patient,
  Protocol,
  TestMode,
  TestRound,
} from "@/types/audit";

const FREQUENCIES = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];

const createCalibrationRows = () => {
  const expected = [84, 75.5, 72, 70, 72, 73, 73.5, 75.5, 72, 70];
  const presentation = [70, 70, 70, 70, 70, 70, 50, 70, 70, 70];
  const leftMeasured = [81.4, 81.3, 83.8, 82.2, 81.2, 82.5, 81, 81, 61.8, 47.6];
  const rightMeasured = [84.1, 77.4, 80.2, 78.2, 77.5, 79.1, 77.8, 77.1, 57.9, 43.1];

  return FREQUENCIES.map((frequency, index) => ({
    frequency,
    expected: expected[index],
    presentation: presentation[index],
    leftMeasured: leftMeasured[index],
    rightMeasured: rightMeasured[index],
    enabled: false,
  }));
};

const initialPatients: Patient[] = [
  {
    id: "p-1",
    name: "[church] p07",
    group: "Adult",
    results: [
      {
        id: "r-1",
        frequencySummary: "Current Frequency: 250 Hz",
        thresholdSummary: "dB Threshold: (L) 15 (R) 15",
        reliabilitySummary: "Reliability: (L) 1/1 (R) 0/0",
        points: [
          { frequency: 250, left: 50, right: 50 },
          { frequency: 1000, left: 30, right: 30 },
          { frequency: 2000, left: 15, right: 15 },
          { frequency: 4000, left: 15, right: 15 },
          { frequency: 8000, left: 14, right: 15 },
        ],
      },
    ],
  },
  {
    id: "p-2",
    name: "[aa] rr",
    group: "Adult",
    results: [],
  },
];

interface AuditContextType {
  frequencies: number[];
  language: AppLanguage;
  mode: TestMode;
  earOrder: EarOrder;
  selectedFrequencies: number[];
  protocols: Protocol[];
  calibrationProfiles: CalibrationProfile[];
  selectedCalibrationId: string;
  patients: Patient[];
  selectedPatientId: string;
  currentRound: TestRound | null;
  progress: number;
  isTesting: boolean;
  isPaused: boolean;
  toggleFrequency: (frequency: number) => void;
  removeLastFrequency: () => void;
  clearFrequencies: () => void;
  setLanguage: (language: AppLanguage) => void;
  setMode: (mode: TestMode) => void;
  setEarOrder: (order: EarOrder) => void;
  saveProtocol: (patientGroup: string, patientName: string) => void;
  loadProtocol: (id: string) => void;
  deleteCurrentProtocol: () => void;
  setSelectedPatientId: (id: string) => void;
  setSelectedCalibrationId: (id: string) => void;
  updateCalibrationValue: (frequency: number, key: "presentation" | "leftMeasured" | "rightMeasured", value: number) => void;
  toggleCalibrationEnabled: (frequency: number) => void;
  clearMeasuredLevels: () => void;
  loadDefaultPresentation: () => void;
  startTesting: () => void;
  pauseTesting: () => void;
  repeatRound: () => void;
  respondToRound: (target: "top" | "bottom" | "no_sound") => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

const randomPick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const visualForMode = (mode: TestMode, index: number): TestRound["visual"] => {
  if (mode === "children") return "illustrated";
  return ["trapezoid", "rectangle", "oval"][index % 3] as TestRound["visual"];
};

export const AuditProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>("English");
  const [mode, setMode] = useState<TestMode>("adult");
  const [earOrder, setEarOrder] = useState<EarOrder>("L. Ear -> R. Ear");
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [calibrationProfiles, setCalibrationProfiles] = useState<CalibrationProfile[]>([
    { id: "c-1", name: "phonne", rows: createCalibrationRows() },
  ]);
  const [selectedCalibrationId, setSelectedCalibrationId] = useState("c-1");
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState("p-1");
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState<TestRound | null>(null);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const protocolFrequencySource = selectedFrequencies.length ? selectedFrequencies : [250, 1000, 2000, 4000, 8000];

  const buildRound = (index: number) => {
    const frequency = protocolFrequencySource[index % protocolFrequencySource.length];
    const visual = visualForMode(mode, index);
    const correctTarget = randomPick<"top" | "bottom" | "no_sound">(["top", "bottom", "no_sound"]);
    setCurrentRound({ frequency, visual, correctTarget });
  };

  const toggleFrequency = (frequency: number) => {
    setSelectedFrequencies((previous) =>
      previous.includes(frequency) ? previous.filter((value) => value !== frequency) : [...previous, frequency],
    );
  };

  const removeLastFrequency = () => setSelectedFrequencies((previous) => previous.slice(0, -1));
  const clearFrequencies = () => setSelectedFrequencies([]);

  const saveProtocol = (patientGroup: string, patientName: string) => {
    const created: Protocol = {
      id: crypto.randomUUID(),
      patientGroup,
      patientName,
      frequencies: selectedFrequencies,
      earOrder,
      language,
      mode,
    };
    setProtocols((previous) => [created, ...previous]);
  };

  const loadProtocol = (id: string) => {
    const target = protocols.find((item) => item.id === id);
    if (!target) return;
    setSelectedFrequencies(target.frequencies);
    setEarOrder(target.earOrder);
    setLanguage(target.language);
    setMode(target.mode);
  };

  const deleteCurrentProtocol = () => {
    const signature = selectedFrequencies.join("-");
    setProtocols((previous) => previous.filter((item) => item.frequencies.join("-") !== signature));
  };

  const updateCalibrationValue = (
    frequency: number,
    key: "presentation" | "leftMeasured" | "rightMeasured",
    value: number,
  ) => {
    setCalibrationProfiles((previous) =>
      previous.map((profile) =>
        profile.id === selectedCalibrationId
          ? { ...profile, rows: profile.rows.map((row) => (row.frequency === frequency ? { ...row, [key]: value } : row)) }
          : profile,
      ),
    );
  };

  const toggleCalibrationEnabled = (frequency: number) => {
    setCalibrationProfiles((previous) =>
      previous.map((profile) =>
        profile.id === selectedCalibrationId
          ? { ...profile, rows: profile.rows.map((row) => (row.frequency === frequency ? { ...row, enabled: !row.enabled } : row)) }
          : profile,
      ),
    );
  };

  const clearMeasuredLevels = () => {
    setCalibrationProfiles((previous) =>
      previous.map((profile) =>
        profile.id === selectedCalibrationId
          ? {
              ...profile,
              rows: profile.rows.map((row) => ({ ...row, leftMeasured: 0, rightMeasured: 0 })),
            }
          : profile,
      ),
    );
  };

  const loadDefaultPresentation = () => {
    setCalibrationProfiles((previous) =>
      previous.map((profile) =>
        profile.id === selectedCalibrationId
          ? { ...profile, rows: createCalibrationRows().map((row) => ({ ...row, leftMeasured: 0, rightMeasured: 0 })) }
          : profile,
      ),
    );
  };

  const startTesting = () => {
    setIsTesting(true);
    setIsPaused(false);
    setRoundIndex(0);
    setResponses([]);
    buildRound(0);
  };

  const pauseTesting = () => setIsPaused((previous) => !previous);
  const repeatRound = () => buildRound(roundIndex);

  const respondToRound = (target: "top" | "bottom" | "no_sound") => {
    if (!currentRound || isPaused) return;

    const isCorrect = target === currentRound.correctTarget;
    const nextResponses = [...responses, isCorrect];
    setResponses(nextResponses);
    const nextIndex = roundIndex + 1;

    if (nextIndex >= protocolFrequencySource.length) {
      setIsTesting(false);
      setCurrentRound(null);
      const result: HearingResult = {
        id: crypto.randomUUID(),
        frequencySummary: `Current Frequency: ${protocolFrequencySource[0]} Hz`,
        thresholdSummary: `dB Threshold: (L) ${isCorrect ? 15 : 30} (R) ${isCorrect ? 15 : 30}`,
        reliabilitySummary: `Reliability: (L) ${nextResponses.filter(Boolean).length}/${nextResponses.length} (R) ${nextResponses.filter(Boolean).length}/${nextResponses.length}`,
        points: protocolFrequencySource.map((frequency, index) => ({
          frequency,
          left: Math.max(10, 50 - index * 8),
          right: Math.max(10, 50 - index * 8),
        })),
      };
      setPatients((previous) =>
        previous.map((patient) =>
          patient.id === selectedPatientId ? { ...patient, results: [result, ...patient.results] } : patient,
        ),
      );
      return;
    }

    setRoundIndex(nextIndex);
    buildRound(nextIndex);
  };

  const progress = Math.round((responses.length / protocolFrequencySource.length) * 100);

  const value = useMemo(
    () => ({
      frequencies: FREQUENCIES,
      language,
      mode,
      earOrder,
      selectedFrequencies,
      protocols,
      calibrationProfiles,
      selectedCalibrationId,
      patients,
      selectedPatientId,
      currentRound,
      progress,
      isTesting,
      isPaused,
      toggleFrequency,
      removeLastFrequency,
      clearFrequencies,
      setLanguage,
      setMode,
      setEarOrder,
      saveProtocol,
      loadProtocol,
      deleteCurrentProtocol,
      setSelectedPatientId,
      setSelectedCalibrationId,
      updateCalibrationValue,
      toggleCalibrationEnabled,
      clearMeasuredLevels,
      loadDefaultPresentation,
      startTesting,
      pauseTesting,
      repeatRound,
      respondToRound,
    }),
    [
      language,
      mode,
      earOrder,
      selectedFrequencies,
      protocols,
      calibrationProfiles,
      selectedCalibrationId,
      patients,
      selectedPatientId,
      currentRound,
      progress,
      isTesting,
      isPaused,
    ],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error("useAudit must be used inside AuditProvider");
  return context;
};
