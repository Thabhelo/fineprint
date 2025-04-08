import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Shield, Download, BookOpen, FileText, ChevronDown, User } from 'lucide-react';
import AuthButton from './AuthButton';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Add effect to check for fallback auth
  useEffect(() => {
    // Check if we have a fallback user in localStorage
    const storedUser = localStorage.getItem('fallback_auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFallbackUser(parsedUser);
      } catch (e) {
        console.error('Error parsing fallback user:', e);
        localStorage.removeItem('fallback_auth_user');
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChromeExtension = () => {
    // Navigate to the extension page instead of directly to Chrome web store
    navigate('/extension');
  };

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Determine if user is authenticated (either via Supabase Auth or fallback)
  const isAuthenticated = !loading && (user || fallbackUser);
  const userDisplayName = user?.email || fallbackUser?.email || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <span className="ml-2 text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FinePrint
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/features" className={`text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/features' ? 'text-indigo-600' : ''}`}>Features</Link>
            <Link to="/pricing" className={`text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/pricing' ? 'text-indigo-600' : ''}`}>Pricing</Link>
            <Link to="/contact" className={`text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors ${location.pathname === '/contact' ? 'text-indigo-600' : ''}`}>Contact</Link>
            <Link to="/documents" className={`text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors flex items-center ${location.pathname === '/documents' ? 'text-indigo-600' : ''}`}>
              <FileText className="h-4 w-4 mr-1" /> Documents
            </Link>
            <Link to="/research" className={`text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors flex items-center ${location.pathname === '/research' ? 'text-indigo-600' : ''}`}>
              <BookOpen className="h-4 w-4 mr-1" /> Research
            </Link>
            
            <button
              onClick={handleChromeExtension}
              className="text-sm lg:text-base text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-1" /> Extension
            </button>
            
            {isAuthenticated ? (
              <div className="relative ml-3 user-dropdown">
                <button
                  type="button"
                  className="flex text-gray-700 hover:text-indigo-600 items-center text-sm lg:text-base"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="truncate max-w-[120px]">{userDisplayName}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {fallbackUser && (
                      <div className="px-4 py-2 text-xs text-yellow-500 border-b border-gray-100">
                        Using fallback authentication
                      </div>
                    )}
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="inline-block mr-2 h-4 w-4" /> Profile
                    </Link>
                    <AuthButton style="dropdown" />
                  </div>
                )}
              </div>
            ) : (
              <AuthButton style="default" />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-md shadow-lg z-20">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link 
              to="/features" 
              className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/contact" 
              className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/documents" 
              className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-4 w-4 mr-2" /> Documents
            </Link>
            <Link 
              to="/research" 
              className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="h-4 w-4 mr-2" /> Research
            </Link>
            
            <button
              onClick={() => {
                handleChromeExtension();
                setIsOpen(false);
              }}
              className="w-full text-left py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" /> Chrome Extension
            </button>
            
            {isAuthenticated ? (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="block py-2 text-base font-medium text-gray-500">
                  {userDisplayName}
                  {fallbackUser && (
                    <span className="ml-2 text-xs text-yellow-500">
                      (Fallback Auth)
                    </span>
                  )}
                </div>
                <Link 
                  to="/profile" 
                  className="block py-2.5 text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="inline-block mr-2 h-4 w-4" /> Profile
                </Link>
                <div onClick={() => setIsOpen(false)}>
                  <AuthButton style="mobile" />
                </div>
              </div>
            ) : (
              <div onClick={() => setIsOpen(false)}>
                <AuthButton style="mobile" />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}