import { motion } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SignupSuccess() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">You're Almost There!</h1>
            
            <div className="mt-6 text-left">
              <p className="text-gray-600 mb-4">
                We've sent a confirmation email to your inbox. Please click the link in the email to verify your account.
              </p>
              
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mt-4">
                <Mail className="h-6 w-6 text-blue-500 mr-3" />
                <p className="text-blue-700 text-sm">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              
              <p className="mt-6 text-gray-600">
                Already confirmed your email?
              </p>
              
              <div className="mt-4 flex flex-col space-y-3">
                <Link
                  to="/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </Link>
                
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