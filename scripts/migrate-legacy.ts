/**
 * Legacy → new database migration (MongoDB → MongoDB).
 * -------------------------------------------------------------------------
 * Copies members, dues/contributions and events from the OLD GERAF database
 * into this app's NEW schema. It READS the old DB with the raw driver (so it
 * needs no knowledge of the old models) and WRITES through this app's Mongoose
 * models, so every inserted document is validated against the current schema.
 *
 * SAFETY
 *  - DRY RUN by default: prints what it WOULD do and writes nothing. Pass
 *    `--commit` to actually write.
 *  - Idempotent: re-running updates existing records (matched by email for
 *    users, by member+month+year for dues) instead of duplicating.
 *  - Read-only on the old DB. Never drops or modifies the source.
 *  - Always test against a COPY of the new DB before pointing it at prod.
 *
 * USAGE
 *   # 1. dry run (default) — shows the mapping, writes nothing
 *   OLD_MONGODB_URI="mongodb+srv://…/olddb" \
 *   MONGODB_URI="mongodb+srv://…/newdb" \
 *     npx tsx scripts/migrate-legacy.ts
 *
 *   # 2. real run
 *   OLD_MONGODB_URI="…" MONGODB_URI="…" \
 *     npx tsx scripts/migrate-legacy.ts --commit
 *
 * ⚠️  FIELD MAPPING: the three `map*` functions below assume likely old field
 *     names. CONFIRM them against a real exported sample and adjust before a
 *     committed run — a wrong name silently drops that field.
 *
 * NOTE ON PASSWORDS: legacy password hashes are NOT copied (the old app's
 * hashing differs from this app's bcrypt pre-save hook). Imported members have
 * no password and must use the forgot-password flow or Google sign-in. See
 * `LEGACY_PASSWORD_NOTE` handling below.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

import { dbConnect } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dues } from "../src/models/Dues";
import { Event } from "../src/models/Event";
import { MONTHS, DUES_TYPES, ROLES } from "../src/lib/constants";

const COMMIT = process.argv.includes("--commit");

// -------------------------------------------------------------------------
// Old collection names — adjust if the old DB uses different names.
// -------------------------------------------------------------------------
const OLD_COLLECTIONS = {
  users: "users",
  dues: "dues", // might be "contributions" in the old app
  events: "events",
};

// A loose shape for old documents — we read untyped and map explicitly.
type OldDoc = Record<string, unknown>;

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
const str = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};
const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const bool = (v: unknown): boolean => v === true || v === "true" || v === 1 || v === "1";

/** Normalise a month into this app's lowercase enum (jan…dec). Accepts a name
 *  ("January"/"jan") or a 1–12 number. Returns undefined if unrecognised. */
function normaliseMonth(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const asNum = Number(v);
  if (Number.isInteger(asNum) && asNum >= 1 && asNum <= 12) return MONTHS[asNum - 1];
  const s = String(v).trim().toLowerCase();
  const full = MONTHS.find((m) => m === s);
  if (full) return full;
  const byPrefix = MONTHS.find((m) => m.startsWith(s.slice(0, 3)));
  return byPrefix;
}

/** Map an old role value into this app's ROLES enum. */
function normaliseRole(v: unknown): (typeof ROLES)[number] {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "admin") return "Admin";
  if (s === "member" || s === "active") return "Member";
  return "Pending";
}

// -------------------------------------------------------------------------
// FIELD MAPPINGS — the part to verify against a real sample.
// Each maps one old document to the new model's field shape.
// -------------------------------------------------------------------------

/** Old member/user → new User fields (no password; see note above). */
function mapUser(old: OldDoc) {
  return {
    email: str(old.email)?.toLowerCase(),
    phone: str(old.phone) ?? str(old.phoneNumber),
    finlandContact: str(old.finlandContact) ?? str(old.contact),
    title: str(old.title),
    firstname: str(old.firstname) ?? str(old.firstName) ?? str(old.fname),
    lastname: str(old.lastname) ?? str(old.lastName) ?? str(old.surname),
    gender: str(old.gender),
    dateOfBirth: str(old.dateOfBirth) ?? str(old.dob),
    children: str(old.children),
    fathersname: str(old.fathersname) ?? str(old.fatherName),
    mothersname: str(old.mothersname) ?? str(old.motherName),
    spousename: str(old.spousename) ?? str(old.spouseName),
    nextkin: str(old.nextkin) ?? str(old.nextOfKin),
    nextkinContact: str(old.nextkinContact) ?? str(old.nextOfKinContact),
    occupation: str(old.occupation),
    address: str(old.address),
    postalCode: str(old.postalCode) ?? str(old.postcode),
    city: str(old.city),
    ghanacity: str(old.ghanacity) ?? str(old.hometown) ?? str(old.homeTown),
    picture: str(old.picture) ?? str(old.photo),
    role: normaliseRole(old.role),
  };
}

/** Old dues/contribution → new Dues fields. Returns null if unmappable. */
function mapDues(old: OldDoc, memberId: mongoose.Types.ObjectId) {
  const month = normaliseMonth(old.month);
  const year = str(old.year) ?? str(old.yr);
  const amount = num(old.amount) ?? num(old.value);
  if (!month || !year || amount === undefined) return null; // required fields

  const rawType = str(old.duesType) ?? str(old.type) ?? "Monthly";
  const duesType =
    (DUES_TYPES as readonly string[]).find(
      (t) => t.toLowerCase() === rawType.toLowerCase()
    ) ?? "Monthly";

  return {
    member: memberId,
    category: str(old.category),
    amount,
    description: str(old.description),
    month,
    year,
    duesType,
    paid: bool(old.paid ?? old.isPaid),
    paidDate: old.paidDate ? new Date(old.paidDate as string) : undefined,
    addedDate: old.addedDate ? new Date(old.addedDate as string) : new Date(),
  };
}

