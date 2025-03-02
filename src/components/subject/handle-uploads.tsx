"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { SubjectUploadPopup } from "./subject-upload-popup";
import type { UploadData } from "../../contexts/upload-context";
import { useUpload } from "../../contexts/upload-context";
import { useSubject } from "../../contexts/subject-context";
import type { Dispatch, SetStateAction } from "react";
// import { storeFileInIndexedDB } from "../../utils/file-storage";

// API client for uploads
const uploadToServer = async (
  upload: UploadData,
  subjectId: string
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append("id", uuidv4());
    formData.append("type", upload.type);
    formData.append("content", upload.content);
    formData.append("title", upload.title);
    formData.append("description", upload.description);
    formData.append("subject_id", subjectId);

    // If it's a PDF file, retrieve it from IndexedDB and append to formData
    if (upload.type === "pdf" && upload.fileKey) {
      // Get the file data from IndexedDB
      const db = await openDatabase();
      const transaction = db.transaction(["pdf_files"], "readonly");
      const store = transaction.objectStore("pdf_files");

      const getRequest = store.get(upload.fileKey);

      const fileData = await new Promise<string | null>((resolve) => {
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => {
          console.error("Error retrieving file from IndexedDB");
          resolve(null);
        };
      });

      if (fileData) {
        // Convert data URL to Blob
        const blob = dataURLtoBlob(fileData);
        formData.append("file", blob, upload.content);
      }
    }

    const response = await fetch(
      "https://backend-large-file-handling-983894129463.asia-south2.run.app/api/upload/",
      {
        method: "POST",
        headers: {
          // Don't set Content-Type header when using FormData
          // It will be automatically set with the correct boundary
          Accept: "application/json",
        },

        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error uploading:", error);
    return false;
  }
};

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

// Helper function to open IndexedDB
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("prajnai_files", 1);

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event);
      reject(new Error("Could not open IndexedDB"));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdf_files")) {
        db.createObjectStore("pdf_files", { keyPath: "id" });
      }
    };
  });
};

export default function HandleUploads({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<number[]>>;
}) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const { uploadedData, setUploadedData } = useUpload();
  const { currentSubjectId } = useSubject();

  const handleUploadComplete = () => {
    console.log("All uploads completed successfully!");
    setShowUploadPopup(false);
    setUploadedData([]); // Clear all uploaded data
    setCards([]);
  };

  return (
    <div>
      <button
        onClick={() => setShowUploadPopup(true)}
        className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
      >
        Upload Subjects
      </button>

      {showUploadPopup && currentSubjectId && (
        <SubjectUploadPopup
          uploads={uploadedData}
          onClose={() => setShowUploadPopup(false)}
          onComplete={handleUploadComplete}
          uploadFunction={async (upload) => {
            return await uploadToServer(upload, currentSubjectId);
          }}
        />
      )}
    </div>
  );
}
