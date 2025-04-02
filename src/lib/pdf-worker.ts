import * as pdfjsLib from "pdfjs-dist";

// Initialize the worker using the bundled worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "../workers/pdf.worker.js",
    import.meta.url
  ).toString();
}

export default pdfjsLib;
