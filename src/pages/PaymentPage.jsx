import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, CreditCard, Zap, TrendingUp, Shield, ArrowRight, Gift,
  Monitor, Globe, Sparkles, Tag, Star
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import config from '../../config';
import { getBranding } from '../utils/branding';

const PRICING = {
  usd: {
    symbol: '$',
    starter: 5,
    pro: 19,
    monitor5: 5,
    monitor50: 10,
    label: 'USD',
  },
  inr: {
    symbol: '\u20B9',
    starter: 450,
    pro: 1599,
    monitor5: 399,
    monitor50: 799,
    label: 'INR',
  },
};

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState('STARTER');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [redeemingCoupon, setRedeemingCoupon] = useState(false);
  const [currency, setCurrency] = useState('usd');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('canceled')) {
      toast.error('Payment was canceled.');
    }
  }, [searchParams]);

  const p = PRICING[currency];

  const plans = [
    {
      id: 'STARTER',
      name: 'Starter',
      price: `${p.symbol}${p.starter}`,
      period: 'month',
      features: [
        'Unlimited resume scoring',
        'Bulk upload resumes',
        'JD matching & ranking',
        'Recruiter dashboard',
        'Basic analytics',
        '10 interview sessions/month',
      ],
      icon: Zap,
      popular: false,
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: `${p.symbol}${p.pro}`,
      period: 'month',
      features: [
        'Everything in Starter',
        '50 interviews/month',
        'AI proctoring & monitoring',
        'Advanced analytics & insights',
        'Priority support',
        'Custom branding',
      ],
      icon: TrendingUp,
      popular: true,
    },
  ];

  const monitoringPacks = [
    {
      id: 'SMALL',
      name: '5 Monitored Interviews',
      price: `${p.symbol}${p.monitor5}`,
      credits: 5,
      icon: Monitor,
    },
    {
      id: 'LARGE',
      name: '50 Monitored Interviews',
      price: `${p.symbol}${p.monitor50}`,
      credits: 50,
      icon: Monitor,
      badge: 'Best Value',
    },
  ];

  const getAccessToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated. Please login again.');
    return token;
  };

  const isAdminTestUser = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return (userData.email || '').toLowerCase() === 'admin@recrify.co';
    } catch {
      return false;
    }
  };

  const loadCashfreeSdk = () => new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const existing = document.querySelector('script[data-cashfree-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Cashfree), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK.'));
    document.body.appendChild(script);
  });

  const verifyCashfreeOrder = async (orderId, accessToken, successRedirect) => {
    const verifyResponse = await axios.post(
      `${config.apiUrl}/api/auth/cashfree/verify-payment/`,
      { order_id: orderId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (verifyResponse.data.success) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (verifyResponse.data.user) {
        Object.assign(userData, verifyResponse.data.user);
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      toast.success(verifyResponse.data.message || 'Payment successful!');
      if (successRedirect === 'reload') {
        setTimeout(() => { window.location.reload(); }, 1000);
      } else {
        setTimeout(() => { window.location.href = successRedirect; }, 1000);
      }
    }
  };

  const startCashfreeCheckout = async (plan, successRedirect) => {
    const accessToken = getAccessToken();
    const response = await axios.post(
      `${config.apiUrl}/api/auth/cashfree/create-order/`,
      { plan, currency },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const { payment_session_id, order_id, environment } = response.data;
    const Cashfree = await loadCashfreeSdk();
    const cashfree = Cashfree({ mode: environment === 'production' ? 'production' : 'sandbox' });
    const result = await cashfree.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget: '_modal',
    });

    if (result?.error) {
      throw new Error(result.error.message || 'Payment cancelled.');
    }

    await verifyCashfreeOrder(order_id, accessToken, successRedirect);
  };

  const handleSubscribe = async (plan) => {
    setLoading(plan);
    setError('');
    try {
      const accessToken = getAccessToken();

      if (isAdminTestUser()) {
        const grantResponse = await axios.post(
          `${config.apiUrl}/api/auth/grant-test-access/`,
          { plan },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (grantResponse.data.user) {
          Object.assign(userData, grantResponse.data.user);
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        toast.success('This test user has access to all paid features');
        setTimeout(() => { window.location.href = '/recruiter-dashboard'; }, 1000);
        return;
      }

      await startCashfreeCheckout(plan, '/recruiter-dashboard');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start checkout.');
    } finally {
      setLoading('');
    }
  };

  const handleMonitoringPurchase = async (pack) => {
    const planKey = pack === 'SMALL' ? 'MONITOR_5' : 'MONITOR_50';
    setLoading(`monitor_${pack}`);
    setError('');
    try {
      await startCashfreeCheckout(planKey, 'reload');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to start checkout.');
    } finally {
      setLoading('');
    }
  };

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setRedeemingCoupon(true);
    setError('');
    try {
      const accessToken = getAccessToken();
      const response = await axios.post(
        `${config.apiUrl}/api/auth/redeem-coupon/`,
        { code: couponCode },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.is_paid = true;
      userData.subscription_plan = 'PRO';
      userData.beta_access = true;
      localStorage.setItem('userData', JSON.stringify(userData));

      toast.success(response.data.message);
      setTimeout(() => { window.location.href = '/recruiter-dashboard'; }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid coupon code.');
    } finally {
      setRedeemingCoupon(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-secondary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
            Choose Your <span className="text-primary">Plan</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            Unlock the full power of {getBranding().appName}'s AI-driven recruitment platform.
          </p>

          <div className="inline-flex items-center gap-2 bg-surface border border-gray-800 rounded-full p-1">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currency === 'usd' ? 'bg-primary text-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-1" /> USD
            </button>
            <button
              onClick={() => setCurrency('inr')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currency === 'inr' ? 'bg-primary text-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              INR
            </button>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-gray-800 bg-surface hover:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-dark text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> RECOMMENDED
                  </div>
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                selectedPlan === plan.id ? 'bg-primary/20' : 'bg-gray-800'
              }`}>
                <plan.icon className={`h-8 w-8 ${selectedPlan === plan.id ? 'text-primary' : 'text-gray-400'}`} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-primary">{plan.price}</span>
                <span className="text-gray-400">/ {plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading === plan.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Subscribe to {plan.name}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Monitoring Add-Ons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Monitor className="h-7 w-7 text-primary" />
              Monitoring Add-On Packs
            </h2>
            <p className="text-gray-400">Add AI-proctored interview monitoring to any plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {monitoringPacks.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="relative bg-surface border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all"
              >
                {pack.badge && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-amber-500 text-dark text-xs font-bold px-3 py-1 rounded-full">
                      {pack.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <pack.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{pack.name}</h4>
                    <p className="text-2xl font-bold text-primary">{pack.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMonitoringPurchase(pack.id)}
                  disabled={loading === `monitor_${pack.id}`}
                  className="w-full py-2 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {loading === `monitor_${pack.id}` ? 'Processing...' : 'Buy Now'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Beta Coupon Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-lg mx-auto mb-16"
        >
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/30 rounded-2xl p-8 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Founder's Beta Access</h3>
            <p className="text-gray-400 text-sm mb-6">
              Got a beta code? Unlock 14 days of full PRO access — no credit card required.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors font-mono tracking-wider text-center"
              />
              <button
                onClick={handleRedeemCoupon}
                disabled={redeemingCoupon || !couponCode.trim()}
                className="px-6 py-3 bg-primary text-dark font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                {redeemingCoupon ? '...' : 'Redeem'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: 'Secure Payments', desc: 'Powered by Cashfree' },
            { icon: Zap, title: 'Instant Access', desc: 'Start recruiting immediately' },
            { icon: TrendingUp, title: 'Scale Anytime', desc: 'Upgrade or downgrade easily' },
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
