"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaSync, FaSpinner, FaCheck } from "react-icons/fa";
import { TopicCreatePopup } from "@/components/topic/topic-create-popup";
import { useSubject } from "@/contexts/subject-context";
import { useRouter } from "next/navigation";
import { useCreditContext } from "@/contexts/credit-context";
import { InsufficientCreditsPopup } from "@/components/ui/insufficient-credits-popup";

// Define the Topic interface based on the database schema
interface Topic {
  id: string;
  title: string;
  subject_id: string;
  additional_info?: string;
  note?: object;
  have_note: boolean;
  created_at: string;
  updated_at: string;
}

// TopicCard component to display topic information and note status
const TopicCard = ({ topic }: { topic: Topic }) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (topic.have_note) {
      router.push(`/note/${topic.id}`);
    }
  };

  return (
    <div
      key={topic.id}
      className={`p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
        topic.have_note ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      <h3 className="text-lg font-semibold text-theme-primary mb-2">
        {topic.title}
      </h3>
      {topic.additional_info && (
        <p className="text-gray-600 text-sm line-clamp-3">
          {topic.additional_info}
        </p>
      )}

      {/* Note Status Section */}
      <div className="mt-3 border-t pt-2">
        {topic.have_note ? (
          <div className="flex items-center text-green-600">
            <FaCheck className="mr-2" />
            <span className="text-sm font-medium">Note is ready</span>
            <span className="ml-2 text-xs text-blue-500">(Click to view)</span>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
            <div className="flex items-center">
              <div className="relative flex items-center text-blue-600">
                <div className="mr-2 relative">
                  <FaSpinner className="animate-spin text-blue-500" />
                  <span className="absolute inset-0 animate-ping opacity-30 rounded-full bg-blue-400"></span>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI creating this note
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200">
              <div className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 animate-shimmer"></div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Created: {new Date(topic.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default function TopicPage() {
  const { currentSubjectId } = useSubject();
  const { credits, fetchCredits, userId } = useCreditContext();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientCreditsPopup, setShowInsufficientCreditsPopup] = useState(false);
  const REQUIRED_CREDITS = 5;

  useEffect(() => {
    if (currentSubjectId) {
      fetchTopics();
    } else {
      setIsLoading(false);
      setError("No subject selected");
    }
  }, [currentSubjectId]);

  useEffect(() => {
    // Fetch credits when component loads
    fetchCredits();
  }, [fetchCredits]);

  const fetchTopics = async (showRefreshAnimation = false) => {
    if (!currentSubjectId) return;

    try {
      if (showRefreshAnimation) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`/api/topic?subjectId=${currentSubjectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkCredits = () => {
    // Make sure credits are updated
    fetchCredits();
    
    // Check if user has enough credits
    if (credits !== null && credits < REQUIRED_CREDITS) {
      setShowInsufficientCreditsPopup(true);
      return false;
    }
    
    return true;
  };

  const handleCreateButton = () => {
    if (checkCredits()) {
      setShowCreatePopup(true);
    }
  };

  const handleCreateTopic = async (title: string, additionalInfo: string) => {
    if (!currentSubjectId || !userId) return;
    
    // Double-check credits before creating
    if (!checkCredits()) {
      return;
    }

    try {
      setIsCreating(true);
      const topicId = uuidv4();

      const response = await fetch("/api/topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: topicId,
          title,
          subject_id: currentSubjectId,
          additional_info: additionalInfo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create topic");
      }

      const newTopic = await response.json();
      setTopics((prev) => [newTopic, ...prev]);
      setShowCreatePopup(false);
    } catch (err) {
      console.error("Error creating topic:", err);
      setError("Failed to create topic");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 200% 100%;
        }
      `}</style>
      <div className="p-6 mt-20">
        <div className="flex justify-between items-center mb-6 ">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-theme-primary">Notes</h1>
            <button
              onClick={() => fetchTopics(true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary rounded-md transition-colors disabled:opacity-50"
            >
              <FaSync
                className={`text-sm ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
          <button
            onClick={handleCreateButton}
            className="px-4 py-2 rounded-lg bg-theme-primary text-theme-light hover:bg-theme-primary/90 transition-colors"
            disabled={!currentSubjectId}
          >
            Create a note
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 mt-4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        ) : topics.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No notes found. Create your first note!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}

        {showCreatePopup && (
          <TopicCreatePopup
            subjectId={currentSubjectId || ""}
            onSave={handleCreateTopic}
            onClose={() => setShowCreatePopup(false)}
            isUpdating={isCreating}
          />
        )}

        <InsufficientCreditsPopup
          isOpen={showInsufficientCreditsPopup}
          onClose={() => setShowInsufficientCreditsPopup(false)}
          requiredCredits={REQUIRED_CREDITS}
          currentCredits={credits}
        />
      </div>
    </>
  );
}
