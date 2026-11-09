/**
 * Legacy → new database migration (GERAF mongodump → new MongoDB).
 * -------------------------------------------------------------------------
 * Copies members and dues/contributions from a GERAF `mongodump` directory
 * (the `.bson` files, no running Mongo required) into this app's NEW schema.
 * It READS the dump `.bson` files directly with the `bson` parser and WRITES
 * through this app's Mongoose models, so every inserted document is validated
 * against the current schema.
 *
 * SAFETY
 *  - DRY RUN by default: prints what it WOULD do and writes nothing. Pass
 *    `--commit` to actually write.
 *  - Idempotent: re-running updates existing records (matched by email/phone
 *    for users, by member+month+year for dues) instead of duplicating.
 *  - Read-only on the source: it only reads the dump files, never writes them.
 *  - Always test against a COPY of the new DB before pointing it at prod.
 *
 * USAGE
 *   # 1. dry run (default) — shows the mapping, writes nothing
 *   LEGACY_DUMP_DIR="~/legacy-dump/geraf" \
 *   MONGODB_URI="mongodb+srv://…/newdb" \
 *     npx tsx scripts/migrate-legacy.ts
 *
 *   # 2. real run
 *   LEGACY_DUMP_DIR="~/legacy-dump/geraf" MONGODB_URI="…" \
 *     npx tsx scripts/migrate-legacy.ts --commit
 *
 *   LEGACY_DUMP_DIR must point at the directory that CONTAINS the collection
 *   .bson files (e.g. the `geraf/` folder with users.bson, dues.bson). A
 *   leading `~` is expanded to the home directory.
 *
 * FIELD MAPPING: the `map*` functions below are tuned to the real GERAF schema
 * (verified against an exported sample): members live in `users`, next-of-kin
 * name is `nextking` and relationship is `nextkin`, dues `paid` is derived from
 * `paidDate`. `memberapplications` (a subset of `users` plus test rows) and
 * `passwordresets` (ephemeral) are intentionally NOT migrated.
 *
 * NOTE ON PASSWORDS: the legacy GERAF app already hashes passwords with the
 * SAME scheme this app uses (bcrypt, $2a$10$…), so existing hashes ARE copied
 * verbatim. The copy must bypass this app's pre-save hook, which would re-hash
 * an already-hashed value and break login (double bcrypt). We therefore write
 * the hash with an unhook'd path (markModified reset) so imported members keep
 * their current password. Members with no legacy password simply have none and
 * use forgot-password / Google. Legacy "Pending" stubs with no email/phone are
 * skipped entirely.
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { homedir } from "node:os";
import mongoose from "mongoose";
import { deserialize } from "bson";

import { dbConnect } from "../src/lib/db";
import { User } from "../src/models/User";
import { Dues } from "../src/models/Dues";
import { Event } from "../src/models/Event";
import { MONTHS, DUES_TYPES, ROLES } from "../src/lib/constants";

const COMMIT = process.argv.includes("--commit");

// -------------------------------------------------------------------------
// Old collection names — adjust if the old DB uses different names.
// -------------------------------------------------------------------------
// The old GERAF database (db name "geraf") holds: users, dues,
// memberapplications, passwordresets. There is NO events collection.
// Member identity lives IN `users` (not in memberapplications), so we migrate
// users + dues only. passwordresets are ephemeral and intentionally ignored.
const OLD_COLLECTIONS = {
  users: "users",
  dues: "dues",
  events: "events", // absent in GERAF — handled gracefully if missing
};

// Accounts found in the legacy DB that are NOT real members (test/junk or
// suspected hostile signups, incl. two with Admin role). Never migrate these.
const BLOCKED_EMAILS = new Set(
  (process.env.MIGRATE_BLOCKED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

// A loose shape for old documents — we read untyped and map explicitly.
type OldDoc = Record<string, unknown>;

// -------------------------------------------------------------------------
// Dump reader — parse a mongodump `.bson` file into documents, with no running
// Mongo. A BSON file is a back-to-back sequence of documents, each prefixed
// with its own 4-byte little-endian length. (Same walk as inspect-dump.ts.)
// -------------------------------------------------------------------------
function expandHome(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function resolveDumpDir(): string {
  const raw = process.env.LEGACY_DUMP_DIR;
  if (!raw) throw new Error("Set LEGACY_DUMP_DIR (the mongodump directory that contains the .bson files).");
  const dir = expandHome(raw);
  const abs = isAbsolute(dir) ? dir : join(process.cwd(), dir);
  if (!existsSync(abs)) throw new Error(`LEGACY_DUMP_DIR does not exist: ${abs}`);
  return abs;
}

/** Read `<dumpDir>/<collection>.bson` into an array of documents. Returns an
 *  empty array (not an error) when the file is absent, so an optional
 *  collection like `events` is simply skipped. */
