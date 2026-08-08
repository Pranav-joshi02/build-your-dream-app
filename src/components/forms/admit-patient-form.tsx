import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  ward: string;
  doctor: string;
  condition: string;
  status: "critical" | "warning" | "stable" | "info";
  admitted: string;
}

export function AdmitPatientForm({ onAdmit }: { onAdmit: (patient: Patient) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "M",
    ward: "General Ward",
    doctor: "Dr. Basil Frost",
    condition: "",
    status: "stable" as "critical" | "warning" | "stable" | "info"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.condition) {
      alert("Please fill all required fields.");
      return;
    }

    const newPatient: Patient = {
      id: `PT-${Math.floor(10260 + Math.random() * 1000)}`,
      name: formData.name,
      age: parseInt(formData.age) || 0,
      sex: formData.sex,
      ward: formData.ward,
      doctor: formData.doctor,
      condition: formData.condition,
      status: formData.status,
      admitted: "Today"
    };

    onAdmit(newPatient);
    setOpen(false);
    setFormData({
      name: "",
      age: "",
      sex: "M",
      ward: "General Ward",
      doctor: "Dr. Basil Frost",
      condition: "",
      status: "stable"
    });
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-popover";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Admit patient</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Admit New Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="35"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Sex</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="M" className="bg-popover text-foreground">Male</option>
                    <option value="F" className="bg-popover text-foreground">Female</option>
                    <option value="Other" className="bg-popover text-foreground">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ward/Location</label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="General Ward" className="bg-popover text-foreground">General Ward</option>
                    <option value="ICU" className="bg-popover text-foreground">ICU</option>
                    <option value="Cardiology · 4B" className="bg-popover text-foreground">Cardiology · 4B</option>
                    <option value="Neurology · 3A" className="bg-popover text-foreground">Neurology · 3A</option>
                    <option value="Pulmonology · 3B" className="bg-popover text-foreground">Pulmonology · 3B</option>
                    <option value="Maternity · 6A" className="bg-popover text-foreground">Maternity · 6A</option>
                    <option value="Pediatrics · 1C" className="bg-popover text-foreground">Pediatrics · 1C</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Attending Doctor</label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Dr. Basil Frost" className="bg-popover text-foreground">Dr. Basil Frost</option>
                    <option value="Dr. April Gallegos" className="bg-popover text-foreground">Dr. April Gallegos</option>
                    <option value="Dr. Vicki Walsh" className="bg-popover text-foreground">Dr. Vicki Walsh</option>
                    <option value="Dr. Nannie Guerrero" className="bg-popover text-foreground">Dr. Nannie Guerrero</option>
                    <option value="Dr. Daren Andrade" className="bg-popover text-foreground">Dr. Daren Andrade</option>
                    <option value="Dr. Lilly Chavez" className="bg-popover text-foreground">Dr. Lilly Chavez</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Condition/Diagnosis</label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  placeholder="e.g. Acute bronchitis"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Initial Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="stable" className="bg-popover text-foreground">Stable</option>
                  <option value="warning" className="bg-popover text-foreground">Warning</option>
                  <option value="critical" className="bg-popover text-foreground">Critical</option>
                  <option value="info" className="bg-popover text-foreground">Info</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Admit Patient
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
