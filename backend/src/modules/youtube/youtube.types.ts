// ── YouTube Data API v3 response types ──────────────────────────────

export interface YouTubePlaylistSnippet {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubePlaylistResource {
  id: string;
  snippet: YouTubePlaylistSnippet;
}

export interface YouTubePlaylistListResponse {
  items: YouTubePlaylistResource[];
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export interface YouTubePlaylistItemSnippet {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    standard?: { url: string };
    maxres?: { url: string };
  };
  position: number;
  resourceId: { kind: string; videoId: string };
}

export interface YouTubePlaylistItemResource {
  snippet: YouTubePlaylistItemSnippet;
  contentDetails: { videoId: string; videoPublishedAt: string };
}

export interface YouTubePlaylistItemsResponse {
  items: YouTubePlaylistItemResource[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export interface YouTubeVideoContentDetails {
  duration: string; // ISO 8601 e.g. "PT4M13S"
}

export interface YouTubeVideoResource {
  id: string;
  contentDetails: YouTubeVideoContentDetails;
}

export interface YouTubeVideoListResponse {
  items: YouTubeVideoResource[];
}

// ── App-level types ─────────────────────────────────────────────────

export interface PlaylistPreview {
  playlistId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  channelTitle: string;
  videoCount: number;
  videos: PlaylistVideoPreview[];
}

export interface PlaylistVideoPreview {
  youtubeVideoId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  position: number;
  durationSeconds: number | null;
}
