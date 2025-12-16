import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  // Close mobile menu when route changes
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isHome ? 'bg-transparent backdrop-blur-sm' : 'bg-dark border-b border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-3xl font-display font-bold text-white tracking-tighter">
                Hire<span className="text-primary">Desk</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:space-x-8">
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/upload-resume" current={location.pathname}>Upload Resume</NavLink>
              <NavLink to="/jobs" current={location.pathname}>Jobs</NavLink>
              <NavLink to="/dashboard" current={location.pathname}>Dashboard</NavLink>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
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

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden bg-dark border-t border-gray-800 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                {/* Mobile Navigation Links */}
                <MobileNavLink to="/" current={location.pathname} onClick={handleNavClick}>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/upload-resume" current={location.pathname} onClick={handleNavClick}>
                  Upload Resume
                </MobileNavLink>
                <MobileNavLink to="/jobs" current={location.pathname} onClick={handleNavClick}>
                  Jobs
                </MobileNavLink>
                <MobileNavLink to="/dashboard" current={location.pathname} onClick={handleNavClick}>
                  Dashboard
                </MobileNavLink>

                {/* Mobile Auth Section */}
                {currentUser ? (
                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <div className="text-gray-400 text-sm px-3 py-2">
                      {currentUser.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        handleNavClick();
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-surface text-white text-sm font-medium hover:bg-primary hover:text-dark transition-colors duration-300 border border-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <button
                      onClick={() => {
                        setLoginModalOpen(true);
                        handleNavClick();
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-surface text-white text-sm font-medium hover:bg-primary hover:text-dark transition-colors duration-300 border border-gray-700"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setSignUpModalOpen(true);
                        handleNavClick();
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-primary text-dark text-sm font-medium hover:bg-white transition-colors duration-300"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

function MobileNavLink({ to, children, current, onClick }) {
  const isActive = current === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors duration-300 ${
        isActive 
          ? 'bg-primary text-dark' 
          : 'text-gray-400 hover:text-white hover:bg-surface'
      }`}
    >
      {children}
    </Link>
  );
}

