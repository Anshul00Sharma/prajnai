"use client";

import { useState, memo } from "react";
import { FaCheck, FaEdit, FaTrash } from "react-icons/fa";
// import { useUpload } from "@/contexts/upload-context";

interface AddTopicCardProps {
  id: number;
  onSubmit: (data: {
    id: number;
    title: string;
    description: string;
    // uploadIds: string[];
  }) => void;
  onDelete: (id: number) => void;
}

function AddTopicCard({ id, onSubmit, onDelete }: AddTopicCardProps) {
  // const { uploadedData } = useUpload();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [isEditable, setIsEditable] = useState(true);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSubmit({
  //     id,
  //     title,
  //     description,
  //     uploadIds: selectedUploads,
  //   });
  //   setIsEditable(false);
  // };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id,
      title,
      description,
    });
    setIsEditable(false);
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleDeleteCard = () => {
    onDelete(id);
  };

  // const handleSelectAll = () => {
  //   if (selectedUploads.length === uploadedData.length) {
  //     // If all uploads are already selected, deselect all
  //     setSelectedUploads([]);
  //   } else {
  //     // Otherwise, select all uploads
  //     setSelectedUploads(uploadedData.map((upload) => upload.id.toString()));
  //   }
  // };

  // const handleUploadToggle = (uploadId: string) => {
  //   setSelectedUploads((prev) => {
  //     if (prev.includes(uploadId)) {
  //       return prev.filter((id) => id !== uploadId);
  //     } else {
  //       return [...prev, uploadId];
  //     }
  //   });
  // };

  // const isAllSelected =
  //   uploadedData.length > 0 && selectedUploads.length === uploadedData.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full h-[250px] flex flex-col relative group">
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
            placeholder="Enter topic title"
            className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            required
            disabled={!isEditable}
          />
        </div>

        {/* Description Input */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter topic description"
            className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 resize-none h-[120px] text-sm disabled:bg-gray-50 disabled:text-gray-500"
            required
            disabled={!isEditable}
          />
        </div>

        {/* Use Uploads Section */}
        {/* <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-gray-700">Use Uploads</p>
          <div className="border border-theme-primary/20 rounded-lg p-2 max-h-[120px] overflow-y-auto">
            {uploadedData.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                No uploads available
              </p>
            ) : (
              <div className="space-y-1">
                
                <div className="pb-1 border-b border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded text-theme-primary focus:ring-1 focus:ring-theme-primary/20"
                      disabled={!isEditable}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      All Uploads
                    </span>
                  </label>
                </div>

                
                {uploadedData.map((upload) => (
                  <label
                    key={upload.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUploads.includes(upload.id.toString())}
                      onChange={() => handleUploadToggle(upload.id.toString())}
                      className="rounded text-theme-primary focus:ring-1 focus:ring-theme-primary/20"
                      disabled={!isEditable}
                    />
                    <span className="text-xs text-gray-700 truncate">
                      {upload.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div> 
        */}

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
            >
              <FaCheck className="text-xs" />
              <span>Confirm</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default memo(AddTopicCard);
