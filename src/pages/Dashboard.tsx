import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, ArrowRight, FileText, Calendar, BarChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    monthlyActivity: [65, 45, 75, 35, 55, 40, 80, 60, 90, 50, 70, 85],
    userGrowth: [20, 25, 30, 35, 45, 50, 60, 65, 75, 80, 85, 90],
    caseDistribution: {
      contracts: 40,
      litigation: 25,
      compliance: 35
    },
    upcomingDeadlines: [
      { id: '1', title: 'Contract Review', date: '2024-03-15', type: 'urgent' },
      { id: '2', title: 'Case Filing', date: '2024-03-18', type: 'normal' },
      { id: '3', title: 'Compliance Update', date: '2024-03-20', type: 'normal' }
    ]
  });

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
          <p className="mt-2 text-gray-600">Here's your legal practice overview</p>
        </motion.div>

        {/* Activity Overview */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h2>
          <div className="h-64 flex items-end space-x-2">
            {stats.monthlyActivity.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition-colors relative group"
                style={{ height: `${value}%` }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Case Growth</h2>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-48 flex items-end space-x-2">
              {stats.userGrowth.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-green-100 rounded-t-lg hover:bg-green-200 transition-colors"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Case Distribution */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Case Distribution</h2>
              <BarChart className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="space-y-4">
              {Object.entries(stats.caseDistribution).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                    <span className="text-sm font-medium text-gray-700">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Upcoming Deadlines */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            <Link
              to="/cases"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <Calendar className={`h-5 w-5 ${
                  deadline.type === 'urgent' ? 'text-red-600' : 'text-blue-600'
                }`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(deadline.date).toLocaleDateString()}</p>
                </div>
                <span
                  className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                    deadline.type === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {deadline.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}