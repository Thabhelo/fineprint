import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Twitter, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-400" />
              <span className="ml-2 text-lg sm:text-xl font-bold">FinePrint</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Protecting your rights with AI-powered contract analysis.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a 
                href="https://x.com/thabhelo_tabs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="https://facebook.com/thabhelo.duve" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="https://instagram.com/thabhelo_tabs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="https://linkedin.com/in/thabhelo" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
          
          <div className="mt-2 sm:mt-0">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/features" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">Pricing</Link>
              </li>
              <li>
                <Link 
                  to="/extension"
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base"
                >
                  Chrome Extension
                </Link>
              </li>
              <li>
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base"
                >
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">About</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">Blog</Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">Careers</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-indigo-400 transition-colors text-sm sm:text-base">Privacy</Link>
              </li>
            </ul>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Contact</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a href="mailto:thabheloduve@gmail.com" className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center text-sm sm:text-base">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="break-all">thabheloduve@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:2563754207" className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center text-sm sm:text-base">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  +1 (256) 375-4207
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 sm:mt-12 sm:pt-8 border-t border-gray-800">
          <p className="text-sm sm:text-base text-gray-400 text-center">
            © {new Date().getFullYear()} FinePrint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}