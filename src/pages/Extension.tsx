import React from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, FileText, Zap, Lock, ExternalLink } from 'lucide-react';

export default function Extension() {
  const handleDownload = () => {
    window.open('https://chrome.google.com/webstore/category/extensions', '_blank');
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            Protect Your Contracts <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Everywhere You Go</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Analyze and secure your contracts directly in your browser with our Chrome Extension
          </p>
        </motion.div>

        {/* Extension Preview */}
        <motion.div
          className="my-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-indigo-100 p-2 w-full max-w-4xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-16 rounded-t-lg flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 h-8 w-full max-w-xl bg-white/20 rounded-md"></div>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="w-64 h-64 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Shield className="h-24 w-24 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">FinePrint: Contract Analyzer</h3>
                <div className="flex gap-2 mb-6">
                  <div className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">AI-Powered</div>
                  <div className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">Free</div>
                  <div className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">4.9 ★</div>
                </div>
                <p className="text-gray-600 mb-6">
                  Instantly analyze contracts, terms of service, and legal agreements right in your browser.
                  Our AI will highlight risks, identify hidden fees, and protect you from unfair terms.
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Add to Chrome (Free)
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <Zap className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">One-Click Analysis</h3>
            <p className="text-gray-600">
              Analyze contracts directly from your browser with a single click. Get instant results without leaving the page.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <FileText className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Color-Coded Highlights</h3>
            <p className="text-gray-600">
              Automatically highlights crucial contract details using color-coding to draw attention to any concealed or critical information.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <Lock className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Website Certificate Check</h3>
            <p className="text-gray-600">
              Verifies that a website's certificate is valid and the domain is secure before you interact with its contracts.
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">
              Join {/* TODO: Add number of users */2}+ Users Protected by FinePrint
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Install our Chrome Extension today and never sign a bad contract again. Free forever.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-indigo-600 transition-all duration-300"
            >
              <Download className="mr-2 h-5 w-5" />
              Add to Chrome
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 