"use client";

import { useEffect, useState } from "react";
import { FaBook, FaPlus, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubject } from "@/contexts/subject-context";
import { getUserId } from "@/utils/local-storage";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useCreditContext } from "./nav-bar";

export function BottomNav() {
  const { subjects, setSubjects, setCurrentSubjectId, currentSubjectId } =
    useSubject();
  const { credits, isLoading, fetchCredits } = useCreditContext();
  const [isCreating, setIsCreating] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/subject?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setSubjects(data);
        setCurrentSubjectId(data[0].id);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [userId, setSubjects]);

  const handleCreateSubject = async () => {
    if (isCreating || !userId) return;

    setIsCreating(true);
    try {
      const newSubject = {
        id: crypto.randomUUID(),
        user_id: userId,
      };

      const response = await fetch("/api/subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) throw new Error("Failed to create subject");

      const createdSubject = await response.json();
      setSubjects([createdSubject, ...subjects]); // Add new subject at the beginning
      setCurrentSubjectId(createdSubject.id); // Select the new subject
      setShowSubjects(false); // Close the subjects panel after creating
    } catch (error) {
      console.error("Error creating subject:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local state
      setSubjects([]);
      setCurrentSubjectId("");
      
      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <div className="bg-white shadow-lg rounded-t-xl border border-theme-primary/20">
          <div className="flex justify-between items-center px-4 py-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center text-blue-600 px-3 py-2"
              aria-label="Logout"
            >
              <FaSignOutAlt />
            </button>
            
            <button
              onClick={() => setShowSubjects(!showSubjects)}
              className="flex items-center gap-2 px-4 py-2 text-theme-primary font-medium rounded-lg hover:bg-theme-light transition-colors"
            >
              <FaBook />
              <span>Subjects</span>
              <motion.div
                animate={{ rotate: showSubjects ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>
            </button>
            
            <div className="flex items-center md:hidden">
              <div className="flex items-center gap-1 text-theme-primary">
                <span className="text-sm font-medium">
                  {credits !== null ? credits : '...'}
                </span>
                <button
                  onClick={fetchCredits}
                  disabled={isLoading}
                  className="p-1 rounded-full hover:bg-theme-light/50 transition-all"
                  aria-label="Refresh credits"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={isLoading ? { rotate: 360 } : {}}
                    transition={isLoading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </motion.svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Slide-up Panel */}
      <AnimatePresence>
        {showSubjects && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 block lg:hidden"
              onClick={() => setShowSubjects(false)}
            />

            {/* Subjects Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-14 left-0 right-0 z-40 bg-white rounded-t-xl shadow-lg border border-theme-primary/20 p-4 block lg:hidden"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-theme-primary flex items-center gap-2">
                  <FaBook />
                  Subjects
                </h2>
                <button
                  onClick={handleCreateSubject}
                  disabled={isCreating || !userId}
                  className="p-1.5 rounded-lg hover:bg-theme-light text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  aria-label="Create new subject"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaPlus className="text-sm" />
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No subjects yet. Create one to get started!
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <motion.div
                      key={subject.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`/subject`}
                        onClick={() => {
                          setCurrentSubjectId(subject.id);
                          setShowSubjects(false);
                        }}
                        className={`block px-4 py-3 rounded-lg text-sm transition-colors ${
                          currentSubjectId === subject.id
                            ? "bg-theme-primary text-white font-medium"
                            : "hover:bg-theme-light text-gray-700"
                        }`}
                      >
                        {subject.name || "id_" + subject.id.slice(-9)}
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drag handle */}
              <div className="mt-4 flex justify-center">
                <div className="w-16 h-1 bg-gray-300 rounded-full" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
