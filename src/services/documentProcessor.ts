import { createWorker } from "tesseract.js";
import * as pdfjsLib from "../lib/pdf-worker";
import mammoth from "mammoth";
import { supabase } from "../lib/supabase";

export interface ProcessedDocument {
  text: string;
  metadata: {
    title: string;
    type: "pdf" | "docx" | "image";
    pageCount?: number;
    wordCount: number;
    processedAt: string;
    ocrResults?: {
      confidence: number;
      language: string;
    };
  };
}

export class DocumentProcessor {
  private static instance: DocumentProcessor;
  private tesseractWorker: Tesseract.Worker | null = null;
  public onProgress?: (progress: number) => void;

  constructor() {
    // Pre-load PDF worker if in browser environment
    if (typeof window !== 'undefined') {
      // Dynamic import to prevent SSR issues
      import("../lib/pdf-worker").catch(err => {
        console.error("Failed to preload PDF worker:", err);
      });
    }
  }

  public static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  private async initTesseract(): Promise<void> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await createWorker("eng");
    }
  }

  public async processDocument(file: File): Promise<ProcessedDocument> {
    const fileType = file.type.toLowerCase();
    let text = "";
    let metadata: ProcessedDocument["metadata"] = {
      title: file.name,
      type: fileType.includes("pdf")
        ? "pdf"
        : fileType.includes("docx")
        ? "docx"
        : "image",
      wordCount: 0,
      processedAt: new Date().toISOString(),
    };

    try {
      // Start progress at 10%
      if (this.onProgress) {
        this.onProgress(10);
      }
      
      if (fileType.includes("pdf")) {
        // Update progress to 20%
        if (this.onProgress) {
          this.onProgress(20);
        }
        
        const result = await this.processPDF(file);
        text = result.text;
        metadata.pageCount = result.pageCount;
        
        // Update progress to 70%
        if (this.onProgress) {
          this.onProgress(70);
        }
      } else if (fileType.includes("docx")) {
        text = await this.processDOCX(file);
        
        // Update progress for DOCX
        if (this.onProgress) {
          this.onProgress(70);
        }
      } else if (fileType.includes("image")) {
        const result = await this.processImage(file);
        text = result.text;
        metadata.ocrResults = result.ocrResults;
        
        // Update progress for image
        if (this.onProgress) {
          this.onProgress(70);
        }
      }

      metadata.wordCount = text.split(/\s+/).length;

      // Update progress to 80%
      if (this.onProgress) {
        this.onProgress(80);
      }

      // Store the processed document in Supabase
      await this.storeProcessedDocument(file.name, text, metadata);
      
      // Complete progress at 100%
      if (this.onProgress) {
        this.onProgress(100);
      }

      return { text, metadata };
    } catch (error) {
      console.error("Error processing document:", error);
      // Reset progress on error
      if (this.onProgress) {
        this.onProgress(0);
      }
      throw new Error("Failed to process document");
    }
  }

  private async processPDF(file: File): Promise<{ text: string; pageCount: number }> {
    try {
      console.log("Starting PDF processing");
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // Ensure PDFjs is properly imported
        const pdfjs = await import("../lib/pdf-worker");
        
        // Verify the PDF worker is properly loaded before proceeding
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          console.warn("PDF.js worker not initialized, using CDN fallback");
          const fallback = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
          pdfjs.GlobalWorkerOptions.workerSrc = fallback;
        } else {
          console.log("Using PDF.js worker from:", pdfjs.GlobalWorkerOptions.workerSrc);
        }
        
        // Load the PDF document with enhanced error handling
        const loadingTask = pdfjs.getDocument({ 
          data: new Uint8Array(arrayBuffer),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });
        
        // Add better error handling for loading failures
        loadingTask.onPassword = (updateCallback, reason) => {
          console.error("Password protected PDF detected:", reason);
          throw new Error("Password protected PDFs are not supported");
        };
        
        const pdf = await loadingTask.promise;
        
        console.log(`PDF loaded with ${pdf.numPages} pages`);
        let fullText = "";
        
        // Process each page with enhanced error handling
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + " ";
          } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError);
            // Continue with other pages instead of failing completely
          }
        }
        
        // If we didn't get any text, try a fallback method
        if (!fullText.trim() && pdf.numPages > 0) {
          console.warn("No text extracted from PDF, using fallback method");
          try {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Create canvas for rendering
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page to canvas
            await page.render({
              canvasContext: context!,
              viewport: viewport
            }).promise;
            
            // Convert to image and use OCR as fallback
            const imageData = canvas.toDataURL('image/png');
            const img = new Image();
            
            // Use a promise to handle the image loading
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageData;
            });
            
            // Process the rendered image with OCR
            const ocrResult = await this.performOCR(img);
            fullText = ocrResult.text;
          } catch (fallbackError) {
            console.error("Fallback method failed:", fallbackError);
          }
        }
        
        return {
          text: fullText,
          pageCount: pdf.numPages,
        };
      } catch (pdfError) {
        console.error("PDF processing error:", pdfError);
        
        // Try OCR as last resort for problematic PDFs
        try {
          console.log("Attempting OCR fallback for problematic PDF");
          const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          // Import pdfjs dynamically if needed
          const pdfjs = await import("../lib/pdf-worker");
          
          // Convert first page to image using alternative method
          const pdfDoc = await pdfjs.getDocument(url).promise;
          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context!,
            viewport: viewport
          }).promise;
          
          URL.revokeObjectURL(url);
          
          // Process with OCR
          const ocrResult = await this.processImage(file, canvas.toDataURL('image/png'));
          return ocrResult;
        } catch (ocrError) {
          console.error("OCR fallback failed:", ocrError);
          throw new Error(`Failed to process PDF: ${pdfError.message}`);
        }
      }
    } catch (error) {
      console.error("Fatal PDF processing error:", error);
      throw new Error(`Could not process PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async processImage(file: File, imageDataUrl?: string): Promise<{
    text: string;
    ocrResults: {
      confidence: number;
      language: string;
    };
  }> {
    await this.initTesseract();
    if (!this.tesseractWorker)
      throw new Error("Tesseract worker not initialized");

    const imageUrl = imageDataUrl || URL.createObjectURL(file);
    const result = await this.tesseractWorker.recognize(imageUrl);
    
    // Only revoke if we created the URL
    if (!imageDataUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    return {
      text: result.data.text,
      ocrResults: {
        confidence: result.data.confidence,
        language: "eng",
      },
    };
  }

  private async storeProcessedDocument(
    fileName: string,
    text: string,
    metadata: ProcessedDocument["metadata"]
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      // If user is not authenticated, store in session storage instead
      if (!user) {
        console.log("User not authenticated - storing document in session storage");
        
        // Get existing documents from session storage or initialize empty array
        const existingDocs = JSON.parse(sessionStorage.getItem('temporaryDocuments') || '[]');
        
        // Add new document
        existingDocs.push({
          id: `temp-${Date.now()}`,
          file_name: fileName,
          content: text,
          metadata: metadata,
          created_at: new Date().toISOString(),
        });
        
        // Save back to session storage
        sessionStorage.setItem('temporaryDocuments', JSON.stringify(existingDocs));
        return;
      }

      const { error } = await supabase.from("processed_documents").insert({
        user_id: user.id,
        file_name: fileName,
        content: text,
        metadata: metadata,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error storing document:", error);
      // Don't throw the error to allow processing to continue
    }
  }

  public async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}
