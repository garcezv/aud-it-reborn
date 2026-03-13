import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/context/AuditContext";

const TestPage = () => {
  const navigate = useNavigate();
  const { mode, currentRound, isPaused, isTesting, progress, startTesting, pauseTesting, repeatRound, respondToRound } = useAudit();

  const instruction = "Please tap the shape that makes sounds, or tap \"No Sound\" if you don’t hear any sound";

  const renderVisual = (slot: "top" | "bottom") => {
    if (!currentRound) return <div className="h-[320px] rounded-md border border-border bg-card" />;

    if (currentRound.visual === "illustrated") {
      return (
        <button className="h-[320px] w-full rounded-md border border-border bg-card text-[180px]" onClick={() => respondToRound(slot)}>
          🕊️
        </button>
      );
    }

    const styleMap = {
      trapezoid: "clip-trapezoid bg-stimulus-purple",
      rectangle: "bg-stimulus-orange",
      oval: "rounded-full bg-stimulus-green",
    } as const;

    return (
      <button
        className={`h-[320px] w-full border-8 border-foreground/60 ${styleMap[currentRound.visual]} ${slot === "top" ? "opacity-95" : "opacity-75"}`}
        onClick={() => respondToRound(slot)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-background px-6 py-4">
      <div className="flex items-start justify-between">
        <Button variant="link" className="h-auto px-0 text-xl" onClick={() => navigate("/")}>
          Return to Title
        </Button>
        <p className="font-data text-5xl">Test Progress: {progress}%</p>
      </div>

      <section className="mt-5 grid grid-cols-[1.4fr_2.2fr_1.2fr] gap-8">
        <aside className="flex items-center justify-center px-4 text-center text-7xl leading-tight">{instruction}</aside>

        <div className="space-y-6">
          <div className="flex justify-end">
            <Button size="tablet" variant="secondary" onClick={startTesting}>
              Start Testing!
            </Button>
          </div>

          {renderVisual("top")}
          {renderVisual("bottom")}
        </div>

        <div className="flex flex-col items-end justify-between">
          <button
            className="flex h-[320px] w-[280px] items-center justify-center rounded-l-[999px] border-4 border-foreground/50 bg-card text-7xl"
            onClick={() => respondToRound("no_sound")}
          >
            {mode === "children" ? "🤔" : "No Sound"}
          </button>

          <Button size="tablet" variant="success" onClick={pauseTesting}>
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </section>

      <div className="mt-4 flex justify-between">
        <Button size="tablet" variant="warning" onClick={repeatRound} disabled={!isTesting}>
          Repeat
        </Button>
        <Button size="tablet" variant="secondary" onClick={() => navigate("/protocol")}>
          Protocol Setup
        </Button>
      </div>
    </main>
  );
};

export default TestPage;
