import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-8">
      <section className="flex w-full max-w-5xl flex-col items-center gap-10 py-10">
        <h1 className="text-7xl font-semibold tracking-tight text-foreground">Aud•It</h1>

        <div className="grid gap-6">
          <Button size="tablet" className="w-[320px]" onClick={() => navigate("/protocol")}>
            Start
          </Button>
          <Button size="tablet" className="w-[320px]" onClick={() => navigate("/test")}>
            Practice
          </Button>
          <Button size="tablet" className="w-[320px]" onClick={() => navigate("/calibration")}>
            Calibration
          </Button>
          <Button size="tablet" className="w-[320px]" onClick={() => navigate("/results")}>
            View Results
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;
