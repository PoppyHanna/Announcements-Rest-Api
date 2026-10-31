import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";
import logger from "./src/logger.ts";


import "./src/auth.openapi.ts";
import "./src/announcements.openapi.ts";

import authRoutes from "./src/routes/auth.routes.ts";
import announcementsRoutes from "./src/routes/announcements.routes.ts";

import { generateOpenApiDocument } from "./src/openapi.ts";

const app = express();

app.use(pinoHttp({ logger }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      
return callback(
  Object.assign(new Error("Origin not allowed by CORS"), {
    status: 403,
  }),
);

    },
  }),
);


app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/announcements", announcementsRoutes);

const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));


 // 404 Not Found handler - must be after all routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Not found",
  });
});

// Error handling middleware
app.use((
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error({ err }, "Request failed");

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Validation failed",
      details: {
        body: ["Invalid JSON format in request body"],
      },
    });
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      message: "Resource not found",
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      message: "Unique constraint violation",
    });
  }

  if (err.code === "P2003") {
    return res.status(400).json({
      message: "Foreign key constraint failed",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  
logger.info(
  `Server is running on port ${PORT}: http://localhost:${PORT}/api-docs`,
);
});

