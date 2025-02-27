"use client";

import { useState } from "react";
import { FaImage } from "react-icons/fa";
import NoteBlock from "./note-block";

interface ImageProps {
  id: string;
  initialSrc?: string;
  initialAlt?: string;
  onDelete?: () => void;
  onImageChange?: (src: string, alt: string) => void;
}

export default function Image({
  id,
  initialSrc = "https://via.placeholder.com/800x400?text=Add+an+image",
  initialAlt = "Image description",
  onDelete,
  onImageChange,
}: ImageProps) {
  const [src, setSrc] = useState(initialSrc);
  const [alt, setAlt] = useState(initialAlt);
  const [isEditing, setIsEditing] = useState(false);

  const handleSrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSrc = e.target.value;
    setSrc(newSrc);
    onImageChange?.(newSrc, alt);
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlt = e.target.value;
    setAlt(newAlt);
    onImageChange?.(src, newAlt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setSrc(objectUrl);
      onImageChange?.(objectUrl, alt);
    }
  };

  return (
    <NoteBlock
      id={id}
      type="Image"
      icon={<FaImage size={14} />}
      onDelete={onDelete}
    >
      <div className="px-2 py-1">
        {isEditing ? (
          <div className="space-y-3 bg-theme-primary/5 p-3 rounded-md">
            <div>
              <label className="block text-sm text-theme-primary/70 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={src}
                onChange={handleSrcChange}
                className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-primary/70 mb-1">
                Alternative Text
              </label>
              <input
                type="text"
                value={alt}
                onChange={handleAltChange}
                className="w-full px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm"
                placeholder="Description of the image"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-primary/70 mb-1">
                Or upload an image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-theme-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-theme-primary/10 file:text-theme-primary hover:file:bg-theme-primary/20"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-1.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors text-sm"
                onClick={() => setIsEditing(false)}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div
            className="cursor-pointer relative group/image"
            onClick={() => setIsEditing(true)}
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto object-cover rounded-lg hover:opacity-95 transition-opacity"
              />
            </div>
            <div className="opacity-0 group-hover/image:opacity-100 absolute inset-0 flex items-center justify-center bg-theme-primary/10 rounded-lg transition-opacity">
              <button className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors text-sm">
                Edit Image
              </button>
            </div>
            <p className="text-xs text-theme-primary/60 mt-1 text-center">
              {alt}
            </p>
          </div>
        )}
      </div>
    </NoteBlock>
  );
}
