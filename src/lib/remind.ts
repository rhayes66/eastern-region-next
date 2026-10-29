import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { User } from "@/models/User";
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

export type RemindAllResult = {
  total: number;
  sent: number;
  skipped: number;
  skippedReasons: Record<string, number>;
};

/**
 * Send WhatsApp reminders for every outstanding (unpaid) dues record
 * (requirement 10). Shared by the admin action and the scheduled cron. Uses the
 * approved template when configured, else a free-form fallback; degrades
 * gracefully and reports a per-outcome summary.
 */
export async function remindAllOutstanding(): Promise<RemindAllResult> {
  await dbConnect();
  const unpaid = await Dues.find({ paid: false }).lean();
  if (unpaid.length === 0) {
    return { total: 0, sent: 0, skipped: 0, skippedReasons: {} };
  }

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

  return { total: unpaid.length, sent, skipped, skippedReasons };
}
