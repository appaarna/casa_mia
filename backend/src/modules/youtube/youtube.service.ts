import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import type {
  PlaylistPreview,
  PlaylistVideoPreview,
  YouTubePlaylistItemResource,
  YouTubePlaylistItemsResponse,
  YouTubePlaylistListResponse,
  YouTubeVideoListResponse
} from "./youtube.types";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

// ── Helpers ─────────────────────────────────────────────────────────

function apiKey(): string {
  return env.youtubeApiKey;
}

function bestThumbnail(
  thumbnails: Record<string, { url: string } | undefined> | undefined
): string | null {
  if (!thumbnails) return null;
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    null
  );
}

/** Parse ISO 8601 duration (e.g. PT4M13S) to total seconds */
export function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// ── YouTube Data API calls ──────────────────────────────────────────

export async function fetchPlaylistMetadata(playlistId: string) {
  const url = `${YT_API_BASE}/playlists?part=snippet&id=${encodeURIComponent(playlistId)}&key=${apiKey()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new AppError(502, `YouTube API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as YouTubePlaylistListResponse;

  if (!data.items || data.items.length === 0) {
    throw new AppError(404, `YouTube playlist not found: ${playlistId}`);
  }

  return data.items[0];
}

export async function fetchAllPlaylistItems(
  playlistId: string
): Promise<YouTubePlaylistItemResource[]> {
  const items: YouTubePlaylistItemResource[] = [];
  let pageToken: string | undefined;

  do {
    let url = `${YT_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=50&key=${apiKey()}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new AppError(502, `YouTube API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as YouTubePlaylistItemsResponse;
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

export async function fetchVideoDurations(
  videoIds: string[]
): Promise<Map<string, number>> {
  const durationMap = new Map<string, number>();
  if (videoIds.length === 0) return durationMap;

  // YouTube API accepts up to 50 IDs per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const url = `${YT_API_BASE}/videos?part=contentDetails&id=${chunk.join(",")}&key=${apiKey()}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new AppError(502, `YouTube API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as YouTubeVideoListResponse;
    for (const video of data.items ?? []) {
      durationMap.set(video.id, parseIsoDuration(video.contentDetails.duration));
    }
  }

  return durationMap;
}

// ── Composite helpers ───────────────────────────────────────────────

export async function buildPlaylistPreview(playlistId: string): Promise<PlaylistPreview> {
  const playlist = await fetchPlaylistMetadata(playlistId);
  const items = await fetchAllPlaylistItems(playlistId);

  // Fetch durations for all videos
  const videoIds = items
    .map((item) => item.contentDetails?.videoId ?? item.snippet.resourceId.videoId)
    .filter(Boolean);
  const durations = await fetchVideoDurations(videoIds);

  const videos: PlaylistVideoPreview[] = items
    .filter((item) => item.snippet.resourceId.kind === "youtube#video")
    .map((item) => {
      const videoId = item.contentDetails?.videoId ?? item.snippet.resourceId.videoId;
      return {
        youtubeVideoId: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
        position: item.snippet.position,
        durationSeconds: durations.get(videoId) ?? null
      };
    })
    .sort((a, b) => a.position - b.position);

  return {
    playlistId,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnailUrl: bestThumbnail(playlist.snippet.thumbnails),
    channelTitle: playlist.snippet.channelTitle,
    videoCount: videos.length,
    videos
  };
}
