import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../config/env";
import type { AuthTokenPayload } from "../types/auth";

const refreshTokenMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export function signAccessToken(payload: Pick<AuthTokenPayload, "sub" | "email">): string {
  return jwt.sign({ email: payload.email, type: "access" }, env.auth.accessSecret, {
    subject: payload.sub,
    expiresIn: env.auth.accessExpiresIn as SignOptions["expiresIn"]
  });
}

export function signRefreshToken(payload: Pick<AuthTokenPayload, "sub" | "email">): string {
  return jwt.sign({ email: payload.email, type: "refresh" }, env.auth.refreshSecret, {
    subject: payload.sub,
    expiresIn: env.auth.refreshExpiresIn as SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.auth.accessSecret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.auth.refreshSecret) as AuthTokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(env.auth.refreshCookieName, token, {
    httpOnly: true,
    secure: env.auth.refreshCookieSecure,
    sameSite: env.auth.refreshCookieSameSite,
    maxAge: refreshTokenMaxAgeMs,
    path: "/"
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.auth.refreshCookieName, {
    httpOnly: true,
    secure: env.auth.refreshCookieSecure,
    sameSite: env.auth.refreshCookieSameSite,
    path: "/"
  });
}
