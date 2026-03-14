import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

const addressSchema = z.object({
  line1: optionalString,
  line2: optionalString,
  city: optionalString,
  state: optionalString,
  pincode: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{6}$/.test(v), { message: "Pincode must be 6 digits" }),
}).optional();

const optionalPan = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase()), {
    message: "Invalid PAN format (e.g. ABCDE1234F)",
  });

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[0-9]{10}$/.test(v), { message: "Phone must be 10 digits" });

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Invalid email" });

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  pan: optionalPan,
  dateOfBirth: optionalString,
  permanentAddress: addressSchema,
  officeAddress: addressSchema,
  email: optionalEmail,
  phone: optionalPhone,
});

export const updateClientSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  pan: optionalPan,
  dateOfBirth: optionalString,
  permanentAddress: addressSchema,
  officeAddress: addressSchema,
  email: optionalEmail,
  phone: optionalPhone,
});
