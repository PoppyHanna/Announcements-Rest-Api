import { Router } from "express";
import { createAnnouncement, getAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement } from "../controllers/announcements.controller.ts";
import { announcementQuerySchema, createAnnouncementSchema, announcementParamsSchema, updateAnnouncementSchema } from "../validators/announcements.validator.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.ts";

const router = Router();

router.get(
  "/",
  validateQuery(announcementQuerySchema),
  getAnnouncements,
);

router.get(
  "/:id",
  validateParams(announcementParamsSchema),
  getAnnouncementById,
);

router.patch(
  "/:id",
  authenticate,
  validateParams(announcementParamsSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(announcementParamsSchema),
  deleteAnnouncement,
);

router.post(
  "/",
  authenticate,
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

export default router;
