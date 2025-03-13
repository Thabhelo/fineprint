import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Download, BookOpen, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChromeExtension = () => {
    window.open('https://chrome.google.com/webstore/category/extensions', '_blank');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 hover-scale" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FinePrint
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className={`text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/features' ? 'text-indigo-600' : ''}`}>Features</Link>
            <Link to="/pricing" className={`text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/pricing' ? 'text-indigo-600' : ''}`}>Pricing</Link>
            <Link to="/contact" className={`text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/contact' ? 'text-indigo-600' : ''}`}>Contact</Link>
            <Link to="/documents" className={`text-gray-700 hover:text-indigo-600 transition-colors flex items-center ${location.pathname === '/documents' ? 'text-indigo-600' : ''}`}>
              <FileText className="h-4 w-4 mr-1" /> Documents
            </Link>
            <Link to="/research" className={`text-gray-700 hover:text-indigo-600 transition-colors flex items-center ${location.pathname === '/research' ? 'text-indigo-600' : ''}`}>
              <BookOpen className="h-4 w-4 mr-1" /> Research
            </Link>
            
            <button
              onClick={handleChromeExtension}
              className="text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-1" /> Extension
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-700 hover:text-indigo-600 transition-colors">Profile</Link>
                <button 
                  onClick={signOut}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin" className="text-gray-700 hover:text-indigo-600 transition-colors">Sign In</Link>
                <Link 
                  to="/signup"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-white/90 backdrop-blur-md shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/features" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Features</Link>
            <Link to="/pricing" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Contact</Link>
            <Link to="/documents" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors flex items-center">
              <FileText className="h-4 w-4 mr-2" /> Documents
            </Link>
            <Link to="/research" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors flex items-center">
              <BookOpen className="h-4 w-4 mr-2" /> Research
            </Link>
            
            <button
              onClick={handleChromeExtension}
              className="w-full text-left px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" /> Chrome Extension
            </button>
            
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Profile</Link>
                <button 
                  onClick={signOut}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin"
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}