function readBsonCollection(dumpDir: string, collection: string): OldDoc[] {
  const file = join(dumpDir, `${collection}.bson`);
  if (!existsSync(file)) return [];
  const buf = readFileSync(file);
  const docs: OldDoc[] = [];
  let offset = 0;
  while (offset < buf.length) {
    const size = buf.readInt32LE(offset);
    if (size <= 0 || offset + size > buf.length) break;
    const slice = buf.subarray(offset, offset + size);
    docs.push(deserialize(slice) as OldDoc);
    offset += size;
  }
  return docs;
}

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

// A legacy bcrypt hash looks like $2a$ / $2b$ / $2y$ followed by a cost and 53
// base64 chars. Only a value in this exact shape is safe to copy verbatim.
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/** Only accept a legacy password if it is already a bcrypt hash. */
function legacyPasswordHash(v: unknown): string | undefined {
  const s = str(v);
  return s && BCRYPT_RE.test(s) ? s : undefined;
}

/**
 * Combine the GERAF next-of-kin fields into the new single "nextkin" field.
 * Old schema splits them: `nextking` = kin's NAME, `nextkin` = RELATIONSHIP
 * ("Children", "Spouse"…). The new schema has one "Next of kin" field (name)
 * plus a contact, so fold the relationship into the name to avoid losing it:
 *   "Fidel Hayes (Children)".
 */
function mapNextKin(old: OldDoc): string | undefined {
  const name = str(old.nextking) ?? str(old.nextOfKin) ?? str(old.nextKinName);
  const relation = str(old.nextkin); // relationship in GERAF
  if (name && relation) return `${name} (${relation})`;
  return name ?? relation;
}

