"use client";

import { useState } from "react";
import NoteBlock from "./note-block";

interface Heading1Props {
  id: string;
  isEditing: boolean;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (content: string) => void;
}

export default function Heading1({
  id,
  isEditing,
  initialContent = "Heading 1",
  onDelete,
  onContentChange,
}: Heading1Props) {
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <NoteBlock id={id} type="Heading 1" onDelete={onDelete}>
      {isEditing ? (
        <input
          type="text"
          value={content}
          onChange={handleContentChange}
          className="w-full text-3xl font-bold text-theme-primary bg-transparent border-b-2 border-theme-primary/20 focus:border-theme-primary focus:outline-none px-2 py-1"
          autoFocus
          // onBlur={() => setIsEditing(false)}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") {
          //     setIsEditing(false);
          //   }
          // }}
        />
      ) : (
        <h1
          className="text-3xl font-bold text-theme-primary px-2 py-1 cursor-text"
          // onClick={() => setIsEditing(true)}
        >
          {content}
        </h1>
      )}
    </NoteBlock>
  );
}
