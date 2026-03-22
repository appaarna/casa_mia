import Link from "next/link";
import type { Subject } from "@/lib/types";

const CATEGORIES = ["Development", "Marketing", "Design", "UI Design", "Data", "Business"];
const AUTHORS = ["Michael Anderson", "Sarah Johnson", "Daniel Carter", "Emma Williams", "Christopher Lee", "James Walker"];
const PRICES = [79, 39, 49, 45, 55, 35, 42, 29];

export function SubjectCard({ subject }: { subject: Subject }) {
  const category = CATEGORIES[subject.id % CATEGORIES.length];
  const author = AUTHORS[subject.id % AUTHORS.length];
  
  // Use a pseudo-random pricing specific to the image you provided 
  // Wait, the user asked for Indian Rupees prices like 999, 799, 399
  const indianPrices = [999, 799, 399, 499, 899, 599];
  const price = indianPrices[subject.id % indianPrices.length];
  
  const enrollments = 230 + (subject.id * 89) % 700;
  const hours = Math.max(1, Math.round(subject.videoCount * 0.75));

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-charcoal-800 shadow-flat-sm transition-all duration-300 hover:shadow-flat hover:-translate-y-1 block h-full border border-charcoal-600/30"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900 border-b border-charcoal-600/30">
        {subject.thumbnailUrl ? (
          <img
            src={subject.thumbnailUrl}
            alt={subject.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-20">
            <svg className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v12H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Category & Duration Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {category}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-cream">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {hours}H
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-coral mb-1 line-clamp-2">
          {subject.title}
        </h3>
        
        {/* Author */}
        <p className="text-xs text-muted mb-6">
          by {author}
        </p>
        
        {/* Bottom Tray: Users & Price */}
        <div className="mt-auto flex items-center justify-between border-t border-charcoal-600/30 pt-4">
          
          <div className="flex items-center gap-2">
            {/* Fake avatar stack */}
            <div className="flex -space-x-1.5">
               <div className="w-5 h-5 rounded-full bg-blue-500 border border-charcoal-800 flex items-center justify-center text-[8px] font-bold text-white">👦</div>
               <div className="w-5 h-5 rounded-full bg-pink-500 border border-charcoal-800 flex items-center justify-center text-[8px] font-bold text-white">👩</div>
               <div className="w-5 h-5 rounded-full bg-green-500 border border-charcoal-800 flex items-center justify-center text-[8px] font-bold text-white">🧔</div>
            </div>
            <span className="text-xs font-semibold text-muted">+{enrollments}</span>
          </div>

          <div className="text-lg font-extrabold text-white">
            ₹{price}
          </div>

        </div>

      </div>
    </Link>
  );
}
