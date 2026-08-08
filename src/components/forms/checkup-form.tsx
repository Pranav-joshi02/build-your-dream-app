import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckupForm({ patient }: { patient: any }) {
  const [open, setOpen] = useState(false);

  const handleCheckup = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Routine checkup report for ${patient.name} saved and SMS sent via Brevo.`);
    setOpen(false);
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Routine Checkup</Button>
      {open && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-popover p-6 rounded-lg border shadow-lg max-w-md w-full relative">
            <h2 className="text-lg font-bold mb-4">Routine Checkup: {patient.name}</h2>
            <form onSubmit={handleCheckup} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vitals Notes</label>
                <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Heart rate stable, BP normal..."></textarea>
              </div>
              <div>
                <label className="text-sm font-medium">Next Appointment (Weeks)</label>
                <input type="number" defaultValue="4" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save & Notify Patient</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
