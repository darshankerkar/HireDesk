import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Zap, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const plans = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: '$10',
      period: 'month',
      features: [
        'Post unlimited jobs',
        'Upload up to 100 resumes/month',
        'AI-powered candidate scoring',
        'Basic analytics dashboard',
        'Email support'
      ],
      icon: Zap,
      popular: true
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '$20',
      period: 'month',
      features: [
        'Everything in Basic',
        'Unlimited resume uploads',
        'Advanced analytics & insights',
        'Priority email support',
        'API access',
        'Custom branding'
      ],
      icon: TrendingUp,
      popular: false
    }
  ];

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Get the auth token from localStorage (Firebase ID token or JWT)
      const firebaseUser = JSON.parse(localStorage.getItem('firebaseUser') || 'null');
      const token = firebaseUser?.accessToken;

      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call backend payment endpoint
      const response = await axios.post(
        `${config.apiUrl}/auth/payment/`,
        { plan: selectedPlan },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.is_paid) {
        // Update local storage with payment status
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.is_paid = true;
        userData.subscription_plan = selectedPlan;
        localStorage.setItem('userData', JSON.stringify(userData));

        // Redirect to recruiter dashboard
        navigate('/recruiter-dashboard');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-secondary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Demo Payment Mode</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
            Choose Your <span className="text-primary">Plan</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the full power of HireDesk's AI-driven recruitment platform.
            No credit card required - this is a demo!
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-900/30 border border-red-900 rounded-xl text-red-400 text-center max-w-2xl mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-gray-800 bg-surface hover:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-dark text-xs font-bold px-4 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                selectedPlan === plan.id ? 'bg-primary/20' : 'bg-gray-800'
              }`}>
                <plan.icon className={`h-8 w-8 ${selectedPlan === plan.id ? 'text-primary' : 'text-gray-400'}`} />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-primary">{plan.price}</span>
                <span className="text-gray-400">/ {plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {selectedPlan === plan.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-8 right-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="h-5 w-5 text-dark" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 px-8 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Complete Payment (Demo)
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            🎭 This is a demo payment. Clicking "Complete Payment" will instantly activate your account.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: 'Secure & Trusted', desc: 'Enterprise-grade security' },
            { icon: Zap, title: 'Instant Access', desc: 'Start recruiting immediately' },
            { icon: TrendingUp, title: 'Scale Anytime', desc: 'Upgrade or downgrade easily' }
          ].map((benefit, i) => (
            <div key={i} className="text-center p-6 bg-surface rounded-2xl border border-gray-800">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
              <p className="text-sm text-gray-400">{benefit.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
