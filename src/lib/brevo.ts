/**
 * Brevo API integration for sending transactional SMS and Email.
 *
 * Uses the Brevo REST API v3:
 *   - SMS:   POST https://api.brevo.com/v3/transactionalSMS/sms
 *   - Email: POST https://api.brevo.com/v3/smtp/email
 *
 * The API key is read from the BREVO_API_KEY environment variable.
 */

const BREVO_BASE = "https://api.brevo.com/v3";

function getApiKey(): string {
  // In a TanStack Start / Vite project, server-side env vars aren't prefixed
  // with VITE_. We access them through process.env on the server side
  // or import.meta.env when called from a server function.
  const key =
    (typeof process !== "undefined" && process.env?.["BREVO_API_KEY"]) ||
    (import.meta as any).env?.["BREVO_API_KEY"] ||
    "";
  return key;
}

export interface BrevoSmsPayload {
  sender: string;
  recipient: string; // international format, e.g. "+15551234567"
  content: string;
}

export interface BrevoEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { name: string; email: string };
}

export interface BrevoResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a transactional SMS via Brevo.
 */
export async function sendTransferSMS(payload: BrevoSmsPayload): Promise<BrevoResult> {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.warn("[Brevo SMS] No valid API key configured — skipping real send.");
    return { success: true, messageId: "mock-sms-" + Date.now() };
  }

  try {
    const response = await fetch(`${BREVO_BASE}/transactionalSMS/sms`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        type: "transactional",
        sender: payload.sender,
        recipient: payload.recipient,
        content: payload.content,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Brevo SMS] API error:", response.status, errorBody);
      return { success: false, error: `SMS API error ${response.status}: ${errorBody}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId ?? data.reference };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Brevo SMS] Network error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send a transactional email via Brevo.
 */
export async function sendTransferEmail(payload: BrevoEmailPayload): Promise<BrevoResult> {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === "your_brevo_api_key_here") {
    console.warn("[Brevo Email] No valid API key configured — skipping real send.");
    return { success: true, messageId: "mock-email-" + Date.now() };
  }

  try {
    const response = await fetch(`${BREVO_BASE}/smtp/email`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: payload.sender ?? {
          name: "HospitalOS Pharmacy",
          email: "pharmacy@hospitalos.app",
        },
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Brevo Email] API error:", response.status, errorBody);
      return { success: false, error: `Email API error ${response.status}: ${errorBody}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Brevo Email] Network error:", message);
    return { success: false, error: message };
  }
}
