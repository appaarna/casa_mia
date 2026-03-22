import { findProgress, markCompleted, upsertProgress } from "./progress.repository";

export async function getVideoProgress(userId: number, videoId: number) {
  const progress = await findProgress(userId, videoId);
  if (!progress) {
    return { lastPositionSeconds: 0, isCompleted: false, completedAt: null };
  }
  return {
    lastPositionSeconds: progress.last_position_seconds,
    isCompleted: !!progress.is_completed,
    completedAt: progress.completed_at
  };
}

export async function updateVideoProgress(
  userId: number,
  videoId: number,
  lastPositionSeconds: number
): Promise<void> {
  await upsertProgress(userId, videoId, lastPositionSeconds);
}

export async function completeVideo(userId: number, videoId: number): Promise<void> {
  await markCompleted(userId, videoId);
}
