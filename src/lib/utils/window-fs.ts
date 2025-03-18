// src/lib/utils/window-fs.ts

// Extend Window interface to include our fs utility
declare global {
  interface Window {
    fs: {
      readFile: (
        path: string, 
        options?: { encoding?: string }
      ) => Promise<Uint8Array | string>;
    };
  }
}

// Initialize the window.fs utility
export const initWindowFs = () => {
  // In-memory file storage for development/demo purposes
  const fileStore: Record<string, Uint8Array> = {};

  // Simple implementation of readFile
  const readFile = async (
    path: string, 
    options?: { encoding?: string }
  ): Promise<Uint8Array | string> => {
    try {
      // Check if we have the file in our store
      if (fileStore[path]) {
        // Return with encoding if specified
        if (options?.encoding === 'utf8') {
          const decoder = new TextDecoder('utf-8');
          return decoder.decode(fileStore[path]);
        }
        return fileStore[path];
      }

      // For production, we would fetch from an API
      // Here we're mocking it for development
      console.log(`Fetching file: ${path}`);
      
      // Mock file data for certain known paths
      if (path === 'monthly-profits.csv') {
        const csvData = 
          'Date,Revenue,Expense,Profit\n' +
          '2023-01-15,120000,70000,50000\n' +
          '2023-02-15,130000,75000,55000\n' +
          '2023-03-15,145000,80000,65000\n' +
          '2023-04-15,155000,85000,70000\n' +
          '2023-05-15,165000,90000,75000\n' +
          '2023-06-15,175000,95000,80000\n';
        
        const encoder = new TextEncoder();
        const data = encoder.encode(csvData);
        fileStore[path] = data;
        
        if (options?.encoding === 'utf8') {
          return csvData;
        }
        return data;
      }
      
      throw new Error(`File not found: ${path}`);
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      throw error;
    }
  };

  // Add the file system utilities to the window object
  window.fs = {
    readFile
  };
};

// Export the initialization function
export default initWindowFs;
