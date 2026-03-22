import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import PaymentSuccess from './pages/PaymentSuccess';
import VerifyEmail from './pages/VerifyEmail';
import CheckEmail from './pages/CheckEmail';
import Jobs from './pages/Jobs';
import UploadResume from './pages/UploadResume';
import BulkUpload from './pages/BulkUpload';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import LandingPage from './pages/LandingPage';
import CandidateJobs from './pages/CandidateJobs';
import InterviewsDashboard from './pages/InterviewsDashboard';
import InterviewRoom from './components/InterviewRoom';
import InterviewJoinGate from './components/InterviewJoinGate';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataPreloadProvider } from './contexts/DataPreloadContext';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';
import Pricing from './pages/Pricing';
import { BrandingProvider } from './contexts/BrandingContext';

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingRole, setVerifyingRole] = useState(false);

  useEffect(() => {
    // If signup is in progress, check if it's stale (> 30 seconds old)
    const signupPending = localStorage.getItem('signup_pending');
    if (signupPending) {
      const pendingTime = parseInt(signupPending, 10);
      if (pendingTime && Date.now() - pendingTime > 30000) {
        // Stale signup_pending flag — clear it
        console.warn('Clearing stale signup_pending flag');
        localStorage.removeItem('signup_pending');
      } else {
        // Active signup in progress — keep loading, don't interfere
        setLoading(true);
        return;
      }
    }

    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      
      // CRITICAL: Validate that stored userData matches current Firebase user
      // Prevents stale session data from a previous user leaking through
      if (currentUser && parsedData.email && currentUser.email !== parsedData.email) {
        console.warn('Session mismatch: clearing stale userData', parsedData.email, '!=', currentUser.email);
        localStorage.removeItem('userData');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUserData(null);
        setLoading(false);
        return;
      }
      
      // Simulate backend role verification for recruiters
      if (parsedData.role === 'RECRUITER' && !parsedData.is_paid) {
        setVerifyingRole(true);
        setTimeout(() => {
          setUserData(parsedData);
          setVerifyingRole(false);
          setLoading(false);
        }, 2000); // 2 second delay for role verification
      } else {
        setUserData(parsedData);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Show landing page if user is not logged in
  // Check both Firebase auth AND Django JWT token (access_token)
  // Firebase signup is fire-and-forget, so currentUser may be null even after OTP verification
  const hasValidSession = currentUser || localStorage.getItem('access_token');
  if (!hasValidSession || !userData) {
    // Public routes accessible without login
    if (location.pathname.startsWith('/verify-email/')) {
      return (
        <Routes>
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      );
    }
    if (location.pathname === '/check-email') {
      return (
        <Routes>
          <Route path="/check-email" element={<CheckEmail />} />
        </Routes>
      );
    }
    

    // Static Public Pages
    if (['/terms', '/privacy', '/refund', '/contact', '/pricing'].includes(location.pathname)) {
      return (
        <div className="min-h-screen bg-dark text-secondary font-sans">
          <main>
            <Routes>
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </main>
        </div>
      );
    }

    // If user is trying to join an interview room, show Google login gate
    if (location.pathname.startsWith('/interview/room/')) {
      return <InterviewJoinGate />;
    }
    return <LandingPage />;
  }

  // Role verification loading state
  if (verifyingRole) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Role</h2>
          <p className="text-gray-400">Checking your account credentials...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
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
  const isEmailVerified = userData.is_email_verified !== false; // default true for existing users
  const isInterviewRoomRoute = location.pathname.startsWith('/interview/room/');
  const isLegalPage = ['/terms', '/privacy', '/refund', '/contact', '/pricing'].includes(location.pathname);
  const showNavbar = !isLegalPage && location.pathname !== '/payment' && !(isRecruiter && !isPaid);
  const showChatBot = !isLegalPage && location.pathname !== '/payment';

  // Email verification gate removed — users are auto-verified on registration

  // Payment gate removed — all users get full access on registration

  // All users get full access (is_paid set to true on registration)
  const defaultDashboard = isRecruiter ? '/recruiter-dashboard' : '/candidate-dashboard';
  const defaultJobsPage = isRecruiter ? '/jobs' : '/candidate-jobs';

  // Show normal app with navbar if user is logged in and authorized
  return (
    <div className="min-h-screen bg-dark text-secondary font-sans">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-20' : ''}>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Recruiter Dashboard - PAID recruiters only */}
          <Route path="/recruiter-dashboard" element={
            isRecruiter ? (
              <ProtectedRoute>
                <RecruiterDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Candidate Dashboard - Candidates AND unpaid recruiters */}
          <Route path="/candidate-dashboard" element={
            !isRecruiter ? (
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Bulk Upload - Recruiters only */}
          <Route path="/bulk-upload" element={
            isRecruiter ? (
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
            isRecruiter ? (
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            ) : (
              <Navigate to="/upload-resume" replace />
            )
          } />

          {/* New Candidate Jobs Page */}
          <Route path="/candidate-jobs" element={
            <ProtectedRoute>
              <CandidateJobs />
            </ProtectedRoute>
          } />

          {/* Interviews Dashboard - Recruiters only */}
          <Route path="/interviews" element={
            isRecruiter ? (
              <ProtectedRoute>
                <InterviewsDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={defaultDashboard} replace />
            )
          } />

          {/* Interview Room - Accessible to both recruiters and candidates */}
          <Route path="/interview/room/:interviewId" element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          } />

          {/* Payment Page */}
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Payment Success */}
          <Route path="/payment/success" element={<PaymentSuccess />} />

          {/* Email Verification (for already-logged-in users clicking link) */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/check-email" element={<CheckEmail />} />

          {/* Legal / Static Pages */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Redirect invalid routes to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {showChatBot && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
      <Router>
        <Toaster position="top-right" />
        <DataPreloadProvider>
          <AppContent />
        </DataPreloadProvider>
      </Router>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
