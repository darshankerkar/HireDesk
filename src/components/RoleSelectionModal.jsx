import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, ArrowRight, X } from 'lucide-react';
import SignUpModal from './SignUpModal';
import LoginModal from './LoginModal';

export default function RoleSelectionModal({ isOpen, onClose, mode = 'signup' }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (mode === 'signup') {
      setShowAuthModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  if (!isOpen) return null;

  if (showAuthModal && selectedRole) {
    return (
      <SignUpModal
        isOpen={true}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedRole(null);
          onClose();
        }}
        preselectedRole={selectedRole}
      />
    );
  }

  if (showLoginModal && selectedRole) {
    return (
      <LoginModal
        isOpen={true}
        onClose={() => {
          setShowLoginModal(false);
          setSelectedRole(null);
          onClose();
        }}
        preselectedRole={selectedRole}
      />
    );
  }

  return (
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
        className="relative bg-surface border border-gray-800 rounded-3xl p-8 w-full max-w-4xl shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-3">
            Choose Your Role
          </h2>
          <p className="text-gray-400 text-lg">
            {mode === 'signup' ? 'Select how you want to use HireDesk' : 'Select your role to continue'}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('CANDIDATE')}
            className="group relative bg-dark border-2 border-gray-700 hover:border-primary rounded-2xl p-8 text-left transition-all duration-300"
          >
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              FREE
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                I'm a Candidate
              </h3>
              
              <p className="text-gray-400 mb-6">
                Find jobs and apply with your resume
              </p>
              
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  View all job listings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Apply to jobs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Upload resume for each job
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Access AI chat assistant
                </li>
              </ul>
              
              <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                Continue as Candidate <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>

          {/* Recruiter Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('RECRUITER')}
            className="group relative bg-dark border-2 border-gray-700 hover:border-primary rounded-2xl p-8 text-left transition-all duration-300"
          >
            <div className="absolute top-0 right-0 bg-primary text-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              PAID
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                I'm a Recruiter
              </h3>
              
              <p className="text-gray-400 mb-6">
                Post jobs and find the best candidates
              </p>
              
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Post unlimited jobs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Bulk resume upload
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  AI-powered candidate scoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Analytics dashboard
                </li>
              </ul>
              
              <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                Continue as Recruiter <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={onClose} className="text-primary hover:underline">Login instead</button></>
          ) : (
            <>Don't have an account? <button onClick={onClose} className="text-primary hover:underline">Sign up instead</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
}
