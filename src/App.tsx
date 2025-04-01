import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignupSuccess from './pages/SignupSuccess';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import ContractDetail from './pages/ContractDetail';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/admin/Dashboard';
import DocumentLibrary from './pages/DocumentLibrary';
import LegalResearch from './pages/LegalResearch';
import GetStarted from './pages/GetStarted';
import About from './pages/About';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Authentication routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup-success" element={<SignupSuccess />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contract/:id" 
              element={
                <ProtectedRoute>
                  <ContractDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentLibrary />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/research" 
              element={
                <ProtectedRoute>
                  <LegalResearch />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
          <Toaster position="top-right" />
          <VercelAnalytics />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
