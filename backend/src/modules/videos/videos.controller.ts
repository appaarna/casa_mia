import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { getVideo } from "./videos.service";

export async function getVideoHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const videoId = Number(req.params.videoId);
    if (!Number.isInteger(videoId) || videoId <= 0) {
      throw new AppError(400, "Invalid video ID");
    }

    const video = await getVideo(videoId);
    res.status(200).json(video);
  } catch (error) {
    next(error);
  }
}
