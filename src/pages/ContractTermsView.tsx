import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Clock,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  XSquare,
  RefreshCw,
  Gavel,
  MessageSquare,
  Lock,
  FileText,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { DocumentProcessor } from "../services/documentProcessor";
import { ExtractedContractTerms } from "../services/contractExtractor";
import { ContractTermsPDF } from "../components/ContractTermsPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

interface DocumentWithTerms {
  id: string;
  file_name: string;
  content: string;
  metadata: {
    extractedTerms?: ExtractedContractTerms;
    title: string;
    type: string;
    processedAt: string;
    wordCount: number;
    pageCount?: number;
  };
  created_at: string;
}

export default function ContractTermsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentWithTerms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view this document");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("processed_documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        setError("Document not found");
        setLoading(false);
        return;
      }

      // Check if document has extracted terms
      if (!data.metadata?.extractedTerms) {
        setError("No contract terms found for this document");
        setLoading(false);
        return;
      }

      // Log the loaded document and extracted terms
      console.log("Loaded Document:", {
        documentId: data.id,
        fileName: data.file_name,
        extractedTerms: data.metadata.extractedTerms,
      });

      setDocument(data as DocumentWithTerms);
    } catch (error) {
      console.error("Error loading document:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!document?.metadata?.extractedTerms) {
      toast.error("No contract terms to export");
      return;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return dateString;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  const terms = document?.metadata?.extractedTerms;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Contract Terms: {document?.file_name}
              </h1>
              <p className="text-sm text-gray-500">
                Processed:{" "}
                {format(new Date(document?.metadata?.processedAt || ""), "PPP")}
              </p>
            </div>
          </div>
          {document?.metadata?.extractedTerms && (
            <div className="relative">
              <PDFDownloadLink
                document={
                  <ContractTermsPDF
                    documentName={document.file_name}
                    terms={document.metadata.extractedTerms}
                  />
                }
                fileName={`contract_terms_${document.file_name.replace(
                  /\.[^/.]+$/,
                  ""
                )}.pdf`}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {({ loading, error }) => {
                  if (error) {
                    console.error("PDF generation error:", error);
                    return (
                      <span className="text-red-500">Error generating PDF</span>
                    );
                  }
                  return (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {loading ? "Preparing PDF..." : "Export as PDF"}
                    </>
                  );
                }}
              </PDFDownloadLink>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-3">
                <Calendar className="h-5 w-5 mr-2" />
                Contract Dates
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Effective Date
                  </p>
                  <p className="text-base">
                    {formatDate(terms?.effectiveDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Expiration Date
                  </p>
                  <p className="text-base">
                    {formatDate(terms?.expirationDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="flex items-center text-lg font-semibold text-green-800 mb-3">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Contract Amount
                  </p>
                  <p className="text-base">
                    {terms?.amount || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Payment Terms
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {terms?.paymentTerms || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="flex items-center text-lg font-semibold text-purple-800 mb-3">
                <Users className="h-5 w-5 mr-2" />
                Contract Parties
              </h3>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Parties Involved
                </p>
                {terms?.parties && terms.parties.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {terms.parties.map((party, index) => (
                      <li key={index} className="text-sm">
                        {party}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base">No parties explicitly identified</p>
                )}
              </div>
            </div>

            {/* Termination */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h3 className="flex items-center text-lg font-semibold text-red-800 mb-3">
                <XSquare className="h-5 w-5 mr-2" />
                Termination Conditions
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Termination Clause
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {terms?.terminationClause || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Automatic Renewal
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {terms?.automaticRenewal ||
                      "No automatic renewal clause found"}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <h3 className="flex items-center text-lg font-semibold text-amber-800 mb-3">
                <Gavel className="h-5 w-5 mr-2" />
                Legal Framework
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Governing Law
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {terms?.governingLaw || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Dispute Resolution
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {terms?.disputeResolution || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidentiality */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <h3 className="flex items-center text-lg font-semibold text-indigo-800 mb-3">
                <Lock className="h-5 w-5 mr-2" />
                Confidentiality
              </h3>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Confidentiality Clause
                </p>
                <p className="text-sm text-gray-700 line-clamp-5">
                  {terms?.confidentiality ||
                    "No specific confidentiality clause found"}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Scores */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Extraction Confidence
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {terms?.confidence &&
                Object.entries(terms.confidence).map(([field, score]) => (
                  <div key={field} className="bg-gray-100 p-3 rounded">
                    <p className="text-xs font-medium text-gray-500 capitalize">
                      {field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <div className="mt-1 h-2 w-full bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          score > 0.85
                            ? "bg-green-500"
                            : score > 0.7
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${score * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1">
                      {Math.round(score * 100)}%
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
