"use client";

import { FaFile, FaGlobe, FaFileAlt, FaTrash } from "react-icons/fa";
import { format } from "date-fns";

interface PreviousUploadCardProps {
  title: string;
  type: "pdf" | "web-link" | "text";
  description: string;
  created_at: string;
  onDelete?: () => void;
}

export function PreviousUploadCard({
  title,
  type,
  description,
  created_at,
  onDelete,
}: PreviousUploadCardProps) {
  const TypeIcon = {
    pdf: FaFile,
    "web-link": FaGlobe,
    text: FaFileAlt,
  }[type];

  const typeLabel = {
    pdf: "PDF File",
    "web-link": "Web Link",
    text: "Text Note",
  }[type];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 relative group w-64 max-h-fit">
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 text-red-500/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete upload"
        >
          <FaTrash className="text-sm" />
        </button>
      )}

      {/* Type Icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-theme-primary/10 flex items-center justify-center">
          <TypeIcon className="text-theme-primary text-lg" />
        </div>
        <p className="text-xs text-theme-primary/60 capitalize">{typeLabel}</p>
      </div>

      {/* Title and Description */}
      <div className="space-y-2 mb-3">
        <h3
          className="font-semibold text-theme-primary text-sm line-clamp-2"
          title={title}
        >
          {title}
        </h3>
        <p
          className="text-xs text-theme-primary/60 line-clamp-3"
          title={description}
        >
          {description}
        </p>
      </div>

      {/* Date at bottom right */}
      <div className="flex justify-end">
        <p className="text-xs text-theme-primary/40">
          {format(new Date(created_at), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
