import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAudit } from "@/context/AuditContext";

const CalibrationPage = () => {
  const navigate = useNavigate();
  const {
    calibrationProfiles,
    selectedCalibrationId,
    updateCalibrationValue,
    toggleCalibrationEnabled,
    clearMeasuredLevels,
    loadDefaultPresentation,
  } = useAudit();

  const profile = useMemo(
    () => calibrationProfiles.find((item) => item.id === selectedCalibrationId) ?? calibrationProfiles[0],
    [calibrationProfiles, selectedCalibrationId],
  );

  return (
    <main className="min-h-screen bg-background px-6 py-4">
      <Button variant="link" className="h-auto px-0 text-xl" onClick={() => navigate("/")}>
        Return to Title
      </Button>

      <section className="mt-8 space-y-5">
        <div className="grid grid-cols-10 gap-2 text-center font-data text-4xl">
          {profile.rows.map((row) => (
            <p key={row.frequency}>{row.frequency} Hz</p>
          ))}
        </div>

        {["expected", "presentation", "leftMeasured", "rightMeasured"].map((line) => (
          <div key={line} className="space-y-2">
            <p className="text-center text-4xl">
              {line === "expected" && "Expected Sound Pressure Level for 70 dB HL (dB SPL)"}
              {line === "presentation" && "Presentation Level (dBHL)"}
              {line === "leftMeasured" && "Left Measured Level for 70 dB HL (dB SPL)"}
              {line === "rightMeasured" && "Right Measured Level for 70 dB HL (dB SPL)"}
            </p>
            <div className="grid grid-cols-10 gap-2">
              {profile.rows.map((row) => (
                <Input
                  key={`${line}-${row.frequency}`}
                  className="h-14 text-center font-data text-3xl"
                  value={row[line as keyof typeof row] as number}
                  onChange={(event) =>
                    line !== "expected" &&
                    updateCalibrationValue(
                      row.frequency,
                      line as "presentation" | "leftMeasured" | "rightMeasured",
                      Number(event.target.value),
                    )
                  }
                  disabled={line === "expected"}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="grid grid-cols-10 gap-2">
          {profile.rows.map((row) => (
            <Button key={`off-${row.frequency}`} size="touch" variant="secondary" onClick={() => toggleCalibrationEnabled(row.frequency)}>
              {row.enabled ? "On" : "Off"}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 py-6">
          <Button size="tablet">Set Volume</Button>
          <Button size="tablet" variant="secondary" onClick={loadDefaultPresentation}>
            Load Default P. Level
          </Button>
          <Button size="tablet" variant="secondary" onClick={clearMeasuredLevels}>
            Clear Measured Level
          </Button>
        </div>

        <p className="text-center text-4xl">Current Setting: {profile.name}</p>

        <div className="flex flex-wrap justify-center gap-6 pb-10">
          <Button size="tablet" variant="secondary">
            Save as New
          </Button>
          <Button size="tablet" variant="secondary">
            Save to Current
          </Button>
          <Button size="tablet" variant="secondary">
            Load Other
          </Button>
          <Button size="tablet" variant="secondary">
            Delete Current
          </Button>
        </div>
      </section>
    </main>
  );
};

export default CalibrationPage;
