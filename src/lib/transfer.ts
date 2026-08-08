import { z } from "zod";
import { sendTransferSMS, sendTransferEmail } from "./brevo";

/**
 * Zod schema for pharmacy transfer requests.
 */
export const transferSchema = z.object({
  medicine: z.string().min(1, "Medicine is required"),
  fromBranch: z.enum(["Central", "North", "South"], { required_error: "Source branch is required" }),
  toBranch: z.enum(["Central", "North", "South"], { required_error: "Destination branch is required" }),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  priority: z.enum(["urgent", "normal"]),
  recipientPhone: z.string().min(5, "Phone number is required"),
  recipientEmail: z.string().email("A valid email is required"),
  notes: z.string().optional(),
});

export type TransferFormData = z.infer<typeof transferSchema>;

export interface TransferResult {
  success: boolean;
  transferId: string;
  smsResult: { success: boolean; error?: string };
  emailResult: { success: boolean; error?: string };
  error?: string;
}

/**
 * Process a pharmacy transfer request:
 * 1. Validate the data
 * 2. Send SMS notification via Brevo
 * 3. Send email confirmation via Brevo
 * 4. Return results
 */
export async function processTransfer(data: TransferFormData): Promise<TransferResult> {
  // Validate
  const parsed = transferSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      transferId: "",
      smsResult: { success: false },
      emailResult: { success: false },
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const transfer = parsed.data;
  const transferId = `TF-${Date.now().toString(36).toUpperCase()}`;
  const priorityLabel = transfer.priority === "urgent" ? "🔴 URGENT" : "🟢 Normal";

  // 1. Send SMS
  const smsContent =
    `HospitalOS: Transfer ${transferId} — ` +
    `${transfer.quantity}x ${transfer.medicine} from ${transfer.fromBranch} → ${transfer.toBranch}. ` +
    `Priority: ${transfer.priority.toUpperCase()}.` +
    (transfer.notes ? ` Notes: ${transfer.notes}` : "");

  const smsResult = await sendTransferSMS({
    sender: "HospitalOS",
    recipient: transfer.recipientPhone,
    content: smsContent,
  });

  // 2. Send Email
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">⚕️ Pharmacy Transfer Request</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">Transfer ID: ${transferId}</p>
      </div>
      <div style="background: #f8fafc; padding: 24px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b; width: 140px;">Medicine</td>
            <td style="padding: 10px 0; font-weight: 600;">${transfer.medicine}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">Quantity</td>
            <td style="padding: 10px 0; font-weight: 600;">${transfer.quantity} units</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">From</td>
            <td style="padding: 10px 0;">${transfer.fromBranch} Branch</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">To</td>
            <td style="padding: 10px 0;">${transfer.toBranch} Branch</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; color: #64748b;">Priority</td>
            <td style="padding: 10px 0; font-weight: 600;">${priorityLabel}</td>
          </tr>
          ${transfer.notes ? `
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Notes</td>
            <td style="padding: 10px 0;">${transfer.notes}</td>
          </tr>` : ""}
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
          This is an automated notification from HospitalOS Pharmacy Network.
        </p>
      </div>
    </div>
  `;

  const emailResult = await sendTransferEmail({
    to: [{ email: transfer.recipientEmail }],
    subject: `[HospitalOS] Pharmacy Transfer ${transferId} — ${transfer.medicine} (${transfer.priority.toUpperCase()})`,
    htmlContent,
  });

  return {
    success: true,
    transferId,
    smsResult: { success: smsResult.success, ...(smsResult.error !== undefined && { error: smsResult.error }) },
    emailResult: { success: emailResult.success, ...(emailResult.error !== undefined && { error: emailResult.error }) },
  };
}
