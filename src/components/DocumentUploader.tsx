import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  DocumentProcessor,
  ProcessedDocument,
} from "../services/documentProcessor";
import { toast } from "sonner";

interface DocumentUploaderProps {
  onDocumentProcessed?: (document: ProcessedDocument) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentProcessed,
  acceptedFileTypes = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contractTermsExtracted, setContractTermsExtracted] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      await processFiles(files);
    },
    []
  );

  const validateFile = (file: File): string | null => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported`;
    }

    if (file.size > maxFileSize) {
      return `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`;
    }

    return null;
  };

  const processFiles = async (files: File[]) => {
    const documentProcessor = DocumentProcessor.getInstance();
    setIsProcessing(true);
    setProgress(0);
    setContractTermsExtracted(false);

    try {
      for (const file of files) {
        console.log(`Starting to process file: ${file.name}`);

        const error = validateFile(file);
        if (error) {
          console.error(`File validation failed: ${error}`);
          toast.error(`File validation failed: ${error}`);
          continue;
        }

        try {
          console.log(
            `Processing file: ${file.name} (type: ${file.type}, size: ${(
              file.size / 1024
            ).toFixed(2)}KB)`
          );

          if (file.type.includes("pdf")) {
            toast.info(
              `Processing PDF: ${file.name}. This may take a moment...`
            );
          }

          const processedDoc = await documentProcessor.processDocument(file);
          console.log(`Successfully processed file: ${file.name}`);

          // Check if contract terms were extracted
          if (processedDoc.metadata.extractedTerms) {
            setContractTermsExtracted(true);
            toast.success(`Contract terms extracted from ${file.name}`);
          } else {
            toast.success(`Successfully processed ${file.name}`);
          }

          onDocumentProcessed?.(processedDoc);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });

          // Provide more helpful error message for PDF worker issues
          let errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          if (
            errorMessage.includes("worker") ||
            errorMessage.includes("Worker")
          ) {
            errorMessage =
              "PDF processing failed: Worker loading issue. Please try again or use a different PDF file.";
          }

          toast.error(`Failed to process ${file.name}: ${errorMessage}`);
        }

        setProgress((prev) => prev + 100 / files.length);
      }
    } catch (error) {
      console.error("Unexpected error in processFiles:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error("An unexpected error occurred while processing files");
    } finally {
      setIsProcessing(false);
      // Reset progress after a delay to show completion
      setTimeout(() => {
        setProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            ) : contractTermsExtracted ? (
              <FileSpreadsheet className="h-12 w-12 text-green-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {contractTermsExtracted
                ? "Contract terms successfully extracted! Upload more documents or download as CSV."
                : "Drag and drop your documents here, or"}
            </p>
            <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
              Browse Files
              <input
                type="file"
                className="hidden"
                multiple
                accept={acceptedFileTypes.join(",")}
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: {acceptedFileTypes.join(", ")}
            </p>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Processing... {Math.round(progress)}%
            </p>
          </div>
        )}

        {contractTermsExtracted && !isProcessing && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">
                Contract terms extracted successfully!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
