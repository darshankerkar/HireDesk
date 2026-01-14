import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import UploadResume from './pages/UploadResume';
import BulkUpload from './pages/BulkUpload';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { currentUser } = useAuth();

  // Show landing page if user is not logged in
  if (!currentUser) {
    return <LandingPage />;
  }

  // Show normal app with navbar if user is logged in
  return (
    <div className="min-h-screen bg-dark text-secondary font-sans">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          } />
          <Route path="/upload-resume" element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          } />
          <Route path="/bulk-upload" element={
            <ProtectedRoute>
              <BulkUpload />
            </ProtectedRoute>
          } />
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
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

