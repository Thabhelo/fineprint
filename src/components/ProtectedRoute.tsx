import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AuthPrompt from './AuthPrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const [fallbackUser, setFallbackUser] = useState<any>(null);

  // Check for fallback authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('fallback_auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFallbackUser(parsedUser);
      } catch (e) {
        console.error('Error parsing fallback user in ProtectedRoute:', e);
        localStorage.removeItem('fallback_auth_user');
      }
    }
  }, []);

  // Show loading indicator while checking auth
  if (loading && !fallbackUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Check if user is authenticated (either with Supabase or fallback)
  const isAuthenticated = Boolean(user || fallbackUser);
  
  // If not authenticated at all, show auth prompt
  if (!isAuthenticated) {
    return <AuthPrompt />;
  }
  
  // For admin-only routes, check role
  // Get role from either standard auth or fallback auth
  const userRole = role || fallbackUser?.role || 'user';

  if (adminOnly && userRole !== 'admin') {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Access Required</h1>
          <p className="text-gray-700 mb-6">
            This section requires administrative privileges. If you believe you should have access,
            please contact support.
          </p>
          <a 
            href="/" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render the protected component
  return <>{children}</>;
}
