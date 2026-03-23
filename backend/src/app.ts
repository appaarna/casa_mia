import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { adminRouter } from "./modules/admin/admin.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { healthRouter } from "./modules/health/health.routes";
import { progressRouter } from "./modules/progress/progress.routes";
import { subjectsRouter } from "./modules/subjects/subjects.routes";
import { videosRouter } from "./modules/videos/videos.routes";

export function createApp() {
  const app = express();

  const allowedOrigins = env.nodeEnv === "development"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : [env.appOrigin];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      credentials: true
    })
  );
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());

  app.use(`${env.apiBasePath}/health`, healthRouter);
  app.use(`${env.apiBasePath}/auth`, authRouter);
  app.use(`${env.apiBasePath}/subjects`, subjectsRouter);
  app.use(`${env.apiBasePath}/videos`, videosRouter);
  app.use(`${env.apiBasePath}/progress`, progressRouter);
  app.use(`${env.apiBasePath}/admin`, adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
