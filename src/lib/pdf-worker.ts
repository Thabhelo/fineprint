import * as pdfjsLib from "pdfjs-dist";

// Use a simpler approach that works in development environment
if (typeof window !== "undefined") {
  // Use the pdfjs bundled worker directly
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  
  console.log("PDF.js worker initialized with version:", pdfjsLib.version);
}

export default pdfjsLib;
