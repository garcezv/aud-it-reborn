// CSV Export utility for patient profile data

import type { PatientProfileWithValues } from "@/types/audiometry";

export function generateCSV(profiles: PatientProfileWithValues[]): string {
  const headers = [
    "Patient Name",
    "Patient Group",
    "Is Adult",
    "Is Practice",
    "Ear Order",
    "Start Time",
    "End Time",
    "Duration (s)",
    "Frequency (Hz)",
    "Threshold Left (dB)",
    "Threshold Right (dB)",
    "No Sound Count Left",
    "No Sound Count Right",
    "No Sound Correct Left",
    "No Sound Correct Right",
    "Spam Count Left",
    "Spam Count Right",
    "Duration Left (s)",
    "Duration Right (s)",
  ];

  const rows: string[][] = [];

  for (const profile of profiles) {
    const frequencyOrder = (profile.frequency_order as number[]) ?? [];
    const freqStr = frequencyOrder.join(";");

    for (const val of profile.values) {
      const thresholdL = val.threshold_l === -1 ? "NR" : String(val.threshold_l);
      const thresholdR = val.threshold_r === -1 ? "NR" : String(val.threshold_r);

      rows.push([
        profile.name,
        profile.patient_group,
        profile.is_adult ? "Adult" : "Children",
        profile.is_practice ? "Practice" : "Test",
        profile.ear_order,
        profile.timestamp,
        profile.end_time ?? "",
        String(profile.duration_seconds ?? 0),
        String(val.frequency),
        thresholdL,
        thresholdR,
        String(val.no_sound_count_l),
        String(val.no_sound_count_r),
        String(val.no_sound_correct_l),
        String(val.no_sound_correct_r),
        String(val.spam_count_l),
        String(val.spam_count_r),
        String(val.duration_seconds_l ?? 0),
        String(val.duration_seconds_r ?? 0),
      ]);
    }
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csvContent;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
