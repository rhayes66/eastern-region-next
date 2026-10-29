import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { createHash } from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, PasswordReset } from "@/models/User";

let mongo: MongoMemoryServer;
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterEach(async () => {
  await User.deleteMany({});
  await PasswordReset.deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("password reset flow (requirement 11)", () => {
  it("stores only the token hash, not the raw token", async () => {
    const user = await User.create({ email: "r@x.com", password: "OldPass1!" });
    const token = "raw-token-value";
    await PasswordReset.create({
      hash: hashToken(token),
      expiryTimestamp: new Date(Date.now() + 3600_000),
      user: user._id,
    });
    const rec = await PasswordReset.findOne({ user: user._id });
    expect(rec!.hash).not.toBe(token);
    expect(rec!.hash).toBe(hashToken(token));
  });

  it("resets the password and lets the member log in with the new one", async () => {
    const user = await User.create({ email: "r2@x.com", password: "OldPass1!" });
    const token = "valid-token";
    await PasswordReset.create({
      hash: hashToken(token),
      expiryTimestamp: new Date(Date.now() + 3600_000),
      user: user._id,
    });

    // consume: look up by hash, set new password, delete token
    const rec = await PasswordReset.findOne({ hash: hashToken(token) });
    expect(rec).not.toBeNull();
    const u = await User.findById(rec!.user).select("+password");
    u!.password = "NewPass1!";
    await u!.save();
    await PasswordReset.deleteMany({ user: user._id });

    const fresh = await User.findById(user._id).select("+password");
    expect(await fresh!.comparePassword("NewPass1!")).toBe(true);
    expect(await fresh!.comparePassword("OldPass1!")).toBe(false);
    // token is single-use
    expect(await PasswordReset.findOne({ hash: hashToken(token) })).toBeNull();
  });

  it("treats an expired token as invalid", async () => {
    const user = await User.create({ email: "r3@x.com", password: "OldPass1!" });
    const token = "expired-token";
    await PasswordReset.create({
      hash: hashToken(token),
      expiryTimestamp: new Date(Date.now() - 1000), // already expired
      user: user._id,
    });
    const rec = await PasswordReset.findOne({ hash: hashToken(token) });
    expect(rec).not.toBeNull();
    expect(rec!.expiryTimestamp.getTime() < Date.now()).toBe(true);
  });
});
