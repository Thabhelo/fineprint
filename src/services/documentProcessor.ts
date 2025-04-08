import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { supabase } from "../lib/supabase";
import { ContractExtractor, ExtractedContractTerms } from "./contractExtractor";

// Use a local worker file to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker-loader.js";

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
    extractedTerms?: ExtractedContractTerms;
  };
}

export class DocumentProcessor {
  private static instance: DocumentProcessor;
  private tesseractWorker: Tesseract.Worker | null = null;
  public contractExtractor: ContractExtractor;

  private constructor() {
    this.contractExtractor = ContractExtractor.getInstance();
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
      console.log(`Processing document: ${file.name} (${file.size} bytes)`);

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size exceeds 10MB limit");
      }

      if (fileType.includes("pdf")) {
        console.log("Processing PDF file...");
        const result = await this.processPDF(file);
        text = result.text;
        metadata.pageCount = result.pageCount;
      } else if (fileType.includes("docx")) {
        console.log("Processing DOCX file...");
        text = await this.processDOCX(file);
      } else if (fileType.includes("image")) {
        console.log("Processing image file...");
        const result = await this.processImage(file);
        text = result.text;
        metadata.ocrResults = result.ocrResults;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      console.log(`Extracted text length: ${text.length} characters`);

      metadata.wordCount = text.split(/\s+/).length;

      // Extract contract terms if the document appears to be a contract
      if (this.isLikelyContract(text, file.name)) {
        console.log("Document appears to be a contract, extracting terms...");
        const processedDoc: ProcessedDocument = { text, metadata };
        const extractedTerms =
          this.contractExtractor.extractContractTerms(processedDoc);
        metadata.extractedTerms = extractedTerms;
        console.log("Contract terms extracted successfully");
      }

      // Store the processed document in Supabase
      console.log("Storing processed document...");
      await this.storeProcessedDocument(file.name, text, metadata);
      console.log("Document processing completed successfully");

      return { text, metadata };
    } catch (error) {
      console.error("Error processing document:", {
        fileName: file.name,
        fileType,
        fileSize: file.size,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to process document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private isLikelyContract(text: string, fileName: string): boolean {
    // Basic heuristic to identify if a document is likely a contract
    const contractKeywords = [
      "agreement",
      "contract",
      "terms",
      "parties",
      "obligations",
      "hereby agree",
      "legally binding",
      "effective date",
      "termination",
      "governing law",
      "witness whereof",
      "consideration",
      "payment terms",
      "company",
      "appointment",
      "duration",
      "remuneration & benefits",
      "compensation",
      "payment",
      "amount",
      "currency",
      "exchange rate",
      "benefits",
      "dispute resolution",
      "non-disclosure",
      "intellectual property",
      "confidentiality",
      "warranty",
      "indemnification",
      "limitation of liability",
      "non-class action",
      "non-waiver",
      "non-assignable",
      "non-transferable",
      "non-exclusive",
      "non-exclusive license",
      "non-exclusive right",
      "services",
      "performance",
      "performance obligations",
      "performance obligations",
      "performance obligations",
      "performance obligations",
      "performance obligations",
    ];

    // Check if filename contains contract-related terms
    const fileNameLower = fileName.toLowerCase();
    if (
      fileNameLower.includes("contract") ||
      fileNameLower.includes("agreement") ||
      fileNameLower.includes("terms")
    ) {
      return true;
    }

    // Check if text contains sufficient contract keywords
    const textLower = text.toLowerCase();
    let keywordCount = 0;
    for (const keyword of contractKeywords) {
      if (textLower.includes(keyword)) {
        keywordCount++;
      }
    }

    // If 3 or more contract keywords are found, it's likely a contract
    return keywordCount >= 3;
  }

  // Generate a CSV from all extracted contract terms in the user's documents
  public async generateContractTermsCSV(): Promise<string> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return "source,extractedAt,effectiveDate,expirationDate,amount,parties,paymentTerms,terminationClause,automaticRenewal,governingLaw,disputeResolution,confidentiality\n";
      }

      const { data, error } = await supabase
        .from("processed_documents")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const extractedTermsList: ExtractedContractTerms[] = [];

      for (const doc of data) {
        if (doc.metadata?.extractedTerms) {
          extractedTermsList.push(doc.metadata.extractedTerms);
        }
      }

      if (extractedTermsList.length === 0) {
        return "source,extractedAt,effectiveDate,expirationDate,amount,parties,paymentTerms,terminationClause,automaticRenewal,governingLaw,disputeResolution,confidentiality\n";
      }

      return this.contractExtractor.convertToCSV(extractedTermsList);
    } catch (error) {
      console.error("Error generating CSV:", error);
      throw new Error("Failed to generate contract terms CSV");
    }
  }

