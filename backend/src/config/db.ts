import { readFileSync } from "node:fs";
import mysql, { type Pool, type PoolOptions, type RowDataPacket } from "mysql2/promise";
import { env } from "./env";

let pool: Pool | null = null;

function getSslConfig(): PoolOptions["ssl"] {
  if (!env.db.ssl) {
    return undefined;
  }

  if (env.db.caCertPath) {
    return {
      ca: readFileSync(env.db.caCertPath, "utf8")
    };
  }

  return {};
}

export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    ssl: getSslConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
  });

  return pool;
}

export async function pingDatabase(): Promise<void> {
  const db = getDbPool();
  await db.query("SELECT 1");
}

interface VersionRow extends RowDataPacket {
  version: string;
}

export async function getDatabaseVersion(): Promise<string> {
  const db = getDbPool();
  const [rows] = await db.query<VersionRow[]>("SELECT VERSION() AS version");
  return String(rows[0]?.version ?? "unknown");
}

export async function closeDbPool(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
