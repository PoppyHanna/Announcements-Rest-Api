import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../src/middleware/authenticate.ts";

const TEST_SECRET = "test-secret-for-vitest";

const createMockResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);

  return res;
};

describe("Authentication middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a Bearer token", () => {
    vi.stubEnv("JWT_SECRET", TEST_SECRET);

    const req = {
      headers: {},
    } as Request;

    const res = createMockResponse();
    const next = vi.fn();

    authenticate(
      req,
      res as unknown as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a valid access token", () => {
    vi.stubEnv("JWT_SECRET", TEST_SECRET);

    const token = jwt.sign(
      { sub: "1", type: "access" },
      TEST_SECRET,
      { expiresIn: "15m" },
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = createMockResponse();
    const next = vi.fn();

    authenticate(
      req,
      res as unknown as Response,
      next as NextFunction,
    );

    expect(req.user).toEqual({ sub: "1" });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects a refresh token used as an access token", () => {
    vi.stubEnv("JWT_SECRET", TEST_SECRET);

    const token = jwt.sign(
      { sub: "1", type: "refresh" },
      TEST_SECRET,
      { expiresIn: "7d" },
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const res = createMockResponse();
    const next = vi.fn();

    authenticate(
      req,
      res as unknown as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
