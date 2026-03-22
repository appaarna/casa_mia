import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import {
  bulkImportPlaylists,
  getImportedSubjects,
  importPlaylist,
  previewPlaylist,
  syncPlaylist
} from "./admin.service";

export async function previewPlaylistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const playlistId = req.params.playlistId as string;
    if (!playlistId) throw new AppError(400, "playlistId param is required");

    const preview = await previewPlaylist(playlistId);
    res.status(200).json(preview);
  } catch (error) {
    next(error);
  }
}

export async function importPlaylistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { playlistId } = req.body as { playlistId?: string };
    if (!playlistId || typeof playlistId !== "string") {
      throw new AppError(400, "playlistId is required in request body");
    }

    const result = await importPlaylist(playlistId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function bulkImportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { playlistIds } = req.body as { playlistIds?: string[] };
    if (!Array.isArray(playlistIds) || playlistIds.length === 0) {
      throw new AppError(400, "playlistIds array is required in request body");
    }

    const result = await bulkImportPlaylists(playlistIds);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function syncPlaylistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const playlistId = req.params.playlistId as string;
    if (!playlistId) throw new AppError(400, "playlistId param is required");

    const result = await syncPlaylist(playlistId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listImportedHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const subjects = await getImportedSubjects();
    res.status(200).json({ subjects });
  } catch (error) {
    next(error);
  }
}
