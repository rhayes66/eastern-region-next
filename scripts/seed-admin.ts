/**
 * Bootstrap the first Admin user.
 * Run with: npm run seed:admin
 * Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.
 */
import "dotenv/config";
import { dbConnect } from "../src/lib/db";
import { User } from "../src/models/User";
import mongoose from "mongoose";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env");
  }

  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "Admin";
    if (password) existing.password = password; // re-hashed by pre-save hook
    await existing.save();
    console.log(`Updated existing user ${email} → Admin`);
  } else {
    await User.create({
      email,
      password,
      firstname: "GERAF",
      lastname: "Admin",
      role: "Admin",
    });
    console.log(`Created admin user ${email}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
