import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, RefreshCw, Upload, Bell, Lock, Smartphone, CreditCard, Globe, Highlighter } from 'lucide-react';

const features = [
  {
    name: 'One-Click AI Analysis',
    description: 'Advanced NLP algorithms analyze contracts directly from your browser extension with a single click.',
    icon: Shield,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Website Certificate Legitimacy',
    description: "FinePrint verifies that a website's certificate is valid and the domain is secure before you interact with its contracts.",
    icon: Globe,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Color-Coded Highlights',
    description: 'Our software automatically highlights crucial contract details—using color-coding—to draw attention to any concealed or critical information.',
    icon: Highlighter,
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Risk Detection',
    description: 'Automatically detect and highlight potentially harmful contract terms.',
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'Automated Refunds',
    description: 'Streamlined process for handling refunds and chargebacks when contracts are breached.',
    icon: RefreshCw,
    color: 'from-green-500 to-teal-500',
  },
  {
    name: 'Easy Upload',
    description: 'Simple drag-and-drop interface for uploading contracts in various formats.',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Real-time Alerts',
    description: 'Get instant notifications about contract renewals and important deadlines.',
    icon: Bell,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    name: 'Secure Storage',
    description: 'End-to-end encryption ensures your contracts are stored safely.',
    icon: Lock,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Mobile Integration',
    description: 'Apple Wallet, Siri, and iMessage integration for proactive monitoring.',
    icon: Smartphone,
    color: 'from-sky-500 to-blue-500',
  },
  {
    name: 'Price Comparison',
    description: 'Real-time scam alerts & price comparison to prevent overcharges.',
    icon: CreditCard,
    color: 'from-emerald-500 to-green-500',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <motion.h1
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Contract Protection
            </span>
          </motion.h1>
          <motion.p
            className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to protect yourself from unfair contracts and hidden fees.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}