import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ContactCooldown } from "@/models/ContactCooldown";

let mongo: MongoMemoryServer;
const COOLDOWN_MS = 60_000;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await ContactCooldown.init(); // build the unique index
});
afterEach(async () => {
  await ContactCooldown.deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// Mirrors the atomic claim used in the public contact route.
async function claim(key: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  try {
    await ContactCooldown.findOneAndUpdate(
      { key, lastSentAt: { $lte: cutoff } },
      {
        $set: {
          lastSentAt: new Date(),
          expiresAt: new Date(Date.now() + COOLDOWN_MS),
        },
      },
      { upsert: true, returnDocument: "before" }
    );
    return true;
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return false;
    throw err;
  }
}

describe("atomic contact cooldown", () => {
  it("allows the first submission and blocks a second within the window", async () => {
    const key = "ama@x.fi|1.2.3.4";
    expect(await claim(key)).toBe(true);
    expect(await claim(key)).toBe(false);
  });

  it("only one of several concurrent submissions wins", async () => {
    const key = "spam@x.fi|9.9.9.9";
    const results = await Promise.all([claim(key), claim(key), claim(key), claim(key)]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("allows a new submission once the window has passed", async () => {
    const key = "later@x.fi|5.5.5.5";
    expect(await claim(key)).toBe(true);
    await ContactCooldown.updateOne(
      { key },
      { $set: { lastSentAt: new Date(Date.now() - COOLDOWN_MS - 1000) } }
    );
    expect(await claim(key)).toBe(true);
  });

  it("tracks different identities independently", async () => {
    expect(await claim("a@x.fi|1.1.1.1")).toBe(true);
    expect(await claim("a@x.fi|2.2.2.2")).toBe(true); // same email, different IP
    expect(await claim("b@x.fi|1.1.1.1")).toBe(true); // different email
  });
});
