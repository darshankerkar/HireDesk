import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../../config';

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) { setError('Enter the complete 6-digit code'); return; }

    setOtpLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/verify-otp/`, {
        email, otp: code
      });

      if (response.data.verified) {
        const { access, refresh, user } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.removeItem('signup_pending');
        setVerified(true);
        toast.success('Email verified!');
        // Redirect based on role: recruiters go to payment, candidates to dashboard
        const redirectUrl = (user.role === 'RECRUITER' && !user.is_paid) ? '/payment' : '/';
        setTimeout(() => { window.location.href = redirectUrl; }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
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
        toast.error('Failed to resend code.');
      }
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="h-10 w-10 text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-3">Email Verified!</h1>
          <p className="text-gray-400">Redirecting you to the dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center"
      >
        {/* Mail icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Mail className="h-10 w-10 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-3">Verify Your Email</h1>

        <p className="text-gray-400 mb-1">Enter the 6-digit code sent to</p>
        {email && <p className="text-primary font-medium mb-6">{email}</p>}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-dark text-white focus:outline-none transition-all duration-200 ${
                digit ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.2)]' : 'border-gray-700 focus:border-primary'
              }`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={otpLoading || otp.some(d => !d)}
          className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {otpLoading ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying...</>
          ) : (
            <><Shield className="h-4 w-4" /> Verify Email</>
          )}
        </button>

        {/* Resend */}
        <div className="text-sm mb-4">
          <span className="text-gray-500">Didn't receive a code? </span>
          {resendCooldown > 0 ? (
            <span className="text-gray-400">Resend in {resendCooldown}s</span>
          ) : (
            <button onClick={handleResend} className="text-primary hover:text-white transition-colors font-medium">
              Resend Code
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <p className="text-gray-600 text-xs mt-6">
          Code expires in 10 minutes. Check spam if not received.
        </p>
      </motion.div>
    </div>
  );
}
