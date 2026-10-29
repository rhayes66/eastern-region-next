import { Schema, model, models, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, TITLES, GENDERS, type Role } from "@/lib/constants";

export { ROLES, TITLES, GENDERS } from "@/lib/constants";
export type { Role } from "@/lib/constants";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email?: string;
  phone?: string;
  finlandContact?: string;
  title?: string;
  firstname?: string;
  lastname?: string;
  gender?: string;
  dateOfBirth?: string;
  children?: string;
  fathersname?: string;
  mothersname?: string;
  spousename?: string;
  nextkin?: string;
  nextkinContact?: string;
  occupation?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  ghanacity?: string;
  password?: string;
  google?: string;
  picture?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email"],
    },
    phone: { type: String, unique: true, sparse: true },
    finlandContact: { type: String },
    title: { type: String, enum: TITLES },
    firstname: { type: String },
    lastname: { type: String },
    gender: { type: String, enum: GENDERS },
    dateOfBirth: { type: String },
    children: { type: String },
    fathersname: { type: String },
    mothersname: { type: String },
    spousename: { type: String },
    nextkin: { type: String },
    nextkinContact: { type: String },
    occupation: { type: String },
    address: { type: String },
    postalCode: { type: String },
    city: { type: String },
    ghanacity: { type: String },
    // select:false → never returned unless explicitly asked for
    password: { type: String, select: false },
    google: { type: String, unique: true, sparse: true },
    picture: { type: String },
    role: { type: String, enum: ROLES, default: "Pending" },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function () {
  // Only (re)hash when the password actually changed
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = models.User || model<IUser>("User", UserSchema);

// ---- Password reset tokens (requirement 11) ----
export interface IPasswordReset extends Document {
  hash: string;
  expiryTimestamp: Date;
  user: Types.ObjectId;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    hash: { type: String, required: true, index: true },
    expiryTimestamp: { type: Date, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

export const PasswordReset =
  models.PasswordReset ||
  model<IPasswordReset>("PasswordReset", PasswordResetSchema);

// ---- Per-user reset cooldown (atomic issuance throttle, requirement 11) ----
// One doc per user (unique index). A reset link may only be issued when the
// last issuance is older than the cooldown window; the claim is made with an
// atomic findOneAndUpdate so concurrent requests cannot both proceed.
export interface IResetCooldown extends Document {
  user: Types.ObjectId;
  lastIssuedAt: Date;
}

const ResetCooldownSchema = new Schema<IResetCooldown>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    lastIssuedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const ResetCooldown =
  models.ResetCooldown ||
  model<IResetCooldown>("ResetCooldown", ResetCooldownSchema);
