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

export function applicationStatusEmail(name: string, accepted: boolean): string {
  return accepted
    ? `<div style="font-family:sans-serif"><h2>Welcome to GERAF, ${name}!</h2><p>Your membership application has been <b>accepted</b>. You can now log in and view your profile.</p></div>`
    : `<div style="font-family:sans-serif"><h2>GERAF application update</h2><p>Dear ${name}, after review your application was not accepted at this time. Please contact the association for details.</p></div>`;
}
