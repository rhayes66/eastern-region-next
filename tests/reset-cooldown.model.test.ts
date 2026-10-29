import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, ResetCooldown } from "@/models/User";

let mongo: MongoMemoryServer;
const COOLDOWN_MS = 2 * 60 * 1000;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await ResetCooldown.init(); // ensure the unique index is built
});
afterEach(async () => {
  await User.deleteMany({});
  await ResetCooldown.deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// Mirrors the atomic claim used in the forgot-password route.
async function claim(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  try {
    await ResetCooldown.findOneAndUpdate(
      { user: userId, lastIssuedAt: { $lte: cutoff } },
      { $set: { lastIssuedAt: new Date() } },
      { upsert: true, returnDocument: "before" }
    );
    return true;
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return false;
    throw err;
  }
}

describe("atomic reset cooldown", () => {
  it("allows the first claim and blocks a second within the window", async () => {
    const u = await User.create({ email: "c@x.com", password: "Str0ng!pw" });
    expect(await claim(u._id)).toBe(true);
    expect(await claim(u._id)).toBe(false);
  });

  it("only one of two concurrent claims wins", async () => {
    const u = await User.create({ email: "c2@x.com", password: "Str0ng!pw" });
    const results = await Promise.all([claim(u._id), claim(u._id), claim(u._id)]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("allows a new claim once the window has passed", async () => {
    const u = await User.create({ email: "c3@x.com", password: "Str0ng!pw" });
    expect(await claim(u._id)).toBe(true);
    // simulate the window elapsing by backdating the stored timestamp
    await ResetCooldown.updateOne(
      { user: u._id },
      { $set: { lastIssuedAt: new Date(Date.now() - COOLDOWN_MS - 1000) } }
    );
    expect(await claim(u._id)).toBe(true);
  });
});
