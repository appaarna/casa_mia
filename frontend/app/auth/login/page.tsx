"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/subjects");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-charcoal-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 shadow-flat sm:p-12">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-coral/20">
            <svg className="h-6 w-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            System Login
          </h2>
          <p className="mt-2 text-sm text-muted">
            Or{" "}
            <Link href="/auth/register" className="font-semibold text-coral hover:text-coral-light">
              initialize a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-900/30 p-4 border border-red-900/50">
            <p className="text-sm font-medium text-coral-light text-center">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cream mb-1">Email address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-white placeholder-charcoal-500 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral transition-colors"
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-white placeholder-charcoal-500 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-coral px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-light disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
