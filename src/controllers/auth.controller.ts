import crypto from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.ts";

//Register
export const register = async (req: Request, res: Response) => {

  const { username, email, password, name } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Username or email already taken",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
    },
  });

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "7d" },
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  const { password: _password, ...safeUser } = user;

  return res.status(201).json({
    user: safeUser,
    accessToken,
    refreshToken,
  });
};

//Login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "7d", jwtid: crypto.randomUUID() },
  );

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    }),
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    }),
  ]);

  const { password: _password, ...safeUser } = user;

  return res.status(200).json({
    user: safeUser,
    accessToken,
    refreshToken,
  });
};

//Refresh Token
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  let payload: jwt.JwtPayload;

  try {
    const decoded = jwt.verify(refreshToken, secret);

    if (typeof decoded === "string" || !decoded.sub) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    payload = decoded;
  } catch {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || String(storedToken.userId) !== payload.sub) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const accessToken = jwt.sign(
    { sub: payload.sub },
    secret,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign(
    { sub: payload.sub },
    secret,
    { expiresIn: "7d", jwtid: crypto.randomUUID() },
  );

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { token: newRefreshToken },
  });

  return res.status(200).json({
    accessToken,
    refreshToken: newRefreshToken,
  });
};

//getMe (user)
export const getMe = async (req: Request, res: Response) => {
  const userId = Number(req.user!.sub);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return res.status(200).json(user);
};

//Logout
export const logout = async (req: Request, res: Response) => {
  const userId = Number(req.user!.sub);

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return res.status(204).end();
};
 