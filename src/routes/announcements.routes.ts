import { Router } from "express";
import { unlink } from "node:fs/promises";
import type { Request, Response, NextFunction } from "express";
import { createAnnouncement, getAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement } from "../controllers/announcements.controller.ts";
import { announcementQuerySchema, createAnnouncementSchema, announcementParamsSchema, updateAnnouncementSchema } from "../validators/announcements.validator.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.ts";
import upload from "../middleware/upload.ts";

const router = Router();


const cleanupUploadOnError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) return next();

  res.once("finish", () => {
    if (res.statusCode >= 400 && req.file) {
      void unlink(req.file.path).catch((error) => {
        console.error("Failed to clean up uploaded file:", error);
      });
    }
  });

  next();
};


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
  upload.single("image"),
  cleanupUploadOnError,
(req, res, next) => {
  if (Object.keys(req.body ?? {}).length === 0 && !req.file) {
    return res.status(400).json({
      message: "At least one field or an image is required",
    });
  }

  next();
},

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
  upload.single("image"),
  cleanupUploadOnError,
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);

export default router;
