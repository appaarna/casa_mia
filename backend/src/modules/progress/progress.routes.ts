import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { completeProgressHandler, getProgressHandler, updateProgressHandler } from "./progress.controller";

export const progressRouter = Router();

progressRouter.use(requireAuth);

progressRouter.get("/videos/:videoId", getProgressHandler);
progressRouter.post("/videos/:videoId", updateProgressHandler);
progressRouter.post("/videos/:videoId/complete", completeProgressHandler);
