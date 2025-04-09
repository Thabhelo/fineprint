import React, { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
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
    // Handle PDF mime types correctly - PDF files can have various mime types
    const isPdf = file.type.includes('pdf') || 
                  file.name.toLowerCase().endsWith('.pdf');
    
    // Handle Office documents
    const isDocx = file.type.includes('docx') || 
                   file.type.includes('doc') || 
                   file.name.toLowerCase().endsWith('.docx') || 
                   file.name.toLowerCase().endsWith('.doc');
    
    // Handle image types
    const isImage = file.type.includes('image') || 
                    acceptedFileTypes.some(ext => 
                      file.name.toLowerCase().endsWith(ext) && 
                      (ext.includes('png') || ext.includes('jpg') || ext.includes('jpeg'))
                    );
    
    if (!isPdf && !isDocx && !isImage) {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      return `File type ${fileExtension} is not supported`;
    }

    if (file.size > maxFileSize) {
      return `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`;
    }

    return null;
  };

  // Helper function to format file size in human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Validate files using our improved validation function
      const invalidFiles = files.filter(file => validateFile(file) !== null);

      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map(f => f.name).join(", ");
        toast.error(
          `Invalid file(s): ${fileNames}. Please check file types and sizes.`
        );
        setIsProcessing(false);
        return;
      }

      // Create Document Processor to handle the document
      const processor = new DocumentProcessor();
      
      // Add progress handler
      processor.onProgress = (progress) => {
        setProgress(progress);
        console.log(`Document processing progress: ${progress}%`);
      };

      console.log(`Starting to process ${files.length} files`);
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file: ${file.name} (${formatFileSize(file.size)})`);
        
        try {
          const processedDocument = await processor.processDocument(file);
          
          if (processedDocument) {
            console.log("Document processed successfully:", processedDocument.metadata.title);
            toast.success(`Document "${processedDocument.metadata.title}" processed successfully`);
            
            if (onDocumentProcessed) {
              onDocumentProcessed(processedDocument);
            }
          } else {
            console.error("Document processing returned undefined result");
            toast.error("Failed to process the document. Please try a different file format.");
          }
        } catch (fileError: unknown) {
          console.error(`Error processing file ${file.name}:`, fileError);
          const errorMessage = fileError instanceof Error ? fileError.message : "Please try a different file.";
          toast.error(`Error processing "${file.name}". ${errorMessage}`);
        }
      }
    } catch (error: unknown) {
      console.error("Error in processFiles:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      toast.error(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
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
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Drag and drop your documents here, or
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
      </div>
    </div>
  );
};
