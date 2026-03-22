import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    message: "Route not found"
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(500).json({
    message
  });
}
