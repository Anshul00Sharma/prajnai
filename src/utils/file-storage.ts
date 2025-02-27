/**
 * Utility functions for handling file storage in IndexedDB
 */

const DB_NAME = 'prajnai_files';
const STORE_NAME = 'pdf_files';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database
 * @returns A promise that resolves to the database instance
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(new Error('Could not open IndexedDB'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Generates a consistent key for storing files in IndexedDB
 * @param id - The unique identifier for the upload
 * @param fileName - The name of the file
 * @returns A unique key for IndexedDB
 */
export const generateFileKey = (id: number, fileName: string): string => 
  `pdf_file_${id}_${fileName}`;

/**
 * Stores a file in IndexedDB as a data URL
 * @param id - The unique identifier for the upload
 * @param file - The file object to store
 * @returns A promise that resolves to the storage key
 */
export const storeFileInIndexedDB = (id: number, file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileKey = generateFileKey(id, file.name);
        const dataUrl = reader.result as string;
        
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const storeRequest = store.put({
          id: fileKey,
          data: dataUrl,
          timestamp: Date.now()
        });
        
        storeRequest.onsuccess = () => {
          resolve(fileKey);
        };
        
        storeRequest.onerror = (event) => {
          console.error('Error storing file in IndexedDB:', event);
          reject(new Error('Failed to store file'));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error("Error storing file in IndexedDB:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Removes a file from IndexedDB
 * @param fileKey - The key of the file to remove
 */
export const removeFileFromIndexedDB = async (fileKey?: string): Promise<void> => {
  if (!fileKey || !fileKey.startsWith('pdf_file_')) return;
  
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.delete(fileKey);
    
    transaction.oncomplete = () => {
      db.close();
    };
  } catch (error) {
    console.error("Error removing file from IndexedDB:", error);
  }
};

/**
 * Retrieves a file from IndexedDB as a data URL
 * @param fileKey - The key of the file to retrieve
 * @returns A promise that resolves to the file data URL or null if not found
 */
export const getFileFromIndexedDB = (fileKey?: string): Promise<string | null> => {
  return new Promise(async (resolve) => {
    if (!fileKey || !fileKey.startsWith('pdf_file_')) {
      resolve(null);
      return;
    }
    
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(fileKey);
      
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
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error("Error retrieving file from IndexedDB:", error);
      resolve(null);
    }
  });
};
