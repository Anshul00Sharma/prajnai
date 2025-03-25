"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Open_Sans, Lato, Roboto, Merriweather } from "next/font/google";
import { EssayReviewResponse } from "../api/essay/route";

// Initialize fonts
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Font options with next/font objects
const fontOptions = [
  { name: "Open Sans", value: openSans.className },
  { name: "Lato", value: lato.className },
  { name: "Roboto", value: roboto.className },
  { name: "Merriweather", value: merriweather.className },
];

// Dummy suggested essay titles
const suggestedTitles = [
  "The Impact of Climate Change on Future Generations",
  "Artificial Intelligence: Promises and Perils",
  "The Evolution of Social Media and Its Effects on Society",
  "Ethical Considerations in Genetic Engineering",
  "The Future of Remote Work in a Post-Pandemic World",
  "Sustainable Development: Balancing Growth and Conservation",
];

// Interface for AI remarks data
type AIRemarks = EssayReviewResponse;

export default function EssayPage() {
  const params = useParams();
  const essayId = params.essay_id as string;
  const [essayContent, setEssayContent] = useState("");
  const [selectedFont, setSelectedFont] = useState(fontOptions[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // Setup form state
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [essayTitle, setEssayTitle] = useState("");
  const [wordLimit, setWordLimit] = useState<number>(500);
  const [titleError, setTitleError] = useState("");
  const [wordLimitError, setWordLimitError] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);

  // AI remarks state
  const [showAIRemarks, setShowAIRemarks] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [aiRemarks, setAIRemarks] = useState<AIRemarks | null>(null);
  const [aiError, setAIError] = useState<string | null>(null);
  const [isAIRemarkMinimized, setIsAIRemarkMinimized] = useState(false);

  useEffect(() => {
    // Simulate loading essay data
    const loadEssay = async () => {
      try {
        // In a real app, fetch essay content from API
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading essay:", error);
        setIsLoading(false);
      }
    };

    loadEssay();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fontMenuRef.current &&
        !fontMenuRef.current.contains(event.target as Node)
      ) {
        setShowToolbar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [essayId]);

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayContent(e.target.value);
  };

  const handleFontChange = (font: (typeof fontOptions)[0]) => {
    setSelectedFont(font);
    setShowToolbar(false);
  };

  const toggleFontMenu = () => {
    setShowToolbar((prev) => !prev);
  };

  const handleGetAIRemarks = async () => {
    if (essayContent.trim().length < 50) {
      alert(
        "Please write at least 50 characters before requesting AI remarks."
      );
      return;
    }

    setIsLoadingRemarks(true);
    setShowAIRemarks(true);
    setAIError(null);
    setIsAIRemarkMinimized(false);

    try {
      // Call the API endpoint instead of direct Gemini functions
      const response = await fetch('/api/essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essay: essayContent,
          title: essayTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get essay feedback');
      }

      const data = await response.json() as EssayReviewResponse;
      setAIRemarks(data);
    } catch (error) {
      console.error("Error getting AI remarks:", error);
      setAIError(
        error instanceof Error 
          ? error.message 
          : "Failed to generate AI feedback. Please try again later."
      );
    } finally {
      setIsLoadingRemarks(false);
    }
  };

  const selectSuggestedTitle = (title: string, index: number) => {
    setEssayTitle(title);
    setActiveSuggestionIndex(index);
    // Clear any previous title error since we now have a title
    setTitleError("");
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    let isValid = true;

    if (!essayTitle.trim()) {
      setTitleError("Please enter a title for your essay");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (!wordLimit || wordLimit <= 0) {
      setWordLimitError("Please enter a valid word limit");
      isValid = false;
    } else if (wordLimit > 5000) {
      setWordLimitError("Word limit cannot exceed 5000");
      isValid = false;
    } else {
      setWordLimitError("");
    }

    if (isValid) {
      setSetupCompleted(true);
    }
  };

  // Count words in the essay
  const wordCount = essayContent.trim()
    ? essayContent.trim().split(/\s+/).length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-medium"
        >
          Loading your essay...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-6"
    >
      <AnimatePresence mode="wait">
        {!setupCompleted ? (
          <motion.div
            key="setup-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mt-10"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Essay Setup</h1>
            <form onSubmit={handleSetupSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="essay-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Essay Title
                </label>
                <input
                  type="text"
                  id="essay-title"
                  value={essayTitle}
                  onChange={(e) => {
                    setEssayTitle(e.target.value);
                    setActiveSuggestionIndex(null);
                  }}
                  placeholder="Enter the title of your essay"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {titleError && (
                  <p className="text-red-500 text-sm">{titleError}</p>
                )}

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Suggested Titles:
                  </p>
                  <div className="flex overflow-x-auto pb-2 -mx-1 scrollbar-hide">
                    <div className="flex gap-2 px-1">
                      {suggestedTitles.map((title, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap border ${
                            activeSuggestionIndex === index
                              ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                          }`}
                          onClick={() => selectSuggestedTitle(title, index)}
                        >
                          {title}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="word-limit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Word Limit
                </label>
                <input
                  type="number"
                  id="word-limit"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(Number(e.target.value))}
                  min="1"
                  max="5000"
                  placeholder="Enter word limit"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {wordLimitError && (
                  <p className="text-red-500 text-sm">{wordLimitError}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Maximum: 5000 words
                </p>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-medium text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 hover:shadow-xl"
              >
                Start Writing
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="essay-editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex justify-between items-center"
            >
              <div>
                <h1 className="text-3xl font-bold">{essayTitle}</h1>
                <p className="text-gray-500 mt-1">Word Limit: {wordLimit}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetAIRemarks}
                disabled={isLoadingRemarks}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingRemarks ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Get AI Remarks"
                )}
              </motion.button>
            </motion.div>

            <div
              className={`w-full ${
                showAIRemarks ? "flex flex-col md:flex-row gap-6" : ""
              }`}
            >
              <motion.div
                className={`relative ${
                  showAIRemarks && !isAIRemarkMinimized
                    ? "md:w-1/2"
                    : "w-full"
                }`}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-4 z-10"
                  ref={fontMenuRef}
                >
                  <div className="relative">
                    <button
                      onClick={toggleFontMenu}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                      <span className={selectedFont.value}>
                        {selectedFont.name}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showToolbar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-20"
                      >
                        {fontOptions.map((font) => (
                          <button
                            key={font.value}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                              selectedFont.value === font.value
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            } ${font.value}`}
                            onClick={() => handleFontChange(font)}
                          >
                            {font.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className={`min-h-[calc(100vh-12rem)] relative ${
                    showAIRemarks && !isAIRemarkMinimized
                      ? "md:min-h-[calc(100vh-14rem)]"
                      : "min-h-[calc(100vh-12rem)]"
                  }`}
                >
                  <textarea
                    value={essayContent}
                    onChange={handleEssayChange}
                    placeholder="Start writing your essay here..."
                    className={`w-full h-full min-h-[calc(100vh-12rem)] p-8 text-lg border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
                      selectedFont.value
                    } ${
                      showAIRemarks && !isAIRemarkMinimized
                        ? "md:min-h-[calc(100vh-14rem)]"
                        : "min-h-[calc(100vh-12rem)]"
                    }`}
                    style={{
                      lineHeight: "1.8",
                    }}
                  />
                  <div className="absolute bottom-4 right-4 text-gray-400 text-sm flex items-center">
                    <span
                      className={
                        wordCount > wordLimit ? "text-red-500 font-medium" : ""
                      }
                    >
                      {wordCount} / {wordLimit} words
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {showAIRemarks && (
                <AnimatePresence>
                  {!isAIRemarkMinimized ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="md:w-1/2 bg-white rounded-2xl shadow-lg p-6 overflow-auto relative"
                      style={{ maxHeight: "calc(100vh - 14rem)" }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                          AI Feedback
                        </h2>
                        <button
                          onClick={() => setIsAIRemarkMinimized(true)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Minimize feedback"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      {isLoadingRemarks ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-16">
                          <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-medium text-gray-800">
                              Analyzing your essay
                            </p>
                            <p className="text-gray-500 mt-2">
                              Our AI is evaluating your writing for detailed
                              feedback...
                            </p>
                          </div>
                        </div>
                      ) : aiError ? (
                        <div className="bg-red-50 p-6 rounded-xl text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto text-red-500 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-red-800 font-medium">{aiError}</p>
                          <button
                            onClick={handleGetAIRemarks}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        aiRemarks && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="space-y-6"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-green-50 p-4 rounded-xl"
                            >
                              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Strengths
                              </h3>
                              <ul className="list-disc pl-5 space-y-1">
                                {aiRemarks.strengths.map((strength, index) => (
                                  <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="text-green-800"
                                  >
                                    {strength}
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="bg-amber-50 p-4 rounded-xl"
                            >
                              <h3 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                                Areas for Improvement
                              </h3>
                              <ul className="list-disc pl-5 space-y-1">
                                {aiRemarks.weaknesses.map((weakness, index) => (
                                  <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: 0.1 * index + 0.2,
                                    }}
                                    className="text-amber-800"
                                  >
                                    {weakness}
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="bg-blue-50 p-4 rounded-xl"
                            >
                              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Overall Feedback
                              </h3>
                              <p className="text-blue-800">
                                {aiRemarks.overallFeedback}
                              </p>
                            </motion.div>
                          </motion.div>
                        )
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-30"
                    >
                      <button
                        onClick={() => setIsAIRemarkMinimized(false)}
                        className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        View AI Feedback
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
