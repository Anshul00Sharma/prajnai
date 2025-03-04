"use client";

import { useRouter } from "next/navigation";
import { hasUserId } from "@/utils/local-storage";

import { useState } from "react";

export default function Home() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      // If user is not logged in, redirect to login page
      const userLoggedIn = await hasUserId();
      console.log("User logged in:", userLoggedIn);
      if (!userLoggedIn) {
        router.push("/auth/login");
        return;
      }

      // Navigate to the subject page
      router.push("/subject");
    } catch (error) {
      console.error("Error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-theme-light flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 flex flex-col justify-center items-center">
        <h1 className="text-6xl font-bold text-theme-primary">Prajna</h1>
        <p className="text-xl text-theme-primary/70">
          Your personal learning companion
        </p>
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="px-8 py-3 bg-theme-primary text-theme-light rounded-lg shadow-md hover:bg-theme-primary/90 transition-colors text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-theme-light border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            "Let's Go!"
          )}
        </button>
      </div>
    </main>
  );
}
