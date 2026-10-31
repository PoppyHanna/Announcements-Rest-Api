import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import logger from "../logger.ts";
import { uploadImage } from "../services/uploadImage.ts";
import { unlink } from "node:fs/promises";

const userSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
  createdAt: true,
} as const;


//Create Announcement
export const createAnnouncement = async (
  req: Request,
  res: Response,
) => {
  const { title, description, price, category } = req.body;

  const userId = Number(req.user!.sub);

    let imageUrl: string | undefined;

  if (req.file) {
    imageUrl = await uploadImage(req.file.path);
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      userId,
      imageUrl,
    },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  
logger.info(
  {
    announcementId: announcement.id,
    userId,
    hasImage: Boolean(imageUrl),
  },
  "Announcement created successfully",
);

  return res.status(201).json(announcement);
};

//All announcements
export const getAnnouncements = async (
  req: Request,
  res: Response,
) => {
  const { search, sort, page } = res.locals.validatedQuery as {
    search?: string;
    sort: "newest" | "oldest";
    page: number;
  };

  const perPage = 10;
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [announcements, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: sort === "oldest" ? "asc" : "desc",
      },
      skip,
      take: perPage,
      include: {
        user: {
          select: userSelect,
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};

//Get announcement by ID
export const getAnnouncementById = async (
  req: Request,
  res: Response,
) => {
  const { id } = res.locals.validatedParams as {
    id: number;
  };

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  if (!announcement) {
    return res.status(404).json({
      message: "Announcement not found",
    });
  }

  return res.status(200).json(announcement);
};

//Update announcement by ID

export const updateAnnouncement = async (
  req: Request,
  res: Response,
) => {
  const { id } = res.locals.validatedParams as { id: number };
  const userId = Number(req.user!.sub);

  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    if (existingAnnouncement.userId !== userId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    let imageUrl: string | undefined;

    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...req.body,
        ...(imageUrl ? { imageUrl } : {}),
      },
      include: {
        user: {
          select: userSelect,
        },
      },
    });

    logger.info(
      {
        announcementId: announcement.id,
        userId,
        hasNewImage: Boolean(imageUrl),
      },
      "Announcement updated successfully",
    );

    return res.status(200).json(announcement);
  } finally {
    if (req.file) {
      await unlink(req.file.path).catch(() => {});
    }
  }
};


//Delete announcement by ID
export const deleteAnnouncement = async (
  req: Request,
  res: Response,
) => {
  const { id } = res.locals.validatedParams as {
    id: number;
  };

  const userId = Number(req.user!.sub);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    return res.status(404).json({
      message: "Announcement not found",
    });
  }

  if (announcement.userId !== userId) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  await prisma.announcement.delete({
    where: { id },
  });

  return res.status(204).end();
};
