import * as pdfjsLib from "pdfjs-dist";

// Initialize the worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib;
}

export default pdfjsLib;
