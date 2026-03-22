import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/tokens";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header) {
    next();
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type === "access") {
      req.auth = payload;
    }
  } catch {
    // Token invalid — proceed without auth
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header) {
    next(new AppError(401, "Authorization header is required"));
    return;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    next(new AppError(401, "Authorization header must use Bearer token"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new AppError(401, "Invalid access token");
    }

    req.auth = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, "Invalid or expired access token"));
      return;
    }

    next(error);
  }
}
