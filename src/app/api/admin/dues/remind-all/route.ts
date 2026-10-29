import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import {
  sendWhatsAppTemplate,
  sendWhatsApp,
  debtTemplateId,
  debtTemplateVariables,
  debtMessage,
} from "@/lib/whatsapp";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type MemberContact = {
  _id: { toString(): string };
  firstname?: string;
  finlandContact?: string;
  phone?: string;
};

/**
 * Send WhatsApp reminders for ALL outstanding (unpaid) dues (requirement 10).
 * Admin only. Returns a per-outcome summary; degrades gracefully when Twilio is
 * unconfigured or a member lacks a contact number.
 */
export async function POST() {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const unpaid = await Dues.find({ paid: false }).lean();

  if (unpaid.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, total: 0 });
  }

  // Preload member contacts to avoid a query per dues record.
  const memberIds = [...new Set(unpaid.map((d) => String(d.member)))];
  const members = (await User.find({ _id: { $in: memberIds } })
    .select("firstname finlandContact phone")
    .lean()) as unknown as MemberContact[];
  const byId = new Map(members.map((m) => [m._id.toString(), m]));

  let sent = 0;
  let skipped = 0;
  const skippedReasons: Record<string, number> = {};
  const templateSid = debtTemplateId();

  for (const d of unpaid) {
    const member = byId.get(String(d.member));
    const contact = member?.finlandContact || member?.phone;
    if (!contact) {
      skipped++;
      skippedReasons["no-contact"] = (skippedReasons["no-contact"] ?? 0) + 1;
      continue;
    }
    const name = member?.firstname ?? "member";
    let ok = false;
    if (templateSid) {
      const r = await sendWhatsAppTemplate(
        contact,
        templateSid,
        debtTemplateVariables(name, d.amount, cap(d.month), d.year)
      );
      ok = r.sent;
    } else {
      ok = await sendWhatsApp(
        contact,
        debtMessage(name, d.amount, cap(d.month), d.year)
      );
    }
    if (ok) sent++;
    else {
      skipped++;
      const reason = templateSid ? "not-delivered" : "no-template";
      skippedReasons[reason] = (skippedReasons[reason] ?? 0) + 1;
    }
  }

  return NextResponse.json({
    ok: true,
    total: unpaid.length,
    sent,
    skipped,
    skippedReasons,
  });
}
