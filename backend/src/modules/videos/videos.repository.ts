import type { RowDataPacket } from "mysql2/promise";
import { getDbPool } from "../../config/db";

export interface VideoDetailRow extends RowDataPacket {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  order_index: number;
  duration_seconds: number | null;
  is_published: boolean;
  subject_id: number;
  subject_title: string;
}

export async function findVideoWithSubject(videoId: number): Promise<VideoDetailRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<VideoDetailRow[]>(
    `SELECT v.*, s.subject_id, sub.title AS subject_title
     FROM videos v
     JOIN sections s ON v.section_id = s.id
     JOIN subjects sub ON s.subject_id = sub.id
     WHERE v.id = ?
     LIMIT 1`,
    [videoId]
  );
  return rows[0] ?? null;
}
