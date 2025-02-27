"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWindowMinimize,
  FaWindowMaximize,
  FaTimes,
  FaUpload,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

import type { UploadData } from "../../contexts/upload-context";

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface SubjectUploadItem {
  subject: UploadData;
  status: UploadStatus;
  progress: number;
  error?: string;
}

interface SubjectUploadPopupProps {
  subjects: UploadData[];
  onClose: () => void;
  onComplete?: () => void;
  uploadFunction: (upload: UploadData) => Promise<boolean>;
}

export function SubjectUploadPopup({
  subjects,
  onClose,
  onComplete,
  uploadFunction,
}: SubjectUploadPopupProps) {
  const [popupState, setPopupState] = useState<"open" | "minimized" | "hidden">(
    "open"
  );
  const [uploadItems, setUploadItems] = useState<SubjectUploadItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize upload items from subjects
  useEffect(() => {
    setUploadItems(
      subjects.map((subject) => ({
        subject,
        status: "pending",
        progress: 0,
      }))
    );
  }, [subjects]);

  // Function to handle real uploads
  const handleUpload = async (index: number) => {
    if (index >= subjects.length) {
      if (onComplete) onComplete();
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    setCurrentIndex(index);

    // Update status to uploading
    setUploadItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, status: "uploading", progress: 10 } : item
      )
    );

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadItems((prev) => {
          const newItems = [...prev];
          // Only increase progress up to 90% until we get confirmation
          if (newItems[index].progress < 90) {
            newItems[index].progress += 5;
          }
          return newItems;
        });
      }, 150);

      // Perform the actual upload
      const success = await uploadFunction(subjects[index]);

      // Clear the interval
      clearInterval(progressInterval);

      if (success) {
        // Set to 100% and mark as success
        setUploadItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: "success", progress: 100 } : item
          )
        );

        // Move to next subject after a delay
        setTimeout(() => {
          handleUpload(index + 1);
        }, 500);
      } else {
        // Mark as error
        setUploadItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "error",
                  progress: 0,
                  error: "Failed to upload",
                }
              : item
          )
        );
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      // Mark as error
      setUploadItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                status: "error",
                progress: 0,
                error: "An unexpected error occurred",
              }
            : item
        )
      );
      setIsUploading(false);
    }
  };

  // Start upload when component mounts
  useEffect(() => {
    if (subjects.length > 0 && !isUploading) {
      handleUpload(0);
    }
  }, [subjects]);

  // Handle minimize/maximize toggle
  const toggleMinimize = () => {
    setPopupState(popupState === "open" ? "minimized" : "open");
  };

  // Get completion percentage
  const getOverallProgress = () => {
    if (uploadItems.length === 0) return 0;

    const completedItems = uploadItems.filter(
      (item) => item.status === "success"
    ).length;
    const progressOfCurrent =
      currentIndex < uploadItems.length
        ? uploadItems[currentIndex].progress / 100
        : 0;

    return Math.round(
      ((completedItems + progressOfCurrent) / uploadItems.length) * 100
    );
  };

  // Check if all uploads are complete
  const isUploadComplete = () => {
    return uploadItems.every((item) => item.status === "success");
  };

  // Check if any upload has failed
  const hasErrors = () => {
    return uploadItems.some((item) => item.status === "error");
  };

  // Retry failed uploads
  const retryFailedUploads = () => {
    const firstErrorIndex = uploadItems.findIndex(
      (item) => item.status === "error"
    );
    if (firstErrorIndex >= 0) {
      handleUpload(firstErrorIndex);
    }
  };

  if (popupState === "hidden") return null;

  return (
    <AnimatePresence>
      {popupState === "open" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-theme-light backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-theme-primary">
                Uploading Subjects
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleMinimize}
                  className="p-2 rounded-full hover:bg-theme-primary/10 text-theme-primary transition-colors"
                >
                  <FaWindowMinimize className="text-sm" />
                </button>
                {isUploadComplete() || hasErrors() ? (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-theme-primary/10 text-theme-primary transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-theme-primary">
                  Overall Progress
                </span>
                <span className="text-xs text-theme-primary/80">
                  {getOverallProgress()}%
                </span>
              </div>
              <div className="w-full bg-theme-primary/10 rounded-full h-2.5">
                <div
                  className="bg-theme-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Error message and retry button */}
            {hasErrors() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-600 mb-2">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-medium">Upload failed</span>
                </div>
                <p className="text-sm text-red-600 mb-2">
                  Some uploads could not be completed. Please retry or close and try again later.
                </p>
                <button
                  onClick={retryFailedUploads}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Retry Failed
                </button>
              </div>
            )}

            {/* Upload Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {uploadItems.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-3 shadow-sm transition-all duration-300 ${
                    item.status === "success"
                      ? "border-l-4 border-green-500"
                      : item.status === "error"
                      ? "border-l-4 border-red-500"
                      : item.status === "uploading"
                      ? "border-l-4 border-theme-primary"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-theme-primary truncate max-w-[200px]">
                      {item.subject.title}
                    </span>
                    <div className="flex items-center">
                      {item.status === "pending" && (
                        <span className="text-xs text-theme-primary/60">
                          Pending
                        </span>
                      )}
                      {item.status === "uploading" && (
                        <div className="flex items-center">
                          <span className="text-xs text-theme-primary/60 mr-2">
                            {item.progress}%
                          </span>
                          <FaUpload className="text-theme-primary text-xs animate-pulse" />
                        </div>
                      )}
                      {item.status === "success" && (
                        <FaCheck className="text-green-500 text-sm" />
                      )}
                      {item.status === "error" && (
                        <FaExclamationTriangle className="text-red-500 text-sm" />
                      )}
                    </div>
                  </div>
                  {item.status !== "pending" && (
                    <div className="w-full bg-theme-primary/10 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                          item.status === "error"
                            ? "bg-red-500"
                            : "bg-theme-primary"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  )}
                  {item.status === "error" && item.error && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-theme-light rounded-lg p-3 shadow-lg cursor-pointer z-50"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-theme-primary/10 flex items-center justify-center">
              <FaUpload className="text-theme-primary text-sm" />
              {isUploading && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-theme-primary rounded-full animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-theme-primary">
                  Uploading Subjects
                </h3>
                <FaWindowMaximize className="text-theme-primary/60 text-xs" />
              </div>
              <div className="w-32 bg-theme-primary/10 rounded-full h-1.5 mt-1">
                <div
                  className="bg-theme-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {currentIndex < uploadItems.length && (
            <div className="mt-2 text-xs text-theme-primary/80 truncate">
              Current: {uploadItems[currentIndex]?.subject.title}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
