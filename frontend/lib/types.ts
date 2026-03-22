// ── Subject types ───────────────────────────────────────────────────

export interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  youtubePlaylistId: string | null;
  sourceType: string;
  videoCount: number;
}

export interface VideoProgress {
  lastPositionSeconds: number;
  isCompleted: boolean;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  orderIndex: number;
  durationSeconds: number | null;
  progress: VideoProgress | null;
  isLocked: boolean;
}

export interface Section {
  id: number;
  title: string;
  orderIndex: number;
  videos: Video[];
}

export interface SubjectTree {
  subject: {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    youtubePlaylistId: string | null;
  };
  sections: Section[];
}

// ── Auth types ──────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

// ── Admin types ─────────────────────────────────────────────────────

export interface PlaylistPreview {
  playlistId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  channelTitle: string;
  videoCount: number;
  videos: {
    youtubeVideoId: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    position: number;
    durationSeconds: number | null;
  }[];
}

export interface ImportResult {
  subjectId: number;
  videosImported: number;
}

export interface BulkImportResult {
  results: {
    playlistId: string;
    subjectId?: number;
    videosImported?: number;
    error?: string;
  }[];
}
