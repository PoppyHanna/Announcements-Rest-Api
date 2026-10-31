import { z } from "zod";

const priceSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }

    return value;
  },
  z.number().positive(),
);

export const createAnnouncementSchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().min(10),
  price: priceSchema,
  category: z.enum(["sale", "service", "job", "other"]),
});

export const updateAnnouncementSchema =
  createAnnouncementSchema.partial();

export const announcementParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const announcementQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
});
