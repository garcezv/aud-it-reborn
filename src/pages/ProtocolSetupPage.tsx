import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAudit } from "@/context/AuditContext";
import type { EarOrder } from "@/types/audit";

const ProtocolSetupPage = () => {
  const navigate = useNavigate();
  const {
    frequencies,
    selectedFrequencies,
    earOrder,
    language,
    mode,
    protocols,
    toggleFrequency,
    removeLastFrequency,
    clearFrequencies,
    setEarOrder,
    setLanguage,
    setMode,
    saveProtocol,
    loadProtocol,
    deleteCurrentProtocol,
  } = useAudit();

  const [errorOpen, setErrorOpen] = useState(false);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState(protocols[0]?.id ?? "");
  const [patientGroup, setPatientGroup] = useState("Adult");
  const [patientName, setPatientName] = useState("iPad Adult");

  const sequenceText = useMemo(
    () => (selectedFrequencies.length ? selectedFrequencies.map((f) => `${f} Hz`).join(" ► ") : "None"),
    [selectedFrequencies],
  );

  const requireFrequency = (action: () => void) => {
    if (!selectedFrequencies.length) {
      setErrorOpen(true);
      return;
    }
    action();
  };

  const earOrders: EarOrder[] = ["L. Ear Only", "R. Ear Only", "L. Ear -> R. Ear", "R. Ear -> L. Ear"];

  return (
    <main className="min-h-screen bg-background px-6 py-4">
      <Button variant="link" className="h-auto px-0 text-xl" onClick={() => navigate("/")}>
        Return to Title
      </Button>

      <section className="mt-10 space-y-10">
        <div className="grid grid-cols-10 gap-3">
          {frequencies.map((frequency) => (
            <Button
              key={frequency}
              variant={selectedFrequencies.includes(frequency) ? "default" : "secondary"}
              size="touch"
              onClick={() => toggleFrequency(frequency)}
            >
              {frequency} Hz
            </Button>
          ))}
        </div>

        <p className="text-center font-data text-5xl text-foreground">Test Sequence: {sequenceText}</p>

        <div className="space-y-6">
          <p className="text-center text-4xl">L./R. Ear Order: {earOrder}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {earOrders.map((order) => (
              <Button
                key={order}
                size="touch"
                variant={earOrder === order ? "default" : "secondary"}
                onClick={() => setEarOrder(order)}
              >
                {order}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <Button size="touch" variant="destructive" onClick={removeLastFrequency}>
            Remove Last
          </Button>
          <Button size="touch" variant="destructive" onClick={clearFrequencies}>
            Clear All
          </Button>
          <Button size="touch" onClick={() => requireFrequency(() => setSaveOpen(true))}>
            Save Protocol
          </Button>
          <Button size="touch" variant="secondary" onClick={() => setSelectionOpen(true)}>
            Load Protocol
          </Button>
          <Button size="touch" variant="destructive" onClick={deleteCurrentProtocol}>
            Delete Current Protocol
          </Button>
        </div>

        <div className="flex items-end justify-center gap-10">
          <div className="grid gap-3">
            <Button size="touch" variant={language === "English" ? "default" : "secondary"} onClick={() => setLanguage("English")}>
              Switch to English
            </Button>
            <Button
              size="touch"
              variant={language === "Portuguese" ? "default" : "secondary"}
              onClick={() => setLanguage("Portuguese")}
            >
              Switch to Portuguese
            </Button>
          </div>

          <Button
            size="touch"
            variant={mode === "adult" ? "default" : "secondary"}
            onClick={() => {
              setMode("adult");
              requireFrequency(() => navigate("/test"));
            }}
          >
            Adult Test
          </Button>
          <Button
            size="touch"
            variant={mode === "children" ? "warning" : "secondary"}
            onClick={() => {
              setMode("children");
              requireFrequency(() => navigate("/test"));
            }}
          >
            Children Test
          </Button>
        </div>

        <p className="pb-4 text-center text-4xl">Test Language: {language}</p>
      </section>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-4xl">There is no frequency selected!</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end">
            <Button size="touch" onClick={() => setErrorOpen(false)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectionOpen} onOpenChange={setSelectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-4xl">Select a different setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {protocols.length ? (
              protocols.map((protocol) => (
                <button
                  key={protocol.id}
                  className="w-full rounded-md border border-border bg-card px-4 py-3 text-left text-2xl"
                  onClick={() => setSelectedProtocolId(protocol.id)}
                >
                  {protocol.patientName} ({protocol.patientGroup})
                </button>
              ))
            ) : (
              <p className="text-xl text-muted-foreground">No saved protocol.</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button size="touch" variant="secondary" onClick={() => setSelectionOpen(false)}>
              Cancel
            </Button>
            <Button
              size="touch"
              onClick={() => {
                if (selectedProtocolId) loadProtocol(selectedProtocolId);
                setSelectionOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-4xl">Save Protocol</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="text-2xl">Patient’s Group</label>
            <Input value={patientGroup} onChange={(event) => setPatientGroup(event.target.value)} className="h-14 text-2xl" />
            <label className="text-2xl">Patient’s Name</label>
            <Input value={patientName} onChange={(event) => setPatientName(event.target.value)} className="h-14 text-2xl" />
          </div>
          <div className="flex justify-end gap-3">
            <Button size="touch" variant="secondary" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              size="touch"
              onClick={() => {
                saveProtocol(patientGroup, patientName);
                setSaveOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ProtocolSetupPage;
