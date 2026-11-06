import { Schema, model, models, Document } from "mongoose";

/**
 * Per-identity throttle for the PUBLIC contact form (mirrors ResetCooldown).
 *
 * The contact endpoint is unauthenticated and sends SMTP mail on every valid
 * request, so it must be rate-limited to stop an attacker flooding the
 * association inbox (and exhausting the shared SMTP service also used for
 * password resets). The claim is made with an atomic findOneAndUpdate keyed on
 * a unique `key` (email+IP), so concurrent requests cannot both proceed within
 * the cooldown window. This is DB-backed shared state, which works on
 * serverless without extra infra; true per-IP limiting still belongs at the
 * edge/proxy.
 *
 * `expiresAt` carries a TTL index so stale rows self-prune.
 */
export interface IContactCooldown extends Document {
  key: string;
  lastSentAt: Date;
  expiresAt: Date;
}

const ContactCooldownSchema = new Schema<IContactCooldown>(
  {
    key: { type: String, required: true, unique: true },
    lastSentAt: { type: Date, required: true },
    // TTL: Mongo removes the doc once this timestamp passes.
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false }
);

export const ContactCooldown =
  models.ContactCooldown ||
  model<IContactCooldown>("ContactCooldown", ContactCooldownSchema);
