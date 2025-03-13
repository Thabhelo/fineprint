import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, Activity, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  totalContracts: number;
  highRiskContracts: number;
  activeUsers: number;
}

interface AdminLog {
  id: string;
  action: string;
  created_at: string;
  details: Record<string, any>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalContracts: 0,
    highRiskContracts: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      const [usersCount, contractsCount, highRiskCount, activeUsersCount, activity] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('contracts').select('id', { count: 'exact' }),
        supabase.from('analysis_results').select('id').eq('risk_level', 'high').count(),
        supabase.from('usage_stats')
          .select('id')
          .gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .count(),
        supabase.from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalContracts: contractsCount.count || 0,
        highRiskContracts: highRiskCount.count || 0,
        activeUsers: activeUsersCount.count || 0
      });

      if (activity.data) {
        setRecentActivity(activity.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage your platform</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
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
              <FileText className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalContracts}</p>
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.highRiskContracts}</p>
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
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users (7d)</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.created_at), 'PPpp')}
                    </p>
                  </div>
                </div>
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                  onClick={() => console.log('View details', activity)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}