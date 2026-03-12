import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, FileText, CreditCard, AlertTriangle, Lock, Users, BookOpen, Mail } from 'lucide-react';
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

export default function TermsAndConditions() {
  const brand = useBranding();

  const toc = [
    { id: 'acceptance', label: '1. Acceptance of Terms' },
    { id: 'description', label: '2. Description of Services' },
    { id: 'eligibility', label: '3. Eligibility' },
    { id: 'accounts', label: '4. User Accounts' },
    { id: 'subscription', label: '5. Subscription & Payments' },
    { id: 'acceptable-use', label: '6. Acceptable Use Policy' },
    { id: 'ip', label: '7. Intellectual Property' },
    { id: 'data', label: '8. Data & Privacy' },
    { id: 'disclaimer', label: '9. Disclaimer of Services' },
    { id: 'liability', label: '10. Limitation of Liability' },
    { id: 'indemnification', label: '11. Indemnification' },
    { id: 'termination', label: '12. Termination' },
    { id: 'governing-law', label: '13. Governing Law' },
    { id: 'changes', label: '14. Changes to These Terms' },
    { id: 'contact', label: '15. Contact Us' },
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
            <FileText className="w-4 h-4" />
            Legal Document
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please read these Terms &amp; Conditions carefully before using {brand.appName}. By accessing or using our platform, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last Updated: {LAST_UPDATED}</p>
        </motion.div>

        {/* Quick Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Shield, label: 'SaaS Software Platform', sub: 'Subscription-based access' },
            { icon: CreditCard, label: 'Secure Payments', sub: 'Processed via payment gateway' },
            { icon: Lock, label: 'India Applicable', sub: 'Governed by Indian law' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/8 bg-white/[0.02]">
              <item.icon className="w-5 h-5 text-primary shrink-0" />
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

          <Section id="acceptance" icon={FileText} title="1. Acceptance of Terms">
            <p>
              By accessing, browsing, or using the {brand.appName} platform (the "Service"), you ("User", "you", or "your") agree to be legally bound by these Terms &amp; Conditions ("Terms"), our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>, all of which are incorporated herein by reference.
            </p>
            <p>
              If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms, in which case the terms "you" or "your" shall refer to such entity.
            </p>
            <p>
              If you do not agree with any part of these Terms, you must immediately discontinue use of the Service.
            </p>
          </Section>

          <Section id="description" icon={Users} title="2. Description of Services">
            <p>
              {brand.appName} is a <strong className="text-white">B2B Software-as-a-Service (SaaS)</strong> platform that provides AI-powered recruitment automation tools to companies and hiring teams. Our services include, but are not limited to:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>AI-based resume parsing, structured data extraction, and candidate profiling</Li>
              <Li>Automated candidate scoring based on job description relevance</Li>
              <Li>Bulk resume upload and processing via CSV/Excel files</Li>
              <Li>Job posting and candidate pipeline management dashboard</Li>
              <Li>Interview scheduling and virtual interview room management</Li>
              <Li>Resume Analyzer tool for standalone skill gap analysis</Li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
              <strong className="text-amber-400 block mb-1">⚠ Important Disclaimer</strong>
              {brand.appName} is a <em>software platform</em> only. We do <strong>not</strong> provide job placement services, recruitment agency services, staffing services, or candidate placement guarantees. We are not an employment agency. Subscriptions grant access to software tools, not to any employment outcome.
            </div>
          </Section>

          <Section id="eligibility" icon={Shield} title="3. Eligibility">
            <p>To use the Service, you must:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Be at least 18 years of age</Li>
              <Li>Have the legal capacity to enter into a binding agreement</Li>
              <Li>Not be a person barred from receiving services under the laws of India or other applicable jurisdictions</Li>
              <Li>Provide accurate, current, and complete registration information</Li>
            </ul>
            <p>
              <strong className="text-white">Recruiter accounts</strong> are intended for representatives of registered companies or organizations. By registering as a Recruiter, you confirm that you are acting in a professional business capacity.
            </p>
            <p>
              <strong className="text-white">Candidate accounts</strong> are intended for individual job seekers who wish to use the platform for resume analysis and job application purposes.
            </p>
          </Section>

          <Section id="accounts" icon={Lock} title="4. User Accounts">
            <p>To access features of the Service, you must register for an account. You agree to:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Provide accurate and complete information during registration</Li>
              <Li>Keep your login credentials confidential and not share them with any third party</Li>
              <Li>Notify us immediately at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> upon becoming aware of any unauthorised use of your account</Li>
              <Li>Accept full responsibility for all activities that occur under your account</Li>
              <Li>Not create multiple accounts to circumvent restrictions or trial limits</Li>
            </ul>
            <p>
              {brand.appName} reserves the right to disable or suspend accounts found to be in violation of these Terms or for any other reason at our sole discretion.
            </p>
            <p>
              You acknowledge that {brand.appName} implements email verification before full platform access is granted, and that your account data is tied to your verified email address.
            </p>
          </Section>

          <Section id="subscription" icon={CreditCard} title="5. Subscription & Payments">
            <p>
              Access to the Recruiter-tier features of {brand.appName} requires a paid subscription. All subscription fees are quoted in Indian Rupees (INR) or USD as displayed in the Pricing page at the time of purchase.
            </p>
            <h3 className="text-white font-semibold mt-4">5.1 Billing</h3>
            <ul className="space-y-1 list-none pl-2">
              <Li>Subscriptions are billed on a monthly or annual basis, as selected at checkout</Li>
              <Li>Payment is processed securely through a licensed third-party payment gateway</Li>
              <Li>By providing payment details, you authorise us to charge you the applicable subscription fee</Li>
              <Li>All amounts are due in advance at the beginning of each billing cycle</Li>
            </ul>
            <h3 className="text-white font-semibold mt-4">5.2 Auto-Renewal</h3>
            <p>
              Subscriptions automatically renew at the end of each billing period at the then-current rate unless cancelled prior to the renewal date. You are responsible for cancelling your subscription before renewal if you do not wish to continue.
            </p>
            <h3 className="text-white font-semibold mt-4">5.3 Price Changes</h3>
            <p>
              {brand.appName} reserves the right to modify subscription pricing at any time. Any price changes will be communicated to you via email at least 14 days before taking effect. Continued use of the Service after a price change constitutes acceptance of the new pricing.
            </p>
            <h3 className="text-white font-semibold mt-4">5.4 Taxes</h3>
            <p>
              Subscription prices are exclusive of applicable taxes, including GST. Applicable taxes will be added at checkout as required by law.
            </p>
            <h3 className="text-white font-semibold mt-4">5.5 Refunds</h3>
            <p>
              Please refer to our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link> for full details on refund eligibility and procedures.
            </p>
          </Section>

          <Section id="acceptable-use" icon={AlertTriangle} title="6. Acceptable Use Policy">
            <p>You agree not to use the Service in any manner that:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Violates any applicable local, national, or international law or regulation</Li>
              <Li>Uploads forged, fabricated, or fraudulent resumes, documents, or credentials</Li>
              <Li>Infringes any intellectual property rights of any party</Li>
              <Li>Transmits any unsolicited advertising, spam, or promotional material</Li>
              <Li>Attempts to reverse-engineer, decompile, or extract source code from the platform</Li>
              <Li>Uses automated bots, scrapers, or data mining tools on the platform without prior written consent</Li>
              <Li>Discriminates against candidates on the basis of caste, religion, race, gender, disability, or any other protected characteristic</Li>
              <Li>Impersonates any person or entity, or falsely represents your affiliation with any person or entity</Li>
              <Li>Disrupts, overloads, or interferes with the integrity or performance of the Service</Li>
            </ul>
            <p>
              Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account without refund.
            </p>
          </Section>

          <Section id="ip" icon={BookOpen} title="7. Intellectual Property">
            <p>
              The Service and all associated content, features, functionality, source code, design, text, graphics, logos, AI models, and trademarks (collectively, the "Content") are owned by or licensed to {brand.appName} and are protected by applicable intellectual property laws.
            </p>
            <p>
              Nothing in these Terms grants you any right to use any trademark, service mark, logo, or trade name of {brand.appName}. You may not copy, modify, adapt, translate, distribute, sell, or create derivative works from any Content without our prior written consent.
            </p>
            <p>
              You retain ownership of any data you upload to our platform (e.g., resumes, job descriptions). By uploading such data, you grant {brand.appName} a limited, non-exclusive, royalty-free licence to process and store that data solely for the purpose of providing the Service to you.
            </p>
          </Section>

          <Section id="data" icon={Lock} title="8. Data & Privacy">
            <p>
              Your use of the Service is subject to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which explains what information we collect, how we use it, and your rights regarding your personal data.
            </p>
            <p>
              You are solely responsible for ensuring that any personal data you upload about third parties (including candidate resumes) is collected and processed in compliance with applicable data protection laws, including obtaining any necessary consents.
            </p>
            <p>
              {brand.appName} implements industry-standard encryption, secure storage, and access controls to protect data processed through the platform.
            </p>
          </Section>

          <Section id="disclaimer" icon={AlertTriangle} title="9. Disclaimer of Services">
            <p>
              THE {brand.appName.toUpperCase()} SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</Li>
              <Li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</Li>
              <Li>WARRANTIES REGARDING THE ACCURACY OF AI SCORING OR RESUME ANALYSIS RESULTS</Li>
            </ul>
            <p>
              {brand.appName} does not guarantee any specific hiring outcome, candidate quality, or reduction in time-to-hire. AI scoring results are indicative and should be used as one of several factors in hiring decisions — not as the sole determinant.
            </p>
            <p>
              {brand.appName} is a software tool and does not act as a recruitment consultant, employment agency, or placement service.
            </p>
          </Section>

          <Section id="liability" icon={Shield} title="10. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {brand.appName.toUpperCase()} AND ITS DIRECTORS, EMPLOYEES, PARTNERS, AND AFFILIATES SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Any indirect, incidental, special, consequential, or punitive damages</Li>
              <Li>Loss of profits, revenue, data, goodwill, or business opportunities</Li>
              <Li>Damages arising from your reliance on AI scoring, analysis results, or platform content</Li>
              <Li>Interruption or cessation of the Service for any reason</Li>
              <Li>Unauthorised access to or alteration of your data due to circumstances beyond our reasonable control</Li>
            </ul>
            <p>
              OUR AGGREGATE LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER, AND REGARDLESS OF THE FORM OF ACTION, SHALL NOT EXCEED THE TOTAL SUBSCRIPTION FEES PAID BY YOU TO {brand.appName.toUpperCase()} IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
          </Section>

          <Section id="indemnification" icon={Shield} title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless {brand.appName}, its officers, directors, employees, agents, and service providers from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in any way connected with:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Your access to or use of the Service</Li>
              <Li>Your violation of these Terms</Li>
              <Li>Your violation of any third-party right, including privacy or intellectual property rights</Li>
              <Li>Any fraudulent or forged documents uploaded to the platform</Li>
              <Li>Your violation of any applicable law or regulation</Li>
            </ul>
          </Section>

          <Section id="termination" icon={AlertTriangle} title="12. Termination">
            <p>
              <strong className="text-white">You</strong> may terminate your account at any time by contacting us at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a>. Upon cancellation, your access will remain active until the end of your current billing period.
            </p>
            <p>
              <strong className="text-white">{brand.appName}</strong> reserves the right to suspend or terminate your account immediately, without prior notice or liability, for any of the following reasons:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Violation of these Terms or our Acceptable Use Policy</Li>
              <Li>Non-payment of subscription fees</Li>
              <Li>Fraudulent, abusive, or illegal use of the platform</Li>
              <Li>Uploading forged or fabricated documents</Li>
              <Li>Any other conduct that we believe is harmful to other users, the platform, or third parties</Li>
            </ul>
            <p>
              Upon termination, your right to use the Service will cease immediately. Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to ownership, disclaimers, indemnification, and limitation of liability.
            </p>
          </Section>

          <Section id="governing-law" icon={BookOpen} title="13. Governing Law & Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any dispute, controversy, or claim arising out of or relating to these Terms, the Service, or any breach thereof shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
            <p>
              Before initiating any formal legal proceedings, you agree to first attempt to resolve any dispute by contacting us in good faith at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a>.
            </p>
            <p>
              Nothing in this clause shall prevent either party from seeking immediate injunctive or other equitable relief from a court of competent jurisdiction where necessary to prevent irreparable harm.
            </p>
          </Section>

          <Section id="changes" icon={FileText} title="14. Changes to These Terms">
            <p>
              {brand.appName} reserves the right to modify these Terms at any time. When we make material changes, we will:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Update the "Last Updated" date at the top of this page</Li>
              <Li>Send an email notification to all registered account holders</Li>
              <Li>Display a notice on the platform for a reasonable period</Li>
            </ul>
            <p>
              Your continued use of the Service after any changes become effective constitutes your acceptance of the new Terms. If you do not agree to the amended Terms, you must stop using the Service and cancel your subscription.
            </p>
          </Section>

          <Section id="contact" icon={Mail} title="15. Contact Us">
            <p>If you have any questions, concerns, or requests regarding these Terms, please contact us:</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email (General)</p>
                <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline font-medium">{brand.contactEmail}</a>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email (Support)</p>
                <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline font-medium">{brand.supportEmail}</a>
              </div>
            </div>
            <p className="mt-4">We aim to respond to all enquiries within 2 business days.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/privacy" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Privacy Policy →</Link>
              <Link to="/refund" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Refund Policy →</Link>
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
