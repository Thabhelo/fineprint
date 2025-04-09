import * as pdfjsLib from "pdfjs-dist";

// More resilient worker initialization with direct CDN fallback
if (typeof window !== "undefined") {
  try {
    // Set the CDN fallback first so we always have something working
    const cdnFallback = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = cdnFallback;

    // Check if the worker file exists in our public directory
    const checkWorkerExistence = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (e) {
        console.warn(`PDF.js worker not found at ${url}:`, e);
        return false;
      }
    };

    // Try to load worker with multiple fallbacks
    const setupWorker = async () => {
      // List of locations to try loading the worker from, in order of preference
      const workerUrls = [
        // First try with origin to respect current domain
        `${window.location.origin}/js/pdf.worker.min.mjs`,
        // Then try absolute path 
        `/js/pdf.worker.min.mjs`,
        // Then relative path for development
        './js/pdf.worker.min.mjs',
        // Primary CDN fallback
        cdnFallback,
        // Secondary CDN fallback
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
      ];
      
      // Try each URL in sequence
      for (const url of workerUrls) {
        try {
          console.log(`Trying to load PDF.js worker from: ${url}`);
          if (await checkWorkerExistence(url)) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = url;
            console.log("PDF.js worker successfully loaded from:", url);
            return true;
          }
        } catch (e) {
          console.warn(`Failed to check worker at ${url}:`, e);
        }
      }
      
      // We already set the fallback above, so just log if we reached here
      console.log("Using default fallback PDF.js worker:", cdnFallback);
      return false;
    };
    
    // Initialize without blocking the main thread
    setupWorker().catch(err => {
      console.error("Failed to setup PDF.js worker:", err);
      // We've already set the fallback, so no need to set it again
    });
  } catch (error) {
    console.error("Error during PDF.js worker initialization:", error);
    // Emergency fallback already set above
  }
}

// Ensure the version is exported
export const version = pdfjsLib.version;

// Export all pdfjsLib functionality
export default pdfjsLib;
export * from "pdfjs-dist";
