"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UploadData {
  id: number;
  title: string;
  type: "pdf" | "web-link" | "text";
  description: string;
  content: string;
  fileKey?: string; // Add fileKey for PDF files stored in IndexedDB
}

interface UploadContextType {
  uploadedData: UploadData[];
  setUploadedData: (
    data: UploadData[] | ((prev: UploadData[]) => UploadData[])
  ) => void;
  addUpload: (data: UploadData) => void;
  removeUpload: (id: number) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Helper function to remove file from IndexedDB
const removeFileFromIndexedDB = async (fileKey?: string) => {
  if (fileKey && fileKey.startsWith("pdf_file_")) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(["pdf_files"], "readwrite");
      const store = transaction.objectStore("pdf_files");

      store.delete(fileKey);

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error("Error removing file from IndexedDB:", error);
    }
  }
};

// Open IndexedDB database
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

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadedData, setUploadedData] = useState<UploadData[]>([]);

  const addUpload = async (data: UploadData) => {
    // No need to add anything here - the file is already stored in IndexedDB
    // by the upload-card component before this function is called

    setUploadedData((prev) => {
      // If data with this id exists, update it, otherwise add it
      const exists = prev.some((item) => item.id === data.id);
      if (exists) {
        return prev.map((item) => {
          if (item.id === data.id) {
            // If updating from a PDF to something else, or changing PDF files,
            // clean up the old file from IndexedDB
            if (
              item.fileKey &&
              (data.type !== "pdf" || item.fileKey !== data.fileKey)
            ) {
              removeFileFromIndexedDB(item.fileKey);
            }
            return data;
          }
          return item;
        });
      }
      return [...prev, data];
    });
  };

  const removeUpload = async (id: number) => {
    // Find the item to be removed to clean up its file if needed
    const itemToRemove = uploadedData.find((item) => item.id === id);
    if (itemToRemove?.fileKey) {
      await removeFileFromIndexedDB(itemToRemove.fileKey);
    }

    setUploadedData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <UploadContext.Provider
      value={{
        uploadedData,
        setUploadedData,
        addUpload,
        removeUpload,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within a UploadProvider");
  }
  return context;
}
