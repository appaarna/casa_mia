"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSubjectTree } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { SubjectTree } from "@/lib/types";
import { LessonItem } from "@/components/lesson-item";

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [tree, setTree] = useState<SubjectTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const PRICES = [999, 799, 399, 499, 899];
  const coursePrice = tree ? PRICES[tree.subject.id % PRICES.length] : 999;

  useEffect(() => {
    getSubjectTree(Number(subjectId))
      .then((data) => setTree(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    if (!tree) return { completedCount: 0, totalCount: 0, progressPercent: 0 };
    let c = 0;
    let t = 0;
    for (const sec of tree.sections) {
      for (const vid of sec.videos) {
        t++;
        if (vid.progress?.isCompleted) c++;
      }
    }
    return {
      completedCount: c,
      totalCount: t,
      progressPercent: t === 0 ? 0 : Math.round((c / t) * 100)
    };
  }, [tree]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 animate-pulse">
        <div className="h-64 w-full rounded-3xl bg-charcoal-800 border border-charcoal-600/30 mb-12" />
        <div className="h-10 w-48 bg-charcoal-700 rounded-xl mb-6" />
        <div className="space-y-4">
          {[1,2,3,4].map(n => <div key={n} className="h-16 bg-charcoal-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !tree) {
    return (
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <div className="inline-flex rounded-2xl border border-charcoal-600 bg-charcoal-800 p-12 flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-900/30 flex items-center justify-center text-coral mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Course unavailable</h2>
                <p className="text-muted max-w-md">{error || "Subject not found."}</p>
            </div>
        </div>
    );
  }

  const { subject, sections } = tree;
  const isStarted = progressPercent > 0;
  const isFinished = progressPercent === 100;

  let nextLessonUrl = `/subjects/${subject.id}/learn`;
  
  if (isStarted && !isFinished) {
    for (const sec of sections) {
      const nextVid = sec.videos.find((v) => !v.progress?.isCompleted && !v.isLocked);
      if (nextVid) {
        nextLessonUrl = `/subjects/${subject.id}/learn?videoId=${nextVid.id}`;
        break;
      }
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-charcoal-900 pb-20">
      {/* Hero Section */}
      <div className="border-b border-charcoal-600/30 bg-charcoal-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-start">
            
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden rounded-2xl md:w-1/3 aspect-video bg-charcoal-900 border border-charcoal-600/50 shadow-flat-sm">
                {subject.thumbnailUrl ? (
                    <img src={subject.thumbnailUrl} alt={subject.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal-500">
                        <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /></svg>
                    </div>
                )}
                <div className="absolute top-4 left-4 rounded-md bg-charcoal-900/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pink backdrop-blur-sm border border-charcoal-600/50">
                    Video Course
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <Link href="/subjects" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-coral">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </Link>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {subject.title}
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted">
                {subject.description || "No description provided for this module."}
              </p>

              {/* Progress & Actions */}
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                {!user ? (
                  <button
                    onClick={() => router.push("/auth/register")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-10 py-4 text-base font-bold text-white transition-all hover:bg-coral-light shadow-flat w-full sm:w-auto"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Enroll for ₹{coursePrice}
                  </button>
                ) : (
                  <Link
                    href={nextLessonUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-8 py-4 text-sm font-bold text-white transition-all hover:bg-coral-light hover:shadow-flat w-full sm:w-auto"
                  >
                    {isFinished ? (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Review Course
                      </>
                    ) : isStarted ? (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Resume Learning
                      </>
                    ) : (
                      "Begin Module"
                    )}
                  </Link>
                )}

                {user ? (
                  <div className="flex-1 w-full max-w-xs">
                    <div className="mb-2 flex justify-between text-sm font-bold text-cream">
                      <span>Course Progress</span>
                      <span className="text-coral">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-charcoal-900 border border-charcoal-600/30">
                      <div
                        className="h-full rounded-full bg-coral transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted">
                      {completedCount} of {totalCount} lessons completed
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm font-medium text-muted">
                    <div className="flex flex-col gap-1">
                      <span className="text-cream font-bold">Full Lifetime Access</span>
                      <span>Learn at your own pace anytime.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="h-6 w-2 rounded-full bg-coral" />
          Curriculum Structure
        </h2>
        
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-charcoal-600 overflow-hidden bg-charcoal-800 shadow-flat-sm">
              <div className="border-b border-charcoal-600 bg-charcoal-700/50 px-6 py-4">
                <h3 className="text-lg font-bold text-cream">{section.title}</h3>
              </div>
              <div className="divide-y divide-charcoal-600/50 p-2">
                {section.videos.map((video, idx) => (
                  <LessonItem
                    key={video.id}
                    video={video}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
