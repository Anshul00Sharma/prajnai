"use client";

import { useState } from "react";
import { FaParagraph } from "react-icons/fa";
import NoteBlock from "./note-block";

interface ParagraphProps {
  id: string;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (content: string) => void;
}

export default function Paragraph({
  id,
  initialContent = "Type your text here...",
  onDelete,
  onContentChange,
}: ParagraphProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <NoteBlock
      id={id}
      type="Paragraph"
      icon={<FaParagraph size={16} />}
      onDelete={onDelete}
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full text-theme-primary/90 bg-transparent border-b border-theme-primary/20 focus:border-theme-primary focus:outline-none px-2 py-1 resize-none min-h-[80px]"
          autoFocus
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              setIsEditing(false);
            }
          }}
          ref={(textarea) => {
            if (textarea) {
              adjustTextareaHeight(textarea);
              textarea.addEventListener("input", () => adjustTextareaHeight(textarea));
            }
          }}
        />
      ) : (
        <p
          className="text-theme-primary/90 px-2 py-1 whitespace-pre-wrap cursor-text"
          onClick={() => setIsEditing(true)}
        >
          {content}
        </p>
      )}
    </NoteBlock>
  );
}
