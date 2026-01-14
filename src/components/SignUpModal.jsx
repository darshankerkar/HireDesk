import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../../config';

export default function SignUpModal({ isOpen, onClose, preselectedRole = null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const isRecruiter = preselectedRole === 'RECRUITER';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isRecruiter && !companyName.trim()) {
      setError('Company name is required for recruiters');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user first
      const userCredential = await signup(email, password);
      
      // Then register with Django backend
      try {
        const username = email.split('@')[0]; // Generate username from email
        
        const backendData = {
          username: username,
          email: email,
          password: password,
          role: preselectedRole || 'CANDIDATE',
          company_name: isRecruiter ? companyName : ''
        };

        const response = await axios.post(`${config.apiUrl}/auth/register/`, backendData);
        
        // Store user data including role for routing
        const userData = {
          email: email,
          role: preselectedRole || 'CANDIDATE',
          is_recruiter: isRecruiter,
          is_paid: false,
          company_name: companyName
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Store Firebase user
        if (userCredential.user) {
          const firebaseUser = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            accessToken: await userCredential.user.getIdToken()
          };
          localStorage.setItem('firebaseUser', JSON.stringify(firebaseUser));
        }

        onClose();
        
        // Redirect based on role will happen in App.jsx
        window.location.reload(); // Force reload to trigger routing logic
      } catch (backendError) {
        console.error('Backend registration error:', backendError);
        setError(backendError.response?.data?.username?.[0] || 
                 backendError.response?.data?.email?.[0] ||
                 'Registration with backend failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Sign Up {preselectedRole && `as ${preselectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`}
            </h2>
            <p className="text-gray-400 mb-8">
              Create your account to get started
            </p>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {isRecruiter && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required={isRecruiter}
                      placeholder="Enter your company name"
                      className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Creating Account...' : `Sign Up as ${isRecruiter ? 'Recruiter' : 'Candidate'}`}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

