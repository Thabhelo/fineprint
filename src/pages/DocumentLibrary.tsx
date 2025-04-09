import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Upload,
  Download,
  Share2,
  Tags,
  AlertTriangle,
  CheckCircle,
  Folder,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { DocumentUploader } from "../components/DocumentUploader";
import { DocumentVisualizer } from "../components/DocumentVisualizer";
import type { ProcessedDocument } from "../services/documentProcessor";

export interface Document {
  id: string;
  title: string;
  category: string;
  tags: string[];
  lastModified: string;
  status: "analyzing" | "complete" | "error";
  riskLevel?: "low" | "medium" | "high";
  url?: string;
  file_path?: string;
  content?: string;
  metadata?: ProcessedDocument["metadata"];
}

interface DocumentStats {
  totalDocuments: number;
  highRiskCount: number;
  categoryCount: number;
  analyzedCount: number;
}

interface ProcessedDocumentRow {
  id: string;
  user_id: string;
  file_name: string;
  content: string;
  metadata: ProcessedDocument["metadata"];
  created_at: string;
  updated_at: string;
}

export default function DocumentLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    highRiskCount: 0,
    categoryCount: 0,
    analyzedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Handle unauthenticated users by loading from session storage
      if (!user) {
        console.log("No authenticated user found - loading documents from session storage");
        
        // Get documents from session storage
        const tempDocuments = JSON.parse(sessionStorage.getItem('temporaryDocuments') || '[]');
        
        // Format the documents to match our Document type
        const formattedDocs = tempDocuments.map((doc: any) => ({
          id: doc.id,
          title: doc.file_name,
          category: doc.metadata.type,
          tags: [doc.metadata.type],
          lastModified: doc.created_at,
          status: "complete" as const,
          riskLevel: "low" as "low" | "medium" | "high",
          content: doc.content,
          metadata: doc.metadata,
        }));
        
        setDocuments(formattedDocs);
        
        // Calculate stats for temporary documents
        const uniqueCategories = new Set(formattedDocs.map((doc: Document) => doc.category));
        setStats({
          totalDocuments: formattedDocs.length,
          highRiskCount: formattedDocs.filter((doc: Document) => doc.riskLevel === "high").length,
          categoryCount: uniqueCategories.size,
          analyzedCount: formattedDocs.length,
        });
        
        setLoading(false);
        return;
      }

      console.log("Fetching documents for user:", user.id);
      const { data, error } = await supabase
        .from("processed_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw new Error(`Failed to load documents: ${error.message}`);
      }

      console.log("Received documents:", data?.length || 0);
      const formattedDocs = (data as ProcessedDocumentRow[]).map((doc) => ({
        id: doc.id,
        title: doc.file_name,
        category: doc.metadata.type,
        tags: [doc.metadata.type],
        lastModified: doc.created_at,
        status: "complete" as const,
        riskLevel: "low" as "low" | "medium" | "high",
        content: doc.content,
        metadata: doc.metadata,
      }));

      setDocuments(formattedDocs);

      // Calculate stats
      const uniqueCategories = new Set(
        formattedDocs.map((doc) => doc.category)
      );
      setStats({
        totalDocuments: formattedDocs.length,
        highRiskCount: formattedDocs.filter(
          (doc) => doc.riskLevel === ("high" as const)
        ).length,
        categoryCount: uniqueCategories.size,
        analyzedCount: formattedDocs.filter((doc) => doc.status === "complete")
          .length,
      });
    } catch (error) {
      console.error("Error loading documents:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading documents";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentProcessed = async (processedDoc: ProcessedDocument) => {
    // Refresh the document list
    await loadDocuments();
  };

  const categories = ["all", ...new Set(documents.map((doc) => doc.category))];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
          <p className="mt-2 text-gray-600">Upload and manage your documents</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Documents
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalDocuments || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.highRiskCount || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <Tags className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.categoryCount || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Analyzed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.analyzedCount || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Document Uploader */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Document Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500">{doc.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="View document analysis"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {doc.status === "analyzing" ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600" />
                  ) : doc.status === "complete" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : doc.status === "error" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {doc.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {doc.metadata && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Pages: {doc.metadata.pageCount || "N/A"}</p>
                  <p>Words: {doc.metadata.wordCount}</p>
                  {doc.metadata.ocrResults && (
                    <p>
                      OCR Confidence:{" "}
                      {Math.round(doc.metadata.ocrResults.confidence)}%
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Modified: {format(new Date(doc.lastModified), "PPP")}
                </span>
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Download document"
                    aria-label="Download document"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Share document"
                    aria-label="Share document"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedDocument && (
          <DocumentVisualizer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
}
