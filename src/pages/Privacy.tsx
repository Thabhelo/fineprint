import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Server, Database } from 'lucide-react';

const privacySections = [
  {
    id: 1,
    title: 'Information We Collect',
    icon: <Eye className="h-6 w-6 text-indigo-600" />,
    content: [
      'Personal Information: Name, email address, and account credentials when you register.',
      'Payment Information: Credit card details and billing information for premium subscriptions.',
      'Usage Data: Information about how you interact with our services, including features used and time spent.',
      'Documents: The content of legal documents you upload or analyze through our platform.',
      'Device Information: Browser type, IP address, device type, and operating system.'
    ]
  },
  {
    id: 2,
    title: 'How We Use Your Information',
    icon: <FileText className="h-6 w-6 text-indigo-600" />,
    content: [
      'To provide and maintain our services, including analyzing legal documents.',
      'To improve and personalize your experience based on your preferences and usage patterns.',
      'To process transactions and manage your subscription.',
      'To communicate with you about service updates, new features, or support requests.',
      'To detect and prevent fraudulent activity and ensure the security of our platform.'
    ]
  },
  {
    id: 3,
    title: 'Data Security',
    icon: <Lock className="h-6 w-6 text-indigo-600" />,
    content: [
      'We implement robust security measures to protect your information from unauthorized access.',
      'All data is encrypted during transmission using TLS/SSL protocols.',
      'We regularly review our security practices and update them as necessary.',
      'Access to personal data is restricted to authorized personnel only.',
      'We conduct regular security assessments and penetration testing.'
    ]
  },
  {
    id: 4,
    title: 'Data Storage',
    icon: <Server className="h-6 w-6 text-indigo-600" />,
    content: [
      'Your data is stored on secure servers located in the United States.',
      'We retain your information only as long as necessary to provide our services or as required by law.',
      'You can request deletion of your account and associated data at any time.',
      'Document data is temporarily processed for analysis and can be permanently deleted at your request.',
      'Backups are encrypted and stored in separate secure facilities.'
    ]
  },
  {
    id: 5,
    title: 'Data Sharing',
    icon: <Database className="h-6 w-6 text-indigo-600" />,
    content: [
      'We do not sell your personal information to third parties.',
      'We may share data with trusted service providers who assist us in operating our services (e.g., payment processors).',
      'We may disclose information if required by law or to protect our rights or the safety of users.',
      'Aggregate, anonymized data may be used for research and improving our AI systems.',
      'All third-party vendors are contractually obligated to maintain confidentiality and security.'
    ]
  }
];

export default function Privacy() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="mt-4 text-xl text-gray-600">
            How we protect and handle your information
          </p>
          <div className="mt-6 text-gray-600 max-w-3xl mx-auto">
            <p>
              At FinePrint, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
            </p>
            <p className="mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 space-y-10"
        >
          {privacySections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {section.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {section.content.map((item, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-600 mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Access</h3>
              <p className="text-gray-600 text-sm mt-1">
                You can request access to the personal information we have about you.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Correction</h3>
              <p className="text-gray-600 text-sm mt-1">
                You can request that we correct inaccurate or incomplete information.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Deletion</h3>
              <p className="text-gray-600 text-sm mt-1">
                You can request that we delete your personal information.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Portability</h3>
              <p className="text-gray-600 text-sm mt-1">
                You can request a copy of your data in a structured, commonly used format.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about our Privacy Policy or how we handle your information, please contact us:
          </p>
          <div className="mt-4">
            <p className="font-medium text-gray-900">Privacy Team</p>
            <p className="text-gray-600">FinePrint, Inc.</p>
            <a
              href="mailto:thabheloduve@gmail.com"
              className="text-indigo-600 hover:text-indigo-500"
            >
              privacy@fineprint.it.com | thabheloduve@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}