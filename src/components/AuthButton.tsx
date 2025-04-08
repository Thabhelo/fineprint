import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, Loader } from 'lucide-react';
import { toast } from 'sonner';

type ButtonStyle = 'default' | 'primary' | 'mobile' | 'dropdown';

interface AuthButtonProps {
  style?: ButtonStyle;
}

export default function AuthButton({ style = 'default' }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check for fallback auth
  const fallbackUser = localStorage.getItem('fallback_auth_user') 
    ? JSON.parse(localStorage.getItem('fallback_auth_user') || '{}') 
    : null;

  const isAuthenticated = !loading && (user || fallbackUser);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      // Handle sign out
      setIsLoading(true);
      try {
        // Check if we're using fallback auth
        if (fallbackUser) {
          localStorage.removeItem('fallback_auth_user');
          toast.success('Successfully signed out!');
          navigate('/');
        } else {
          await signOut();
          navigate('/');
        }
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to sign out.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Navigate to sign in page
      navigate('/signin');
    }
  };

  // Button styling based on the style prop
  let buttonClasses = '';
  
  switch (style) {
    case 'primary':
      buttonClasses = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105";
      break;
    case 'mobile':
      buttonClasses = isAuthenticated 
        ? "w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300"
        : "w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300";
      break;
    case 'dropdown':
      buttonClasses = "w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
      break;
    default:
      buttonClasses = isAuthenticated
        ? "text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105";
      break;
  }

  // Loading indicator or button text based on auth state
  const buttonContent = isLoading ? (
    <div className="flex items-center justify-center">
      <Loader className="h-5 w-5 animate-spin" />
    </div>
  ) : (
    <div className="flex items-center">
      {isAuthenticated ? (
        <>
          {style === 'dropdown' && <LogOut className="inline-block mr-2 h-4 w-4" />}
          Sign Out
          {style !== 'dropdown' && <LogOut className="ml-2 h-5 w-5" />}
        </>
      ) : (
        <>
          Sign In / Sign Up
          <LogIn className="ml-2 h-5 w-5" />
        </>
      )}
    </div>
  );

  return (
    <button
      onClick={handleAuthAction}
      disabled={isLoading || loading}
      className={buttonClasses}
    >
      {buttonContent}
    </button>
  );
} 