import { z } from "zod";
import { registry } from "./openapi.ts";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./validators/auth.validator.ts";

const errorResponse = z.object({
  message: z.string(),
});

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

// POST /auth/register
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Authentication"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
    },
    409: {
      description: "Username or email already taken",
      content: {
        "application/json": {
          schema: errorResponse,
        },
      },
    },
  },
});

// POST /auth/login
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Authentication"],
  summary: "Log in",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: errorResponse,
        },
      },
    },
  },
});

// POST /auth/refresh
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Authentication"],
  summary: "Refresh access and refresh tokens",
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tokens refreshed successfully",
      content: {
        "application/json": {
          schema: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Invalid refresh token",
    },
  },
});

// GET /auth/me
registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Authentication"],
  summary: "Get current user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user information",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// POST /auth/logout
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Authentication"],
  summary: "Log out",
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: "Logged out successfully",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
