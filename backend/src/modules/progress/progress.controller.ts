import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { completeVideo, getVideoProgress, updateVideoProgress } from "./progress.service";

export async function getProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.auth!.sub);
    const videoId = Number(req.params.videoId);
    if (!Number.isInteger(videoId) || videoId <= 0) {
      throw new AppError(400, "Invalid video ID");
    }

    const progress = await getVideoProgress(userId, videoId);
    res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
}

export async function updateProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.auth!.sub);
    const videoId = Number(req.params.videoId);
    if (!Number.isInteger(videoId) || videoId <= 0) {
      throw new AppError(400, "Invalid video ID");
    }

    const { lastPositionSeconds } = req.body as { lastPositionSeconds?: number };
    if (typeof lastPositionSeconds !== "number" || lastPositionSeconds < 0) {
      throw new AppError(400, "lastPositionSeconds must be a non-negative number");
    }

    await updateVideoProgress(userId, videoId, Math.floor(lastPositionSeconds));
    res.status(200).json({ message: "Progress updated" });
  } catch (error) {
    next(error);
  }
}

export async function completeProgressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.auth!.sub);
    const videoId = Number(req.params.videoId);
    if (!Number.isInteger(videoId) || videoId <= 0) {
      throw new AppError(400, "Invalid video ID");
    }

    await completeVideo(userId, videoId);
    res.status(200).json({ message: "Video marked as completed" });
  } catch (error) {
    next(error);
  }
}
