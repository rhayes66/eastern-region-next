import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
// Approved WhatsApp template for proactive debt reminders (requirement 10).
// WhatsApp rejects free-form messages sent outside the 24-hour customer-service
// window, so proactive reminders MUST use an approved template referenced by
// its Content SID. Configure these once the template is approved in Twilio.
const debtTemplateSid = process.env.TWILIO_DEBT_TEMPLATE_SID; // HX...

const client = sid && token ? twilio(sid, token) : null;

export type WhatsAppResult = {
  sent: boolean;
  reason?: "not-configured" | "no-template" | "send-failed";
};

function normalize(to: string): string {
  return to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
}

/**
 * Send a free-form WhatsApp message. Valid only INSIDE the 24h customer-service
 * window (i.e. a reply to a member-initiated message). For proactive outreach
 * use sendWhatsAppTemplate instead.
 */
export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  if (!client || !from) {
    console.warn("[whatsapp] Twilio not configured — skipping message to", to);
    return false;
  }
  try {
    await client.messages.create({ from, to: normalize(to), body });
    return true;
  } catch (err) {
    console.error("[whatsapp] send failed:", err);
    return false;
  }
}

/**
 * Send a PROACTIVE WhatsApp message using an approved template (Content SID +
 * variables). This is the compliant path for debt reminders sent outside the
 * 24h window. Degrades gracefully: reports a reason instead of throwing when
 * Twilio or the template is not configured.
 */
export async function sendWhatsAppTemplate(
  to: string,
  contentSid: string,
  contentVariables: Record<string, string>
): Promise<WhatsAppResult> {
  if (!client || !from) {
    console.warn("[whatsapp] Twilio not configured — skipping template to", to);
    return { sent: false, reason: "not-configured" };
  }
  try {
    await client.messages.create({
      from,
      to: normalize(to),
      contentSid,
      contentVariables: JSON.stringify(contentVariables),
    });
    return { sent: true };
  } catch (err) {
    console.error("[whatsapp] template send failed:", err);
    return { sent: false, reason: "send-failed" };
  }
}

/** The approved debt-reminder template's Content SID (or undefined). */
export function debtTemplateId(): string | undefined {
  return debtTemplateSid;
}

/**
 * Ordered content variables for the debt-reminder template. The approved
 * template body should read e.g.:
 *   "Hello {{1}}, your {{2}} {{3}} GERAF dues of €{{4}} are outstanding..."
 */
export function debtTemplateVariables(
  name: string,
  amount: number,
  month: string,
  year: string
): Record<string, string> {
  return {
    "1": name,
    "2": month,
    "3": year,
    "4": amount.toFixed(2),
  };
}

/** Free-form fallback body (used only within the 24h window / for logging). */
export function debtMessage(
  name: string,
  amount: number,
  month: string,
  year: string
): string {
  return (
    `Hello ${name}, this is a reminder from GERAF (Ghana Eastern Region Association Finland). ` +
    `Your ${month} ${year} dues of €${amount.toFixed(2)} are still outstanding. ` +
    `Please arrange payment at your earliest convenience. Thank you.`
  );
}
