import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  dept: string;
  type: string;
  status: string;
}

export function NewAppointmentForm({ onAdd }: { onAdd: (appt: Appointment) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    time: "09:00",
    patient: "",
    doctor: "Dr. Basil Frost",
    dept: "Neurology",
    type: "Consultation",
    status: "Scheduled"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doc = e.target.value;
    let dept = "Neurology";
    
    if (doc === "Dr. Vicki Walsh") dept = "Cardiology";
    else if (doc === "Dr. April Gallegos") dept = "Gynecology";
    else if (doc === "Dr. Nannie Guerrero") dept = "Urology";
    else if (doc === "Dr. Daren Andrade") dept = "Pulmonology";
    else if (doc === "Dr. Lilly Chavez") dept = "Pediatrics";

    setFormData(prev => ({ ...prev, doctor: doc, dept }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.time) {
      alert("Please enter patient name and time");
      return;
    }

    const newAppt: Appointment = {
      id: `AP-${Math.floor(8800 + Math.random() * 1100)}`,
      time: formData.time,
      patient: formData.patient,
      doctor: formData.doctor,
      dept: formData.dept,
      type: formData.type,
      status: formData.status
    };

    onAdd(newAppt);
    setOpen(false);
    setFormData({
      time: "09:00",
      patient: "",
      doctor: "Dr. Basil Frost",
      dept: "Neurology",
      type: "Consultation",
      status: "Scheduled"
    });
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-popover";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>New appointment</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Schedule New Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Patient Name</label>
                <input
                  type="text"
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  placeholder="Marta Iqbal"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Appt Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Consultation" className="bg-popover text-foreground">Consultation</option>
                    <option value="Follow-up" className="bg-popover text-foreground">Follow-up</option>
                    <option value="MRI review" className="bg-popover text-foreground">MRI review</option>
                    <option value="Post-op" className="bg-popover text-foreground">Post-op</option>
                    <option value="Spirometry" className="bg-popover text-foreground">Spirometry</option>
                    <option value="Growth scan" className="bg-popover text-foreground">Growth scan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Doctor</label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleDoctorChange}
                    className={inputClass}
                  >
                    <option value="Dr. Basil Frost" className="bg-popover text-foreground">Dr. Basil Frost</option>
                    <option value="Dr. Vicki Walsh" className="bg-popover text-foreground">Dr. Vicki Walsh</option>
                    <option value="Dr. April Gallegos" className="bg-popover text-foreground">Dr. April Gallegos</option>
                    <option value="Dr. Nannie Guerrero" className="bg-popover text-foreground">Dr. Nannie Guerrero</option>
                    <option value="Dr. Daren Andrade" className="bg-popover text-foreground">Dr. Daren Andrade</option>
                    <option value="Dr. Lilly Chavez" className="bg-popover text-foreground">Dr. Lilly Chavez</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Department</label>
                  <input
                    type="text"
                    name="dept"
                    value={formData.dept}
                    className={inputClass}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Scheduled" className="bg-popover text-foreground">Scheduled</option>
                  <option value="Waiting" className="bg-popover text-foreground">Waiting</option>
                  <option value="In progress" className="bg-popover text-foreground">In progress</option>
                  <option value="Checked in" className="bg-popover text-foreground">Checked in</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule
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
