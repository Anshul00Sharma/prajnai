"use client";

import { Exam } from "@/types/exam";
import { useRouter } from "next/navigation";
import { FaCheck, FaSpinner, FaBookOpen, FaClipboardList, FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState, useEffect } from "react";

interface Topic {
  id: string;
  title: string;
}

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const router = useRouter();
  const [showTopics, setShowTopics] = useState(false);
  const [topicDetails, setTopicDetails] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Fetch topic details when topics are expanded
  useEffect(() => {
    const fetchTopicDetails = async () => {
      if (!showTopics || topicDetails.length > 0) return;
      
      setIsLoadingTopics(true);
      try {
        // Create an array of promises for each topic fetch
        const topicPromises = exam.topics.map(topicId => 
          fetch(`/api/topic/${topicId}`)
            .then(res => res.ok ? res.json() : null)
            .catch(err => {
              console.error(`Error fetching topic ${topicId}:`, err);
              return null;
            })
        );
        
        // Wait for all promises to resolve
        const results = await Promise.all(topicPromises);
        
        // Filter out any null results and map to the topic interface
        const validTopics = results
          .filter(result => result !== null)
          .map(topic => ({
            id: topic.id,
            title: topic.title
          }));
        
        setTopicDetails(validTopics);
      } catch (error) {
        console.error("Error fetching topic details:", error);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    
    fetchTopicDetails();
  }, [showTopics, exam.topics, topicDetails.length]);

  const handleCardClick = () => {
    if (exam.exam_ready) {
      router.push(`/exam/${exam.id}`);
    }
  };

  // Calculate total questions
  const totalQuestions = exam.mcqCount + exam.trueFalseCount + exam.shortAnswerCount;

  return (
    <div
      key={exam.id}
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex items-start">
        <div className="mr-3 text-theme-primary text-2xl">
          <FaClipboardList />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-theme-primary mb-1">
            Exam {new Date(exam.created_at).toLocaleDateString()}
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
              <FaQuestionCircle className="mr-1" />
              <span>{totalQuestions} Questions</span>
            </div>
            <div 
              className="flex items-center bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowTopics(!showTopics);
              }}
            >
              <FaBookOpen className="mr-1" />
              <span>{exam.topics.length} Topics</span>
              {showTopics ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
            </div>
          </div>

          {/* Topics list (collapsible) */}
          {showTopics && (
            <div className="mt-2 mb-3 p-2 bg-gray-50 rounded-md text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Topics:</h4>
              {isLoadingTopics ? (
                <div className="flex justify-center py-2">
                  <FaSpinner className="animate-spin text-blue-500" />
                </div>
              ) : topicDetails.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600">
                  {topicDetails.map((topic) => (
                    <li key={topic.id} className="truncate">
                      {topic.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc list-inside text-gray-600">
                  {exam.topics.map((topicId, index) => (
                    <li key={topicId} className="truncate">
                      Topic {index + 1}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {exam.additionalInfo && (
            <p className="text-gray-600 text-sm line-clamp-2 mt-2">
              {exam.additionalInfo}
            </p>
          )}

          {/* Exam Status Section */}
          <div 
            className={`mt-3 border-t pt-2 ${exam.exam_ready ? "cursor-pointer" : ""}`}
            onClick={exam.exam_ready ? handleCardClick : undefined}
          >
            {exam.exam_ready ? (
              <div className="flex items-center text-green-600">
                <FaCheck className="mr-2" />
                <span className="text-sm font-medium">Exam is ready</span>
                <span className="ml-2 text-xs text-blue-500">(Click to start)</span>
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
                      AI generating questions
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
            Created: {new Date(exam.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
