"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { useSubject } from "@/contexts/subject-context";

interface Topic {
  id: string;
  title: string;
  subject_id: string;
  additional_info?: string;
  have_note: boolean;
}

interface ExamCreatePopupProps {
  onSave: (
    selectedTopics: string[],
    mcqCount: number,
    trueFalseCount: number,
    shortAnswerCount: number,
    additionalInfo: string
  ) => void;
  onClose: () => void;
  isUpdating?: boolean;
}

export function ExamCreatePopup({
  onSave,
  onClose,
  isUpdating = false,
}: ExamCreatePopupProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [mcqCount, setMcqCount] = useState<number>(5);
  const [trueFalseCount, setTrueFalseCount] = useState<number>(5);
  const [shortAnswerCount, setShortAnswerCount] = useState<number>(5);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const { currentSubjectId } = useSubject();

  // Calculate total questions
  const totalQuestions = mcqCount + trueFalseCount + shortAnswerCount;

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        
        if (!currentSubjectId) {
          setTopics([]);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/topic?subjectId=${currentSubjectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        
        const data = await response.json();
        setTopics(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics");
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [currentSubjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (selectedTopics.length === 0) {
      setError("Please select at least one topic");
      return;
    }

    if (totalQuestions !== 15) {
      setError("Total questions must be exactly 15");
      return;
    }

    onSave(
      selectedTopics,
      mcqCount,
      trueFalseCount,
      shortAnswerCount,
      additionalInfo.trim()
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const adjustQuestionCounts = (
    type: "mcq" | "trueFalse" | "shortAnswer",
    newValue: number
  ) => {
    // Validate the input
    if (newValue < 0) return;

    // Update the question count for the specified type
    if (type === "mcq") {
      setMcqCount(newValue);
    } else if (type === "trueFalse") {
      setTrueFalseCount(newValue);
    } else if (type === "shortAnswer") {
      setShortAnswerCount(newValue);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
        onClick={() => onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-theme-light/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-theme-primary mb-4">
            Create New Exam
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2"
              >
                <FaExclamationTriangle />
                {error}
              </motion.div>
            )}

            {/* Topic Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-theme-primary mb-1">
                Select Topics
              </label>
              <div
                className="w-full px-4 py-2 rounded-lg border border-theme-primary/20 focus-within:border-theme-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-theme-primary/20 bg-white cursor-pointer flex justify-between items-center"
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
              >
                <div className="flex-1 truncate">
                  {selectedTopics.length > 0
                    ? `${selectedTopics.length} topic${
                        selectedTopics.length > 1 ? "s" : ""
                      } selected`
                    : "Select topics..."}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${
                    showTopicDropdown ? "transform rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Dropdown for topic selection */}
              {showTopicDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto border border-theme-primary/20"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-theme-primary">
                      <div className="animate-spin inline-block w-5 h-5 border-2 border-theme-primary border-t-transparent rounded-full mb-2"></div>
                      <p>Loading topics...</p>
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No topics available
                    </div>
                  ) : (
                    topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-theme-primary/10 flex justify-between items-center ${
                          selectedTopics.includes(topic.id)
                            ? "bg-theme-primary/5"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTopic(topic.id);
                        }}
                      >
                        <span className="truncate">{topic.title}</span>
                        {selectedTopics.includes(topic.id) && (
                          <FaCheck className="text-theme-primary flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Selected topics pills */}
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTopics.map((topicId) => {
                    const topic = topics.find((t) => t.id === topicId);
                    return (
                      topic && (
                        <div
                          key={topicId}
                          className="bg-theme-primary/10 text-theme-primary rounded-full px-3 py-1 text-sm flex items-center gap-1 group"
                        >
                          <span className="truncate max-w-[150px]">
                            {topic.title}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(topicId);
                            }}
                            className="p-0.5 rounded-full hover:bg-theme-primary/20 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </div>

            {/* Question Distribution */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                Question Distribution (Total: {totalQuestions}/15)
              </label>

              <div className="bg-white border border-theme-primary/20 rounded-lg p-4 space-y-3">
                {/* Progress bar for total questions */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(totalQuestions / 15) * 100}%`,
                      backgroundColor:
                        totalQuestions === 15
                          ? "#10B981"
                          : totalQuestions > 15
                          ? "#EF4444"
                          : "#60A5FA",
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  ></motion.div>
                </div>

                {/* MCQ Questions */}
                <div className="grid grid-cols-[1fr,120px] gap-3 items-center">
                  <label className="text-sm text-gray-700">
                    Multiple Choice Questions
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      className="absolute left-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-l-lg border-r border-theme-primary/20"
                      onClick={() =>
                        adjustQuestionCounts("mcq", Math.max(0, mcqCount - 1))
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={mcqCount}
                      onChange={(e) =>
                        adjustQuestionCounts(
                          "mcq",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full text-center rounded-lg border border-theme-primary/20 py-1 px-8"
                      min="0"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-r-lg border-l border-theme-primary/20"
                      onClick={() => adjustQuestionCounts("mcq", mcqCount + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* True/False Questions */}
                <div className="grid grid-cols-[1fr,120px] gap-3 items-center">
                  <label className="text-sm text-gray-700">
                    True/False Questions
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      className="absolute left-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-l-lg border-r border-theme-primary/20"
                      onClick={() =>
                        adjustQuestionCounts(
                          "trueFalse",
                          Math.max(0, trueFalseCount - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={trueFalseCount}
                      onChange={(e) =>
                        adjustQuestionCounts(
                          "trueFalse",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full text-center rounded-lg border border-theme-primary/20 py-1 px-8"
                      min="0"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-r-lg border-l border-theme-primary/20"
                      onClick={() =>
                        adjustQuestionCounts("trueFalse", trueFalseCount + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Short Answer Questions */}
                <div className="grid grid-cols-[1fr,120px] gap-3 items-center">
                  <label className="text-sm text-gray-700">
                    Short Answer Questions
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      className="absolute left-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-l-lg border-r border-theme-primary/20"
                      onClick={() =>
                        adjustQuestionCounts(
                          "shortAnswer",
                          Math.max(0, shortAnswerCount - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={shortAnswerCount}
                      onChange={(e) =>
                        adjustQuestionCounts(
                          "shortAnswer",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full text-center rounded-lg border border-theme-primary/20 py-1 px-8"
                      min="0"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 bottom-0 px-2 text-theme-primary hover:bg-theme-primary/10 rounded-r-lg border-l border-theme-primary/20"
                      onClick={() =>
                        adjustQuestionCounts(
                          "shortAnswer",
                          shortAnswerCount + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Warning or success message */}
                {totalQuestions !== 15 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg flex items-center gap-2"
                  >
                    <FaExclamationTriangle />
                    <span>Total must be exactly 15 questions</span>
                  </motion.div>
                )}

                {totalQuestions === 15 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-green-600 bg-green-50 p-2 rounded-lg flex items-center gap-2"
                  >
                    <FaCheck />
                    <span>Perfect! You have 15 questions in total</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label
                htmlFor="additionalInfo"
                className="block text-sm font-medium text-theme-primary mb-1"
              >
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Enter additional information about the exam..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/20 bg-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                disabled={isUpdating}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-theme-primary hover:bg-theme-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-theme-primary text-theme-light hover:bg-theme-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={
                  selectedTopics.length === 0 ||
                  totalQuestions !== 15 ||
                  isUpdating
                }
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-theme-light border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create Exam"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
