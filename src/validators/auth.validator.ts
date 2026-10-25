import { z } from "zod";

//Register schema
export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Refresh token schema
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
