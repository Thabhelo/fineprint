import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, PieChart, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import type { Contract } from '../types';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Not authenticated');
      }

      // Get usage stats
      const { data: usageStats, error: statsError } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.data.user.id)
        .single();

      if (statsError) throw statsError;

      // Get contracts with analysis results
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          *,
          analysis_results (
            risk_level
          )
        `)
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Calculate risk level distribution
      const riskLevels = contracts?.reduce((acc: Record<string, number>, contract: Contract) => {
        const riskLevel = contract.analysis_results?.[0]?.risk_level || 'unknown';
        acc[riskLevel] = (acc[riskLevel] || 0) + 1;
        return acc;
      }, {});

      setStats({
        usage: usageStats,
        contracts,
        riskLevels
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your contract analysis metrics</p>
        </motion.div>

        {/* Usage Stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Contracts Analyzed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.usage.contracts_analyzed}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <LineChart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Words Analyzed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.usage.total_words_analyzed.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk Detected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.usage.high_risk_detected}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Level Ratio</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {((stats.usage.high_risk_detected / stats.usage.contracts_analyzed) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contract History */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contract Analysis History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Word Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.contracts.map((contract: Contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(contract.created_at), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contract.analysis_results?.[0]?.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        contract.analysis_results?.[0]?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {contract.analysis_results?.[0]?.risk_level?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.content.split(/\s+/).length.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Level Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.riskLevels).map(([level, count]: [string, any]) => (
              <div
                key={level}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <div className={`text-2xl font-bold mb-2 ${
                  level === 'high' ? 'text-red-600' :
                  level === 'medium' ? 'text-yellow-600' :
                  level === 'low' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {count}
                </div>
                <div className="text-sm text-gray-500 uppercase">
                  {level} Risk
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}