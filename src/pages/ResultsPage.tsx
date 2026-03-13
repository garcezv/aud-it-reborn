import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/context/AuditContext";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ResultsPage = () => {
  const navigate = useNavigate();
  const { patients, selectedPatientId, setSelectedPatientId } = useAudit();
  const selectedPatient = useMemo(() => patients.find((item) => item.id === selectedPatientId) ?? patients[0], [patients, selectedPatientId]);
  const selectedResult = selectedPatient?.results[0];

  return (
    <main className="min-h-screen bg-background px-6 py-4">
      <Button variant="link" className="h-auto px-0 text-xl" onClick={() => navigate("/")}>
        Return to Title
      </Button>

      <section className="mt-5 grid grid-cols-[1.35fr_2fr] gap-6">
        <div className="space-y-4">
          <Button size="touch" variant="secondary">
            Export All Patient Data
          </Button>

          <div className="h-[900px] overflow-y-auto rounded-sm border border-border bg-secondary px-2 py-2">
            {patients.map((patient) => (
              <button
                key={patient.id}
                className={`mb-2 w-full rounded-sm px-4 py-2 text-left text-2xl ${selectedPatientId === patient.id ? "bg-card" : "bg-secondary text-secondary-foreground"}`}
                onClick={() => setSelectedPatientId(patient.id)}
              >
                {patient.name}({patient.group})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-5">
            <p className="text-3xl">
              {selectedResult
                ? `${selectedResult.frequencySummary} ; ${selectedResult.thresholdSummary} ; ${selectedResult.reliabilitySummary}`
                : "Current Frequency: None"}
            </p>
            <div className="flex gap-4">
              <Button size="touch" variant="destructive">
                Delete All Patient Profiles
              </Button>
              <Button size="touch" variant="destructive">
                Delete Current Patient Profile
              </Button>
            </div>
          </div>

          <div className="h-[410px] rounded-sm border border-border bg-panel-left p-3">
            {selectedResult ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedResult.points}>
                  <CartesianGrid stroke="hsl(var(--border))" />
                  <XAxis dataKey="frequency" tick={{ fontSize: 20 }} />
                  <YAxis tick={{ fontSize: 20 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="left" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-3xl">No chart data available.</p>
            )}
          </div>

          <div className="h-[410px] rounded-sm border border-border bg-panel-right p-3">
            {selectedResult ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedResult.points}>
                  <CartesianGrid stroke="hsl(var(--border))" />
                  <XAxis dataKey="frequency" tick={{ fontSize: 20 }} />
                  <YAxis tick={{ fontSize: 20 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="right" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-3xl">No chart data available.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;
