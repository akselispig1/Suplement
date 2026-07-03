import Link from "next/link";

export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ssg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="0.55" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* stacked layers — the "stack" */}
      <path d="M20 4 L34.5 12 L20 20 L5.5 12 Z" fill="url(#ssg)" />
      <path d="M20 4 L34.5 12 L20 20 L5.5 12 Z" fill="black" fillOpacity="0.0" />
      <path d="M5.5 19.5 L20 27.5 L34.5 19.5" stroke="url(#ssg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <path d="M5.5 27 L20 35 L34.5 27" stroke="url(#ssg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 font-bold text-lg text-white group ${className}`}>
      <span className="relative flex items-center justify-center">
        <span className="absolute inset-0 rounded-full blur-md bg-emerald-400/40 group-hover:bg-emerald-400/60 transition-colors" />
        <LogoMark className="relative w-8 h-8 group-hover:scale-105 transition-transform" />
      </span>
      <span className="tracking-tight">
        Supp<span className="gradient-text">Stack</span>
      </span>
    </Link>
  );
}
