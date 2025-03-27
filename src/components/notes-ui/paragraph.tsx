"use client";

import { useState, useRef } from "react";
import NoteBlock from "./note-block";
import { Block } from "@/app/note/[topic_id]/page";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { RiMagicLine } from "react-icons/ri";

interface ParagraphProps {
  id: string;
  isEditing: boolean;
  block: Block;
  title: string;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (content: string) => void;
}

export default function Paragraph({
  id,
  isEditing,
  initialContent = "Type your text here...",
  title,
  block,
  onDelete,
  onContentChange,
}: ParagraphProps) {
  const [content, setContent] = useState(initialContent);
  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  // Auto-resize textarea based on content
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  // Send request to AI to edit the paragraph
  const handleAIEdit = async () => {
    if (!prompt.trim()) return;

    try {
      setIsAILoading(true);

      const response = await fetch("/api/note-sections/paragraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          block: block, // The overall block context
          content, // Current paragraph content
          prompt, // User's editing request
          title, // Paragraph heading/title
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI edits");
      }

      const data = await response.json();

      // Apply the edited paragraph
      const aiEditedText = data.editedParagraph;
      setContent(aiEditedText);
      onContentChange?.(aiEditedText);

      // Close the AI bubble and reset prompt
      setIsAIBubbleOpen(false);
      setPrompt("");
    } catch (err) {
      console.error("Error getting AI edits:", err);
      // Show error in the prompt area (optional)
      alert("Failed to get AI edits. Please try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  // View-only version of paragraph
  const ViewOnlyParagraph = () => (
    <p className="text-theme-primary/90 px-2 py-1 whitespace-pre-wrap">
      {content}
    </p>
  );

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center my-2">
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.2,
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.4,
          times: [0, 0.5, 1],
        }}
      />
    </div>
  );

  return (
    <NoteBlock id={id} type="Paragraph" onDelete={onDelete}>
      <div className="relative">
        {isEditing ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              className="w-full text-theme-primary/90 bg-transparent border-b border-theme-primary/20 focus:border-theme-primary focus:outline-none px-2 py-1 resize-none min-h-[80px]"
              autoFocus
              onFocus={(e) => adjustTextareaHeight(e.target)}
              onInput={(e) =>
                adjustTextareaHeight(e.target as HTMLTextAreaElement)
              }
            />

            {/* AI Edit Button */}
            <motion.button
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-md hover:bg-theme-primary/90"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAIBubbleOpen(true)}
            >
              <RiMagicLine size={18} />
            </motion.button>

            {/* AI Chat Bubble */}
            <AnimatePresence>
              {isAIBubbleOpen && (
                <motion.div
                  className="absolute right-0 bottom-12 w-72 bg-white rounded-lg shadow-lg border border-theme-primary/20 overflow-hidden z-10"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between bg-theme-primary text-white p-2">
                    <div className="flex items-center">
                      <FaRobot className="mr-2" />
                      <span className="font-medium">AI Editor</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsAIBubbleOpen(false)}
                    >
                      <FaTimes />
                    </motion.button>
                  </div>

                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-2">
                      How would you like to transform this text?
                    </p>

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
                      placeholder="E.g., Make this more concise, Fix grammar, Explain in simpler terms..."
                      disabled={isAILoading}
                    />

                    {isAILoading ? (
                      <LoadingAnimation />
                    ) : (
                      <motion.button
                        className="mt-2 w-full bg-theme-primary text-white py-2 rounded flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAIEdit}
                        disabled={!prompt.trim()}
                      >
                        <FaPaperPlane className="mr-2" size={12} />
                        Edit with AI
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <ViewOnlyParagraph />
        )}
      </div>
    </NoteBlock>
  );
}
