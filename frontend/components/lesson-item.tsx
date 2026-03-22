import type { Video } from "@/lib/types";

interface LessonItemProps {
  video: Video;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

function formatSeconds(secs: number | null) {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LessonItem({ video, index, isActive, onClick }: LessonItemProps) {
  const isLocked = video.isLocked;
  const isCompleted = video.progress?.isCompleted ?? false;

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
        isActive
          ? "bg-coral/10 ring-1 ring-coral/30"
          : isLocked
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-charcoal-700"
      }`}
    >
      {/* Status icon / Index */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
          isCompleted
            ? "bg-coral text-white"
            : isActive
              ? "bg-coral/20 text-coral"
              : isLocked
                ? "bg-charcoal-900/50 border border-charcoal-600/50 text-muted/50"
                : "bg-charcoal-900 border border-charcoal-600 text-muted"
        }`}
      >
        {isCompleted ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : isLocked ? (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          index + 1
        )}
      </div>

      {/* Lesson info */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            isActive ? "text-coral" : isLocked ? "text-muted/50" : "text-cream"
          }`}
        >
          {video.title}
        </p>
        
        {/* Progress indicator or duration */}
        {!isCompleted && !isLocked && video.progress && video.progress.lastPositionSeconds > 0 ? (
          <div className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-charcoal-900 border border-charcoal-600/50">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{
                width: `${Math.min(100, (video.progress.lastPositionSeconds / (video.durationSeconds || 1)) * 100)}%`
              }}
            />
          </div>
        ) : (
          video.durationSeconds && (
            <p className="mt-0.5 text-xs text-muted">
              {formatSeconds(video.durationSeconds)}
            </p>
          )
        )}
      </div>
    </button>
  );
}
