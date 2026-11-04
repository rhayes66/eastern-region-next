import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const from = process.env.EMAIL_FROM ?? "GERAF <no-reply@geraf.org>";

const transporter =
  host && user
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    : null;

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter) {
    console.warn("[email] SMTP not configured — would have sent to", to, "subj:", subject);
    return false;
  }
  try {
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export function passwordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px">
      <h2>Reset your GERAF password</h2>
      <p>Click the button below to set a new password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#15803d;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>`;
}

/**
 * Escape HTML special characters so user-supplied values (e.g. an applicant's
 * name from the public form) cannot inject markup/links into our emails.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function applicationStatusEmail(name: string, accepted: boolean): string {
  const safeName = escapeHtml(name);
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return accepted
    ? `<div style="font-family:sans-serif"><h2>Welcome to GERAF, ${safeName}!</h2><p>Your membership application has been <b>accepted</b>. You can now <a href="${base}/login">log in</a> with the email and password you chose, or sign in with Google.</p><p>Forgot your password? <a href="${base}/forgot-password">Reset it here</a>.</p></div>`
    : `<div style="font-family:sans-serif"><h2>GERAF application update</h2><p>Dear ${safeName}, after review your application was not accepted at this time. Please contact the association for details.</p></div>`;
}

import { CONTACT_DETAILS } from "@/lib/executives";

/** Email sent to the association when a visitor uses the contact form. */
export function contactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): string {
  const n = escapeHtml(name);
  const e = escapeHtml(email);
  const s = escapeHtml(subject);
  const m = escapeHtml(message).replace(/\n/g, "<br>");
  return `<div style="font-family:sans-serif;max-width:560px">
    <h2>New contact message</h2>
    <p><b>From:</b> ${n} &lt;${e}&gt;</p>
    <p><b>Subject:</b> ${s}</p>
    <hr><p>${m}</p></div>`;
}

/** Where contact-form messages are delivered. Falls back to the published address. */
export const CONTACT_INBOX = process.env.CONTACT_INBOX || CONTACT_DETAILS.email;
