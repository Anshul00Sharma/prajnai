"use client";

import { ReactNode } from "react";
import { FaTrash } from "react-icons/fa";

export interface NoteBlockProps {
  id: string;
  children: ReactNode;
  type: string;
  onDelete?: () => void;
}

export default function NoteBlock({
  id,
  children,
  type,

  onDelete,
}: NoteBlockProps) {
  return (
    <div
      className="relative group p-2 mb-2 rounded-md hover:bg-theme-primary/5 transition-colors"
      data-block-id={id}
      data-block-type={type}
    >
      {/* Block controls - visible on hover */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
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

      {/* Block content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
