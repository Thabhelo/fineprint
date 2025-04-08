import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles, FileText, Scale, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GetStarted() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Start Your Legal Journey
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
              With FinePrint
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Join thousands of users who trust FinePrint to protect their legal rights and make informed decisions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <FileText className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Contract Analysis</h3>
            <p className="text-gray-600 mb-6">
              Our AI analyzes contracts in seconds, highlighting potential risks and unfair terms.
            </p>
            <Link to="/features" className="text-indigo-600 hover:text-indigo-700 flex items-center">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <Scale className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Legal Protection</h3>
            <p className="text-gray-600 mb-6">
              Get expert guidance and protection for all your legal documents and agreements.
            </p>
            <Link to="/features" className="text-indigo-600 hover:text-indigo-700 flex items-center">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <Brain className="h-12 w-12 text-indigo-600 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
            <p className="text-gray-600 mb-6">
              Advanced AI technology provides deep insights and recommendations for your legal needs.
            </p>
            <Link to="/features" className="text-indigo-600 hover:text-indigo-700 flex items-center">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join FinePrint today and experience the future of legal protection. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg md:py-4 md:text-lg md:px-10 transition-all duration-300"
              >
                Start Free Trial
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-indigo-600 text-base font-medium rounded-full text-indigo-600 bg-transparent hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-all duration-300"
              >
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}