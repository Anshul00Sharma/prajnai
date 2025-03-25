"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCreditContext } from "@/contexts/credit-context";

export function NavBar() {
  const pathname = usePathname();
  const { credits, isLoading, fetchCredits } = useCreditContext();

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
              Uploads
            </Link>
            <Link
              href="/topic"
              className={`px-6 py-2 rounded-full transition-all ${
                pathname === "/topic"
                  ? "bg-theme-light text-theme-primary shadow-md scale-105"
                  : "text-theme-light hover:bg-theme-secondary/20"
              }`}
            >
              Notes
            </Link>
            <Link
              href="/exam"
              className={`px-6 py-2 rounded-full transition-all ${
                pathname === "/exam"
                  ? "bg-theme-light text-theme-primary shadow-md scale-105"
                  : "text-theme-light hover:bg-theme-secondary/20"
              }`}
            >
              Exam
            </Link>
          </div>
        </nav>
      </div>

      {/* Credits display with refresh button - Hidden on mobile */}
      <div className="absolute top-6 right-6 z-50 hidden md:block">
        <div className="bg-theme-primary rounded-full shadow-lg px-4 py-2 flex items-center gap-2 text-theme-light">
          <span className="font-medium">
            Credits: {credits !== null ? credits : "..."}
          </span>
          <button
            onClick={fetchCredits}
            disabled={isLoading}
            className="ml-1 p-1 rounded-full hover:bg-theme-secondary/20 transition-all"
            aria-label="Refresh credits"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={isLoading ? { rotate: 360 } : {}}
              transition={
                isLoading
                  ? { repeat: Infinity, duration: 1, ease: "linear" }
                  : {}
              }
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </motion.svg>
          </button>
        </div>
      </div>
    </div>
  );
}
