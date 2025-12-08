import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isHome ? 'bg-transparent backdrop-blur-sm' : 'bg-dark border-b border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-3xl font-display font-bold text-white tracking-tighter">
                Hire<span className="text-primary">Desk</span>
              </Link>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/upload-resume" current={location.pathname}>Upload Resume</NavLink>
              <NavLink to="/jobs" current={location.pathname}>Jobs</NavLink>
              <NavLink to="/dashboard" current={location.pathname}>Dashboard</NavLink>
            </div>
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-gray-400 text-sm">{currentUser.email}</span>
                  <button
                    onClick={logout}
                    className="px-5 py-2 rounded-full bg-surface text-white text-sm font-medium hover:bg-primary hover:text-dark transition-colors duration-300 border border-gray-700 hover:border-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-5 py-2 rounded-full bg-surface text-white text-sm font-medium hover:bg-primary hover:text-dark transition-colors duration-300 border border-gray-700 hover:border-primary"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setSignUpModalOpen(true)}
                    className="px-5 py-2 rounded-full bg-primary text-dark text-sm font-medium hover:bg-white transition-colors duration-300"
                  >
                    Sign Up 
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
      />
    </>
  );
}

function NavLink({ to, children, current }) {
  const isActive = current === to;
  return (
    <Link 
      to={to} 
      className={`relative px-1 pt-1 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
    >
      {children}
      {isActive && (
        <motion.div 
          layoutId="underline"
          className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary"
        />
      )}
    </Link>
  );
}

