import { z } from "zod";
import { registry } from "./openapi.ts";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementQuerySchema,
  announcementParamsSchema,
} from "./validators/announcements.validator.ts";

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

const announcementSchema = createAnnouncementSchema.extend({
  id: z.number(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: userSchema,
});

const errorSchema = z.object({
  message: z.string(),
});

// GET /announcements
registry.registerPath({
  method: "get",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Get announcements with search, sorting and pagination",
  request: {
    query: announcementQuerySchema,
  },
  responses: {
    200: {
      description: "List of announcements",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(announcementSchema),
            pagination: z.object({
              total: z.number(),
              page: z.number(),
              totalPages: z.number(),
              perPage: z.number(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
    },
  },
});

// GET /announcements/{id}
registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get announcement by ID",
  request: {
    params: announcementParamsSchema,
  },
  responses: {
    200: {
      description: "Announcement found",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    400: {
      description: "Invalid ID",
    },
    404: {
      description: "Announcement not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

// POST /announcements
registry.registerPath({
  method: "post",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Create a new announcement",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAnnouncementSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Announcement created",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    400: {
      description: "Validation error",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// PATCH /announcements/{id}
registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update own announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateAnnouncementSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Announcement updated",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    400: {
      description: "Validation error",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Access denied",
    },
    404: {
      description: "Announcement not found",
    },
  },
});

// DELETE /announcements/{id}
registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete own announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementParamsSchema,
  },
  responses: {
    204: {
      description: "Announcement deleted successfully",
    },
    400: {
      description: "Invalid ID",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Access denied",
    },
    404: {
      description: "Announcement not found",
    },
  },
});
