import { Router } from "express";
import { getVideoHandler } from "./videos.controller";

export const videosRouter = Router();

videosRouter.get("/:videoId", getVideoHandler);
