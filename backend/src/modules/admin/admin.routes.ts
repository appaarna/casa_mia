import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  bulkImportHandler,
  importPlaylistHandler,
  listImportedHandler,
  previewPlaylistHandler,
  syncPlaylistHandler
} from "./admin.controller";

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(requireAuth);

adminRouter.get("/import/youtube-playlist/:playlistId/preview", previewPlaylistHandler);
adminRouter.post("/import/youtube-playlist", importPlaylistHandler);
adminRouter.post("/import/youtube-playlists/bulk", bulkImportHandler);
adminRouter.post("/sync/youtube-playlist/:playlistId", syncPlaylistHandler);
adminRouter.get("/import/subjects", listImportedHandler);
