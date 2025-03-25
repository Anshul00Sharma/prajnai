"use client";

import { useState, useEffect } from "react";
import { FaSync, FaPlus } from "react-icons/fa";
import { ExamCreatePopup } from "@/components/exam/exam-create-popup";
import { useSubject } from "@/contexts/subject-context";
import { getUserId } from "@/utils/local-storage";
import { Exam } from "@/types/exam";
import { ExamCard } from "@/components/exam/exam-card";
import { useCreditContext } from "@/contexts/credit-context";
import { InsufficientCreditsPopup } from "@/components/ui/insufficient-credits-popup";

export default function ExamPage() {
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentSubjectId } = useSubject();
  const { credits, fetchCredits } = useCreditContext();
  const [showInsufficientCreditsPopup, setShowInsufficientCreditsPopup] = useState(false);
  const REQUIRED_CREDITS = 15;

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

  const handleCreateExam = async (
    selectedTopics: string[],
    mcqCount: number,
    trueFalseCount: number,
    shortAnswerCount: number,
    additionalInfo: string
  ) => {
    // Double-check credits before creating
    if (!checkCredits()) {
      return;
    }

    try {
      setIsCreating(true);

      // Get the user ID
      const user_id = await getUserId();

      if (!user_id) {
        console.error("No user ID found");
        setIsCreating(false);
        return;
      }

      if (!currentSubjectId) {
        console.error("No subject ID selected");
        setIsCreating(false);
        return;
      }

      // Make API call to create the exam
      const response = await fetch("/api/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedTopics,
          mcqCount,
          trueFalseCount,
          shortAnswerCount,
          additionalInfo,
          subject_id: currentSubjectId,
          user_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exam");
      }

      setShowCreatePopup(false);
      setIsCreating(false);
      
      // Refresh the exams list to show the newly created exam
      fetchExams();
    } catch (error) {
      console.error("Error creating exam:", error);
      setIsCreating(false);
    }
  };

  // Fetch exams
  const fetchExams = async () => {
    try {
      setIsLoading(true);

      const user_id = await getUserId();

      if (!user_id) {
        console.error("No user ID found");
        setIsLoading(false);
        return;
      }

      let url = `/api/exam?userId=${user_id}`;

      if (currentSubjectId) {
        url += `&subjectId=${currentSubjectId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch exams");
      }

      const data = await response.json();
      setExams(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setIsLoading(false);
    }
  };

  // Refresh exams
  const refreshExams = async () => {
    try {
      setIsRefreshing(true);
      await fetchExams();
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error refreshing exams:", error);
      setIsRefreshing(false);
    }
  };

  // Fetch exams on component mount and when subject changes
  useEffect(() => {
    fetchExams();
  }, [currentSubjectId]);

  // Fetch credits when component mounts
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return (
    <div className="p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-theme-primary">Exams</h1>
          <button
            onClick={refreshExams}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary rounded-md transition-colors disabled:opacity-50"
          >
            <FaSync className={`${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
        <button
          onClick={handleCreateButton}
          className="px-4 py-2 rounded-lg bg-theme-primary text-theme-light hover:bg-theme-primary/90 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Exam list will go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={`loading-${index}`} 
              className="p-4 bg-white rounded-lg shadow animate-pulse"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex gap-2 mt-2 mb-3">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mt-3"></div>
                </div>
              </div>
            </div>
          ))
        ) : exams.length === 0 ? (
          // Empty state
          <div className="col-span-full p-8 bg-white rounded-lg shadow text-center text-gray-500">
            No exams created yet. Click on {'"Create Exam"'} to get started.
          </div>
        ) : (
          // Exams list
          exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))
        )}
      </div>

      {/* Create Exam Popup */}
      {showCreatePopup && (
        <ExamCreatePopup
          onSave={handleCreateExam}
          onClose={() => setShowCreatePopup(false)}
          isUpdating={isCreating}
        />
      )}

      {/* Insufficient Credits Popup */}
      <InsufficientCreditsPopup
        isOpen={showInsufficientCreditsPopup}
        onClose={() => setShowInsufficientCreditsPopup(false)}
        requiredCredits={REQUIRED_CREDITS}
        currentCredits={credits}
        resourceType="exam"
      />
    </div>
  );
}
