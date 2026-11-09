/**
 * Inspect a mongodump .bson file WITHOUT a running Mongo or bsondump.
 * Uses the `bson` package that ships with the mongodb driver (already a dep).
 *
 * Usage (from the repo root):
 *   npx tsx scripts/inspect-dump.ts ~/legacy-dump/geraf/users.bson
 *   npx tsx scripts/inspect-dump.ts ~/legacy-dump/geraf/users.bson 3   # first 3 docs
 *
 * Prints: total doc count, then the first N documents (default 1) as JSON so
 * you can see the real FIELD NAMES. Redact personal values before sharing.
 */
import { readFileSync } from "node:fs";
import { deserialize } from "bson";

function main() {
  const file = process.argv[2];
  const limit = Number(process.argv[3] ?? "1");
  if (!file) {
    console.error("Usage: npx tsx scripts/inspect-dump.ts <path-to.bson> [count]");
    process.exit(1);
  }

  const buf = readFileSync(file);
  const docs: Record<string, unknown>[] = [];
  let offset = 0;
  // A BSON file is a sequence of documents; each starts with a 4-byte LE length.
  while (offset < buf.length) {
    const size = buf.readInt32LE(offset);
    if (size <= 0 || offset + size > buf.length) break;
    const slice = buf.subarray(offset, offset + size);
    docs.push(deserialize(slice) as Record<string, unknown>);
    offset += size;
  }

  console.log(`\n=== ${file} ===`);
  console.log(`Total documents: ${docs.length}`);
  console.log(`\nField names in first doc:`);
  console.log(Object.keys(docs[0] ?? {}).join(", ") || "(empty)");
  console.log(`\nFirst ${Math.min(limit, docs.length)} document(s):`);
  for (const d of docs.slice(0, limit)) {
    console.log(JSON.stringify(d, null, 2));
  }
}

main();
