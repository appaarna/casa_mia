import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { env } from "../src/config/env";

function getSslConfig() {
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

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    ssl: getSslConfig(),
    multipleStatements: true
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\``);
  await connection.end();
}

interface AppliedMigrationRow extends RowDataPacket {
  filename: string;
}

async function run() {
  await ensureDatabase();

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    ssl: getSslConfig(),
    multipleStatements: true
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_filename (filename)
    )
  `);

  const [appliedRows] = await connection.query<AppliedMigrationRow[]>(
    "SELECT filename FROM schema_migrations"
  );
  const applied = new Set(appliedRows.map((row) => row.filename));

  const migrationsDir = path.resolve(__dirname, "../migrations");
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), "utf8");

    await connection.beginTransaction();
    try {
      await connection.query(sql);
      await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file]);
      await connection.commit();
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  await connection.end();
}

run().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
