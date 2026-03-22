"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  startSeconds?: number;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
  onReady?: () => void;
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) {
      resolve();
      return;
    }

    readyCallbacks.push(resolve);

    if (apiLoaded) return;
    apiLoaded = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };
  });
}

export function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onProgress,
  onComplete,
  onReady
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoIdRef = useRef(videoId);

  const startProgressTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const time = Math.floor(playerRef.current.getCurrentTime());
        onProgress?.(time);
      }
    }, 10000);
  }, [onProgress]);

  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    videoIdRef.current = videoId;

    async function init() {
      await loadYouTubeAPI();

      if (!containerRef.current) return;

      // Destroy existing player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Create new div for the player
      const playerDiv = document.createElement("div");
      playerDiv.id = `yt-player-${videoId}`;
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv.id, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          start: startSeconds > 0 ? startSeconds : undefined
        },
        events: {
          onReady: () => {
            onReady?.();
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startProgressTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              stopProgressTracking();
              if (playerRef.current) {
                const currentTime = Math.floor(playerRef.current.getCurrentTime());
                onProgress?.(currentTime);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              stopProgressTracking();
              onComplete?.();
            }
          }
        }
      });
    }

    init();

    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-charcoal-900 border-none">
      <div ref={containerRef} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full border-none" />
    </div>
  );
}
