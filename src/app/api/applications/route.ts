import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { MemberApplication } from "@/models/MemberApplication";
import { applicationSchema } from "@/lib/validation";

/**
 * Public endpoint (requirement 7): anyone can submit a membership application.
 * Stored with status "Pending" for admin review (requirement 2).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  await dbConnect();

  // Guard against obvious duplicate submissions by the same email while Pending
  const { email } = parsed.data;
  if (email) {
    const existing = await MemberApplication.findOne({
      "yourDetails.email": email.toLowerCase(),
      status: "Pending",
    });
    if (existing) {
      return NextResponse.json(
        { error: "An application with this email is already pending review." },
        { status: 409 }
      );
    }
  }

  const application = await MemberApplication.create({
    yourDetails: parsed.data,
    status: "Pending",
    applicationDate: new Date(),
  });

  return NextResponse.json(
    { id: application._id.toString(), status: application.status },
    { status: 201 }
  );
}
