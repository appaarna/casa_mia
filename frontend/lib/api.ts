import { useAuthStore } from "./auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

// ── Core fetch wrapper ──────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (res.status === 401) {
    // Try refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${useAuthStore.getState().accessToken}`;
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include"
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message ?? `HTTP ${retryRes.status}`);
      }
      return retryRes.json() as Promise<T>;
    }
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth endpoints ──────────────────────────────────────────────────

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) return false;

    const data = await res.json();
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ user: { id: number; email: string; name: string; role: string }; accessToken: string }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  useAuthStore.getState().setAuth(data.user, data.accessToken);
  return data;
}

export async function register(email: string, password: string, name: string) {
  const data = await apiFetch<{ user: { id: number; email: string; name: string; role: string }; accessToken: string }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify({ email, password, name }) }
  );
  useAuthStore.getState().setAuth(data.user, data.accessToken);
  return data;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // Ignore
  }
  useAuthStore.getState().clearAuth();
}

export async function tryRefreshOnLoad() {
  const ok = await refreshToken();
  if (!ok) {
    useAuthStore.getState().setLoading(false);
  }
}

// ── Subject endpoints ───────────────────────────────────────────────

export async function getSubjects() {
  return apiFetch<{ subjects: import("./types").Subject[] }>("/subjects");
}

export async function getSubjectTree(subjectId: number) {
  return apiFetch<import("./types").SubjectTree>(`/subjects/${subjectId}/tree`);
}

// ── Video endpoints ─────────────────────────────────────────────────

export async function getVideo(videoId: number) {
  return apiFetch<import("./types").Video>(`/videos/${videoId}`);
}

// ── Progress endpoints ──────────────────────────────────────────────

export async function getProgress(videoId: number) {
  return apiFetch<import("./types").VideoProgress>(`/progress/videos/${videoId}`);
}

export async function updateProgress(videoId: number, lastPositionSeconds: number) {
  return apiFetch(`/progress/videos/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ lastPositionSeconds })
  });
}

export async function completeProgress(videoId: number) {
  return apiFetch(`/progress/videos/${videoId}/complete`, { method: "POST" });
}

// ── Admin endpoints ─────────────────────────────────────────────────

export async function previewPlaylist(playlistId: string) {
  return apiFetch<import("./types").PlaylistPreview>(
    `/admin/import/youtube-playlist/${encodeURIComponent(playlistId)}/preview`
  );
}

export async function importPlaylist(playlistId: string) {
  return apiFetch<import("./types").ImportResult>("/admin/import/youtube-playlist", {
    method: "POST",
    body: JSON.stringify({ playlistId })
  });
}

export async function bulkImportPlaylists(playlistIds: string[]) {
  return apiFetch<import("./types").BulkImportResult>("/admin/import/youtube-playlists/bulk", {
    method: "POST",
    body: JSON.stringify({ playlistIds })
  });
}

export async function syncPlaylist(playlistId: string) {
  return apiFetch<{ updated: number; added: number; unpublished: number }>(
    `/admin/sync/youtube-playlist/${encodeURIComponent(playlistId)}`,
    { method: "POST" }
  );
}

export async function getImportedSubjects() {
  return apiFetch<{ subjects: import("./types").Subject[] }>("/admin/import/subjects");
}
