import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { sendWhatsApp, debtMessage } from "@/lib/whatsapp";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Send a WhatsApp debt reminder for one unpaid dues record (requirement 10).
 * Admin only. Degrades gracefully (reports not-sent) when Twilio is unconfigured
 * or the member has no contact number.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (admin?.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await dbConnect();
  const dues = await Dues.findById(id);
  if (!dues) {
    return NextResponse.json({ error: "Dues record not found" }, { status: 404 });
  }
  if (dues.paid) {
    return NextResponse.json(
      { error: "This dues record is already marked paid." },
      { status: 400 }
    );
  }

  const member = await User.findById(dues.member).select(
    "firstname finlandContact phone"
  );
  const contact = member?.finlandContact || member?.phone;
  if (!member || !contact) {
    return NextResponse.json(
      { error: "Member has no contact number on file." },
      { status: 422 }
    );
  }

  const sent = await sendWhatsApp(
    contact,
    debtMessage(
      member.firstname ?? "member",
      dues.amount,
      cap(dues.month),
      dues.year
    )
  );

  return NextResponse.json({
    ok: true,
    sent,
    message: sent
      ? "Reminder sent."
      : "WhatsApp is not configured; reminder was not delivered (logged server-side).",
  });
}