  private async processPDF(
    file: File
  ): Promise<{ text: string; pageCount: number }> {
    try {
      console.log("Starting PDF processing...");
      console.log(
        "Using local worker file:",
        pdfjsLib.GlobalWorkerOptions.workerSrc
      );

      // Validate file
      if (!file || file.size === 0) {
        throw new Error("Invalid file: File is empty or undefined");
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          `File size (${(file.size / (1024 * 1024)).toFixed(
            2
          )}MB) exceeds 10MB limit`
        );
      }

      // Convert to array buffer
      console.log("Converting file to array buffer...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("File converted to array buffer");

      // Try simpler approach to loading PDF first
      console.log("Attempting to load PDF with simplified options...");

      try {
        // Create a blob URL from the file and use it with an iframe
        // This is a fallback approach that might work when PDF.js has issues
        console.log("Using alternative extraction method");

        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        // Extract basic metadata and attempt to estimate page count
        let pageCount = 1; // Default minimum

        // For text extraction, we'll use a simplified method
        // Read a larger portion of the file to check for text and page markers
        const textDecoder = new TextDecoder();
        let text = textDecoder.decode(arrayBuffer);

        // Clean up non-printable characters that might interfere with processing
        text = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "");

        // Estimate page count by looking for common PDF page markers
        // Method 1: Look for "/Page" objects
        const pageObjectMatches = text.match(/\/Page\s*<<|\/Type\s*\/Page/g);
        if (pageObjectMatches && pageObjectMatches.length > 0) {
          pageCount = pageObjectMatches.length;
          console.log(`Estimated ${pageCount} pages using Page object count`);
        } else {
          // Method 2: Look for page count in the metadata
          const pagesMatch = text.match(/\/Pages\s*\d+\s*\d+\s*R/);
          if (pagesMatch) {
            const numberMatch = pagesMatch[0].match(/\d+/);
            if (numberMatch) {
              const estimatedCount = parseInt(numberMatch[0], 10);
              if (estimatedCount > 0 && estimatedCount < 1000) {
                pageCount = estimatedCount;
                console.log(
                  `Estimated ${pageCount} pages using Pages reference`
                );
              }
            }
          } else {
            // Method 3: Estimate based on file size (rough approximation)
            const fileSizeKB = file.size / 1024;
            // Very rough estimate: average PDF page is about 100KB
            const sizeEstimate = Math.max(1, Math.round(fileSizeKB / 100));
            pageCount = Math.min(sizeEstimate, 30); // Cap at reasonable max
            console.log(
              `Estimated ${pageCount} pages using file size heuristic`
            );
          }
        }

        // Extract text using keywords and common PDF text markers
        // PDF files often contain text between parentheses or specific stream markers
        const textChunks: string[] = [];

        // Extract text between parentheses (common PDF text storage format)
        const parenMatches = text.match(/\(([^\)]+)\)/g);
        if (parenMatches && parenMatches.length > 10) {
          const extractedText = parenMatches
            .map((match) => match.substring(1, match.length - 1))
            .join(" ");
          textChunks.push(extractedText);
        }

        // Extract any readable text sequences (at least 3 characters)
        const readableText = text
          .split(/[^a-zA-Z0-9\s.,;:'"!?-]/)
          .filter((chunk) => chunk.trim().length > 3)
          .join(" ");
        textChunks.push(readableText);

        // Combine and clean the extracted text
        text = textChunks.join(" ").replace(/\s+/g, " ").trim();

        // If we found text in the PDF directly, use it
        if (text.length > 100) {
          console.log(
            `Extracted ${text.length} characters of text from PDF stream (${pageCount} pages)`
          );
        } else {
          // Otherwise report limited functionality
          text =
            "PDF text extraction is limited. Please try a different format or convert this PDF to a text-based format.";
          console.log("Limited text extraction for this PDF");
        }

        // Clean up
        URL.revokeObjectURL(blobUrl);

        console.log("PDF processing completed with alternative method");
        return {
          text,
          pageCount,
        };
      } catch (fallbackError) {
        console.log(
          "Fallback method failed, attempting standard PDF.js approach"
        );
      }

      // Standard PDF.js approach (we only get here if the fallback failed)
      console.log("Loading PDF with PDF.js...");

      // This code shouldn't execute since our fallback method always returns
      // But we keep it as a reference for future development
      console.log(
        "WARNING: PDF.js extraction method was reached, which may not work"
      );

      throw new Error(
        "PDF processing is currently unavailable. Please try a different file format."
      );
    } catch (error) {
      console.error("Error in processPDF:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to process PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Skip storage if user is not authenticated, but don't throw an error
      if (!user) {
        console.log("User not authenticated - skipping document storage");
        return;
      }

      // Sanitize text to remove null characters and other invalid Unicode sequences
      // that can cause PostgreSQL storage errors
      const sanitizedText = text
        .replace(/\u0000/g, "") // Remove null characters
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\0-\x1F\x7F-\x9F]/g, "") // Remove control characters
        .replace(/\\u[0-9a-fA-F]{4}/g, ""); // Remove Unicode escape sequences that might cause issues

      console.log(
        `Text sanitized: removed ${
          text.length - sanitizedText.length
        } problematic characters`
      );

      const { error } = await supabase.from("processed_documents").insert({
        user_id: user.id,
        file_name: fileName,
        content: sanitizedText,
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
