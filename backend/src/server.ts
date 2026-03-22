import { createServer } from "node:http";
import { createApp } from "./app";
import { closeDbPool, pingDatabase } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await pingDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}${env.apiBasePath}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDbPool();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch(async (error) => {
  console.error("Failed to bootstrap backend", error);
  await closeDbPool();
  process.exit(1);
});