/** Old member/user → new User fields (plus bcrypt password when present). */
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
    // NOTE: GERAF `nextking` = name, `nextkin` = relationship — see mapNextKin.
    nextkin: mapNextKin(old),
    nextkinContact: str(old.nextkinContact) ?? str(old.nextOfKinContact),
    occupation: str(old.occupation),
    address: str(old.address),
    postalCode: str(old.postalCode) ?? str(old.postcode),
    city: str(old.city),
    ghanacity: str(old.ghanacity) ?? str(old.hometown) ?? str(old.homeTown),
    picture: str(old.picture) ?? str(old.photo),
    // `set` is a stray mangled $set update written as literal data on one old
    // doc; `normaliseRole` reads the top-level role and ignores it.
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

  // GERAF dues have no explicit `paid` flag — a row carries a `paidDate` when
  // the contribution was recorded as paid. Derive `paid` from that (falling
  // back to an explicit flag if a future export ever has one).
  const paidDate = old.paidDate ? new Date(old.paidDate as string) : undefined;
  const paid =
    old.paid !== undefined || old.isPaid !== undefined
      ? bool(old.paid ?? old.isPaid)
      : paidDate !== undefined;

  return {
    member: memberId,
    category: str(old.category),
    amount,
    description: str(old.description),
    month,
    year,
    duesType,
    paid,
    paidDate,
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
  const newUri = process.env.MONGODB_URI;
  if (!newUri) throw new Error("Set MONGODB_URI (target/new database).");

  // Source: a mongodump directory of .bson files (read-only, no running Mongo).
  const dumpDir = resolveDumpDir();

  console.log(COMMIT ? "=== COMMIT RUN (writes enabled) ===" : "=== DRY RUN (no writes) ===");
  console.log(`Source dump: ${dumpDir}`);

  // Target: this app's Mongoose connection + validated models.
  await dbConnect();

  const stats = {
    users: { read: 0, written: 0, skipped: 0, withPassword: 0 },
    dues: { read: 0, written: 0, skipped: 0 },
    events: { read: 0, written: 0, skipped: 0 },
  };

  // Maps an old user's _id → the new User _id, so dues can be re-linked.
  const idByOldUser = new Map<string, mongoose.Types.ObjectId>();
  // Maps old email → new User _id, as a fallback link for dues.
  const idByEmail = new Map<string, mongoose.Types.ObjectId>();

  // ---- Users --------------------------------------------------------------
  const oldUsers = readBsonCollection(dumpDir, OLD_COLLECTIONS.users);
  if (oldUsers.length === 0) {
    throw new Error(
      `No users found — is ${OLD_COLLECTIONS.users}.bson in ${dumpDir}? ` +
        "LEGACY_DUMP_DIR must point at the folder containing the .bson files."
    );
  }
  for (const old of oldUsers) {
    stats.users.read++;
    const doc = mapUser(old);
    if (doc.email && BLOCKED_EMAILS.has(doc.email)) {
      stats.users.skipped++;
      console.warn("  skip user (blocked email):", doc.email);
      continue;
    }
    if (!doc.email && !doc.phone) {
      stats.users.skipped++;
      console.warn("  skip user (no email or phone):", String(old._id));
      continue;
    }

    const legacyHash = legacyPasswordHash(old.password);

    if (!COMMIT) {
      stats.users.written++; // would-write
      if (legacyHash) stats.users.withPassword++;
      const fakeId = new mongoose.Types.ObjectId();
      idByOldUser.set(String(old._id), fakeId);
      if (doc.email) idByEmail.set(doc.email, fakeId);
      continue;
    }

    // Idempotent upsert by email (or phone when no email).
    const query = doc.email ? { email: doc.email } : { phone: doc.phone };
    const existing = await User.findOne(query).select("+password");
    const target = existing ?? new User();
    target.set(doc);

    // Carry the already-bcrypt'd legacy hash verbatim. Setting it marks the
    // path modified, which would trigger the pre-save re-hash (double bcrypt),
    // so immediately unmark it so save() writes the hash untouched. Only ever
    // overwrite an empty password — never clobber a password already set in
    // the new DB.
    if (legacyHash && !target.password) {
      target.password = legacyHash;
      target.unmarkModified("password");
      stats.users.withPassword++;
    }

    const saved = await target.save();
    stats.users.written++;
    idByOldUser.set(String(old._id), saved._id);
    if (doc.email) idByEmail.set(doc.email, saved._id);
  }

  // ---- Dues ---------------------------------------------------------------
  const oldDues = readBsonCollection(dumpDir, OLD_COLLECTIONS.dues);
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
  // GERAF has no events collection; readBsonCollection returns [] if absent.
  const oldEvents = readBsonCollection(dumpDir, OLD_COLLECTIONS.events);
  if (oldEvents.length === 0) {
    console.log("  (no events.bson in dump — skipping events)");
  }
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

  // ---- Report -------------------------------------------------------------
  console.log("\n--- Summary ---");
  console.table(stats);
  if (!COMMIT) {
    console.log("\nDRY RUN complete. Re-run with --commit to write.");
    console.log("⚠️  Verify the map* field names against the printed skips first.");
  } else {
    console.log("\nCOMMIT complete.");
    console.log(
      `Passwords: ${stats.users.withPassword} member(s) kept their legacy` +
        " bcrypt password and can log in as before."
    );
    console.log(
      "Members WITHOUT a legacy password must use 'Forgot password' or Google" +
        " sign-in. (Picture filenames were copied as-is; the old uploads/ files" +
        " are not migrated yet — profile photos will show the initials fallback" +
        " until re-uploaded.)"
    );
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
