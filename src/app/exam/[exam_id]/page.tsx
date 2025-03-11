"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheck, FaSpinner } from "react-icons/fa";
import { MCQQuestion } from "@/components/exam/question-types/mcq-question";
import { TrueFalseQuestion } from "@/components/exam/question-types/true-false-question";
import { ShortAnswerQuestion } from "@/components/exam/question-types/short-answer-question";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  ai_explanation?: string;
}

interface shortAnswer {
  question: string;
  modelAnswer?: string;
}
interface TrueFalse {
  question: string;
  answer: boolean;
  explanation: string;
}

interface QuestionsResponse {
  id: string;
  title: string;
  description: string;
  mcq: MCQ[];
  short_answer: shortAnswer[];
  true_false: TrueFalse[];
  feedback?: string;
}

// Interface for exam submission data
interface ExamSubmission {
  exam_id: string | string[];
  submission_time: string;
  answers: {
    mcq: {
      question: string;
      user_answer: string | null;
      correct_answer: string;
    }[];
    true_false: {
      question: string;
      user_answer: boolean | null;
      correct_answer: boolean;
    }[];
    short_answer: {
      question: string;
      user_answer: string;
      modelAnswer?: string;
    }[];
  };
}

export default function ExamPage() {
  const router = useRouter();
  const { exam_id } = useParams();
  const [examData, setExamData] = useState<QuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState<ExamSubmission | null>(
    null
  );
  const [evalResult, setEvalResult] = useState<{
    total_score: number;
    max_possible_score: number;
    score_details: {
      mcq: number;
      true_false: number;
      short_answer: number;
    };
  } | null>(null);

  // User answers
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [trueFalseAnswers, setTrueFalseAnswers] = useState<
    Record<number, boolean>
  >({});
  const [shortAnswers, setShortAnswers] = useState<Record<number, string>>({});

  // Progress tracking
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  useEffect(() => {
    // Fetch exam data from the API
    const fetchExam = async () => {
      try {
        setIsLoading(true);

        if (!exam_id) {
          setError("Exam ID is missing");
          return;
        }

        const response = await fetch(`/api/exam/main/${exam_id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch exam data");
        }

        const data = await response.json();
        console.log(data);
        setExamData(data);
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load exam data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [exam_id]);

  useEffect(() => {
    console.log("Submission data:", submissionData);
  }, [submissionData]);

  useEffect(() => {
    if (!examData) return;
    console.log("Exam data:", examData);

    // Count answered questions
    const mcqCount = Object.keys(mcqAnswers).length;
    const tfCount = Object.keys(trueFalseAnswers).length;
    const saCount = Object.keys(shortAnswers).filter(
      (key) => shortAnswers[parseInt(key)]?.trim().length > 0
    ).length;

    setAnsweredQuestions(mcqCount + tfCount + saCount);
  }, [mcqAnswers, trueFalseAnswers, shortAnswers, examData]);

  const handleMcqAnswer = (index: number, answer: string) => {
    setMcqAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleTrueFalseAnswer = (index: number, answer: boolean) => {
    setTrueFalseAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleShortAnswer = (index: number, answer: string) => {
    setShortAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Create submission data object with all questions and user answers
    const submission: ExamSubmission = {
      exam_id: exam_id || "",
      submission_time: new Date().toISOString(),
      answers: {
        mcq:
          examData?.mcq.map((question, index) => ({
            question: question.question,
            user_answer: mcqAnswers[index] || null,
            correct_answer: question.answer,
          })) || [],
        true_false:
          examData?.true_false.map((question, index) => ({
            question: question.question,
            user_answer:
              trueFalseAnswers[index] !== undefined
                ? trueFalseAnswers[index]
                : null,
            correct_answer: question.answer,
          })) || [],
        short_answer:
          examData?.short_answer.map((question, index) => ({
            question: question.question,
            user_answer: shortAnswers[index] || "",
            modelAnswer: question.modelAnswer,
          })) || [],
      },
    };

    setSubmissionData(submission);
    console.log("Submission data:", submission);

    try {
      // Send submission to API for evaluation
      const response = await fetch("/api/exam/eval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to evaluate exam");
      }

      const result = await response.json();
      console.log("Evaluation result:", result);

      // Store evaluation results in state
      setEvalResult({
        total_score: result.total_score,
        max_possible_score: result.max_possible_score,
        score_details: result.score_details,
      });

      setShowExplanations(true);
    } catch (error) {
      console.error("Error evaluating exam:", error);
      // Optionally show error message to user
    } finally {
      setIsSubmitting(false);
      // Scroll to top to see results
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getTotalQuestions = () => {
    if (!examData) return 0;
    return (
      examData.mcq.length +
      examData.true_false.length +
      examData.short_answer.length
    );
  };

  const getProgressPercentage = () => {
    const total = getTotalQuestions();
    if (total === 0) return 0;
    return (answeredQuestions / total) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-theme-primary">
            Loading exam...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Exam
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Could not load exam data"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with back button */}
      <div className="bg-theme-primary text-white sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold">{examData.title}</h1>
              <p className="text-sm text-white/80">Exam ID: {exam_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Description card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-theme-primary/10 mb-8"
        >
          <h2 className="text-xl font-semibold text-theme-primary mb-2">
            Description
          </h2>
          <p className="text-gray-700">{examData.description}</p>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {answeredQuestions} of {getTotalQuestions()} questions answered
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                className="h-full bg-theme-primary rounded-full"
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>

          {/* Results summary (shown after submission) */}
          {showExplanations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h3 className="font-medium text-blue-700 mb-2">
                Exam Completed!
              </h3>

              {evalResult && (
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-medium">
                      Your Score:
                    </span>
                    <span className="text-blue-900 font-bold text-lg">
                      {evalResult.total_score} / {evalResult.max_possible_score}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-blue-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Multiple Choice:</span>
                      <span>
                        {evalResult.score_details.mcq} /{" "}
                        {submissionData?.answers.mcq.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>True/False:</span>
                      <span>
                        {evalResult.score_details.true_false} /{" "}
                        {submissionData?.answers.true_false.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Short Answer:</span>
                      <span>
                        {evalResult.score_details.short_answer} /{" "}
                        {(submissionData?.answers.short_answer.length || 0) * 5}{" "}
                        {/* Each short answer worth 5 points */}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-blue-900 text-sm">
                {"You've"} completed the exam. Review the AI explanations for
                each question below to learn more.
              </p>
              {submissionData && (
                <div className="mt-2 text-xs text-blue-800">
                  <p>Submission ID: {exam_id}</p>
                  <p>
                    Submitted:{" "}
                    {new Date(submissionData.submission_time).toLocaleString()}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* MCQ Section */}
        {examData.mcq.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">
              Multiple Choice Questions
            </h2>
            {examData.mcq.map((question, index) => (
              <MCQQuestion
                key={`mcq-${index}`}
                question={question}
                index={index}
                showExplanation={showExplanations}
                onAnswerSelect={(answer) => handleMcqAnswer(index, answer)}
                userAnswer={mcqAnswers[index]}
              />
            ))}
          </div>
        )}

        {/* True/False Section */}
        {examData.true_false.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">
              True/False Questions
            </h2>
            {examData.true_false.map((question, index) => (
              <TrueFalseQuestion
                key={`tf-${index}`}
                question={question}
                index={index}
                showExplanation={showExplanations}
                onAnswerSelect={(answer) =>
                  handleTrueFalseAnswer(index, answer)
                }
                userAnswer={trueFalseAnswers[index]}
              />
            ))}
          </div>
        )}

        {/* Short Answer Section */}
        {examData.short_answer.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">
              Short Answer Questions
            </h2>
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Note:</span> Each short answer
                question is worth up to 5 points. Your answers will be evaluated
                by AI based on accuracy, completeness, and relevance.
              </p>
            </div>
            {examData.short_answer.map((question, index) => (
              <ShortAnswerQuestion
                key={`sa-${index}`}
                question={question}
                index={index}
                showExplanation={showExplanations}
                onAnswerChange={(answer) => handleShortAnswer(index, answer)}
                userAnswer={shortAnswers[index]}
              />
            ))}
          </div>
        )}

        {/* Submit button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{answeredQuestions}</span> of{" "}
                {getTotalQuestions()} questions answered
              </div>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || showExplanations || answeredQuestions === 0
                }
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  showExplanations
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-theme-primary text-white hover:bg-theme-primary/90"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : showExplanations ? (
                  <>
                    <FaCheck />
                    Submitted
                  </>
                ) : (
                  "Submit Exam"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
