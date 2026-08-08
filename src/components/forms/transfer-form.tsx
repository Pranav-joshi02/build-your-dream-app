import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { submitTransferRequestFn } from "@/lib/api";
import { inventory } from "@/lib/hospital-data";

export function TransferForm({ onTransferCreated }: { onTransferCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [formData, setFormData] = useState({
    drug: inventory[0]?.drug || "",
    from_branch: "Central",
    to_branch: "North",
    quantity: 1,
    urgency: "Routine",
    reason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.from_branch === formData.to_branch) {
      alert("Source and destination branches must be different.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitTransferRequestFn({ data: formData });
      
      alert(`Transfer request for ${formData.quantity}x ${formData.drug} submitted successfully.`);
      setOpen(false);
      
      // Reset form
      setFormData({
        drug: inventory[0]?.drug || "",
        from_branch: "Central",
        to_branch: "North",
        quantity: 1,
        urgency: "Routine",
        reason: ""
      });
      
      if (onTransferCreated) {
        onTransferCreated();
      }
    } catch (error) {
      console.error("Failed to submit transfer request:", error);
      alert("Failed to submit transfer request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const textareaClass = "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Request transfer</Button>
      {open && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-popover p-6 rounded-xl border shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Request Medicine Transfer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Medicine</label>
                <select 
                  name="drug" 
                  value={formData.drug} 
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {inventory.map(i => (
                    <option key={i.drug} value={i.drug} className="bg-popover text-foreground">{i.drug}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">From Branch</label>
                  <select 
                    name="from_branch" 
                    value={formData.from_branch} 
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Central" className="bg-popover text-foreground">Central</option>
                    <option value="North" className="bg-popover text-foreground">North</option>
                    <option value="South" className="bg-popover text-foreground">South</option>
                    <option value="East" className="bg-popover text-foreground">East</option>
                    <option value="West" className="bg-popover text-foreground">West</option>
                    <option value="Outpatient Clinic" className="bg-popover text-foreground">Outpatient Clinic</option>
                    <option value="Pediatric Branch" className="bg-popover text-foreground">Pediatric Branch</option>
                    <option value="Emergency Depot" className="bg-popover text-foreground">Emergency Depot</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">To Branch</label>
                  <select 
                    name="to_branch" 
                    value={formData.to_branch} 
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Central" className="bg-popover text-foreground">Central</option>
                    <option value="North" className="bg-popover text-foreground">North</option>
                    <option value="South" className="bg-popover text-foreground">South</option>
                    <option value="East" className="bg-popover text-foreground">East</option>
                    <option value="West" className="bg-popover text-foreground">West</option>
                    <option value="Outpatient Clinic" className="bg-popover text-foreground">Outpatient Clinic</option>
                    <option value="Pediatric Branch" className="bg-popover text-foreground">Pediatric Branch</option>
                    <option value="Emergency Depot" className="bg-popover text-foreground">Emergency Depot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="1"
                    value={formData.quantity} 
                    onChange={handleChange}
                    className={inputClass} 
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Urgency</label>
                  <select 
                    name="urgency" 
                    value={formData.urgency} 
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Routine" className="bg-popover text-foreground">Routine</option>
                    <option value="Urgent" className="bg-popover text-foreground">Urgent</option>
                    <option value="Critical" className="bg-popover text-foreground">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Reason (Optional)</label>
                <textarea 
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={textareaClass} 
                  placeholder="Reason for transfer..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
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

export function RecentTransfers({ transfers }: { transfers: any[] }) {
  if (!transfers || transfers.length === 0) return null;
  return (
    <div className="mt-6 panel p-4 border rounded-xl bg-background">
      <h3 className="text-sm font-semibold mb-3">Recent Transfer Requests</h3>
      <div className="space-y-2">
        {transfers.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-muted/20 text-sm animate-in slide-in-from-bottom-2 duration-200">
            <div>
              <span className="font-medium">{t.quantity}x {t.drug || t.medicine}</span>
              <span className="text-muted-foreground ml-2">from {t.from_branch || t.from} to {t.to_branch || t.to}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${t.urgency === 'Urgent' || t.priority === 'urgent' || t.urgency === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {t.urgency || t.priority || 'Routine'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
