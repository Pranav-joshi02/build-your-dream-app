import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  patient: string;
  type: string;
  ordered: string;
  status: string;
  flag: "critical" | "warning" | "stable" | "info";
}

export function NewReportForm({ onAdd }: { onAdd: (report: Report) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    patient: "",
    type: "Blood culture",
    flag: "stable" as "critical" | "warning" | "stable" | "info",
    status: "Awaiting sign-off"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient) {
      alert("Please enter patient name");
      return;
    }

    const newReport: Report = {
      id: `RP-${Math.floor(5500 + Math.random() * 4500)}`,
      patient: formData.patient,
      type: formData.type,
      ordered: "Aug 8",
      status: formData.status,
      flag: formData.flag
    };

    onAdd(newReport);
    setOpen(false);
    setFormData({
      patient: "",
      type: "Blood culture",
      flag: "stable",
      status: "Awaiting sign-off"
    });
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-popover";

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>New Report</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 animate-in fade-in">Create Diagnostic Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Patient Name</label>
                <input
                  type="text"
                  value={formData.patient}
                  onChange={e => setFormData(prev => ({ ...prev, patient: e.target.value }))}
                  placeholder="Jerry Wilcox"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Report Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Blood culture" className="bg-popover text-foreground">Blood culture</option>
                  <option value="Echocardiogram" className="bg-popover text-foreground">Echocardiogram</option>
                  <option value="Brain MRI" className="bg-popover text-foreground">Brain MRI</option>
                  <option value="X-ray, left radius" className="bg-popover text-foreground">X-ray, left radius</option>
                  <option value="Obstetric ultrasound" className="bg-popover text-foreground">Obstetric ultrasound</option>
                  <option value="Complete Blood Count" className="bg-popover text-foreground">Complete Blood Count</option>
                  <option value="Urinalysis" className="bg-popover text-foreground">Urinalysis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Severity Flag</label>
                  <select
                    value={formData.flag}
                    onChange={e => setFormData(prev => ({ ...prev, flag: e.target.value as any }))}
                    className={inputClass}
                  >
                    <option value="stable" className="bg-popover text-foreground">Stable</option>
                    <option value="info" className="bg-popover text-foreground">Info</option>
                    <option value="warning" className="bg-popover text-foreground">Warning</option>
                    <option value="critical" className="bg-popover text-foreground">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="Awaiting sign-off" className="bg-popover text-foreground">Awaiting sign-off</option>
                    <option value="Ready" className="bg-popover text-foreground">Ready</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Report
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
