
/**
 * Utility functions for handling file storage in the web application
 * This implementation uses localStorage for persistence in the browser
 */

// Maximum size for localStorage (approximately 5MB to be safe)
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; 

/**
 * Store a file in the web application
 * @param file File object to store
 * @returns Promise resolving to the stored file's metadata
 */
export const storeFile = async (file: File): Promise<{
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: number;
}> => {
  return new Promise((resolve, reject) => {
    // Generate a unique ID for the file
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Read the file as a data URL
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const dataUrl = event.target.result.toString();
      
      // Check if we have enough space in localStorage
      const currentStorage = localStorage.getItem('slackAI_files') || '{}';
      const currentStorageSize = currentStorage.length;
      
      if (currentStorageSize + dataUrl.length > MAX_STORAGE_SIZE) {
        reject(new Error('Not enough storage space. Please delete some files first.'));
        return;
      }
      
      // Store the file metadata and data URL
      try {
        const files = JSON.parse(currentStorage);
        
        // File metadata
        const fileData = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: dataUrl,
          timestamp: Date.now()
        };
        
        // Add the file to storage
        files[fileId] = fileData;
        
        // Save back to localStorage
        localStorage.setItem('slackAI_files', JSON.stringify(files));
        
        // Return the file metadata
        resolve(fileData);
      } catch (error) {
        reject(new Error('Failed to store file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Start reading the file
    reader.readAsDataURL(file);
  });
};

/**
 * Get all stored files
 * @returns Array of file metadata objects
 */
export const getAllFiles = (): Array<{
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: number;
}> => {
  try {
    const storage = localStorage.getItem('slackAI_files') || '{}';
    const files = JSON.parse(storage);
    return Object.values(files);
  } catch (error) {
    console.error('Failed to get files:', error);
    return [];
  }
};

/**
 * Get a specific file by ID
 * @param fileId ID of the file to retrieve
 * @returns File metadata object or null if not found
 */
export const getFileById = (fileId: string): {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: number;
} | null => {
  try {
    const storage = localStorage.getItem('slackAI_files') || '{}';
    const files = JSON.parse(storage);
    return files[fileId] || null;
  } catch (error) {
    console.error('Failed to get file:', error);
    return null;
  }
};

/**
 * Get file by name
 * @param fileName Name of the file to retrieve
 * @returns File metadata object or null if not found
 */
export const getFileByName = (fileName: string): {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: number;
} | null => {
  try {
    const storage = localStorage.getItem('slackAI_files') || '{}';
    const files = JSON.parse(storage);
    return Object.values(files).find((file: any) => file.name === fileName) as any || null;
  } catch (error) {
    console.error('Failed to get file by name:', error);
    return null;
  }
};

/**
 * Delete a file by ID
 * @param fileId ID of the file to delete
 * @returns Boolean indicating success
 */
export const deleteFile = (fileId: string): boolean => {
  try {
    const storage = localStorage.getItem('slackAI_files') || '{}';
    const files = JSON.parse(storage);
    
    if (!files[fileId]) {
      return false;
    }
    
    delete files[fileId];
    localStorage.setItem('slackAI_files', JSON.stringify(files));
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
};

/**
 * Clear all stored files
 * @returns Boolean indicating success
 */
export const clearAllFiles = (): boolean => {
  try {
    localStorage.setItem('slackAI_files', '{}');
    return true;
  } catch (error) {
    console.error('Failed to clear files:', error);
    return false;
  }
};
