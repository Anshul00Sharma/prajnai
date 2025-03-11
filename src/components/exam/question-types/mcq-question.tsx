"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  ai_explanation?: string;
}

interface MCQQuestionProps {
  question: MCQ;
  index: number;
  showExplanation: boolean;
  onAnswerSelect: (selectedOption: string) => void;
  userAnswer?: string;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  index,
  showExplanation,
  onAnswerSelect,
  userAnswer,
}) => {
  const isCorrect = userAnswer === question.answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md border border-theme-primary/10 mb-6"
    >
      <h3 className="font-semibold text-lg text-theme-primary mb-4">
        Question {index + 1}: {question.question}
      </h3>

      <div className="space-y-3 mb-4">
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-start">
            <button
              onClick={() => onAnswerSelect(option)}
              disabled={showExplanation}
              className={`flex items-center w-full p-3 rounded-lg border transition-all ${
                showExplanation
                  ? option === question.answer
                    ? "border-green-500 bg-green-50"
                    : userAnswer === option
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                  : userAnswer === option
                  ? "border-theme-primary bg-theme-primary/5"
                  : "border-gray-200 hover:border-theme-primary/50 hover:bg-theme-primary/5"
              }`}
            >
              <div className="mr-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    userAnswer === option
                      ? showExplanation
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-theme-primary text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {userAnswer === option && (
                    <span className="text-xs">
                      {showExplanation ? (
                        isCorrect ? (
                          <FaCheck />
                        ) : (
                          <FaTimes />
                        )
                      ) : (
                        "•"
                      )}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`flex-1 ${
                  showExplanation && option === question.answer
                    ? "font-medium"
                    : ""
                }`}
              >
                {option}
              </span>
              {showExplanation && option === question.answer && (
                <FaCheck className="text-green-500 ml-2" />
              )}
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showExplanation && question.ai_explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h4 className="font-medium text-blue-700 mb-2">AI Explanation:</h4>
            <p className="text-blue-900 text-sm">{question.ai_explanation}</p>
            <div className="mt-2 flex items-center text-sm text-blue-700">
              <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {isCorrect ? "Correct" : "Incorrect"} Answer: {question.answer}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
