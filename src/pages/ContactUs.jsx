import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Clock, Shield, CheckCircle,
  ArrowRight, Loader2, Building2, FileText, CreditCard, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '../contexts/BrandingContext';

const RESPONSE_TIME = '2 business days';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const INQUIRY_TYPES = [
  { value: '', label: 'Select inquiry type...' },
  { value: 'billing', label: 'Billing & Subscription' },
  { value: 'refund', label: 'Refund Request' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account & Access' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'legal', label: 'Legal / Compliance' },
  { value: 'other', label: 'Other' },
];

export default function ContactUs() {
  const brand = useBranding();

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.inquiryType) newErrors.inquiryType = 'Please select an inquiry type';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    else if (form.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('sending');

    // Build mailto link as a fallback (no backend email endpoint on contact form)
    const subject = encodeURIComponent(`[${brand.appName}] ${INQUIRY_TYPES.find(t => t.value === form.inquiryType)?.label || 'Inquiry'} - ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company || 'N/A'}\nInquiry Type: ${form.inquiryType}\n\nMessage:\n${form.message}`
    );

    // Small delay to show loading state, then open mailto
    setTimeout(() => {
      window.location.href = `mailto:${brand.contactEmail}?subject=${subject}&body=${body}`;
      setStatus('success');
      setForm({ name: '', email: '', company: '', inquiryType: '', message: '' });
    }, 800);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-white text-sm placeholder-gray-600 bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
      errors[field]
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-white/10 hover:border-white/20 focus:border-primary/40'
    }`;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-16 relative z-10">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-14 text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Contact {brand.appName}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question about our platform, billing, or need support? Our team is here to help. We typically respond within {RESPONSE_TIME}.
          </motion.p>
          <motion.p variants={fadeUp} className="text-sm text-gray-600 mt-3 italic">
            {brand.disclaimer}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left column - Info */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact card */}
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm">
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Direct Contact
              </h2>
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">General Inquiries</p>
                  <a
                    href={`mailto:${brand.contactEmail}`}
                    id="contact-general-email"
                    className="text-primary hover:text-white font-semibold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    {brand.contactEmail}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Technical Support & Billing</p>
                  <a
                    href={`mailto:${brand.supportEmail}`}
                    id="contact-support-email"
                    className="text-primary hover:text-white font-semibold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    {brand.supportEmail}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Response time */}
            <motion.div variants={fadeUp} className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-semibold">Response Time</p>
                <p className="text-gray-400 text-sm">We aim to reply within <strong className="text-primary">{RESPONSE_TIME}</strong></p>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Help</h3>
              <div className="space-y-2">
                {[
                  { to: '/refund', icon: CreditCard, label: 'Refund Policy', desc: 'Learn about our 7-day guarantee' },
                  { to: '/terms', icon: FileText, label: 'Terms & Conditions', desc: 'Understand your rights & obligations' },
                  { to: '/privacy', icon: Shield, label: 'Privacy Policy', desc: 'How we protect your data' },
                  { to: '/pricing', icon: Building2, label: 'Pricing Plans', desc: 'Free & Pro subscription details' },
                ].map((link, i) => (
                  <Link
                    key={i}
                    to={link.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-200 group"
                  >
                    <link.icon className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-primary transition-colors duration-200">{link.label}</p>
                      <p className="text-gray-500 text-xs truncate">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 ml-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div variants={fadeUp} className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-amber-400 block mb-1">Disclaimer</strong>
                  {brand.appName} provides software tools only. We are not a job placement agency, recruitment consultant, or staffing firm and cannot guarantee employment outcomes.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm">
              <h2 className="text-white font-bold text-xl mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-8">
                Fill out the form below and we'll get back to you shortly. For urgent billing or account issues, email us directly.
              </p>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-400 max-w-sm">
                    Your email client should have opened. If not, please email us directly at{' '}
                    <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline">{brand.contactEmail}</a>
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 px-6 py-2.5 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-sm transition-all duration-200"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5" id="contact-form">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputClass('name')}
                        autoComplete="name"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className={inputClass('email')}
                        autoComplete="email"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Company & Inquiry Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-company" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                        Company / Organisation
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Your company name (optional)"
                        className={inputClass('company')}
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-inquiry-type" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                        Inquiry Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="contact-inquiry-type"
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        className={`${inputClass('inquiryType')} appearance-none cursor-pointer`}
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                      >
                        {INQUIRY_TYPES.map(t => (
                          <option key={t.value} value={t.value} disabled={!t.value} className="bg-[#111] text-gray-300">
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {errors.inquiryType && <p className="text-red-400 text-xs mt-1">{errors.inquiryType}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Please describe your question or issue in detail..."
                      className={`${inputClass('message')} resize-none`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.message
                        ? <p className="text-red-400 text-xs">{errors.message}</p>
                        : <span />
                      }
                      <p className="text-gray-600 text-xs ml-auto">
                        {form.message.length} / 1000
                      </p>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-gray-500">
                    <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      By submitting this form, you agree to our{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      Your message will be sent to our support team via email. We do not share your information with third parties for marketing purposes.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-dark bg-primary hover:bg-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing your message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Business Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 p-6 rounded-2xl border border-white/8 bg-white/[0.02] text-center"
        >
          <p className="text-gray-400 text-sm">
            <strong className="text-white">{brand.appName}</strong> — AI-Powered Recruitment Automation SaaS Platform.
            &nbsp;|&nbsp; <strong className="text-white">Website:</strong> recrify.co
            &nbsp;|&nbsp; <strong className="text-white">Email:</strong>{' '}
            <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline">{brand.contactEmail}</a>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {brand.appName} is a subscription-based software platform. We do not provide job placement, staffing, or recruitment agency services.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 text-xs mt-8"
        >
          {brand.copyright} &nbsp;|&nbsp;
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link> &nbsp;·&nbsp;
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link> &nbsp;·&nbsp;
          <Link to="/refund" className="hover:text-gray-400 transition-colors">Refunds</Link>
        </motion.p>
      </div>
    </div>
  );
}
