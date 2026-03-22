import type { NextFunction, Request, Response } from "express";
import { getHealthSnapshot } from "./health.service";

export async function getHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const snapshot = await getHealthSnapshot();
    res.status(200).json(snapshot);
  } catch (error) {
    next(error);
  }
}
