"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="w-full h-20 flex items-center justify-center relative z-40 bg-theme-light/70 backdrop-blur-sm">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <nav className="bg-theme-primary rounded-full shadow-lg px-2 py-1.5">
          <div className="flex gap-2">
            <Link
              href="/subject"
              className={`px-6 py-2 rounded-full transition-all ${
                pathname === `/subject`
                  ? "bg-theme-light text-theme-primary shadow-md scale-105"
                  : "text-theme-light hover:bg-theme-secondary/20"
              }`}
            >
              Subject
            </Link>
            <Link
              href="/topic"
              className={`px-6 py-2 rounded-full transition-all ${
                pathname === "/topic"
                  ? "bg-theme-light text-theme-primary shadow-md scale-105"
                  : "text-theme-light hover:bg-theme-secondary/20"
              }`}
            >
              Topic
            </Link>
            <Link
              href="/notion-page"
              className={`px-6 py-2 rounded-full transition-all ${
                pathname === "/notion-page"
                  ? "bg-theme-light text-theme-primary shadow-md scale-105"
                  : "text-theme-light hover:bg-theme-secondary/20"
              }`}
            >
              Notion
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
