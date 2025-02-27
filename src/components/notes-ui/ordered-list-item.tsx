"use client";

import { useState } from "react";

interface OrderedListItemProps {
  id: string;
  index: number;
  initialContent?: string;
  onDelete?: () => void;
  onContentChange?: (id: string, content: string) => void;
}

export default function OrderedListItem({
  id,
  index,
  initialContent = "List item",
  onDelete,
  onContentChange,
}: OrderedListItemProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(id, newContent);
  };

  return (
    <li className="flex items-start mb-1 group relative" value={index + 1}>
      {isEditing ? (
        <input
          type="text"
          value={content}
          onChange={handleContentChange}
          className="flex-1 text-theme-primary/90 bg-transparent border-b border-theme-primary/20 focus:border-theme-primary focus:outline-none py-0.5 px-1 ml-1"
          autoFocus
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span
          className="flex-1 text-theme-primary/90 py-0.5 px-1 ml-1 cursor-text"
          onClick={() => setIsEditing(true)}
        >
          {content}
        </span>
      )}
      
      {/* Delete button - only visible on hover */}
      {onDelete && (
        <button
          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-full absolute right-0 transition-opacity"
          onClick={onDelete}
          aria-label="Delete list item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </li>
  );
}
