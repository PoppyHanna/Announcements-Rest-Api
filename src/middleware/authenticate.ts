
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  const token = authorization.slice(7);

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      !payload.sub ||
      !/^\d+$/.test(payload.sub)
    ) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    req.user = {
      sub: payload.sub,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
