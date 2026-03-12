import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Building, Shield, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import config from '../../config';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

export default function SignUpModal({ isOpen, onClose, preselectedRole = null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const captchaRef = useRef(null);

  // OTP state
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const isRecruiter = preselectedRole === 'RECRUITER';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendCooldown(0);
    }
  }, [isOpen]);

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

    // Get CAPTCHA token
    let captchaToken = '';
    if (RECAPTCHA_SITE_KEY && captchaRef.current) {
      captchaToken = captchaRef.current.getValue();
      if (!captchaToken) {
        setError('Please complete the CAPTCHA verification');
        return;
      }
    }

    setLoading(true);
    try {
      // Clear any old session data
      localStorage.removeItem('userData');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('signup_pending');

      // STEP 1: Register with Django backend FIRST (fast, reliable)
      const username = email.split('@')[0];
      const backendData = {
        username,
        email,
        password,
        role: preselectedRole || 'CANDIDATE',
        company_name: isRecruiter ? companyName : '',
        captchaToken: captchaToken
      };

      console.log('[SIGNUP] Step 1: Django register...');
      const registerResponse = await axios.post(`${config.apiUrl}/api/auth/register/`, backendData);
      console.log('[SIGNUP] Step 1: Django register SUCCESS');

      // STEP 2: Firebase signup - fire and forget (truly non-blocking)
      // Needed for Google login later but NOT critical for OTP verification
      console.log('[SIGNUP] Step 2: Firebase signup (fire-and-forget)...');
      signup(email, password).catch(firebaseErr => {
        console.log('[SIGNUP] Firebase background:', firebaseErr.code || firebaseErr.message);
        if (firebaseErr.code === 'auth/email-already-in-use') {
          login(email, password).catch(() => {});
        }
      });

      // STEP 3: Store unverified user data and redirect to OTP page
      const newUserData = {
        email: email,
        role: preselectedRole || 'CANDIDATE',
        is_recruiter: isRecruiter,
        is_paid: false,
        company_name: isRecruiter ? companyName : '',
        subscription_plan: 'FREE',
        is_email_verified: false,
        beta_access: false,
        monitoring_credits: 0,
      };
      localStorage.setItem('userData', JSON.stringify(newUserData));

      console.log('[SIGNUP] Step 3: Redirecting to /check-email...');
      onClose();
      window.location.href = `/check-email?email=${encodeURIComponent(email)}`;

    } catch (err) {
      console.error('[SIGNUP] Error:', err.response?.status, err.response?.data || err.message);
      // Handle Django registration errors
      if (err.response?.data) {
        const data = err.response.data;
        // If email already exists in Django, redirect to verification
        if (data.email && String(data.email).toLowerCase().includes('already')) {
          // Try Firebase login and redirect
          try { await login(email, password); } catch (e) { /* ignore */ }
          const newUserData = {
            email, role: preselectedRole || 'CANDIDATE', is_recruiter: isRecruiter,
            is_paid: false, company_name: isRecruiter ? companyName : '',
            subscription_plan: 'FREE', is_email_verified: false, beta_access: false, monitoring_credits: 0,
          };
          localStorage.setItem('userData', JSON.stringify(newUserData));
          onClose();
          window.location.href = `/check-email?email=${encodeURIComponent(email)}`;
          return;
        }
        setError(data.username?.[0] || data.email?.[0] || data.error || 'Registration failed. Please try again.');
      } else {
        setError(err.message || 'Sign up failed. Please try again.');
      }
    } finally {
      localStorage.removeItem('signup_pending');
      setLoading(false);
      if (captchaRef.current) captchaRef.current.reset();
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setOtpLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/verify-otp/`, {
        email: email,
        otp: code
      });

      if (response.data.verified) {
        // Store JWT tokens and user data
        const { access, refresh, user } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('userData', JSON.stringify(user));

        setStep('success');
        toast.success('Email verified successfully!');

        // Redirect after brief success animation
        setTimeout(() => {
          onClose();
          window.location.href = '/';
        }, 1500);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Verification failed. Please try again.';
      setError(errMsg);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await axios.post(`${config.apiUrl}/api/auth/resend-otp/`, { email });
      toast.success('New verification code sent!');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('Please wait before requesting another code.');
      } else {
        toast.error('Failed to resend code. Please try again.');
      }
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
            onClick={step === 'form' ? onClose : undefined}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto"
          >
            {/* Close Button (only on form step) */}
            {step === 'form' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* ─── STEP 1: Registration Form ─── */}
              {step === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-display font-bold text-white mb-2">
                    Sign Up {preselectedRole && `as ${preselectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`}
                  </h2>
                  <p className="text-gray-400 mb-8">Create your account to get started</p>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

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

                    {RECAPTCHA_SITE_KEY && (
                      <div className="flex justify-center">
                        <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} theme="dark" />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating Account...' : (
                        <>
                          <Shield className="h-4 w-4" />
                          {`Sign Up as ${isRecruiter ? 'Recruiter' : 'Candidate'}`}
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─── STEP 2: OTP Verification ─── */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center"
                >
                  {/* Back button */}
                  <button
                    onClick={() => { setStep('form'); setError(''); }}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {/* Mail icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-16 h-16 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <Mail className="h-8 w-8 text-primary" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                  <p className="text-gray-400 text-sm mb-1">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-primary font-medium mb-6">{email}</p>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-dark text-white focus:outline-none transition-all duration-200 ${
                          digit
                            ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.2)]'
                            : 'border-gray-700 focus:border-primary'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => handleVerifyOtp()}
                    disabled={otpLoading || otp.some(d => !d)}
                    className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                  >
                    {otpLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Verify Email
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-sm">
                    <span className="text-gray-500">Didn't receive a code? </span>
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-primary hover:text-white transition-colors font-medium"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs mt-4">
                    Code expires in 10 minutes. Check spam if not received.
                  </p>
                </motion.div>
              )}

              {/* ─── STEP 3: Success ─── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                  <p className="text-gray-400">Redirecting you to the dashboard...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

