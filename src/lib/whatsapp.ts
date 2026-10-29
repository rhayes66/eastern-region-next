import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

const client = sid && token ? twilio(sid, token) : null;

/**
 * Send a WhatsApp message to a member. `to` must be an E.164 number
 * (e.g. +358401234567); the whatsapp: prefix is added here.
 * Returns false (and logs) if Twilio is not configured, so callers degrade
 * gracefully instead of throwing.
 */
export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  if (!client || !from) {
    console.warn("[whatsapp] Twilio not configured — skipping message to", to);
    return false;
  }
  const normalized = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  try {
    await client.messages.create({ from, to: normalized, body });
    return true;
  } catch (err) {
    console.error("[whatsapp] send failed:", err);
    return false;
  }
}

export function debtMessage(name: string, amount: number, month: string, year: string): string {
  return (
    `Hello ${name}, this is a reminder from GERAF (Ghana Eastern Region Association Finland). ` +
    `Your ${month} ${year} dues of €${amount.toFixed(2)} are still outstanding. ` +
    `Please arrange payment at your earliest convenience. Thank you.`
  );
}
