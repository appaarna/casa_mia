import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDbPool } from "../../config/db";

export interface ProgressRow extends RowDataPacket {
  id: number;
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function findProgress(userId: number, videoId: number): Promise<ProgressRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<ProgressRow[]>(
    `SELECT * FROM video_progress
     WHERE user_id = ? AND video_id = ?
     LIMIT 1`,
    [userId, videoId]
  );
  return rows[0] ?? null;
}

export async function upsertProgress(
  userId: number,
  videoId: number,
  lastPositionSeconds: number
): Promise<void> {
  const db = getDbPool();
  await db.execute<ResultSetHeader>(
    `INSERT INTO video_progress (user_id, video_id, last_position_seconds)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       last_position_seconds = VALUES(last_position_seconds),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, videoId, lastPositionSeconds]
  );
}

export async function markCompleted(userId: number, videoId: number): Promise<void> {
  const db = getDbPool();
  await db.execute<ResultSetHeader>(
    `INSERT INTO video_progress (user_id, video_id, is_completed, completed_at)
     VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       is_completed = TRUE,
       completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, videoId]
  );
}
