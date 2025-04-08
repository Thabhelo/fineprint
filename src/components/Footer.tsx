import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Twitter, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">FinePrint</span>
            </div>
            <p className="text-gray-400">
              Protecting your rights with AI-powered contract analysis.
            </p>
            <div className="flex space-x-6">
              <a 
                href="https://x.com/thabhelo_tabs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="https://facebook.com/thabhelo.duve" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com/thabhelo_tabs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://linkedin.com/in/thabhelo" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-gray-300 hover:text-indigo-400 transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-indigo-400 transition-colors">Pricing</Link>
              </li>
              <li>
                <Link 
                  to="/extension"
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Chrome Extension
                </Link>
              </li>
              <li>
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" target="_blank" className="text-gray-300 hover:text-indigo-400 transition-colors">About</Link>
              </li>
              <li>
                <Link to="/blog" target="_blank" className="text-gray-300 hover:text-indigo-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/careers" target="_blank" className="text-gray-300 hover:text-indigo-400 transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/privacy" target="_blank" className="text-gray-300 hover:text-indigo-400 transition-colors">Privacy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="mailto:thabheloduve@gmail.com" className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  thabheloduve@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:2563754207" className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  +1 (256) 375-4207
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} FinePrint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}