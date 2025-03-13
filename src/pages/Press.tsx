import { motion } from 'framer-motion';
import { Newspaper, Download, ExternalLink } from 'lucide-react';

const pressReleases = [
  {
    id: 1,
    title: 'FinePrint Launches AI-Powered Contract Analysis Platform',
    date: '2024-03-13',
    excerpt: 'Revolutionary platform helps consumers understand complex legal agreements.',
    link: '#'
  },
  {
    id: 2,
    title: 'FinePrint Reaches 50,000 Active Users',
    date: '2024-03-01',
    excerpt: 'Milestone achievement in protecting consumer rights through technology.',
    link: '#'
  },
  {
    id: 3,
    title: 'FinePrint Introduces Mobile App',
    date: '2024-02-15',
    excerpt: 'Bringing contract analysis capabilities to iOS and Android devices.',
    link: '#'
  }
];

const mediaKit = {
  logo: {
    title: 'FinePrint Logo Pack',
    description: 'High-resolution logos in various formats',
    size: '2.4 MB'
  },
  brandGuide: {
    title: 'Brand Guidelines',
    description: 'Official brand colors, typography, and usage guidelines',
    size: '1.8 MB'
  },
  pressKit: {
    title: 'Press Kit',
    description: 'Company information, facts, and media assets',
    size: '3.2 MB'
  }
};

export default function Press() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">Press Center</h1>
          <p className="mt-4 text-xl text-gray-600">
            Latest news and media resources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release) => (
              <div
                key={release.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start">
                  <Newspaper className="h-6 w-6 text-indigo-600 mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {release.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(release.date).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-600">{release.excerpt}</p>
                    <a
                      href={release.link}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
                    >
                      Read Full Release <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Media Kit</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(mediaKit).map(([key, item]) => (
              <div
                key={key}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.size}</span>
                  <button className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Contact</h2>
          <p className="text-gray-600">
            For press inquiries, please contact:
          </p>
          <div className="mt-4">
            <p className="font-medium text-gray-900">Thabhelo Duve</p>
            <p className="text-gray-600">Founder & CEO</p>
            <a
              href="mailto:thabhelo.duve+portfolio@talladega.edu"
              className="text-indigo-600 hover:text-indigo-500"
            >
              thabheloduve@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}