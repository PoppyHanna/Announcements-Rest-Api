
import { z } from "zod";

// Реєстрація нового користувача
export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// Вхід користувача
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Оновлення токенів
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
