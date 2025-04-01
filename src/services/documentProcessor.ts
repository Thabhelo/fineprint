import { createWorker } from "tesseract.js";
import pdfjsLib from "../lib/pdf-worker";
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

  private constructor() {}

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
      if (fileType.includes("pdf")) {
        const result = await this.processPDF(file);
        text = result.text;
        metadata.pageCount = result.pageCount;
      } else if (fileType.includes("docx")) {
        text = await this.processDOCX(file);
      } else if (fileType.includes("image")) {
        const result = await this.processImage(file);
        text = result.text;
        metadata.ocrResults = result.ocrResults;
      }

      metadata.wordCount = text.split(/\s+/).length;

      // Store the processed document in Supabase
      await this.storeProcessedDocument(file.name, text, metadata);

      return { text, metadata };
    } catch (error) {
      console.error("Error processing document:", error);
      throw new Error("Failed to process document");
    }
  }

  private async processPDF(
    file: File
  ): Promise<{ text: string; pageCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return {
      text,
      pageCount: pdf.numPages,
    };
  }

  private async processDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async processImage(file: File): Promise<{
    text: string;
    ocrResults: {
      confidence: number;
      language: string;
    };
  }> {
    await this.initTesseract();
    if (!this.tesseractWorker)
      throw new Error("Tesseract worker not initialized");

    const imageUrl = URL.createObjectURL(file);
    const result = await this.tesseractWorker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("processed_documents").insert({
      user_id: user.id,
      file_name: fileName,
      content: text,
      metadata: metadata,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  public async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}
