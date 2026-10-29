import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "@/models/User";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("User model", () => {
  it("hashes the password on save (never stores plaintext)", async () => {
    const plain = "Str0ng!pw";
    await User.create({ email: "a@b.com", password: plain });

    // password has select:false, so ask for it explicitly
    const doc = await User.findOne({ email: "a@b.com" }).select("+password");
    expect(doc).not.toBeNull();
    expect(doc!.password).toBeDefined();
    expect(doc!.password).not.toBe(plain);
    expect(doc!.password!.startsWith("$2")).toBe(true); // bcrypt hash marker
  });

  it("comparePassword returns true for the correct password", async () => {
    await User.create({ email: "c@d.com", password: "Str0ng!pw" });
    const doc = await User.findOne({ email: "c@d.com" }).select("+password");
    expect(await doc!.comparePassword("Str0ng!pw")).toBe(true);
  });

  it("comparePassword returns false for a wrong password", async () => {
    await User.create({ email: "e@f.com", password: "Str0ng!pw" });
    const doc = await User.findOne({ email: "e@f.com" }).select("+password");
    expect(await doc!.comparePassword("wrong")).toBe(false);
  });

  it("does not re-hash the password when an unrelated field changes", async () => {
    const doc = await User.create({ email: "g@h.com", password: "Str0ng!pw" });
    const withPw = await User.findById(doc._id).select("+password");
    const firstHash = withPw!.password;

    withPw!.firstname = "Ama";
    await withPw!.save();

    const after = await User.findById(doc._id).select("+password");
    expect(after!.password).toBe(firstHash); // hook skipped: password unmodified
  });

  it("defaults a new user's role to Pending", async () => {
    const doc = await User.create({ email: "i@j.com", password: "Str0ng!pw" });
    expect(doc.role).toBe("Pending");
  });

  it("omits the password by default (select:false)", async () => {
    await User.create({ email: "k@l.com", password: "Str0ng!pw" });
    const doc = await User.findOne({ email: "k@l.com" });
    expect(doc!.password).toBeUndefined();
  });
});
