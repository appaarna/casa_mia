"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { previewPlaylist, importPlaylist, bulkImportPlaylists } from "@/lib/api";
import type { PlaylistPreview } from "@/lib/types";

export default function AdminImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PlaylistPreview | null>(null);
  const [mode, setMode] = useState<"single" | "bulk">("single");

  const extractPlaylistId = (input: string) => {
    try {
      if (!input.includes("http")) return input;
      const urlObj = new URL(input);
      return urlObj.searchParams.get("list") || input;
    } catch {
      return input;
    }
  };

  const handlePreview = async () => {
    if (!url) return;
    setError("");
    setLoading(true);
    try {
      const pId = extractPlaylistId(url);
      const data = await previewPlaylist(pId);
      setPreview(data);
    } catch (err: any) {
      setError(err.message || "Failed to preview playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setError("");
    setLoading(true);
    try {
      const pId = extractPlaylistId(url);
      const res = await importPlaylist(pId);
      router.push(`/subjects/${res.subjectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to import");
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkUrls.trim()) return;
    setError("");
    setLoading(true);
    try {
      const lines = bulkUrls.split("\n").map(l => l.trim()).filter(Boolean);
      const ids = lines.map(extractPlaylistId);
      await bulkImportPlaylists(ids);
      router.push("/subjects");
    } catch (err: any) {
      setError(err.message || "Bulk import failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Ingestion Engine</h1>
        <p className="text-muted">Import YouTube playlists to be parsed and dynamically mapped as locked courses.</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-charcoal-600/50 pb-px">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2.5 text-sm font-bold transition-all ${
            mode === "single"
              ? "border-b-2 border-coral text-coral"
              : "border-b-2 border-transparent text-muted hover:text-white"
          }`}
        >
          Single Import
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2.5 text-sm font-bold transition-all ${
            mode === "bulk"
              ? "border-b-2 border-coral text-coral"
              : "border-b-2 border-transparent text-muted hover:text-white"
          }`}
        >
          Bulk Import
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-900/30 p-4 border border-red-900/50">
          <p className="text-sm font-medium text-coral-light">{error}</p>
        </div>
      )}

      {/* Single Mode */}
      {mode === "single" && (
        <div className="space-y-8">
          <div className="rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 shadow-flat-sm">
            <label className="block text-sm font-bold text-cream mb-4">Target URL or ID</label>
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/playlist?list=..."
                className="flex-1 rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-sm text-white focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              />
              <button
                onClick={handlePreview}
                disabled={loading || !url}
                className="rounded-xl border border-charcoal-600 bg-charcoal-700 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-charcoal-600 disabled:opacity-50"
              >
                {loading ? "Fetching..." : "Fetch Metadata"}
              </button>
            </div>
          </div>

          {preview && (
            <div className="rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 shadow-flat-sm animate-fade-in">
              <h3 className="mb-6 text-lg font-bold text-white border-b border-charcoal-600/30 pb-4">Parsed Metadata Preview</h3>
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {preview.thumbnailUrl && (
                  <img
                    src={preview.thumbnailUrl}
                    alt={preview.title}
                    className="w-full md:w-48 aspect-video rounded-xl object-cover bg-charcoal-900 border border-charcoal-600/50"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-cream mb-2">{preview.title}</h4>
                  <p className="text-sm text-muted mb-4">{preview.channelTitle}</p>
                  <div className="inline-flex items-center rounded-lg bg-charcoal-900 border border-charcoal-600 px-3 py-1.5 text-xs font-semibold text-cream">
                    {preview.videoCount} Valid Video{preview.videoCount !== 1 ? 's' : ''} Identified
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="rounded-xl bg-coral px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-coral-light disabled:opacity-50"
                >
                  {loading ? "Constructing Course..." : "Finalize Import"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Mode */}
      {mode === "bulk" && (
        <div className="rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 shadow-flat-sm">
          <label className="block text-sm font-bold text-cream mb-4">Batch Processing (One URL per line)</label>
          <textarea
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            placeholder="https://youtube.com/playlist?list=ID_1&#10;https://youtube.com/playlist?list=ID_2"
            rows={6}
            className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 p-4 text-sm text-white focus:border-pink focus:outline-none focus:ring-1 focus:ring-pink transition-colors mb-6 font-mono"
          />
          <div className="flex justify-end">
            <button
              onClick={handleBulkImport}
              disabled={loading || !bulkUrls.trim()}
              className="rounded-xl bg-pink px-8 py-3 text-sm font-bold text-charcoal-950 transition-colors hover:bg-pink-dark disabled:opacity-50"
            >
              {loading ? "Executing Batch..." : "Execute Batch Import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
