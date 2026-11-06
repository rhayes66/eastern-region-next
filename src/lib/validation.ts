import { z } from "zod";
import {
  MONTHS,
  DUES_TYPES,
  BENEFIT_CATEGORIES,
  EVENT_TYPES,
  GENDERS,
  TITLES,
} from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Strong password: upper, lower, digit, symbol, 6+ (matches legacy rule)
const passwordRule = z
  .string()
  .regex(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/,
    "Password must be 6+ chars with upper, lower, number and symbol"
  );

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Member application (requirement 8 fields + login credentials)
export const applicationSchema = z
  .object({
    title: z.enum(TITLES).optional(),
    firstname: z.string().min(1, "Full name is required"),
    lastname: z.string().min(1, "Last name is required"),
    gender: z.enum(GENDERS),
    fathersname: z.string().optional(),
    mothersname: z.string().optional(),
    spousename: z.string().optional(),
    children: z.string().optional(),
    address: z.string().min(1, "Location address is required"),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    ghanacity: z.string().min(1, "Home town in Ghana is required"),
    finlandContact: z.string().min(1, "Finland contact number is required"),
    // Email is the login identity, so it is required on the application.
    email: z.string().email("A valid email is required"),
    password: passwordRule,
    confirmPassword: z.string(),
    occupation: z.string().optional(),
    dateOfBirth: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const duesSchema = z.object({
  member: z.string().min(1),
  amount: z.coerce.number().positive(),
  month: z.enum(MONTHS),
  year: z.string().regex(/^\d{4}$/),
  duesType: z.enum(DUES_TYPES),
  description: z.string().optional(),
  paid: z.boolean().optional(),
});

export const benefitSchema = z.object({
  member: z.string().min(1),
  category: z.enum(BENEFIT_CATEGORIES),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
});

// A string that must parse to a real calendar date (rejects "", "not-a-date",
// "2026-13-40", etc.) so routes never pass an invalid value to Mongoose.
const dateString = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const eventSchema = z.object({
  title: z.string().min(1),
  eventType: z.enum(EVENT_TYPES),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: dateString,
  endDate: dateString.optional(),
});

export const forgotPasswordSchema = z.object({ email: z.string().email() });
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Admin sets a new password for a member (support / recovery, requirement 11).
export const adminSetPasswordSchema = z.object({
  password: passwordRule,
});

// Member edits their OWN profile. Deliberately excludes email, role, password
// and picture: unknown keys are stripped by zod, so they cannot be mass-assigned.
export const profileSchema = z.object({
  title: z.union([z.enum(TITLES), z.literal("")]),
  firstname: z.string().trim().min(1, "Full name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(GENDERS),
  dateOfBirth: z.string(),
  occupation: z.string().trim(),
  address: z.string().trim().min(1, "Location address is required"),
  city: z.string().trim(),
  postalCode: z.string().trim(),
  ghanacity: z.string().trim().min(1, "Home town in Ghana is required"),
  finlandContact: z.string().trim().min(1, "Finland contact number is required"),
  spousename: z.string().trim(),
  children: z.string().trim(),
  fathersname: z.string().trim(),
  mothersname: z.string().trim(),
  nextkin: z.string().trim(),
  nextkinContact: z.string().trim(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// Public contact form (anyone may submit).
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("A valid email is required"),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(1, "Message is required").max(5000),
});
export type ContactInput = z.infer<typeof contactSchema>;
