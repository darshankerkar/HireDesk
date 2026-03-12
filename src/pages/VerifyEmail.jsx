import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, already
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/auth/verify-email/${token}/`);
      if (response.data.already_verified) {
        setStatus('already');
        setMessage('Your email is already verified.');
      } else {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed. The link may be invalid or expired.');
    }
  };

  const icons = {
    verifying: <Loader className="h-16 w-16 text-primary animate-spin" />,
    success: <CheckCircle className="h-16 w-16 text-green-400" />,
    already: <CheckCircle className="h-16 w-16 text-blue-400" />,
    error: <XCircle className="h-16 w-16 text-red-400" />,
  };

  const titles = {
    verifying: 'Verifying your email...',
    success: 'Email Verified!',
    already: 'Already Verified',
    error: 'Verification Failed',
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          {icons[status]}
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {titles[status]}
        </h1>

        <p className="text-gray-400 mb-8">{message}</p>

        {status === 'success' && (
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors"
          >
            Continue to Login
          </button>
        )}

        {status === 'already' && (
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors"
          >
            Go to Home
          </button>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
