import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';

export default function SignupSuccess() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-center">Success!</h1>
          </div>
          
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Thank you for signing up
              </h2>
              <p className="text-gray-600 mb-4">
                Please check your email inbox to confirm your account. Once confirmed, you'll be able to access all features.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you don't see the email, please check your spam folder or contact support.
              </p>
              
              <div className="mt-4 flex flex-col space-y-3">
                <div className="w-full">
                  <AuthButton style="primary" />
                </div>
                
                <Link
                  to="/"
                  className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}