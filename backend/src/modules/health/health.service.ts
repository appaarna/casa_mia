import { getDatabaseVersion, pingDatabase } from "../../config/db";

export async function getHealthSnapshot() {
  await pingDatabase();

  return {
    status: "ok" as const,
    database: "ok" as const,
    databaseVersion: await getDatabaseVersion(),
    timestamp: new Date().toISOString()
  };
}
