import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number"),
  place: z.string().trim().min(5, "Address is too short").max(200),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
});

export type AddressInput = z.infer<typeof addressSchema>;
