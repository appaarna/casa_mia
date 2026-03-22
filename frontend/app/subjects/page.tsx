"use client";

import { useEffect, useState } from "react";
import { getSubjects } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { SubjectCard } from "@/components/subject-card";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubjects()
      .then((data) => {
        setSubjects(data.subjects);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-8 w-48 rounded-md bg-charcoal-700 animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-charcoal-800 animate-pulse border border-charcoal-600/30" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex rounded-2xl border border-charcoal-600 bg-charcoal-800 p-12 flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-900/30 flex items-center justify-center text-coral mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Connection Error</h2>
          <p className="text-muted max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Subject Library</h1>
          <p className="text-muted">Select a module to continue your progress.</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-charcoal-600 border-dashed bg-charcoal-800/50 py-32 text-center">
          <svg className="w-16 h-16 text-charcoal-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">No active subjects</h3>
          <p className="text-muted max-w-sm">
            The curriculum is currently empty. Administrators must import content via the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
