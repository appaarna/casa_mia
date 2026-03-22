import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-charcoal-900 px-6 py-20 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-charcoal-800 via-charcoal-900 to-charcoal-900 opacity-80" />
      
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-12">
        {/* Structured brand pill */}
        <div className="flex items-center gap-3 rounded-full border border-charcoal-600 bg-charcoal-800 px-5 py-2">
          <div className="h-2 w-2 rounded-full bg-coral animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-cream">
            LMS 2.0 Dashboard Architecture
          </span>
        </div>

        {/* Hero Copy */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Structured Learning,
            <br />
            <span className="bg-gradient-to-r from-coral to-pink bg-clip-text text-transparent">
              Engineered.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted md:text-xl">
            A minimalist, highly-focused platform designed to transform YouTube playlists into tracked, locked, and progressive courses.
          </p>
        </div>

        {/* Clean CTA Buttons */}
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/subjects"
            className="flex w-full items-center justify-center rounded-xl bg-coral px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-coral-light sm:w-auto"
          >
            Access Dashboard
          </Link>
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center rounded-xl border border-charcoal-600 bg-charcoal-800 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-charcoal-700 sm:w-auto"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Flat grid feature cards */}
      <div className="relative z-10 mt-32 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Playlist Sync",
            desc: "Ingest any YouTube playlist instantly with full metadata extraction.",
            accent: "bg-coral"
          },
          {
            title: "Sequential Learning",
            desc: "Force progressive completion with mathematically locked lesson states.",
            accent: "bg-pink"
          },
          {
            title: "Progress Analytics",
            desc: "Resume videos exactly where you left them, backed by database triggers.",
            accent: "bg-flamingo"
          }
        ].map((feature, i) => (
          <div
            key={i}
            className="group flex flex-col justify-between gap-6 rounded-3xl border border-charcoal-600 bg-charcoal-800 p-8 text-left transition-all hover:border-charcoal-500 hover:bg-charcoal-700"
          >
            <div className={`h-12 w-12 rounded-2xl ${feature.accent} bg-opacity-20 flex items-center justify-center`}>
              <div className={`h-4 w-4 rounded-full ${feature.accent}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
