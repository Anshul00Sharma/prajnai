"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface TrueFalse {
  question: string;
  answer: boolean;
  explanation: string;
}

interface TrueFalseQuestionProps {
  question: TrueFalse;
  index: number;
  showExplanation: boolean;
  onAnswerSelect: (selectedOption: boolean) => void;
  userAnswer?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  index,
  showExplanation,
  onAnswerSelect,
  userAnswer,
}) => {
  const isCorrect = userAnswer === question.answer;

  const getButtonClasses = (isTrue: boolean) => {
    if (!showExplanation) {
      return userAnswer === isTrue
        ? "bg-theme-primary text-white border-theme-primary"
        : "bg-white text-gray-700 border-gray-300 hover:border-theme-primary/50";
    }
    
    if (question.answer === isTrue) {
      return "bg-green-500 text-white border-green-500";
    }
    
    if (userAnswer === isTrue && userAnswer !== question.answer) {
      return "bg-red-500 text-white border-red-500";
    }
    
    return "bg-white text-gray-400 border-gray-300";
  };

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

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => onAnswerSelect(true)}
          disabled={showExplanation}
          className={`flex-1 flex flex-col items-center py-4 px-6 rounded-lg transition-all border ${getButtonClasses(
            true
          )}`}
        >
          <FaThumbsUp className="text-2xl mb-2" />
          <span className="font-medium">True</span>
        </button>
        
        <button
          onClick={() => onAnswerSelect(false)}
          disabled={showExplanation}
          className={`flex-1 flex flex-col items-center py-4 px-6 rounded-lg transition-all border ${getButtonClasses(
            false
          )}`}
        >
          <FaThumbsDown className="text-2xl mb-2" />
          <span className="font-medium">False</span>
        </button>
      </div>

      <AnimatePresence>
        {showExplanation && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h4 className="font-medium text-blue-700 mb-2">Explanation:</h4>
            <p className="text-blue-900 text-sm">{question.explanation}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {isCorrect ? "Correct" : "Incorrect"} Answer: {question.answer ? "True" : "False"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
