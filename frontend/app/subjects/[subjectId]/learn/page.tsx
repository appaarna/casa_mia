"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSubjectTree, completeProgress } from "@/lib/api";
import type { SubjectTree, Video } from "@/lib/types";
import { YouTubePlayer } from "@/components/youtube-player";

export default function LearningPage() {
  const router = useRouter();
  const { subjectId } = useParams();
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get("videoId");
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [tree, setTree] = useState<SubjectTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getSubjectTree(Number(subjectId))
      .then((data) => setTree(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const allVideos = useMemo(() => {
    if (!tree) return [];
    return tree.sections.flatMap((s) => s.videos);
  }, [tree]);

  const currentVideo = useMemo(() => {
    if (!allVideos.length) return null;
    if (videoIdParam) {
      return allVideos.find((v) => v.id === Number(videoIdParam)) || allVideos[0];
    }
    const firstIncomplete = allVideos.find((v) => !v.progress?.isCompleted && !v.isLocked);
    return firstIncomplete || allVideos[0];
  }, [allVideos, videoIdParam]);

  const currentIndex = currentVideo ? allVideos.indexOf(currentVideo) : -1;
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  useEffect(() => {
    if (currentVideo) {
      const saved = localStorage.getItem(`notes_${currentVideo.id}`);
      setNotes(saved || "");
      setSaveStatus("");
    }
  }, [currentVideo?.id]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    if (currentVideo) {
      localStorage.setItem(`notes_${currentVideo.id}`, val);
    }
    setSaveStatus("Saved locally");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const extractYoutubeId = (url: string) => {
    try {
      if (url.includes("v=")) return url.split("v=")[1].split("&")[0];
      if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
      return url;
    } catch {
      return url;
    }
  };

  const handleComplete = async () => {
    if (!currentVideo) return;
    try {
      await completeProgress(currentVideo.id);
      const data = await getSubjectTree(Number(subjectId));
      setTree(data);
      const updatedAll = data.sections.flatMap(s => s.videos);
      const updatedNext = currentIndex < updatedAll.length - 1 ? updatedAll[currentIndex + 1] : null;
      if (updatedNext && !updatedNext.isLocked) {
        router.push(`/subjects/${subjectId}/learn?videoId=${updatedNext.id}`);
      }
    } catch (err) {
      console.error("Failed to complete lesson", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-charcoal-900">
        <div className="flex flex-col items-center gap-6">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-charcoal-700">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-coral" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Loading Module...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tree || !currentVideo) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-charcoal-900 px-6">
        <div className="rounded-2xl border border-charcoal-600 bg-charcoal-800 p-12 text-center max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-2">Unavailable</h2>
            <p className="text-muted text-sm">{error || "Lesson not found."}</p>
            <Link href={`/subjects/${subjectId}`} className="mt-6 inline-block rounded-xl bg-charcoal-700 px-6 py-2 text-sm font-semibold text-white hover:bg-charcoal-600 transition-colors">Go Back</Link>
        </div>
      </div>
    );
  }

  const isCompleted = currentVideo.progress?.isCompleted;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-charcoal-900">
      {/* Mobile sidebar toggle overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 z-40 bg-black/60 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Course Curriculum */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-80 transform flex-col border-r border-charcoal-600 bg-charcoal-800 transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0 mt-16" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-charcoal-600 px-6 py-5">
          <h2 className="text-base font-bold text-white truncate pr-4">{tree.subject.title}</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {tree.sections.map((section) => (
            <div key={section.id}>
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-muted">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.videos.map((video, idx) => {
                  const active = video.id === currentVideo.id;
                  const locked = video.isLocked;
                  const completed = video.progress?.isCompleted;
                  return (
                    <Link
                      key={video.id}
                      href={locked ? "#" : `/subjects/${tree.subject.id}/learn?videoId=${video.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        active ? "bg-coral/10 text-coral font-bold" : locked ? "pointer-events-none opacity-50" : "text-cream hover:bg-charcoal-700"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                          completed ? "bg-coral text-white" : active ? "bg-coral/20 text-coral" : locked ? "bg-charcoal-900 border border-charcoal-600 text-muted" : "bg-charcoal-900 border border-charcoal-600"
                      }`}>
                          {completed ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : locked ? (
                              <svg className="h-3 w-3 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          ) : (
                              idx + 1
                          )}
                      </div>
                      <span className="truncate">{video.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
            
            <div className="mb-4 flex items-center gap-4 lg:hidden">
                <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 rounded-lg border border-charcoal-600 bg-charcoal-800 px-3 py-1.5 text-sm font-semibold text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    Menu
                </button>
            </div>

            <div className="flex-1 w-full bg-charcoal-800 rounded-3xl overflow-hidden border border-charcoal-600/50 shadow-flat aspect-video max-h-[70vh]">
                <YouTubePlayer
                    videoId={extractYoutubeId(currentVideo.youtubeUrl)}
                    startSeconds={currentVideo.progress?.lastPositionSeconds || 0}
                    onProgress={(seconds) => {
                        import("@/lib/api").then((m) => m.updateProgress(currentVideo.id, seconds).catch(console.error));
                    }}
                    onComplete={handleComplete}
                />
            </div>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 pr-6">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl mb-6">{currentVideo.title}</h1>
                    
                    {/* Notes Area */}
                    <div className="flex flex-col rounded-2xl border border-charcoal-600 bg-charcoal-800 shadow-flat-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-charcoal-600 bg-charcoal-700/50 px-4 py-2.5">
                            <span className="text-sm font-bold text-cream flex items-center gap-2">
                                <svg className="w-4 h-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Personal Notes
                            </span>
                            {saveStatus && <span className="text-xs font-semibold text-coral animate-fade-in">{saveStatus}</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Type your notes here... (Saves automatically to your browser)"
                            className="w-full min-h-[200px] resize-y bg-transparent p-4 text-sm text-muted focus:text-white focus:outline-none focus:ring-0 leading-relaxed"
                        />
                    </div>
                </div>
                
                <div className="flex shrink-0 items-center gap-3">
                    {prevVideo && (
                        <Link 
                            href={`/subjects/${subjectId}/learn?videoId=${prevVideo.id}`}
                            className="flex items-center justify-center rounded-xl border border-charcoal-600 bg-charcoal-800 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-charcoal-700"
                        >
                            Previous
                        </Link>
                    )}
                    
                    {!isCompleted ? (
                        <button
                            onClick={handleComplete}
                            className="flex items-center justify-center gap-2 rounded-xl bg-coral px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-coral-light shadow-flat-sm"
                        >
                            Mark Complete
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    ) : (
                        nextVideo && !nextVideo.isLocked ? (
                            <Link
                                href={`/subjects/${subjectId}/learn?videoId=${nextVideo.id}`}
                                className="flex items-center justify-center gap-2 rounded-xl border border-pink text-pink px-6 py-2.5 text-sm font-bold transition-all hover:bg-pink hover:text-charcoal-900"
                            >
                                Next Lesson
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 rounded-xl bg-charcoal-800 border border-charcoal-600 px-6 py-2.5 text-sm font-bold text-coral opacity-80 cursor-default">
                                Completed
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )
                    )}
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