/** Old event → new Event fields. Returns null if no title/startDate. */
function mapEvent(old: OldDoc) {
  const title = str(old.title) ?? str(old.name);
  const startRaw = old.startDate ?? old.date ?? old.start;
  if (!title || !startRaw) return null;
  return {
    title,
    eventType: str(old.eventType) ?? str(old.type) ?? "Meeting",
    description: str(old.description),
    location: str(old.location) ?? str(old.venue),
    startDate: new Date(startRaw as string),
    endDate: old.endDate ? new Date(old.endDate as string) : undefined,
  };
}

// -------------------------------------------------------------------------
// Migration
// -------------------------------------------------------------------------
async function main() {
  const oldUri = process.env.OLD_MONGODB_URI;
  const newUri = process.env.MONGODB_URI;
  if (!oldUri) throw new Error("Set OLD_MONGODB_URI (source database).");
  if (!newUri) throw new Error("Set MONGODB_URI (target/new database).");
  if (oldUri === newUri) throw new Error("OLD_MONGODB_URI and MONGODB_URI must differ.");

  console.log(COMMIT ? "=== COMMIT RUN (writes enabled) ===" : "=== DRY RUN (no writes) ===");

  // Source: raw driver (read-only, no models).
  const oldClient = new MongoClient(oldUri);
  await oldClient.connect();
  const oldDb = oldClient.db(); // db from the URI

  // Target: this app's Mongoose connection + validated models.
  await dbConnect();

  const stats = {
    users: { read: 0, written: 0, skipped: 0 },
    dues: { read: 0, written: 0, skipped: 0 },
    events: { read: 0, written: 0, skipped: 0 },
  };

  // Maps an old user's _id → the new User _id, so dues can be re-linked.
  const idByOldUser = new Map<string, mongoose.Types.ObjectId>();
  // Maps old email → new User _id, as a fallback link for dues.
  const idByEmail = new Map<string, mongoose.Types.ObjectId>();

  // ---- Users --------------------------------------------------------------
  const oldUsers = await oldDb.collection(OLD_COLLECTIONS.users).find({}).toArray();
  for (const old of oldUsers) {
    stats.users.read++;
    const doc = mapUser(old);
    if (!doc.email && !doc.phone) {
      stats.users.skipped++;
      console.warn("  skip user (no email or phone):", String(old._id));
      continue;
    }

    if (!COMMIT) {
      stats.users.written++; // would-write
      const fakeId = new mongoose.Types.ObjectId();
      idByOldUser.set(String(old._id), fakeId);
      if (doc.email) idByEmail.set(doc.email, fakeId);
      continue;
    }

    // Idempotent upsert by email (or phone when no email).
    const query = doc.email ? { email: doc.email } : { phone: doc.phone };
    const existing = await User.findOne(query);
    let saved;
    if (existing) {
      existing.set(doc);
      saved = await existing.save();
    } else {
      saved = await User.create(doc);
    }
    stats.users.written++;
    idByOldUser.set(String(old._id), saved._id);
    if (doc.email) idByEmail.set(doc.email, saved._id);
  }

  // ---- Dues ---------------------------------------------------------------
  const oldDues = await oldDb.collection(OLD_COLLECTIONS.dues).find({}).toArray();
  for (const old of oldDues) {
    stats.dues.read++;
    // Re-link to the migrated member: try old member id, then old email.
    const oldMemberId = String(old.member ?? old.userId ?? old.user ?? "");
    const oldEmail = str(old.email)?.toLowerCase();
    const memberId =
      idByOldUser.get(oldMemberId) ?? (oldEmail ? idByEmail.get(oldEmail) : undefined);

    if (!memberId) {
      stats.dues.skipped++;
      console.warn("  skip dues (member not found):", String(old._id));
      continue;
    }
    const doc = mapDues(old, memberId);
    if (!doc) {
      stats.dues.skipped++;
      console.warn("  skip dues (missing month/year/amount):", String(old._id));
      continue;
    }

    if (!COMMIT) {
      stats.dues.written++;
      continue;
    }
    // Idempotent on the unique (member, month, year) index.
    await Dues.updateOne(
      { member: doc.member, month: doc.month, year: doc.year },
      { $set: doc },
      { upsert: true }
    );
    stats.dues.written++;
  }

  // ---- Events -------------------------------------------------------------
  try {
    const oldEvents = await oldDb.collection(OLD_COLLECTIONS.events).find({}).toArray();
    for (const old of oldEvents) {
      stats.events.read++;
      const doc = mapEvent(old);
      if (!doc) {
        stats.events.skipped++;
        console.warn("  skip event (missing title/startDate):", String(old._id));
        continue;
      }
      if (!COMMIT) {
        stats.events.written++;
        continue;
      }
      // Idempotent on (title, startDate).
      await Event.updateOne(
        { title: doc.title, startDate: doc.startDate },
        { $set: doc },
        { upsert: true }
      );
      stats.events.written++;
    }
  } catch {
    console.log("  (no events collection in old DB — skipping events)");
  }

  // ---- Report -------------------------------------------------------------
  console.log("\n--- Summary ---");
  console.table(stats);
  if (!COMMIT) {
    console.log("\nDRY RUN complete. Re-run with --commit to write.");
    console.log("⚠️  Verify the map* field names against the printed skips first.");
  } else {
    console.log("\nCOMMIT complete.");
    console.log(
      "Reminder: imported members have NO password — notify them to use" +
        " 'Forgot password' or Google sign-in to gain access."
    );
  }

  await oldClient.close();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
