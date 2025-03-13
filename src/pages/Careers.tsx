import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Code, Book, Users, Zap } from 'lucide-react';

const positions = [
  {
    id: 1,
    title: 'Senior AI Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    id: 2,
    title: 'Legal Content Writer',
    department: 'Content',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    id: 3,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time'
  }
];

const benefits = [
  {
    icon: Users,
    title: 'Remote-First Culture',
    description: 'Work from anywhere in the world'
  },
  {
    icon: Zap,
    title: 'Competitive Salary',
    description: 'Above-market compensation'
  },
  {
    icon: Book,
    title: 'Learning Budget',
    description: 'Annual budget for courses and conferences'
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">Join Our Team</h1>
          <p className="mt-4 text-xl text-gray-600">
            Help us make legal documents accessible to everyone
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid gap-8 md:grid-cols-3"
        >
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <benefit.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
              <p className="mt-2 text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position) => (
              <div
                key={position.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {position.title}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {position.department}
                      <MapPin className="h-4 w-4 ml-4 mr-2" />
                      {position.location}
                      <Code className="h-4 w-4 ml-4 mr-2" />
                      {position.type}
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}