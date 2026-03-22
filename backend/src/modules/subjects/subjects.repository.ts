import type { RowDataPacket } from "mysql2/promise";
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

export interface ProgressRow extends RowDataPacket {
  video_id: number;
  last_position_seconds: number;
  is_completed: boolean;
  completed_at: Date | null;
}

// ── Subject queries ─────────────────────────────────────────────────

export async function findAllPublishedSubjects(): Promise<SubjectRow[]> {
  const db = getDbPool();
  const [rows] = await db.query<SubjectRow[]>(
    "SELECT * FROM subjects WHERE is_published = TRUE ORDER BY created_at DESC"
  );
  return rows;
}

export async function findSubjectById(id: number): Promise<SubjectRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<SubjectRow[]>(
    "SELECT * FROM subjects WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function findSubjectBySlug(slug: string): Promise<SubjectRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<SubjectRow[]>(
    "SELECT * FROM subjects WHERE slug = ? LIMIT 1",
    [slug]
  );
  return rows[0] ?? null;
}

// ── Section queries ─────────────────────────────────────────────────

export async function findSectionsBySubjectId(subjectId: number): Promise<SectionRow[]> {
  const db = getDbPool();
  const [rows] = await db.query<SectionRow[]>(
    "SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC",
    [subjectId]
  );
  return rows;
}

// ── Video queries ───────────────────────────────────────────────────

export async function findVideosBySectionId(sectionId: number): Promise<VideoRow[]> {
  const db = getDbPool();
  const [rows] = await db.query<VideoRow[]>(
    "SELECT * FROM videos WHERE section_id = ? AND is_published = TRUE ORDER BY order_index ASC",
    [sectionId]
  );
  return rows;
}

export async function findVideoById(videoId: number): Promise<VideoRow | null> {
  const db = getDbPool();
  const [rows] = await db.query<VideoRow[]>(
    "SELECT * FROM videos WHERE id = ? LIMIT 1",
    [videoId]
  );
  return rows[0] ?? null;
}

// ── Progress queries ────────────────────────────────────────────────

export async function findProgressForSubject(
  userId: number,
  videoIds: number[]
): Promise<ProgressRow[]> {
  if (videoIds.length === 0) return [];
  const db = getDbPool();
  const placeholders = videoIds.map(() => "?").join(",");
  const [rows] = await db.query<ProgressRow[]>(
    `SELECT video_id, last_position_seconds, is_completed, completed_at
     FROM video_progress
     WHERE user_id = ? AND video_id IN (${placeholders})`,
    [userId, ...videoIds]
  );
  return rows;
}

export async function countSubjectVideos(subjectId: number): Promise<number> {
  const db = getDbPool();
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM videos v
     JOIN sections s ON v.section_id = s.id
     WHERE s.subject_id = ? AND v.is_published = TRUE`,
    [subjectId]
  );
  return Number((rows[0] as { count: number }).count);
}
