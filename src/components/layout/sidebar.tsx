"use client";

import { useEffect, useState } from "react";
import {
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubject } from "@/contexts/subject-context";
import { getUserId } from "@/utils/local-storage";
import { supabase } from "@/lib/supabase";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const { subjects, setSubjects, setCurrentSubjectId, currentSubjectId } =
    useSubject();
  const [isCreating, setIsCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    if (isCreating) return;

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
      <div
        className={`z-50 fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out flex-col hidden lg:flex ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => onCollapsedChange(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
        >
          {isCollapsed ? (
            <FaChevronRight className="text-theme-primary" />
          ) : (
            <FaChevronLeft className="text-theme-primary" />
          )}
        </button>

        {/* Logo */}
        <div className="p-4 border-b">
          {isCollapsed ? (
            <div className="w-8 h-8 rounded bg-theme-primary text-white flex items-center justify-center">
              P
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-theme-primary">Prajna</h1>
          )}
        </div>

        {/* Subjects */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-theme-primary">
                <FaBook />
                {!isCollapsed && <h2 className="font-semibold">Subjects</h2>}
              </div>
              {!isCollapsed && (
                <button
                  onClick={handleCreateSubject}
                  disabled={isCreating}
                  className="p-1.5 rounded-lg hover:bg-theme-light text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaPlus className="text-sm" />
                  )}
                </button>
              )}
            </div>
            {isCollapsed && (
              <div className="flex flex-col items-center space-y-2 mt-2">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subject`}
                    onClick={() => setCurrentSubjectId(subject.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentSubjectId === subject.id
                        ? "bg-theme-primary text-white"
                        : "hover:bg-theme-light text-gray-700"
                    }`}
                    title={subject.name || "id_" + subject.id.slice(-9)}
                  >
                    {(subject.name || "id_" + subject.id.slice(-9))
                      .charAt(0)
                      .toUpperCase()}
                  </Link>
                ))}
                {subjects.length < 10 && (
                  <button
                    onClick={handleCreateSubject}
                    disabled={isCreating}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-theme-light text-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create new subject"
                  >
                    {isCreating ? (
                      <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaPlus className="text-sm" />
                    )}
                  </button>
                )}
              </div>
            )}
            {!isCollapsed && (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subject`}
                    onClick={() => setCurrentSubjectId(subject.id)}
                    className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      currentSubjectId === subject.id
                        ? "bg-theme-primary text-white font-medium"
                        : "hover:bg-theme-light text-gray-700"
                    }`}
                  >
                    {subject.name || "id_" + subject.id.slice(-9)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`p-4 border-t hover:bg-blue-50 text-blue-600 transition-colors ${
            isCollapsed ? "flex justify-center" : "flex items-center gap-2"
          }`}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

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
