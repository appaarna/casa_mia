import { AppError } from "../../utils/app-error";
import {
  countSubjectVideos,
  findAllPublishedSubjects,
  findProgressForSubject,
  findSectionsBySubjectId,
  findSubjectById,
  findVideosBySectionId,
  type SubjectRow,
  type VideoRow
} from "./subjects.repository";

// ── Types ───────────────────────────────────────────────────────────

interface SubjectListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  youtubePlaylistId: string | null;
  sourceType: string;
  videoCount: number;
}

interface SubjectTree {
  subject: {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    youtubePlaylistId: string | null;
  };
  sections: SectionWithVideos[];
}

interface SectionWithVideos {
  id: number;
  title: string;
  orderIndex: number;
  videos: VideoWithProgress[];
}

interface VideoWithProgress {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  orderIndex: number;
  durationSeconds: number | null;
  progress: { lastPositionSeconds: number; isCompleted: boolean } | null;
  isLocked: boolean;
}

// ── Service functions ───────────────────────────────────────────────

export async function getAllSubjects(): Promise<SubjectListItem[]> {
  const subjects = await findAllPublishedSubjects();
  const result: SubjectListItem[] = [];

  for (const s of subjects) {
    const videoCount = await countSubjectVideos(s.id);
    result.push({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      thumbnailUrl: s.thumbnail_url,
      youtubePlaylistId: s.youtube_playlist_id,
      sourceType: s.source_type,
      videoCount
    });
  }

  return result;
}

export async function getSubjectById(subjectId: number): Promise<SubjectRow> {
  const subject = await findSubjectById(subjectId);
  if (!subject) {
    throw new AppError(404, "Subject not found");
  }
  return subject;
}

export async function getSubjectTree(
  subjectId: number,
  userId?: number
): Promise<SubjectTree> {
  const subject = await findSubjectById(subjectId);
  if (!subject) {
    throw new AppError(404, "Subject not found");
  }

  const sections = await findSectionsBySubjectId(subjectId);

  // Gather all videos
  const allVideos: { sectionId: number; video: VideoRow }[] = [];
  const sectionVideosMap = new Map<number, VideoRow[]>();

  for (const section of sections) {
    const videos = await findVideosBySectionId(section.id);
    sectionVideosMap.set(section.id, videos);
    for (const v of videos) {
      allVideos.push({ sectionId: section.id, video: v });
    }
  }

  // Fetch progress if user is authenticated
  const allVideoIds = allVideos.map((av) => av.video.id);
  const progressRows = userId
    ? await findProgressForSubject(userId, allVideoIds)
    : [];
  const progressMap = new Map(progressRows.map((p) => [p.video_id, p]));

  // Build flat video list for locking logic (ordered by section order, then video order)
  const flatVideoList = allVideos.sort((a, b) => {
    const sA = sections.find((s) => s.id === a.sectionId)!;
    const sB = sections.find((s) => s.id === b.sectionId)!;
    if (sA.order_index !== sB.order_index) return sA.order_index - sB.order_index;
    return a.video.order_index - b.video.order_index;
  });

  // Compute lock states: first is unlocked, rest require previous completed
  const lockMap = new Map<number, boolean>();
  for (let i = 0; i < flatVideoList.length; i++) {
    if (i === 0) {
      lockMap.set(flatVideoList[i].video.id, false);
    } else {
      const prevVideoId = flatVideoList[i - 1].video.id;
      const prevProgress = progressMap.get(prevVideoId);
      lockMap.set(flatVideoList[i].video.id, !prevProgress?.is_completed);
    }
  }

  // Build response tree
  const treeSections: SectionWithVideos[] = sections.map((section) => {
    const videos = sectionVideosMap.get(section.id) ?? [];
    return {
      id: section.id,
      title: section.title,
      orderIndex: section.order_index,
      videos: videos.map((v) => {
        const progress = progressMap.get(v.id);
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          youtubeVideoId: v.youtube_video_id,
          youtubeUrl: v.youtube_url,
          thumbnailUrl: v.thumbnail_url,
          orderIndex: v.order_index,
          durationSeconds: v.duration_seconds,
          progress: progress
            ? {
                lastPositionSeconds: progress.last_position_seconds,
                isCompleted: !!progress.is_completed
              }
            : null,
          isLocked: lockMap.get(v.id) ?? true
        };
      })
    };
  });

  return {
    subject: {
      id: subject.id,
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      thumbnailUrl: subject.thumbnail_url,
      youtubePlaylistId: subject.youtube_playlist_id
    },
    sections: treeSections
  };
}
