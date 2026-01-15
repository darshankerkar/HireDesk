import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import PaymentPage from './pages/PaymentPage';
import Jobs from './pages/Jobs';
import UploadResume from './pages/UploadResume';
import BulkUpload from './pages/BulkUpload';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    setLoading(false);
  }, [currentUser]);

  // Show landing page if user is not logged in
  if (!currentUser || !userData) {
    return <LandingPage />;
  }

  // Loading state
  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isRecruiter = userData.role === 'RECRUITER';
  const isPaid = userData.is_paid;

  // Recruiter Payment Gate: Unpaid recruiters must go to payment page
  if (isRecruiter && !isPaid) {
    return (
      <div className="min-h-screen bg-dark text-secondary font-sans">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="*" element={<Navigate to="/payment" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Determine default dashboard based on role and payment status
  // Paid recruiters -> Recruiter Dashboard
  // Unpaid recruiters -> Candidate Dashboard (can upload/apply like candidates)  
  // Candidates -> Candidate Dashboard
  const defaultDashboard = (isRecruiter && isPaid) ? '/recruiter-dashboard' : '/candidate-dashboard';

  // Show normal app with navbar if user is logged in and authorized
  return (
    <div className="min-h-screen bg-dark text-secondary font-sans">
      <Navbar />
      <main className="pt-20">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Recruiter Dashboard - PAID recruiters only */}
          <Route path="/recruiter-dashboard" element={
            isRecruiter && isPaid ? (
              <ProtectedRoute>
                <RecruiterDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Candidate Dashboard - Candidates AND unpaid recruiters */}
          <Route path="/candidate-dashboard" element={
            !isRecruiter || (isRecruiter && !isPaid) ? (
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Bulk Upload - Recruiters only */}
          <Route path="/bulk-upload" element={
            isRecruiter && isPaid ? (
              <ProtectedRoute>
                <BulkUpload />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Old Dashboard route redirect */}
          <Route path="/dashboard" element={
            isRecruiter && isPaid ? (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Upload Resume - Available to everyone */}
          <Route path="/upload-resume" element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          } />

          {/* Resume Analyzer - Available to everyone */}
          <Route path="/resume-analyzer" element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          } />

          {/* Jobs - Recruiters only */}
          <Route path="/jobs" element={
            isRecruiter && isPaid ? (
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            ) : (
              <Navigate to="/upload-resume" replace />
            )
          } />

          {/* Redirect invalid routes to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
