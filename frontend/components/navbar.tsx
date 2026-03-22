"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { logout } from "@/lib/api";

function BrandLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="0" y="0" width="14" height="32" rx="7" fill="#EF534F" />
      <rect x="18" y="8" width="14" height="24" rx="7" fill="#FB7E96" />
      <circle cx="25" cy="4" r="4" fill="#FFCDD2" />
    </svg>
  );
}

export function Navbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-charcoal-600 text-cream"
        : "text-muted hover:bg-charcoal-700 hover:text-cream"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-charcoal-600/30 bg-charcoal-900/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <BrandLogo />
          <span className="text-xl font-bold tracking-tight text-white">
            Casa Mia
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/subjects" className={linkClass("/subjects")}>
            Library
          </Link>

          {user?.role === "ADMIN" && (
            <Link href="/admin/import" className={linkClass("/admin/import")}>
              Admin
            </Link>
          )}

          {user ? (
            <div className="ml-4 flex items-center gap-4 border-l border-charcoal-600/50 pl-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-flamingo-dim text-xs font-bold text-flamingo">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted transition-colors hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="ml-4 rounded-full bg-coral px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-coral-light"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
