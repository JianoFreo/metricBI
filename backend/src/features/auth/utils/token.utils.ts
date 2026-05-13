import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "@config/env.js";
import { TokenPair, JwtPayload, DecodedToken } from "../types/auth.types.js";

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const createTokenPair = (payload: JwtPayload): TokenPair => {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET as string, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  } as any);

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET as string, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  } as any);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): DecodedToken | null => {
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch {
    return null;
  }
};

export const hashRefreshToken = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareRefreshToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};

export const getRefreshTokenFromRequest = (req: Request): string | null => {
  const bodyToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : null;
  if (bodyToken) {
    return bodyToken;
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) {
      return acc;
    }
    acc[name] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});

  return cookies[env.AUTH_COOKIE_NAME] || null;
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(env.AUTH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.AUTH_USE_COOKIES || env.NODE_ENV === "production",
    sameSite: "strict",
    domain: env.AUTH_COOKIE_DOMAIN || undefined,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/v1/auth/refresh",
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    path: "/api/v1/auth/refresh",
    domain: env.AUTH_COOKIE_DOMAIN || undefined,
  });
};
