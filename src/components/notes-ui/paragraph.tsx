"use client";

import { useState } from "react";
import NoteBlock from "./note-block";

interface ParagraphProps {
  id: string;
  isEditing: boolean;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (content: string) => void;
}

export default function Paragraph({
  id,
  isEditing,
  initialContent = "Type your text here...",
  onDelete,
  onContentChange,
}: ParagraphProps) {
  const [content, setContent] = useState(initialContent);

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

  // View-only version of paragraph
  const ViewOnlyParagraph = () => (
    <p className="text-theme-primary/90 px-2 py-1 whitespace-pre-wrap">
      {content}
    </p>
  );

  return (
    <NoteBlock id={id} type="Paragraph" onDelete={onDelete}>
      {isEditing ? (
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full text-theme-primary/90 bg-transparent border-b border-theme-primary/20 focus:border-theme-primary focus:outline-none px-2 py-1 resize-none min-h-[80px]"
          autoFocus
          ref={(textarea) => {
            if (textarea) {
              adjustTextareaHeight(textarea);
              textarea.addEventListener("input", () =>
                adjustTextareaHeight(textarea)
              );
            }
          }}
        />
      ) : (
        <ViewOnlyParagraph />
      )}
    </NoteBlock>
  );
}
