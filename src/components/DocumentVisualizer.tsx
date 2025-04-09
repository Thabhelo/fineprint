import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Document } from "../pages/DocumentLibrary";
import {
  analyzeDocument,
  type DocumentAnalysis,
  type ExtractedTerm,
} from "../services/documentAnalyzer";
import { exportAnalysisToPDF } from "../services/pdfExporter";

interface DocumentVisualizerProps {
  document: Document;
  onClose: () => void;
}

const termColors = {
  date: "bg-blue-100 text-blue-800",
  amount: "bg-green-100 text-green-800",
  term: "bg-purple-100 text-purple-800",
  clause: "bg-yellow-100 text-yellow-800",
};

const riskLevelColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export function DocumentVisualizer({
  document,
  onClose,
}: DocumentVisualizerProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const result = await analyzeDocument(document);
        setAnalysis(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to analyze document"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [document]);

  const handleExport = async () => {
    if (!analysis) return;

    try {
      setExporting(true);
      const pdfBlob = await exportAnalysisToPDF(document, analysis);

      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${document.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_analysis.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-center text-gray-600">
            Analyzing document...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`p-2 ${
                  exporting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-indigo-600"
                } transition-colors`}
                title={exporting ? "Exporting..." : "Export analysis"}
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Risk Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  riskLevelColors[analysis.riskLevel]
                }`}
              >
                <p className="text-sm font-medium">Risk Level</p>
                <p className="text-2xl font-bold">
                  {analysis.riskLevel.toUpperCase()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium">Risk Score</p>
                <p className="text-2xl font-bold">
                  {analysis.riskScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Clauses */}
          {analysis.clauses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Key Clauses
              </h3>
              <div className="space-y-4">
                {analysis.clauses.map((clause, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      riskLevelColors[clause.riskLevel]
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{clause.type}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {clause.content}
                        </p>
                      </div>
                      <span className="text-xs uppercase bg-white/50 px-2 py-1 rounded">
                        {clause.riskLevel}
                      </span>
                    </div>
                    {clause.riskFactors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">
                          Risk Factors:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {clause.riskFactors.map((factor, factorIndex) => (
                            <span
                              key={factorIndex}
                              className="text-xs bg-white/50 px-2 py-1 rounded"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Terms */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Extracted Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.terms.map((term, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    termColors[term.type]
                  } flex justify-between items-center`}
                >
                  <div>
                    <p className="font-medium">{term.value}</p>
                    <p className="text-sm opacity-75">
                      Confidence: {(term.confidence * 100).toFixed(1)}%
                    </p>
                    {term.riskFactors && term.riskFactors.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-medium">Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {term.riskFactors.map((factor, factorIndex) => (
                            <span
                              key={factorIndex}
                              className="text-xs bg-white/50 px-1.5 py-0.5 rounded"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs uppercase">{term.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Document Preview
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {document.content?.substring(0, 500)}...
              </p>
            </div>
          </div>

          {/* Metadata */}
          {document.metadata && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-medium">
                    {document.metadata.pageCount || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Words</p>
                  <p className="font-medium">{document.metadata.wordCount}</p>
                </div>
                {document.metadata.ocrResults && (
                  <div>
                    <p className="text-sm text-gray-500">OCR Confidence</p>
                    <p className="font-medium">
                      {Math.round(document.metadata.ocrResults.confidence)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
