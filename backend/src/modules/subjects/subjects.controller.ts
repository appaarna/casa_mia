import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { getAllSubjects, getSubjectById, getSubjectTree } from "./subjects.service";

export async function listSubjectsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const subjects = await getAllSubjects();
    res.status(200).json({ subjects });
  } catch (error) {
    next(error);
  }
}

export async function getSubjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const subjectId = Number(req.params.subjectId);
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      throw new AppError(400, "Invalid subject ID");
    }

    const subject = await getSubjectById(subjectId);
    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
}

export async function getSubjectTreeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const subjectId = Number(req.params.subjectId);
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      throw new AppError(400, "Invalid subject ID");
    }

    const userId = req.auth?.sub ? Number(req.auth.sub) : undefined;
    const tree = await getSubjectTree(subjectId, userId);
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
}
