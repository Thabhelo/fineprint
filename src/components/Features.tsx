import React from 'react';
import { Shield, AlertTriangle, RefreshCw, Upload, Bell, Lock } from 'lucide-react';

const features = [
  {
    name: 'AI-Powered Analysis',
    description: 'Advanced NLP algorithms analyze contracts to identify risky clauses and potential issues.',
    icon: Shield,
  },
  {
    name: 'Risk Detection',
    description: 'Automatically detect and highlight potentially harmful contract terms.',
    icon: AlertTriangle,
  },
  {
    name: 'Automated Refunds',
    description: 'Streamlined process for handling refunds and chargebacks when contracts are breached.',
    icon: RefreshCw,
  },
  {
    name: 'Easy Upload',
    description: 'Simple drag-and-drop interface for uploading contracts in various formats.',
    icon: Upload,
  },
  {
    name: 'Real-time Alerts',
    description: 'Get instant notifications about contract renewals and important deadlines.',
    icon: Bell,
  },
  {
    name: 'Secure Storage',
    description: 'End-to-end encryption ensures your contracts are stored safely.',
    icon: Lock,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Protect Your Rights with AI
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our advanced AI technology helps you understand and manage your contracts effectively.
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className="relative p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}