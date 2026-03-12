import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import axios from 'axios';
import config from '../../config';
import { useBranding } from '../contexts/BrandingContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const brand = useBranding();

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get(
        `${config.apiUrl}/api/auth/payment/success/?session_id=${sessionId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.is_paid = response.data.is_paid;
        userData.subscription_plan = response.data.subscription_plan;
        userData.monitoring_credits = response.data.monitoring_credits;
        localStorage.setItem('userData', JSON.stringify(userData));
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center"
      >
        {status === 'verifying' ? (
          <>
            <Loader className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-3">Processing Payment...</h1>
            <p className="text-gray-400">Please wait while we confirm your payment.</p>
          </>
        ) : status === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {type === 'monitoring' ? 'Monitoring Credits Added!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-400 mb-8">
              {type === 'monitoring'
                ? 'Your monitoring interview credits have been added to your account.'
                : `Your subscription is now active. Welcome to ${brand.appName}!`}
            </p>
            <button
              onClick={() => {
                window.location.href = '/recruiter-dashboard';
              }}
              className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-8">We couldn't verify your payment. Please contact support.</p>
            <button
              onClick={() => navigate('/payment')}
              className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
