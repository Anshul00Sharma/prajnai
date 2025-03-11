"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ShortAnswer {
  question: string;
  ai_explanation?: string;
  modelAnswer?: string;
}

interface ShortAnswerQuestionProps {
  question: ShortAnswer;
  index: number;
  showExplanation: boolean;
  onAnswerChange: (answer: string) => void;
  userAnswer?: string;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
  question,
  index,
  showExplanation,
  onAnswerChange,
  userAnswer,
}) => {
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

      <div className="mb-4">
        <textarea
          value={userAnswer || ""}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          disabled={showExplanation}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all resize-none disabled:bg-gray-50"
          rows={4}
        />
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            {question.ai_explanation && (
              <>
                <h4 className="font-medium text-blue-700 mb-2">AI Explanation:</h4>
                <p className="text-blue-900 text-sm">{question.ai_explanation}</p>
              </>
            )}
            
            {/* Model Answer Section */}
            {question.modelAnswer && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="text-sm font-medium text-green-700 mb-1">Model Answer:</h5>
                <p className="text-green-900 text-sm whitespace-pre-line">{question.modelAnswer}</p>
              </div>
            )}
            
            {userAnswer && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                <h5 className="text-sm font-medium text-blue-700 mb-1">Your Answer:</h5>
                <p className="text-gray-700 text-sm whitespace-pre-line">{userAnswer}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
