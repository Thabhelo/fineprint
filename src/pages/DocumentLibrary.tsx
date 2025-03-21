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
} from "lucide-react";
import { toast } from "sonner";
import { analyzeContract, supabase } from "../lib/supabase";
import { format } from "date-fns";

const DEFAULT_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Standard Employment Agreement",
    category: "Employment",
    tags: ["contract", "employment", "template"],
    lastModified: new Date().toISOString(),
    status: "complete" as const,
    riskLevel: "low" as const,
  },
  {
    id: "2",
    title: "Non-Disclosure Agreement",
    category: "Confidentiality",
    tags: ["NDA", "confidentiality", "template"],
    lastModified: new Date().toISOString(),
    status: "complete" as const,
    riskLevel: "medium" as const,
  },
  {
    id: "3",
    title: "Service Level Agreement",
    category: "Services",
    tags: ["SLA", "services", "contract"],
    lastModified: new Date().toISOString(),
    status: "complete" as const,
    riskLevel: "low" as const,
  },
];

interface Document {
  id: string;
  title: string;
  category: string;
  tags: string[];
  lastModified: string;
  status: "analyzing" | "complete" | "error";
  riskLevel?: "low" | "medium" | "high";
  url?: string;
  file_path?: string;
}

interface Contract {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  url: string | null;
  file_path: string | null;
  analysis_results: { risk_level: string }[];
}

interface DocumentStats {
  totalDocuments: number;
  highRiskCount: number;
  categoryCount: number;
  analyzedCount: number;
}

export default function DocumentLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    highRiskCount: 0,
    categoryCount: 0,
    analyzedCount: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: contracts, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          analysis_results (
            risk_level
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading documents:", error);
        // Use default documents if there's an error or no data
        setDocuments(DEFAULT_DOCUMENTS);
        setStats({
          totalDocuments: DEFAULT_DOCUMENTS.length,
          highRiskCount: DEFAULT_DOCUMENTS.filter(
            (doc) => doc.riskLevel === "high"
          ).length,
          categoryCount: new Set(DEFAULT_DOCUMENTS.map((doc) => doc.category))
            .size,
          analyzedCount: DEFAULT_DOCUMENTS.filter(
            (doc) => doc.status === "complete"
          ).length,
        });
        return;
      }

      // If we have real data, use it
      const formattedDocs = contracts?.length
        ? (contracts as Contract[]).map((contract) => ({
            id: contract.id,
            title: contract.title,
            category: "Uncategorized", // Default category
            tags: ["document"], // Default tags
            lastModified: contract.updated_at,
            status: "complete" as const,
            riskLevel: (contract.analysis_results?.[0]?.risk_level || "low") as
              | "low"
              | "medium"
              | "high",
            url: contract.url || undefined,
            file_path: contract.file_path || undefined,
          }))
        : DEFAULT_DOCUMENTS;

      setDocuments(formattedDocs);

      // Calculate stats
      const uniqueCategories = new Set(
        formattedDocs.map((doc) => doc.category)
      );
      setStats({
        totalDocuments: formattedDocs.length || 0,
        highRiskCount:
          formattedDocs.filter((doc) => doc.riskLevel === "high").length || 0,
        categoryCount: uniqueCategories.size || 0,
        analyzedCount:
          formattedDocs.filter((doc) => doc.status === "complete").length || 0,
      });
    } catch (error) {
      console.error("Error loading documents:", error);
      // Use default documents on error
      setDocuments(DEFAULT_DOCUMENTS);
      setStats({
        totalDocuments: DEFAULT_DOCUMENTS.length,
        highRiskCount: DEFAULT_DOCUMENTS.filter(
          (doc) => doc.riskLevel === "high"
        ).length,
        categoryCount: new Set(DEFAULT_DOCUMENTS.map((doc) => doc.category))
          .size,
        analyzedCount: DEFAULT_DOCUMENTS.filter(
          (doc) => doc.status === "complete"
        ).length,
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "all",
    ...new Set(
      documents.length
        ? documents.map((doc) => doc.category)
        : DEFAULT_DOCUMENTS.map((doc) => doc.category)
    ),
  ];

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempDocId = Date.now().toString();
    const tempDoc: Document = {
      id: tempDocId,
      title: file.name,
      category: "Pending",
      tags: ["new"],
      lastModified: new Date().toISOString(),
      status: "analyzing",
    };

    try {
      setUploading(true);
      setDocuments((prev) => [tempDoc, ...prev]);

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${tempDocId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("contract-docs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("contract-docs").getPublicUrl(filePath);

      // Save document metadata to contracts table
      const { data: contract, error: dbError } = await supabase
        .from("contracts")
        .insert({
          title: file.name,
          user_id: user.id,
          url: publicUrl,
          file_path: filePath,
          content: "", // Empty content since we're storing the file separately
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update the document with success state
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempDocId
            ? {
                ...doc,
                status: "complete",
                riskLevel: "low",
                tags: [...doc.tags, "low"],
                url: publicUrl,
                file_path: filePath,
              }
            : doc
        )
      );

      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");

      // Update the document to show error state
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === tempDocId ? { ...doc, status: "error" } : doc
        )
      );
    } finally {
      setUploading(false);
    }
  };

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
          <p className="mt-2 text-gray-600">
            Upload and manage your legal documents
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

        {/* Upload Section */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">
              Drag and drop your contract here, or
            </p>
            <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all duration-300 cursor-pointer">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                {doc.status === "analyzing" ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600" />
                ) : doc.status === "complete" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : doc.status === "error" ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : null}
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

              {doc.riskLevel && (
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.riskLevel === "high"
                        ? "bg-red-100 text-red-800"
                        : doc.riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {doc.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Modified: {format(new Date(doc.lastModified), "PPP")}
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
