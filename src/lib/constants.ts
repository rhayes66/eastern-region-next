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
