import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles, AlertTriangle, RefreshCw, Lock, Zap, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ComplaintsCarousel from './ComplaintsCarousel';

export default function Hero() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pt-16 sm:pt-20 pb-6 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-6 sm:mt-10 mx-auto max-w-7xl px-4 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center">
              <motion.h1 
                className="text-3xl sm:text-4xl tracking-tight font-extrabold text-gray-900 md:text-5xl lg:text-6xl px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="block">Protect yourself from</span>
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  unfair contracts
                </span>
              </motion.h1>
              
              <motion.p 
                className="mt-3 text-sm sm:text-base text-gray-500 sm:mt-5 sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                FinePrint uses AI to analyze contracts, identify risky clauses, and protect your rights. 
                Never sign a bad contract again.
              </motion.p>
              
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="rounded-md shadow">
                  <Link to={user ? "/documents" : "/get-started"} className="w-full flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg md:text-lg md:px-10">
                    {user ? "My Documents" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/features" className="w-full flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:text-lg md:px-10">
                    Learn More
                  </Link>
                </div>
              </motion.div>
            </div>
            
            {/* Features Grid */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-0">
              <motion.div
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4 mx-auto">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-center mb-2">Risk Detection</h3>
                <p className="text-gray-600 text-center text-xs sm:text-sm">Our AI detects unfair terms, hidden fees, and dangerous clauses that could put you at risk.</p>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4 mx-auto">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-center mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-center text-xs sm:text-sm">Advanced AI algorithms scan every word to identify problematic contract terms other systems might miss.</p>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4 mx-auto">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-center mb-2">Privacy First</h3>
                <p className="text-gray-600 text-center text-xs sm:text-sm">Your contracts remain private and secure with end-to-end encryption and strict data protection measures.</p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4 mx-auto">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-center mb-2">Color-Coded Highlights</h3>
                <p className="text-gray-600 text-center text-xs sm:text-sm">Our software automatically highlights crucial contract details—using color-coding—to draw attention to any concealed or critical information.</p>
              </motion.div>
            </div>

            {/* Complaints Carousel (replacing Trust Metrics) */}
            <ComplaintsCarousel />
          </main>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-40 h-40 sm:w-72 sm:h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            y: [50, 0, 50],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </div>
  );
}