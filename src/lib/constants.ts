/**
 * Shared enums with NO server-only dependencies (no Mongoose), so client
 * components can import them without pulling the DB driver into the browser
 * bundle. Models re-export these; forms import them directly.
 */

export const ROLES = ["Member", "Admin", "Pending"] as const;
export type Role = (typeof ROLES)[number];

export const TITLES = ["Mr.", "Mrs.", "Miss.", "Dr.", "Ms."] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;

export const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const DUES_TYPES = ["Monthly", "Yearly", "Donations"] as const;

// Categories OFFERED when creating a new benefit (forms + create-submission
// validation). "Bereavement" was split into the four "Demise *" categories,
// so it is intentionally absent here — new records use the specific ones.
export const BENEFIT_CATEGORIES = [
  "Demise Father",
  "Demise Mother",
  "Demise Spouse",
  "Demise Child",
  "Medical",
  "Hardship",
  "Childbirth",
  "Wedding",
  "Other",
] as const;

// Legacy categories that must stay VALID for records created before the split,
// even though they're no longer offered. The Mongoose model validates against
// this superset so existing "Bereavement" benefits can still be approved,
// disbursed or rejected (which call benefit.save()). Remove a legacy value only
// after migrating its records to a current category.
export const LEGACY_BENEFIT_CATEGORIES = ["Bereavement"] as const;

// Full accepted enum for persistence/validation of ANY record (old or new).
export const BENEFIT_CATEGORY_ENUM = [
  ...BENEFIT_CATEGORIES,
  ...LEGACY_BENEFIT_CATEGORIES,
] as const;

export const BENEFIT_STATUSES = [
  "Requested",
  "Approved",
  "Disbursed",
  "Rejected",
] as const;

export const EVENT_TYPES = ["Meeting", "Team Event", "Social", "Other"] as const;

export const APPLICATION_STATUSES = [
  "Incomplete",
  "Pending",
  "Accepted",
  "Rejected",
] as const;
