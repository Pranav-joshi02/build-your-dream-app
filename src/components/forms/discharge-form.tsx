import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { sendDischargeEmailFn } from "@/lib/api";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface DischargeStatus {
  email: "idle" | "sending" | "success" | "error";
}

export function DischargeForm({ patient }: { patient: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<DischargeStatus>({ email: "idle" });
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    patientEmail: "",
    patientPhone: "",
    diagnosis: patient?.condition || "",
    prescription: "Paracetamol 500mg — 1 tablet every 6 hours as needed\nOmeprazole 20mg — 1 capsule daily before breakfast",
    followUpNotes: "Schedule follow-up visit in 2 weeks.\nContinue prescribed medications.\nContact hospital immediately if symptoms worsen.",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientEmail) {
      alert("Please enter the patient's email.");
      return;
    }

    setIsSubmitting(true);
    setStatus({ email: "sending" });
    setEmailErrorMessage(null);
    setShowSuccess(true);

    // Send email via Brevo
    try {
      await sendDischargeEmailFn({
        data: {
          patientName: patient.name,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone || "Not provided",
          diagnosis: formData.diagnosis,
          prescription: formData.prescription,
          followUpNotes: formData.followUpNotes,
          doctorName: patient.doctor || "Attending Physician",
        },
      });
      setStatus({ email: "success" });
    } catch (error: any) {
      console.error("Brevo email error:", error);
      setStatus({ email: "error" });
      setEmailErrorMessage(error?.message || "Unknown error occurred while sending email.");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowSuccess(false);
    setStatus({ email: "idle" });
    setEmailErrorMessage(null);
    setFormData({
      patientEmail: "",
      patientPhone: "",
      diagnosis: patient?.condition || "",
      prescription: "Paracetamol 500mg — 1 tablet every 6 hours as needed\nOmeprazole 20mg — 1 capsule daily before breakfast",
      followUpNotes: "Schedule follow-up visit in 2 weeks.\nContinue prescribed medications.\nContact hospital immediately if symptoms worsen.",
    });
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const textareaClass = "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Discharge</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-lg w-full relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {showSuccess ? (
              // Success/Status screen
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto size-16 rounded-full bg-success/15 flex items-center justify-center">
                  {status.email === "success" ? (
                    <CheckCircle className="size-8 text-success" />
                  ) : (
                    <AlertCircle className="size-8 text-destructive" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {status.email === "success" ? "Discharge Complete" : "Discharge Action Failed"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {status.email === "success" 
                      ? `${patient.name} has been successfully discharged.` 
                      : `An error occurred while processing discharge for ${patient.name}.`}
                  </p>
                </div>

                <div className="space-y-2 text-left bg-muted/40 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="size-4 flex-shrink-0" />
                    <span className="flex-1">Email to {formData.patientEmail}</span>
                    {status.email === "success" ? (
                      <span className="text-success text-xs font-medium flex items-center gap-1"><CheckCircle className="size-3" /> Sent</span>
                    ) : (
                      <span className="text-destructive text-xs font-medium flex items-center gap-1"><AlertCircle className="size-3" /> Failed</span>
                    )}
                  </div>
                  {status.email === "error" && emailErrorMessage && (
                    <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-mono break-all">
                      <strong>Error Details:</strong> {emailErrorMessage}
                    </div>
                  )}
                </div>

                <Button onClick={handleClose} className="mt-4">Close</Button>
              </div>
            ) : (
              // Discharge form
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Discharge {patient.name}</h2>
                    <p className="text-xs text-muted-foreground">{patient.id} · {patient.ward}</p>
                  </div>
                </div>

                <form onSubmit={handleDischarge} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        Patient Email *
                      </label>
                      <input
                        type="email"
                        name="patientEmail"
                        value={formData.patientEmail}
                        onChange={handleChange}
                        placeholder="patient@email.com"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        Patient Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="patientPhone"
                        value={formData.patientPhone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Final Diagnosis</label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Prescription</label>
                    <textarea
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleChange}
                      className={textareaClass}
                      placeholder="Medication name — dosage — frequency"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Follow-Up Notes</label>
                    <textarea
                      name="followUpNotes"
                      value={formData.followUpNotes}
                      onChange={handleChange}
                      className={textareaClass}
                      placeholder="Post-discharge instructions..."
                      required
                    />
                  </div>

                  <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground text-sm">On submit, the following will happen:</p>
                    <p>📧 Discharge summary with prescription emailed via <strong>Brevo</strong></p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Discharge & Email"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
