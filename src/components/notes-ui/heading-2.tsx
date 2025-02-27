"use client";

import { useState } from "react";
import { FaHeading } from "react-icons/fa";
import NoteBlock from "./note-block";

interface Heading2Props {
  id: string;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (content: string) => void;
}

export default function Heading2({
  id,
  initialContent = "Heading 2",
  onDelete,
  onContentChange,
}: Heading2Props) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <NoteBlock
      id={id}
      type="Heading 2"
      icon={<FaHeading size={14} />}
      onDelete={onDelete}
    >
      {isEditing ? (
        <input
          type="text"
          value={content}
          onChange={handleContentChange}
          className="w-full text-2xl font-semibold text-theme-primary bg-transparent border-b-2 border-theme-primary/20 focus:border-theme-primary focus:outline-none px-2 py-1"
          autoFocus
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <h2
          className="text-2xl font-semibold text-theme-primary px-2 py-1 cursor-text"
          onClick={() => setIsEditing(true)}
        >
          {content}
        </h2>
      )}
    </NoteBlock>
  );
}
