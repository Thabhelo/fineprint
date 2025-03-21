import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Download, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { exportPDF } from '../lib/api';
import { toast } from 'sonner';
import type { Contract } from '../types';

interface Issue {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  created_at: string;
}

interface AnalysisResult {
  id: string;
  risk_level: string;
  created_at: string;
  updated_at: string;
  analysis_issues?: Issue[];
}

interface ContractWithIssues extends Omit<Contract, 'analysis_results'> {
  analysis_results: AnalysisResult[];
}

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractWithIssues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  async function loadContract() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          analysis_results (
            id,
            risk_level,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get analysis issues separately
      if (data?.analysis_results?.length > 0) {
        const { data: issues, error: issuesError } = await supabase
          .from('analysis_issues')
          .select('*')
          .eq('analysis_id', data.analysis_results[0].id);

        if (issuesError) throw issuesError;

        // Attach issues to the analysis result
        const contractWithIssues = {
          ...data,
          analysis_results: [
            {
              ...data.analysis_results[0],
              analysis_issues: issues || []
            }
          ]
        } as ContractWithIssues;

        setContract(contractWithIssues);
      } else {
        setContract(data as ContractWithIssues);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      toast.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const pdfBlob = await exportPDF(id!);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-analysis-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting contract:', error);
      toast.error('Failed to export contract');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  const analysis = contract.analysis_results?.[0];
  const issues = analysis?.analysis_issues || [];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
                <p className="text-gray-500">
                  Analyzed on {new Date(contract.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Risk Level */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
            <div className={`
              inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
              ${analysis?.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                analysis?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'}
            `}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {analysis?.risk_level?.toUpperCase() || 'Unknown'} Risk
            </div>
          </div>

          {/* Issues */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detected Issues</h2>
            <div className="space-y-4">
              {issues.map((issue: Issue) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    <div className={`
                      h-2 w-2 rounded-full mr-3
                      ${issue.severity === 'high' ? 'bg-red-500' :
                        issue.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'}
                    `} />
                    <p className="text-gray-900">{issue.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contract Content */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Content</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {contract.content}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}