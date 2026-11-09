import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "@/models/User";

// The session token is a snapshot; these tests change what the token SAYS and
// what the DATABASE says independently, to prove the database wins.
let tokenUser: Record<string, unknown> | undefined;
vi.mock("@/auth", () => ({
  auth: async () => (tokenUser ? { user: tokenUser } : null),
}));
vi.mock("@/lib/db", () => ({ dbConnect: async () => {} })); // mongoose is already connected below
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

import { getSessionUser, requireAdmin } from "@/lib/session";

let mongo: MongoMemoryServer;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterEach(async () => {
  tokenUser = undefined;
  await User.deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

async function makeAdmin() {
  return User.create({ email: "boss@example.com", role: "Admin" });
}

describe("getSessionUser reads the role live from the database", () => {
  it("returns null when there is no session", async () => {
    expect(await getSessionUser()).toBeNull();
  });

  it("returns the database role for a current admin", async () => {
    const admin = await makeAdmin();
    tokenUser = { id: admin._id.toString(), email: admin.email, role: "Admin" };
    expect((await getSessionUser())?.role).toBe("Admin");
  });

  it("a demoted admin with a stale Admin token is NOT an admin", async () => {
    const admin = await makeAdmin();
    tokenUser = { id: admin._id.toString(), email: admin.email, role: "Admin" };
    await User.updateOne({ _id: admin._id }, { role: "Member" });
    expect((await getSessionUser())?.role).toBe("Member");
  });

  it("a token that claims Admin cannot elevate a Member", async () => {
    const member = await User.create({ email: "m@example.com", role: "Member" });
    tokenUser = { id: member._id.toString(), email: member.email, role: "Admin" };
    expect((await getSessionUser())?.role).toBe("Member");
  });

  it("a deleted account with a valid token is treated as signed out", async () => {
    const admin = await makeAdmin();
    tokenUser = { id: admin._id.toString(), email: admin.email, role: "Admin" };
    await User.deleteOne({ _id: admin._id });
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireAdmin", () => {
  it("lets a current admin through", async () => {
    const admin = await makeAdmin();
    tokenUser = { id: admin._id.toString(), email: admin.email, role: "Admin" };
    await expect(requireAdmin()).resolves.toMatchObject({ role: "Admin" });
  });

  it("sends anonymous visitors to /login", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });

  it("sends a demoted admin (stale token) to /profile", async () => {
    const admin = await makeAdmin();
    tokenUser = { id: admin._id.toString(), email: admin.email, role: "Admin" };
    await User.updateOne({ _id: admin._id }, { role: "Member" });
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/profile");
  });
});
