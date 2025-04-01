import * as pdfjsLib from "pdfjs-dist";

// Initialize the worker
if (typeof window !== "undefined") {
  const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

export default pdfjsLib;
