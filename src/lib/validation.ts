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

// Member application (requirement 8 fields)
export const applicationSchema = z.object({
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
  email: z.string().email().optional(),
  occupation: z.string().optional(),
  dateOfBirth: z.string().optional(),
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

export const eventSchema = z.object({
  title: z.string().min(1),
  eventType: z.enum(EVENT_TYPES),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
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
