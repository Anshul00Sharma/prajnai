"use client";

import { useState, memo, useEffect } from "react";
import {
  FaFilePdf,
  FaLink,
  FaFileAlt,
  FaCheck,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  storeFileInIndexedDB,
  removeFileFromIndexedDB,
} from "@/utils/file-storage";

export type UploadType = "pdf" | "web-link" | "text";

interface UploadCardProps {
  id: number;
  onSubmit: (data: {
    id: number;
    title: string;
    type: UploadType;
    description: string;
    content: string;
    fileKey?: string | null;
  }) => void;
  onDelete: (id: number) => void;
}

function UploadCard({ id, onSubmit, onDelete }: UploadCardProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<UploadType>("pdf");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState(true);
  const [isStoringFile, setIsStoringFile] = useState(false);

  // Reset content and file when type changes
  useEffect(() => {
    setContent("");
    if (type !== "pdf") {
      setFile(null);
      // If we had a file key and switching away from PDF, clean up
      if (fileKey) {
        removeFileFromIndexedDB(fileKey);
        setFileKey(null);
      }
    }
  }, [type]);

  // Clean up file from IndexedDB when component unmounts
  useEffect(() => {
    return () => {
      if (fileKey) {
        removeFileFromIndexedDB(fileKey);
      }
    };
  }, [fileKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsStoringFile(true);

    try {
      let finalContent = content;
      let finalFileKey = null;

      if (type === "pdf" && file) {
        finalFileKey = await storeFileInIndexedDB(id, file);
        finalContent = file.name;
        setFileKey(finalFileKey);
      }

      onSubmit({
        id,
        title,
        type,
        description,
        content: finalContent,
        fileKey: finalFileKey,
      });

      setIsEditable(false);
    } catch (error) {
      console.error("Error handling file submission:", error);
    } finally {
      setIsStoringFile(false);
    }
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleDeleteCard = () => {
    // Clean up file from IndexedDB before calling onDelete
    if (fileKey) {
      removeFileFromIndexedDB(fileKey);
    }
    onDelete(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full h-[320px] flex flex-col relative group">
      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDeleteCard}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
      >
        <FaTrash className="text-xs" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            required
            disabled={!isEditable}
          />
        </div>

        {/* Type Selection */}
        <div className="flex gap-1.5 justify-center">
          <button
            type="button"
            onClick={() => setType("pdf")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
              type === "pdf"
                ? "bg-theme-primary text-white"
                : "bg-theme-light hover:bg-theme-primary/10 text-theme-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!isEditable}
          >
            <FaFilePdf />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setType("web-link")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
              type === "web-link"
                ? "bg-theme-primary text-white"
                : "bg-theme-light hover:bg-theme-primary/10 text-theme-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!isEditable}
          >
            <FaLink />
            <span>Link</span>
          </button>
          <button
            type="button"
            onClick={() => setType("text")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${
              type === "text"
                ? "bg-theme-primary text-white"
                : "bg-theme-light hover:bg-theme-primary/10 text-theme-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!isEditable}
          >
            <FaFileAlt />
            <span>Text</span>
          </button>
        </div>

        {/* Dynamic Input based on Type */}
        <div className="flex-1">
          {type === "pdf" && (
            <div className="border-2 border-dashed border-theme-primary/20 rounded-lg p-3 text-center hover:border-theme-primary/40 transition-colors h-[100px] flex items-center justify-center disabled:opacity-50 disabled:hover:border-theme-primary/20">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                  }
                }}
                className="hidden"
                id={`pdf-upload-${id}`}
                required={type === "pdf"}
                disabled={!isEditable}
              />
              <label
                htmlFor={`pdf-upload-${id}`}
                className={`cursor-pointer flex flex-col items-center gap-1.5 text-theme-primary/70 ${
                  !isEditable ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <FaFilePdf className="text-2xl" />
                <span className="text-xs">
                  {file ? file.name : "Click to upload PDF"}
                </span>
              </label>
            </div>
          )}
          {type === "web-link" && (
            <div className="h-[100px] flex items-center">
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter web link"
                className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                required={type === "web-link"}
                disabled={!isEditable}
              />
            </div>
          )}
          {type === "text" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter text content"
              className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 h-[100px] resize-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
              required={type === "text"}
              disabled={!isEditable}
            />
          )}
        </div>

        {/* Description Input */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 resize-none h-[40px] text-sm disabled:bg-gray-50 disabled:text-gray-500"
            required
            disabled={!isEditable}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {!isEditable && (
            <button
              type="button"
              onClick={handleEdit}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
            >
              <FaEdit className="text-xs" />
              <span>Edit</span>
            </button>
          )}
          {isEditable && (
            <button
              type="submit"
              className="px-4 py-1.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors text-sm flex items-center gap-1"
              disabled={isStoringFile}
            >
              {isStoringFile ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <FaCheck className="text-xs" />
              )}
              <span>{isStoringFile ? "Uploading..." : "Confirm"}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default memo(UploadCard);
