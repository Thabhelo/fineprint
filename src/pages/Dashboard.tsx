import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const contracts = [
    {
      name: 'Rental Agreement.pdf',
      status: 'high-risk',
      issues: ['Hidden fees detected', 'Unfair termination clause'],
      date: '2024-02-28',
    },
    {
      name: 'Service Contract.pdf',
      status: 'medium-risk',
      issues: ['Automatic renewal clause'],
      date: '2024-02-27',
    },
    {
      name: 'Employment Offer.pdf',
      status: 'safe',
      issues: [],
      date: '2024-02-26',
    },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.email}</h1>
          <p className="mt-2 text-gray-600">Manage your contracts and protect your rights</p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">Drag and drop your contract here, or</p>
            <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all duration-300">
              Browse Files
            </button>
          </div>
        </motion.div>

        {/* Recent Contracts */}
        <motion.div
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Contracts</h2>
          <div className="space-y-4">
            {contracts.map((contract, index) => (
              <motion.div
                key={contract.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{contract.name}</h3>
                    <p className="text-sm text-gray-500">{contract.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {contract.status === 'high-risk' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      High Risk
                    </span>
                  )}
                  {contract.status === 'medium-risk' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Medium Risk
                    </span>
                  )}
                  {contract.status === 'safe' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Safe
                    </span>
                  )}
                  <button className="text-indigo-600 hover:text-indigo-500">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}