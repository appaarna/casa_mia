import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { getSubjectHandler, getSubjectTreeHandler, listSubjectsHandler } from "./subjects.controller";

export const subjectsRouter = Router();

subjectsRouter.get("/", listSubjectsHandler);
subjectsRouter.get("/:subjectId", getSubjectHandler);
subjectsRouter.get("/:subjectId/tree", optionalAuth, getSubjectTreeHandler);
