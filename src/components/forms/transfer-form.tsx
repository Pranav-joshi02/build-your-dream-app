import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { inventory } from "@/lib/hospital-data";
import { processTransfer, type TransferFormData } from "@/lib/transfer";
import {
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Package,
  MapPin,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const branches = ["Central", "North", "South"] as const;

interface TransferRecord {
  id: string;
  medicine: string;
  from: string;
  to: string;
  quantity: number;
  priority: "urgent" | "normal";
  timestamp: Date;
  smsOk: boolean;
  emailOk: boolean;
}

interface FormErrors {
  medicine?: string;
  fromBranch?: string;
  toBranch?: string;
  quantity?: string;
  recipientPhone?: string;
  recipientEmail?: string;
}

export function TransferForm({
  onTransferComplete,
}: {
  onTransferComplete?: (record: TransferRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [medicine, setMedicine] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<"urgent" | "normal">("normal");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Selected drug info
  const selectedDrug = useMemo(
    () => inventory.find((i) => i.drug === medicine),
    [medicine],
  );

  // First critical drug for auto-select hint
  const firstCritical = useMemo(
    () => inventory.find((i) => i.status === "critical"),
    [],
  );

  const getStockForBranch = (branch: string) => {
    if (!selectedDrug) return null;
    switch (branch) {
      case "Central": return selectedDrug.main;
      case "North": return selectedDrug.north;
      case "South": return selectedDrug.south;
      default: return null;
    }
  };

  const resetForm = () => {
    setMedicine("");
    setFromBranch("");
    setToBranch("");
    setQuantity(1);
    setPriority("normal");
    setRecipientPhone("");
    setRecipientEmail("");
    setNotes("");
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!medicine) errs.medicine = "Select a medicine";
    if (!fromBranch) errs.fromBranch = "Select source branch";
    if (!toBranch) errs.toBranch = "Select destination branch";
    if (fromBranch && toBranch && fromBranch === toBranch)
      errs.toBranch = "Must differ from source";
    if (quantity < 1) errs.quantity = "Minimum 1 unit";
    const sourceStock = getStockForBranch(fromBranch);
    if (sourceStock !== null && quantity > sourceStock)
      errs.quantity = `Only ${sourceStock} available at ${fromBranch}`;
    if (!recipientPhone || recipientPhone.length < 5)
      errs.recipientPhone = "Enter a valid phone number";
    if (!recipientEmail || !recipientEmail.includes("@"))
      errs.recipientEmail = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const data: TransferFormData = {
        medicine,
        fromBranch: fromBranch as "Central" | "North" | "South",
        toBranch: toBranch as "Central" | "North" | "South",
        quantity,
        priority,
        recipientPhone,
        recipientEmail,
        notes: notes || undefined,
      };

      const result = await processTransfer(data);

      if (result.success) {
        const notifications: string[] = [];
        if (result.smsResult.success) notifications.push("SMS sent");
        if (result.emailResult.success) notifications.push("Email sent");

        toast.success(`Transfer ${result.transferId} created`, {
          description: `${quantity}× ${medicine}: ${fromBranch} → ${toBranch}. ${notifications.join(" · ")}`,
          duration: 6000,
        });

        onTransferComplete?.({
          id: result.transferId,
          medicine,
          from: fromBranch,
          to: toBranch,
          quantity,
          priority,
          timestamp: new Date(),
          smsOk: result.smsResult.success,
          emailOk: result.emailResult.success,
        });

        resetForm();
        setOpen(false);
      } else {
        toast.error("Transfer failed", {
          description: result.error ?? "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Transfer failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" id="request-transfer-btn">
          <ArrowRightLeft className="mr-1.5 size-4" />
          Request transfer
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <ArrowRightLeft className="size-4 text-primary" />
            </div>
            New Transfer Request
          </DialogTitle>
          <DialogDescription>
            Transfer medicine between branches. SMS and email confirmations are sent
            via Brevo on submission.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Medicine Select */}
          <div className="space-y-2">
            <Label htmlFor="transfer-medicine" className="flex items-center gap-1.5">
              <Package className="size-3.5 text-muted-foreground" />
              Medicine
            </Label>
            <Select value={medicine} onValueChange={setMedicine}>
              <SelectTrigger id="transfer-medicine" className={errors.medicine ? "border-destructive" : ""}>
                <SelectValue placeholder="Select medicine to transfer" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.drug} value={item.drug}>
                    <span className="flex items-center gap-2">
                      {item.drug}
                      {item.status === "critical" && (
                        <span className="inline-block rounded bg-critical/15 px-1.5 py-0.5 text-[10px] font-semibold text-critical">
                          CRITICAL
                        </span>
                      )}
                      {item.status === "warning" && (
                        <span className="inline-block rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                          LOW
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medicine && <p className="text-xs text-destructive">{errors.medicine}</p>}
            {firstCritical && !medicine && (
              <button
                type="button"
                onClick={() => setMedicine(firstCritical.drug)}
                className="text-xs text-primary hover:underline"
              >
                Quick: auto-fill {firstCritical.drug} (critical)
              </button>
            )}
          </div>

          {/* Branch selection row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-from" className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                From branch
              </Label>
              <Select value={fromBranch} onValueChange={setFromBranch}>
                <SelectTrigger id="transfer-from" className={errors.fromBranch ? "border-destructive" : ""}>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b} disabled={b === toBranch}>
                      {b}
                      {selectedDrug && (
                        <span className="ml-2 text-muted-foreground">
                          ({b === "Central" ? selectedDrug.main : b === "North" ? selectedDrug.north : selectedDrug.south} units)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromBranch && <p className="text-xs text-destructive">{errors.fromBranch}</p>}
              {fromBranch && selectedDrug && (
                <p className="text-xs text-muted-foreground">
                  Stock at {fromBranch}: <span className="font-mono font-semibold">{getStockForBranch(fromBranch)}</span> units
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-to" className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                To branch
              </Label>
              <Select value={toBranch} onValueChange={setToBranch}>
                <SelectTrigger id="transfer-to" className={errors.toBranch ? "border-destructive" : ""}>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b} disabled={b === fromBranch}>
                      {b}
                      {selectedDrug && (
                        <span className="ml-2 text-muted-foreground">
                          ({b === "Central" ? selectedDrug.main : b === "North" ? selectedDrug.north : selectedDrug.south} units)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toBranch && <p className="text-xs text-destructive">{errors.toBranch}</p>}
            </div>
          </div>

          {/* Quantity + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity (units)</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min={1}
                max={getStockForBranch(fromBranch) ?? 9999}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-muted-foreground" />
                Priority
              </Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as "urgent" | "normal")}
                className="flex gap-4 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="urgent" id="priority-urgent" />
                  <Label htmlFor="priority-urgent" className="cursor-pointer text-sm font-normal text-critical">
                    Urgent
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="normal" id="priority-normal" />
                  <Label htmlFor="priority-normal" className="cursor-pointer text-sm font-normal">
                    Normal
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Notification contacts */}
          <div className="space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Brevo Notifications
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-phone" className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  SMS to
                </Label>
                <Input
                  id="transfer-phone"
                  type="tel"
                  placeholder="+1 555 012 3456"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className={errors.recipientPhone ? "border-destructive" : ""}
                />
                {errors.recipientPhone && (
                  <p className="text-xs text-destructive">{errors.recipientPhone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email to
                </Label>
                <Input
                  id="transfer-email"
                  type="email"
                  placeholder="pharmacist@hospital.org"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={errors.recipientEmail ? "border-destructive" : ""}
                />
                {errors.recipientEmail && (
                  <p className="text-xs text-destructive">{errors.recipientEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Notes (optional)</Label>
            <Textarea
              id="transfer-notes"
              placeholder="e.g., 2 ICU patients on active courses — needs immediate dispatch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setOpen(false); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-[140px]">
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <ArrowRightLeft className="mr-1.5 size-4" />
                  Submit Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A minimal table showing recent transfers.
 */
export function RecentTransfers({ transfers }: { transfers: TransferRecord[] }) {
  if (transfers.length === 0) return null;

  return (
    <div className="panel overflow-x-auto p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Recent Transfers
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 font-medium">ID</th>
            <th className="py-2 font-medium">Medicine</th>
            <th className="py-2 font-medium">Route</th>
            <th className="py-2 font-medium">Qty</th>
            <th className="py-2 font-medium">Priority</th>
            <th className="py-2 font-medium">Notifications</th>
            <th className="py-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className="border-t border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 font-mono text-xs">{t.id}</td>
              <td className="py-3 font-medium">{t.medicine}</td>
              <td className="py-3 text-muted-foreground">
                {t.from} → {t.to}
              </td>
              <td className="py-3 font-mono">{t.quantity}</td>
              <td className="py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    t.priority === "urgent"
                      ? "bg-critical/12 text-critical"
                      : "bg-primary/12 text-primary"
                  }`}
                >
                  {t.priority === "urgent" ? "Urgent" : "Normal"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs">
                    {t.smsOk ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : (
                      <AlertCircle className="size-3.5 text-destructive" />
                    )}
                    SMS
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    {t.emailOk ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : (
                      <AlertCircle className="size-3.5 text-destructive" />
                    )}
                    Email
                  </span>
                </div>
              </td>
              <td className="py-3 text-xs text-muted-foreground">
                {t.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
