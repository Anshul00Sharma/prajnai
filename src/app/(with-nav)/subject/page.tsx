"use client";

import { SubjectTitlePopup } from "@/components/subject/subject-title-popup";
import UploadCard from "@/components/subject/upload-card";
import { useState, useEffect, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSubject } from "@/contexts/subject-context";
import { useUpload } from "@/contexts/upload-context";
import { PreviousUploadCard } from "@/components/subject/previous-upload-card";
import HandleUploads from "@/components/subject/handle-uploads";

interface UploadData {
  id: number;
  title: string;
  type: "pdf" | "web-link" | "text";
  description: string;
  content: string;
}

interface PreviousUpload {
  id: string;
  title: string;
  type: "pdf" | "web-link" | "text";
  description: string;
  created_at: string;
  subject_id: string;
}

export default function SubjectPage() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [subjectTitle, setSubjectTitle] = useState<string | undefined>("");
  const [nextId, setNextId] = useState(1);
  const [cards, setCards] = useState<number[]>(() => []);
  const { currentSubjectId, subjects, setSubjects } = useSubject();
  const { uploadedData, addUpload, removeUpload } = useUpload();
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousUploads, setPreviousUploads] = useState<PreviousUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentSubjectId) {
      router.push("/");
      return;
    }

    const currentSubject = subjects.find(
      (subject) => subject.id === currentSubjectId
    );

    if (!currentSubject?.name) {
      setSubjectTitle("A new subject");
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSubjectTitle(currentSubject.name);
    }
  }, [router, currentSubjectId, subjects]);

  // Fetch previous uploads
  useEffect(() => {
    async function fetchUploads() {
      if (!currentSubjectId) return;

      try {
        const response = await fetch(`/api/upload/subject/${currentSubjectId}`);
        if (!response.ok) throw new Error("Failed to fetch uploads");

        const data = await response.json();
        setPreviousUploads(data);
      } catch (error) {
        console.error("Error fetching uploads:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUploads();
  }, [currentSubjectId]);

  const handleDeleteUpload = useCallback(
    async (uploadId: string) => {
      try {
        const response = await fetch(`/api/upload/${uploadId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete upload");

        setPreviousUploads((prev) =>
          prev.filter((upload) => upload.id !== uploadId)
        );
      } catch (error) {
        console.error("Error deleting upload:", error);
      }
    },
    [currentSubjectId]
  );

  useEffect(() => {
    console.log("Cards:", cards);
    console.log("Uploaded Data:", uploadedData);
  }, [cards, uploadedData]);

  const handleSaveTitle = useCallback(
    async (title: string) => {
      if (!currentSubjectId) return;

      setIsUpdating(true);
      try {
        const response = await fetch(`/api/subject/${currentSubjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: title }),
        });

        if (!response.ok) {
          throw new Error("Failed to update subject name");
        }

        const updatedSubject = await response.json();

        // Update the subjects array with the new name
        setSubjects(
          subjects.map((subject) =>
            subject.id === currentSubjectId
              ? { ...subject, name: updatedSubject.name }
              : subject
          )
        );

        setSubjectTitle(title);
        setShowPopup(false);
      } catch (error) {
        console.error("Error updating subject name:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsUpdating(false);
      }
    },
    [currentSubjectId, subjects, setSubjects]
  );

  const handleUpload = useCallback(
    (data: UploadData) => {
      console.log("Upload data:", data);
      addUpload(data);
    },
    [addUpload]
  );

  const handleAddCard = useCallback(() => {
    setCards((prev) => (prev.length < 9 ? [...prev, nextId] : prev));
    setNextId((prev) => prev + 1); // Increment the next available ID
  }, [nextId]);

  const handleDeleteCard = useCallback(
    (id: number) => {
      setCards((prev) => prev.filter((cardId) => cardId !== id));
      removeUpload(id);
    },
    [removeUpload]
  );

  return (
    <main className="min-h-screen w-full bg-theme-light p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Subject Title */}
        <div className="flex items-center justify-between mt-12">
          <h1 className="text-4xl font-bold text-theme-primary">
            {subjectTitle || "New Subject"}
          </h1>
        </div>
        <HandleUploads />

        {/* Previous Uploads Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-primary">
            Previous Uploads
          </h2>
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-theme-primary/60 text-center py-8">
                Loading previous uploads...
              </p>
            </div>
          ) : previousUploads.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-theme-primary/60 text-center py-8">
                No uploads yet. Start by adding some content below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {previousUploads.map((upload) => (
                <PreviousUploadCard
                  key={upload.id}
                  title={upload.title}
                  type={upload.type}
                  description={upload.description}
                  created_at={upload.created_at}
                  onDelete={() => handleDeleteUpload(upload.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* New Uploads Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-primary">
            Add New Content
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((id) => (
              <div key={id} className="w-full max-w-sm">
                <UploadCard
                  id={id}
                  onSubmit={handleUpload}
                  onDelete={handleDeleteCard}
                />
              </div>
            ))}

            {cards.length < 9 && (
              <div className="w-full max-w-sm">
                <button
                  onClick={handleAddCard}
                  className="bg-white rounded-xl shadow-lg p-4 w-full h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-theme-primary/20 hover:border-theme-primary/40 transition-colors group"
                >
                  <FaPlus className="text-4xl text-theme-primary/40 group-hover:text-theme-primary/60 transition-colors" />
                  <span className="mt-2 text-sm text-theme-primary/40 group-hover:text-theme-primary/60 transition-colors">
                    Upload More ({cards.length}/9)
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {showPopup && (
        <SubjectTitlePopup
          onSave={handleSaveTitle}
          onClose={() => setShowPopup(false)}
          isUpdating={isUpdating}
        />
      )}
    </main>
  );
}
