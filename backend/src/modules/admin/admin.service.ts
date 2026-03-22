import { AppError } from "../../utils/app-error";
import {
  buildPlaylistPreview,
  fetchAllPlaylistItems,
  fetchPlaylistMetadata,
  fetchVideoDurations
} from "../youtube/youtube.service";
import type { PlaylistPreview } from "../youtube/youtube.types";
import {
  findDefaultSection,
  findSubjectByPlaylistId,
  findVideosBySectionId,
  listImportedSubjects,
  unpublishVideosByIds,
  upsertDefaultSection,
  upsertSubject,
  upsertVideo,
  type SubjectRow
} from "./admin.repository";

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
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

// ── Public service functions ────────────────────────────────────────

export async function previewPlaylist(playlistId: string): Promise<PlaylistPreview> {
  return buildPlaylistPreview(playlistId);
}

export async function importPlaylist(
  playlistId: string
): Promise<{ subjectId: number; videosImported: number }> {
  const playlist = await fetchPlaylistMetadata(playlistId);
  const items = await fetchAllPlaylistItems(playlistId);

  // Fetch durations
  const videoIds = items
    .map((item) => item.contentDetails?.videoId ?? item.snippet.resourceId.videoId)
    .filter(Boolean);
  const durations = await fetchVideoDurations(videoIds);

  // Upsert subject
  const title = playlist.snippet.title;
  const slug = slugify(title);
  const subjectId = await upsertSubject({
    title,
    slug,
    description: playlist.snippet.description || "Imported from YouTube",
    youtubePlaylistId: playlistId,
    thumbnailUrl: bestThumbnail(playlist.snippet.thumbnails)
  });

  // Upsert default section
  const sectionId = await upsertDefaultSection(subjectId);

  // Upsert videos
  let count = 0;
  for (const item of items) {
    if (item.snippet.resourceId.kind !== "youtube#video") continue;

    const videoId = item.contentDetails?.videoId ?? item.snippet.resourceId.videoId;

    await upsertVideo({
      sectionId,
      title: item.snippet.title,
      description: item.snippet.description || null,
      youtubeVideoId: videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
      orderIndex: item.snippet.position + 1,
      durationSeconds: durations.get(videoId) ?? null
    });
    count++;
  }

  return { subjectId, videosImported: count };
}

export async function bulkImportPlaylists(
  playlistIds: string[]
): Promise<{ results: Array<{ playlistId: string; subjectId?: number; videosImported?: number; error?: string }> }> {
  const results = [];

  for (const playlistId of playlistIds) {
    try {
      const result = await importPlaylist(playlistId);
      results.push({ playlistId, subjectId: result.subjectId, videosImported: result.videosImported });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      results.push({ playlistId, error: message });
    }
  }

  return { results };
}

export async function syncPlaylist(
  playlistId: string
): Promise<{ updated: number; added: number; unpublished: number }> {
  const existingSubject = await findSubjectByPlaylistId(playlistId);
  if (!existingSubject) {
    throw new AppError(404, `No imported subject found for playlist: ${playlistId}`);
  }

  const playlist = await fetchPlaylistMetadata(playlistId);
  const items = await fetchAllPlaylistItems(playlistId);
  const videoIds = items
    .map((item) => item.contentDetails?.videoId ?? item.snippet.resourceId.videoId)
    .filter(Boolean);
  const durations = await fetchVideoDurations(videoIds);

  // Update subject metadata
  await upsertSubject({
    title: playlist.snippet.title,
    slug: slugify(playlist.snippet.title),
    description: playlist.snippet.description || "Imported from YouTube",
    youtubePlaylistId: playlistId,
    thumbnailUrl: bestThumbnail(playlist.snippet.thumbnails)
  });

  // Ensure default section
  const section = await findDefaultSection(existingSubject.id);
  const sectionId = section ? section.id : await upsertDefaultSection(existingSubject.id);

  // Track which YT video IDs are still in the playlist
  const currentYtVideoIds = new Set<string>();
  let added = 0;
  let updated = 0;

  for (const item of items) {
    if (item.snippet.resourceId.kind !== "youtube#video") continue;

    const ytVideoId = item.contentDetails?.videoId ?? item.snippet.resourceId.videoId;
    currentYtVideoIds.add(ytVideoId);

    await upsertVideo({
      sectionId,
      title: item.snippet.title,
      description: item.snippet.description || null,
      youtubeVideoId: ytVideoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${ytVideoId}`,
      thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
      orderIndex: item.snippet.position + 1,
      durationSeconds: durations.get(ytVideoId) ?? null
    });
    updated++;
  }

  // Unpublish videos no longer in playlist
  const existingVideos = await findVideosBySectionId(sectionId);
  const toUnpublish = existingVideos
    .filter(
      (v) =>
        v.youtube_video_id && !currentYtVideoIds.has(v.youtube_video_id) && v.is_published
    )
    .map((v) => v.id);

  await unpublishVideosByIds(toUnpublish);

  return { updated, added: updated - (existingVideos.length - toUnpublish.length), unpublished: toUnpublish.length };
}

export async function getImportedSubjects(): Promise<SubjectRow[]> {
  return listImportedSubjects();
}
