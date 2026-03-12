import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CreditCard, RefreshCw, Clock, XCircle, CheckCircle, AlertTriangle, Mail, BookOpen, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '../contexts/BrandingContext';

const LAST_UPDATED = 'March 11, 2026';

const Section = ({ id, icon: Icon, title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35 }}
      className="border border-white/8 rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors duration-200 group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </span>
          <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors duration-200">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 text-gray-300 text-sm md:text-base leading-relaxed space-y-4 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Li = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="text-primary mt-1 shrink-0">•</span>
    <span>{children}</span>
  </li>
);

export default function RefundPolicy() {
  const brand = useBranding();

  const toc = [
    { id: 'overview', label: '1. Overview' },
    { id: 'saas-nature', label: '2. SaaS Subscription Nature' },
    { id: 'eligibility', label: '3. Refund Eligibility' },
    { id: 'non-refundable', label: '4. Non-Refundable Situations' },
    { id: 'process', label: '5. How to Request a Refund' },
    { id: 'processing-time', label: '6. Processing Time' },
    { id: 'cancellation', label: '7. Subscription Cancellation' },
    { id: 'disputes', label: '8. Chargebacks & Disputes' },
    { id: 'changes', label: '9. Changes to This Policy' },
    { id: 'contact', label: '10. Contact Us' },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-300 relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4" />
            Billing & Cancellations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Refund Policy</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {brand.appName} strives to provide a high-quality SaaS platform. We have a clear, fair refund policy to ensure you can use our service with confidence.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last Updated: {LAST_UPDATED}</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            {
              icon: CheckCircle,
              label: '7-Day Money-Back',
              sub: 'Full refund for new subscribers',
              color: 'text-green-400',
              border: 'border-green-400/20',
              bg: 'bg-green-400/10',
            },
            {
              icon: Clock,
              label: '5–10 Business Days',
              sub: 'Standard refund processing time',
              color: 'text-primary',
              border: 'border-primary/20',
              bg: 'bg-primary/10',
            },
            {
              icon: XCircle,
              label: 'No Placement Refunds',
              sub: 'Software only — not a hiring service',
              color: 'text-red-400',
              border: 'border-red-400/20',
              bg: 'bg-red-400/10',
            },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${item.border} ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
              <div>
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10 p-6 rounded-2xl border border-white/8 bg-white/[0.02]"
        >
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {toc.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 py-0.5"
                onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">

          <Section id="overview" icon={FileText} title="1. Overview">
            <p>
              This Refund Policy governs all payments made to {brand.appName} for subscription access to our AI-powered recruitment automation software (SaaS) platform. By subscribing to our Service, you agree to this policy.
            </p>
            <p>
              {brand.appName} is a <strong className="text-white">subscription-based B2B SaaS platform</strong>. Subscribers gain access to software tools and features. Our subscriptions are <strong className="text-white">not</strong> for placement services, recruitment consulting, or any form of employment guarantee.
            </p>
            <p>
              We want you to be completely satisfied. If you experience any issues with our platform, please contact our support team before requesting a refund — we may be able to resolve your issue quickly.
            </p>
          </Section>

          <Section id="saas-nature" icon={CreditCard} title="2. SaaS Subscription Nature">
            <p>
              It is important to understand the nature of what you are purchasing when subscribing to {brand.appName}:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>You are purchasing <strong className="text-white">access to software tools</strong>, not a guaranteed business outcome</Li>
              <Li>{brand.appName} provides AI-powered tools for resume parsing, scoring, and candidate pipeline management</Li>
              <Li>We do <strong className="text-white">not</strong> guarantee any specific hiring results, candidate quality, or reduction in time-to-hire</Li>
              <Li>We are <strong className="text-white">not</strong> a recruitment agency, staffing agency, or job placement service</Li>
              <Li>Access is granted immediately upon successful payment, meaning the digital service is considered delivered upon provision of access</Li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
              <strong className="text-amber-400 block mb-1">⚠ Important Note for Payment Gateway Compliance</strong>
              As a SaaS provider, {brand.appName} complies with Indian Payment Gateway (Razorpay) guidelines. Subscription fees are for software access only. Refunds are governed strictly by the terms outlined in this policy.
            </div>
          </Section>

          <Section id="eligibility" icon={CheckCircle} title="3. Refund Eligibility">
            <h3 className="text-white font-semibold">3.1 New Subscriber Guarantee (7-Day Money-Back)</h3>
            <p>
              We offer a <strong className="text-white">7-day money-back guarantee</strong> for first-time subscribers to our Pro Plan. If you are not satisfied with the platform within the first 7 calendar days of your initial paid subscription, you may request a full refund.
            </p>
            <p>Eligibility conditions:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li>The refund request must be submitted within 7 calendar days of the original payment date</Li>
              <Li>The request is for a <strong className="text-white">first-time subscription only</strong> — not for renewals or repeat subscriptions</Li>
              <Li>Your account has not been suspended or terminated for violation of our Terms of Service</Li>
              <Li>The request is submitted in good faith and not as part of a pattern of abuse</Li>
            </ul>

            <h3 className="text-white font-semibold mt-4">3.2 Service Failure Refunds</h3>
            <p>
              If the {brand.appName} platform experiences a verified outage or technical failure lasting more than 72 consecutive hours within a single billing period, you may be eligible for a pro-rated credit or refund for the affected period. Please contact support to report such issues.
            </p>

            <h3 className="text-white font-semibold mt-4">3.3 Duplicate Payments</h3>
            <p>
              If you are charged twice for the same subscription period due to a technical error, the duplicate charge will be fully refunded upon verification.
            </p>
          </Section>

          <Section id="non-refundable" icon={XCircle} title="4. Non-Refundable Situations">
            <p>Refunds will <strong className="text-white">not</strong> be issued in the following circumstances:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Refund requests made after the 7-day money-back guarantee period has expired</Li>
              <Li>Subscription renewals (monthly or annual) — renewal payments are non-refundable</Li>
              <Li>Accounts suspended or terminated for violating our <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link> or Acceptable Use Policy</Li>
              <Li>Dissatisfaction with AI scoring results or candidate match quality (these are software outputs, not guaranteed outcomes)</Li>
              <Li>Failure to achieve specific business or hiring goals using the platform</Li>
              <Li>Lack of usage — simply not using the platform during a paid period does not entitle you to a refund</Li>
              <Li>Feature requests that were not fulfilled (platform roadmap is at our discretion)</Li>
              <Li>Technical issues caused by the user's own infrastructure, browser, or network</Li>
            </ul>
          </Section>

          <Section id="process" icon={RefreshCw} title="5. How to Request a Refund">
            <p>To request a refund, please follow these steps:</p>
            <ol className="space-y-3 list-none pl-2">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-white">Contact Support by Email</strong>
                  <p className="text-gray-400 mt-0.5">Send an email to <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> with the subject line: <em className="text-white">"Refund Request – [Your Registered Email]"</em></p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-white">Include Required Information</strong>
                  <ul className="text-gray-400 mt-1 space-y-0.5 text-sm">
                    <li>— Registered email address</li>
                    <li>— Date of payment</li>
                    <li>— Payment reference / transaction ID</li>
                    <li>— Reason for the refund request</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-white">Await Confirmation</strong>
                  <p className="text-gray-400 mt-0.5">Our team will acknowledge your request within 2 business days and process eligible refunds within 5–10 business days.</p>
                </div>
              </li>
            </ol>
          </Section>

          <Section id="processing-time" icon={Clock} title="6. Processing Time">
            <p>
              Once a refund has been approved, processing times are as follows:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Method</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Estimated Refund Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">UPI / Net Banking</td>
                    <td className="py-3 px-4 text-gray-300">3–5 business days</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Debit / Credit Card</td>
                    <td className="py-3 px-4 text-gray-300">5–10 business days</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Wallets (Paytm, PhonePe, etc.)</td>
                    <td className="py-3 px-4 text-gray-300">1–3 business days</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">International Cards / Stripe</td>
                    <td className="py-3 px-4 text-gray-300">5–7 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Note: Processing times are from the date of approval and may vary based on your bank or payment provider.
            </p>
          </Section>

          <Section id="cancellation" icon={RefreshCw} title="7. Subscription Cancellation">
            <p>
              You may cancel your {brand.appName} subscription at any time. Here is how cancellation works:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <Li><strong className="text-white">Access After Cancellation:</strong> Your subscription access remains active until the end of your current paid billing period. You will not be charged again after that date.</Li>
              <Li><strong className="text-white">How to Cancel:</strong> Contact us at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> to cancel your subscription, or use the account settings within the platform if available.</Li>
              <Li><strong className="text-white">No Partial Refunds for Early Cancellation:</strong> If you cancel mid-cycle, you retain access for the remainder of the billing period, but no pro-rated refund is issued unless there is a verified service failure.</Li>
              <Li><strong className="text-white">Data After Cancellation:</strong> Your data will be retained for 30 days after subscription end, after which it may be deleted. Please download any data you need before cancellation.</Li>
            </ul>
          </Section>

          <Section id="disputes" icon={AlertTriangle} title="8. Chargebacks & Payment Disputes">
            <p>
              We strongly encourage you to contact us before initiating a chargeback with your bank or payment provider. Most issues can be resolved quickly and amicably through our support team.
            </p>
            <p>
              If a chargeback is initiated without first contacting us:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Your account may be immediately suspended pending investigation</Li>
              <Li>We reserve the right to contest the chargeback with supporting documentation of service delivery</Li>
              <Li>Repeated or fraudulent chargebacks may result in permanent account termination and may be reported to relevant authorities</Li>
            </ul>
            <p>
              To resolve a billing dispute, please contact <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> with your transaction details. We will work to resolve it within 5 business days.
            </p>
          </Section>

          <Section id="changes" icon={RefreshCw} title="9. Changes to This Policy">
            <p>
              {brand.appName} reserves the right to modify this Refund Policy at any time. Any changes will be:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Effective from the date they are posted on this page</Li>
              <Li>Communicated to existing subscribers via email with at least 14 days' notice for material changes</Li>
            </ul>
            <p>
              Continued use of the Service after a policy update constitutes your acceptance of the revised Refund Policy.
            </p>
          </Section>

          <Section id="contact" icon={Mail} title="10. Contact Us">
            <p>
              For all refund requests, billing enquiries, or cancellation requests, please contact us:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Support & Refunds</p>
                <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline font-medium">{brand.supportEmail}</a>
                <p className="text-gray-500 text-xs mt-1">Response within 2 business days</p>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">General Contact</p>
                <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline font-medium">{brand.contactEmail}</a>
                <p className="text-gray-500 text-xs mt-1">For all other enquiries</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Please include your registered email address and transaction ID in all refund-related communications to help us assist you faster.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/terms" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Terms &amp; Conditions →</Link>
              <Link to="/privacy" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Privacy Policy →</Link>
              <Link to="/contact" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Contact Us →</Link>
            </div>
          </Section>

        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 text-xs mt-12"
        >
          {brand.copyright} &nbsp;|&nbsp; <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link> &nbsp;·&nbsp; <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link> &nbsp;·&nbsp; <Link to="/refund" className="hover:text-gray-400 transition-colors">Refunds</Link>
        </motion.p>
      </div>
    </div>
  );
}
