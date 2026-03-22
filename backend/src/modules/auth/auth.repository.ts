import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDbPool } from "../../config/db";

export interface UserRecord extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshTokenRecord extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getDbPool();
  const [rows] = await db.query<UserRecord[]>(
    "SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const db = getDbPool();
  const [rows] = await db.query<UserRecord[]>(
    "SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}): Promise<number> {
  const db = getDbPool();
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
    [input.email, input.passwordHash, input.name, input.role]
  );

  return Number(result.insertId);
}

export async function insertRefreshToken(input: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  const db = getDbPool();
  await db.execute(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [input.userId, input.tokenHash, input.expiresAt]
  );
}

export async function findActiveRefreshToken(input: {
  userId: number;
  tokenHash: string;
}): Promise<RefreshTokenRecord | null> {
  const db = getDbPool();
  const [rows] = await db.query<RefreshTokenRecord[]>(
    `
      SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
      FROM refresh_tokens
      WHERE user_id = ?
        AND token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > UTC_TIMESTAMP()
      LIMIT 1
    `,
    [input.userId, input.tokenHash]
  );

  return rows[0] ?? null;
}

export async function revokeRefreshTokenByHash(input: {
  userId: number;
  tokenHash: string;
}): Promise<void> {
  const db = getDbPool();
  await db.execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP())
      WHERE user_id = ? AND token_hash = ?
    `,
    [input.userId, input.tokenHash]
  );
}
