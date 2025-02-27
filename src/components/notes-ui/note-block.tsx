"use client";

import { ReactNode, useState } from "react";
import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";

export interface NoteBlockProps {
  id: string;
  children: ReactNode;
  type: string;
  icon: ReactNode;
  onDelete?: () => void;
}

export default function NoteBlock({
  id,
  children,
  type,
  icon,
  onDelete,
}: NoteBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div
      className="relative group p-2 mb-2 rounded-md hover:bg-theme-primary/5 transition-colors"
      data-block-id={id}
      data-block-type={type}
    >
      {/* Block controls - visible on hover */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button
          className="p-1.5 rounded-full bg-theme-light text-theme-primary hover:bg-theme-primary/10 transition-colors"
          onClick={toggleEdit}
          aria-label={isEditing ? "Save" : "Edit"}
        >
          {isEditing ? <FaCheck size={14} /> : <FaEdit size={14} />}
        </button>
        {onDelete && (
          <button
            className="p-1.5 rounded-full bg-theme-light text-red-500 hover:bg-red-50 transition-colors"
            onClick={onDelete}
            aria-label="Delete"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>

      {/* Block type indicator - visible when editing */}
      {isEditing && (
        <div className="absolute left-0 top-0 transform -translate-x-10 flex items-center text-theme-primary/70 text-xs">
          <span className="mr-1">{icon}</span>
          <span>{type}</span>
        </div>
      )}

      {/* Block content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
