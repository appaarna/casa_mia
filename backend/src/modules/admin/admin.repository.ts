import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDbPool } from "../../config/db";

// ── Row types ───────────────────────────────────────────────────────

export interface SubjectRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  description: string;
  youtube_playlist_id: string | null;
  thumbnail_url: string | null;
  source_type: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SectionRow extends RowDataPacket {
  id: number;
  subject_id: number;
  title: string;
  order_index: number;
}

export interface VideoRow extends RowDataPacket {
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
}

// ── Subject queries ─────────────────────────────────────────────────

export async function findSubjectByPlaylistId(playlistId: string): Promise<SubjectRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<SubjectRow[]>(
    "SELECT * FROM subjects WHERE youtube_playlist_id = ? LIMIT 1",
    [playlistId]
  );
  return rows[0] ?? null;
}

export async function upsertSubject(data: {
  title: string;
  slug: string;
  description: string;
  youtubePlaylistId: string;
  thumbnailUrl: string | null;
}): Promise<number> {
  const db = getDbPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO subjects (title, slug, description, youtube_playlist_id, thumbnail_url, source_type, is_published)
     VALUES (?, ?, ?, ?, ?, 'youtube', TRUE)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       thumbnail_url = VALUES(thumbnail_url),
       updated_at = CURRENT_TIMESTAMP`,
    [data.title, data.slug, data.description, data.youtubePlaylistId, data.thumbnailUrl]
  );

  // If insertId is 0, it was an update — fetch the existing ID
  if (result.insertId > 0) return result.insertId;

  const existing = await findSubjectByPlaylistId(data.youtubePlaylistId);
  return existing!.id;
}

// ── Section queries ─────────────────────────────────────────────────

export async function findDefaultSection(subjectId: number): Promise<SectionRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<SectionRow[]>(
    "SELECT * FROM sections WHERE subject_id = ? AND order_index = 1 LIMIT 1",
    [subjectId]
  );
  return rows[0] ?? null;
}

export async function upsertDefaultSection(subjectId: number): Promise<number> {
  const db = getDbPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO sections (subject_id, title, order_index)
     VALUES (?, 'Playlist Lessons', 1)
     ON DUPLICATE KEY UPDATE title = VALUES(title)`,
    [subjectId]
  );

  if (result.insertId > 0) return result.insertId;

  const existing = await findDefaultSection(subjectId);
  return existing!.id;
}

// ── Video queries ───────────────────────────────────────────────────

export async function upsertVideo(data: {
  sectionId: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  orderIndex: number;
  durationSeconds: number | null;
}): Promise<number> {
  const db = getDbPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO videos (
       section_id, title, description, youtube_video_id,
       youtube_url, thumbnail_url, order_index, duration_seconds, is_published
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       youtube_url = VALUES(youtube_url),
       thumbnail_url = VALUES(thumbnail_url),
       order_index = VALUES(order_index),
       duration_seconds = VALUES(duration_seconds),
       is_published = TRUE,
       updated_at = CURRENT_TIMESTAMP`,
    [
      data.sectionId,
      data.title,
      data.description,
      data.youtubeVideoId,
      data.youtubeUrl,
      data.thumbnailUrl,
      data.orderIndex,
      data.durationSeconds
    ]
  );
  return result.insertId > 0 ? result.insertId : 0;
}

export async function findVideosBySectionId(sectionId: number): Promise<VideoRow[]> {
  const db = getDbPool();
  const [rows] = await db.query<VideoRow[]>(
    "SELECT * FROM videos WHERE section_id = ? ORDER BY order_index ASC",
    [sectionId]
  );
  return rows;
}

export async function unpublishVideosByIds(videoIds: number[]): Promise<void> {
  if (videoIds.length === 0) return;
  const db = getDbPool();
  const placeholders = videoIds.map(() => "?").join(",");
  await db.execute(
    `UPDATE videos SET is_published = FALSE WHERE id IN (${placeholders})`,
    videoIds
  );
}

export async function listImportedSubjects(): Promise<SubjectRow[]> {
  const db = getDbPool();
  const [rows] = await db.query<SubjectRow[]>(
    "SELECT * FROM subjects WHERE source_type = 'youtube' ORDER BY created_at DESC"
  );
  return rows;
}
