import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'Understanding Contract Analysis AI',
    excerpt: 'How artificial intelligence is revolutionizing the way we read and understand legal documents.',
    author: 'Thabhelo Duve',
    date: '2024-03-13',
    category: 'Technology'
  },
  {
    id: 2,
    title: 'Common Contract Pitfalls to Avoid',
    excerpt: 'Learn about the most common traps in consumer contracts and how to protect yourself.',
    author: 'Legal Team',
    date: '2024-03-12',
    category: 'Legal'
  },
  {
    id: 3,
    title: 'The Future of Legal Tech',
    excerpt: 'Exploring upcoming trends in legal technology and their impact on consumer protection.',
    author: 'Thabhelo Duve',
    date: '2024-03-11',
    category: 'Industry'
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">Latest Updates</h1>
          <p className="mt-4 text-xl text-gray-600">
            Insights and news from the FinePrint team
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <button className="mt-4 flex items-center text-indigo-600 hover:text-indigo-500">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}