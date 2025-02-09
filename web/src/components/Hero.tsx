import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pt-20 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center">
              <motion.h1 
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
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
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                FinePrint uses AI to analyze contracts, identify risky clauses, and protect your rights. 
                Never sign a bad contract again.
              </motion.p>

              <motion.div 
                className="mt-5 sm:mt-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="rounded-md shadow hover-scale">
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg md:py-4 md:text-lg md:px-10 transition-all duration-300"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 hover-scale">
                  <Link
                    to="/features"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-indigo-600 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                  >
                    Learn more
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Animated Features */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-center">Detect risky clauses and hidden fees automatically</p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4 mx-auto">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Real-time Alerts</h3>
                <p className="text-gray-600 text-center">Get instant notifications about potential scams</p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mb-4 mx-auto">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Automated Refunds</h3>
                <p className="text-gray-600 text-center">Recover your money with automated dispute resolution</p>
              </motion.div>
            </div>

            {/* Trust Metrics */}
            <motion.div 
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
                <h4 className="text-2xl font-bold text-indigo-600">$2.5M+</h4>
                <p className="text-gray-600">Recovered Funds</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
                <h4 className="text-2xl font-bold text-indigo-600">50K+</h4>
                <p className="text-gray-600">Protected Users</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
                <h4 className="text-2xl font-bold text-indigo-600">98%</h4>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
                <h4 className="text-2xl font-bold text-indigo-600">24/7</h4>
                <p className="text-gray-600">Support</p>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
          className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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