"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, name);
      router.push("/subjects");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-charcoal-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 shadow-flat sm:p-12">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pink/20">
            <svg className="h-6 w-6 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Create Profile
          </h2>
          <p className="mt-2 text-sm text-muted">
            Already registered?{" "}
            <Link href="/auth/login" className="font-semibold text-pink hover:text-pink-dark transition-colors">
              Access your account
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
              <label className="block text-sm font-medium text-cream mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-white placeholder-charcoal-500 focus:border-pink focus:outline-none focus:ring-1 focus:ring-pink transition-colors"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream mb-1">Email address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-white placeholder-charcoal-500 focus:border-pink focus:outline-none focus:ring-1 focus:ring-pink transition-colors"
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
                className="w-full rounded-xl border border-charcoal-600 bg-charcoal-900 px-4 py-3 text-white placeholder-charcoal-500 focus:border-pink focus:outline-none focus:ring-1 focus:ring-pink transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-pink px-4 py-3 text-sm font-semibold text-charcoal-950 transition-colors hover:bg-pink-dark disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
