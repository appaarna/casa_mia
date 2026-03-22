"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { tryRefreshOnLoad } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    tryRefreshOnLoad();
  }, []);

  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal-900">
        <div className="flex flex-col items-center gap-6">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-charcoal-700">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-coral" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Loading Casa Mia
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
