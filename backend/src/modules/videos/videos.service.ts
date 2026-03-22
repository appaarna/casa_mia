import { AppError } from "../../utils/app-error";
import { findVideoWithSubject } from "./videos.repository";

export async function getVideo(videoId: number) {
  const video = await findVideoWithSubject(videoId);
  if (!video) {
    throw new AppError(404, "Video not found");
  }

  return {
    id: video.id,
    sectionId: video.section_id,
    title: video.title,
    description: video.description,
    youtubeVideoId: video.youtube_video_id,
    youtubeUrl: video.youtube_url,
    thumbnailUrl: video.thumbnail_url,
    orderIndex: video.order_index,
    durationSeconds: video.duration_seconds,
    subjectId: video.subject_id,
    subjectTitle: video.subject_title
  };
}
