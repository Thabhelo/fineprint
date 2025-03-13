import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
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
import Press from './pages/Press';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contract/:id" element={<ContractDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/documents" element={<DocumentLibrary />} />
            <Route path="/research" element={<LegalResearch />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
          </Routes>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;