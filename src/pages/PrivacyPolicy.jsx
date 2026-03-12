import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, Eye, Database, Globe, Lock, RefreshCw, Mail, BookOpen, FileText } from 'lucide-react';
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

export default function PrivacyPolicy() {
  const brand = useBranding();

  const toc = [
    { id: 'overview', label: '1. Overview & Scope' },
    { id: 'data-collected', label: '2. Information We Collect' },
    { id: 'how-we-use', label: '3. How We Use Your Data' },
    { id: 'data-sharing', label: '4. Data Sharing & Disclosure' },
    { id: 'cookies', label: '5. Cookies & Tracking' },
    { id: 'data-security', label: '6. Data Security' },
    { id: 'retention', label: '7. Data Retention' },
    { id: 'your-rights', label: '8. Your Rights' },
    { id: 'children', label: "9. Children's Privacy" },
    { id: 'third-party', label: '10. Third-Party Services' },
    { id: 'changes', label: '11. Changes to This Policy' },
    { id: 'contact', label: '12. Contact Us' },
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
            <Shield className="w-4 h-4" />
            Privacy & Data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {brand.appName} is committed to protecting your privacy. This policy explains how we collect, use, store, and protect your personal information.
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
            { icon: Lock, label: 'Data Not Sold', sub: 'We never sell your personal data' },
            { icon: Shield, label: 'Encrypted Storage', sub: 'Industry-standard security' },
            { icon: Eye, label: 'Transparent', sub: 'You control your data' },
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

          <Section id="overview" icon={FileText} title="1. Overview & Scope">
            <p>
              This Privacy Policy applies to {brand.appName} (referred to as "we", "us", or "our"), a B2B SaaS recruitment automation platform operated at <strong className="text-white">recrify.co</strong> and <strong className="text-white">myproject.duckdns.org</strong> (collectively, the "Platform").
            </p>
            <p>
              This policy governs how we collect, use, retain, and protect the personal information of:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Recruiters</strong> — companies and hiring managers who use our software tools for candidate management</Li>
              <Li><strong className="text-white">Candidates</strong> — individuals who upload resumes and apply to jobs via the platform</Li>
              <Li><strong className="text-white">Visitors</strong> — anyone who accesses our website or marketing pages</Li>
            </ul>
            <p>
              By using the Platform, you consent to the data practices described in this policy. This policy is to be read alongside our <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>.
            </p>
          </Section>

          <Section id="data-collected" icon={Database} title="2. Information We Collect">
            <h3 className="text-white font-semibold">2.1 Information You Provide Directly</h3>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Account Data:</strong> Name, email address, company name, job title, and password (stored as a hash)</Li>
              <Li><strong className="text-white">Resume Data:</strong> Uploaded PDF/DOCX files containing educational background, work experience, skills, contact details, and other information voluntarily submitted by candidates</Li>
              <Li><strong className="text-white">Job Descriptions:</strong> Text and structured data provided by recruiters to define role requirements</Li>
              <Li><strong className="text-white">Payment Data:</strong> Billing address and payment method details — processed directly by our payment partner (we do not store card numbers)</Li>
              <Li><strong className="text-white">Communications:</strong> Messages sent to our support team via email</Li>
            </ul>
            <h3 className="text-white font-semibold mt-4">2.2 Information Collected Automatically</h3>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Log Data:</strong> IP address, browser type, operating system, referring URL, and pages visited</Li>
              <Li><strong className="text-white">Usage Data:</strong> Features used, actions taken within the platform, timestamps, and session duration</Li>
              <Li><strong className="text-white">Device Data:</strong> Device type, screen resolution, and browser language</Li>
            </ul>
            <h3 className="text-white font-semibold mt-4">2.3 AI-Processed Data</h3>
            <p>
              When resumes are uploaded, our AI systems extract structured information including skills, experience, education, and metadata for scoring and analysis purposes. This processing occurs within our controlled infrastructure.
            </p>
          </Section>

          <Section id="how-we-use" icon={Eye} title="3. How We Use Your Data">
            <p>We use the information we collect for the following purposes:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Service Delivery:</strong> To operate the platform, process resumes, generate AI scores, manage job pipelines, and enable interview scheduling</Li>
              <Li><strong className="text-white">Account Management:</strong> To create and manage your account, verify your email, and maintain your session</Li>
              <Li><strong className="text-white">Payment Processing:</strong> To process subscription payments via our payment gateway partner</Li>
              <Li><strong className="text-white">Communication:</strong> To send email notifications related to your account, payment confirmations, and important platform updates</Li>
              <Li><strong className="text-white">Security:</strong> To detect, investigate, and prevent fraudulent activity, abuse, and security incidents</Li>
              <Li><strong className="text-white">Compliance:</strong> To comply with applicable legal obligations</Li>
              <Li><strong className="text-white">Improvement:</strong> To analyse usage patterns and improve platform features (aggregated, anonymised data only)</Li>
            </ul>
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm">
              <strong className="text-green-400 block mb-1">✓ Our Commitment</strong>
              We do not use your data for advertising, profiling for third-party marketing, or any purpose beyond providing and improving our Service. We do not sell, rent, or trade your personal information to any third party.
            </div>
          </Section>

          <Section id="data-sharing" icon={Globe} title="4. Data Sharing & Disclosure">
            <p>We do not sell your personal data. We may share your data only in the following limited circumstances:</p>
            <h3 className="text-white font-semibold mt-2">4.1 Service Providers</h3>
            <p>We engage trusted third-party providers to assist in operating the Service:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Payment Gateways</strong> (e.g., Razorpay): To process subscription payments securely</Li>
              <Li><strong className="text-white">Email Service Providers</strong> (e.g., Brevo/Sendinblue): To send transactional and notification emails</Li>
              <Li><strong className="text-white">Cloud Infrastructure</strong> (e.g., DigitalOcean): To host and store platform data on secured servers</Li>
              <Li><strong className="text-white">Authentication</strong> (e.g., Google Firebase): For secure user authentication</Li>
            </ul>
            <p>All service providers are contractually obligated to use your data only as directed by us and in compliance with applicable laws.</p>
            <h3 className="text-white font-semibold mt-4">4.2 Legal Requirements</h3>
            <p>
              We may disclose your data if required to do so by law, court order, or governmental authority, or if we believe in good faith that such disclosure is necessary to protect our legal rights, enforce our Terms, or protect the safety of any person.
            </p>
            <h3 className="text-white font-semibold mt-4">4.3 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of all or part of our assets, user data may be transferred as part of that transaction. We will notify users via email and/or a prominent notice on our website prior to any such transfer.
            </p>
          </Section>

          <Section id="cookies" icon={Eye} title="5. Cookies & Tracking Technologies">
            <p>
              {brand.appName} uses cookies and similar technologies to operate and improve the Service. We use the following types:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <Li><strong className="text-white">Essential Cookies:</strong> Required for the platform to function (e.g., authentication tokens, session management). Cannot be disabled.</Li>
              <Li><strong className="text-white">Functional Cookies:</strong> Remember your preferences and platform settings (e.g., theme, language).</Li>
              <Li><strong className="text-white">Analytics Cookies:</strong> Collect anonymised usage data to help us understand how users interact with the platform. No personal identifiers are included.</Li>
            </ul>
            <p>
              We do not use third-party advertising cookies or tracking pixels. You can control cookies through your browser settings; however, disabling essential cookies may prevent certain features from working correctly.
            </p>
          </Section>

          <Section id="data-security" icon={Lock} title="6. Data Security">
            <p>
              We take the security of your data seriously and implement the following measures:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL (HTTPS)</Li>
              <Li><strong className="text-white">Password Security:</strong> Passwords are hashed using a strong algorithm (bcrypt/Argon2) and never stored in plain text</Li>
              <Li><strong className="text-white">Access Controls:</strong> Platform access is restricted to authenticated and authorised users only. Internal access is granted on a need-to-know basis</Li>
              <Li><strong className="text-white">Secure Hosting:</strong> Data is hosted on secured cloud infrastructure with firewall protection and regular security monitoring</Li>
              <Li><strong className="text-white">Payment Security:</strong> Payment card data is handled exclusively by our PCI-DSS-compliant payment gateway partner. We do not store card numbers</Li>
            </ul>
            <p>
              While we use commercially reasonable security measures, no method of transmission or storage is 100% secure. In the event of a data breach affecting your rights, we will notify you as required by applicable law.
            </p>
          </Section>

          <Section id="retention" icon={RefreshCw} title="7. Data Retention">
            <p>We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Account Data:</strong> Retained for the duration of your account and for up to 30 days after deletion, to facilitate account recovery</Li>
              <Li><strong className="text-white">Resume & Candidate Data:</strong> Retained for as long as your recruiter account is active. You may request deletion at any time</Li>
              <Li><strong className="text-white">Payment Records:</strong> Retained for a minimum of 7 years as required by applicable financial and tax regulations</Li>
              <Li><strong className="text-white">Log Data:</strong> Retained for up to 90 days for security monitoring purposes</Li>
            </ul>
            <p>
              After the applicable retention period, data is securely deleted or anonymised. You may request earlier deletion of your data by contacting us (subject to our legal retention obligations).
            </p>
          </Section>

          <Section id="your-rights" icon={Shield} title="8. Your Rights">
            <p>
              Subject to applicable law, you have the following rights regarding your personal data:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <Li><strong className="text-white">Right to Access:</strong> Request a copy of the personal data we hold about you</Li>
              <Li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate or incomplete data</Li>
              <Li><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data (subject to legal retention obligations)</Li>
              <Li><strong className="text-white">Right to Portability:</strong> Request your data in a structured, machine-readable format</Li>
              <Li><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time, without affecting the lawfulness of processing before withdrawal</Li>
              <Li><strong className="text-white">Right to Object:</strong> Object to processing of your data in certain circumstances</Li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a>. We will respond within 30 days. We may ask you to verify your identity before processing your request.
            </p>
          </Section>

          <Section id="children" icon={Shield} title="9. Children's Privacy">
            <p>
              The {brand.appName} Service is not directed to children under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately at <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline">{brand.supportEmail}</a> and we will promptly delete that information.
            </p>
          </Section>

          <Section id="third-party" icon={Globe} title="10. Third-Party Services & Links">
            <p>
              The Platform may contain links to third-party websites or integrate with third-party services. These services have their own privacy policies, and we are not responsible for their practices. We encourage you to review the privacy policies of any third-party service you interact with.
            </p>
            <p>Key third parties we integrate with include:</p>
            <ul className="space-y-1 list-none pl-2">
              <Li><strong className="text-white">Google Firebase</strong> — Authentication service (<a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Privacy</a>)</Li>
              <Li><strong className="text-white">Razorpay</strong> — Payment processing (<a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Razorpay Privacy</a>)</Li>
              <Li><strong className="text-white">Brevo</strong> — Email delivery (<a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Brevo Privacy</a>)</Li>
            </ul>
          </Section>

          <Section id="changes" icon={RefreshCw} title="11. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy to reflect changes in our practices or applicable laws. When we make material changes, we will:
            </p>
            <ul className="space-y-1 list-none pl-2">
              <Li>Update the "Last Updated" date at the top of this page</Li>
              <Li>Send an email notification to registered users</Li>
              <Li>Display a notice on the platform before changes take effect</Li>
            </ul>
            <p>
              Your continued use of the Service after the effective date of any revised policy constitutes your acceptance of the changes.
            </p>
          </Section>

          <Section id="contact" icon={Mail} title="12. Contact Us">
            <p>
              If you have any questions about this Privacy Policy, wish to exercise your data rights, or have a privacy-related concern, please reach out to us:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">General Contact</p>
                <a href={`mailto:${brand.contactEmail}`} className="text-primary hover:underline font-medium">{brand.contactEmail}</a>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Privacy & Data Requests</p>
                <a href={`mailto:${brand.supportEmail}`} className="text-primary hover:underline font-medium">{brand.supportEmail}</a>
              </div>
            </div>
            <p className="mt-4">We aim to respond to all data-related requests within 30 days.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/terms" className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:text-primary hover:border-primary/40 transition-colors duration-200">Terms &amp; Conditions →</Link>
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
