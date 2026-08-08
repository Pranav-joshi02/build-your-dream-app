import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function DischargeForm({ patient }: { patient: any }) {
  const [open, setOpen] = useState(false);

  const handleDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Discharge summary for ${patient.name} processed and emailed via Brevo.`);
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Discharge</Button>
      {open && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-popover p-6 rounded-lg border shadow-lg max-w-md w-full relative">
            <h2 className="text-lg font-bold mb-4">Discharge {patient.name}</h2>
            <form onSubmit={handleDischarge} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Final Diagnosis</label>
                <input type="text" defaultValue={patient.condition} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm font-medium">Prescriptions</label>
                <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Paracetamol 500mg as needed"></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Complete & Email</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
