
import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
});

export const adminRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .refine(
      (email) => email.toLowerCase().endsWith("@campusfix.edu"),
      "Admin registration requires an @campusfix.edu email."
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
