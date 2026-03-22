import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../../utils/tokens";
import { login, logout, refresh, register } from "./auth.service";
import { validateLoginBody, validateRegisterBody } from "./auth.validation";

function getRefreshTokenFromCookie(req: Request): string {
  const token = req.cookies?.[env.auth.refreshCookieName];
  if (!token || typeof token !== "string") {
    throw new AppError(401, "Refresh token cookie is missing");
  }

  return token;
}

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = validateRegisterBody(req.body as Record<string, unknown>);
    const result = await register(body);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = validateLoginBody(req.body as Record<string, unknown>);
    const result = await login(body);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = getRefreshTokenFromCookie(req);
    const result = await refresh(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.auth.refreshCookieName];
    await logout(typeof token === "string" ? token : undefined);
    clearRefreshTokenCookie(res);

    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
}
