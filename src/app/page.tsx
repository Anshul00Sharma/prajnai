"use client";

import { useRouter } from "next/navigation";
import { getUserId, hasUserId } from "@/utils/local-storage";
import { useSubject } from "@/contexts/subject-context";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { setCurrentSubjectId } = useSubject();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const userId = getUserId();
      try {
        await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userId }),
        });
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    if (!hasUserId()) initUser();
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const userId = getUserId();
      const response = await fetch(`/api/subject?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch subjects");

      const subjects = await response.json();
      let subjectId: string;

      if (subjects.length === 0) {
        // Create initial subject if none exists
        const newSubject = {
          id: crypto.randomUUID(),
          user_id: userId,
        };

        const createResponse = await fetch("/api/subject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSubject),
        });

        if (!createResponse.ok) throw new Error("Failed to create subject");
        const createdSubject = await createResponse.json();
        subjectId = createdSubject.id;
      } else {
        // Use first existing subject
        subjectId = subjects[0].id;
      }

      setCurrentSubjectId(subjectId);
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
