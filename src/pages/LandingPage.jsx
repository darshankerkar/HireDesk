import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload, Cpu, ShieldCheck, Users, Zap, Target, TrendingUp, Lock } from 'lucide-react';
import RoleSelectionModal from '../components/RoleSelectionModal';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState('signup'); // 'signup' or 'login'

  const handleSignUpClick = () => {
    setRoleSelectionMode('signup');
    setRoleSelectionOpen(true);
  };

  const handleLoginClick = () => {
    setRoleSelectionMode('login');
    setRoleSelectionOpen(true);
  };

  return (
    <>
      <div className="bg-dark min-h-screen text-secondary overflow-hidden">
        {/* Navigation Bar for Landing Page */}
        <nav className="fixed w-full z-50 bg-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="text-3xl font-display font-bold text-white tracking-tighter">
                  Hire<span className="text-primary">Desk</span>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLoginClick}
                  className="px-5 py-2 rounded-full bg-surface text-white text-sm font-medium hover:bg-primary hover:text-dark transition-colors duration-300 border border-gray-700 hover:border-primary"
                >
                  Login
                </button>
                <button
                  onClick={handleSignUpClick}
                  className="px-5 py-2 rounded-full bg-primary text-dark text-sm font-medium hover:bg-white transition-colors duration-300"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-dark to-dark opacity-50"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Large Centered Logo */}
            {/* Large Centered Logo Removed as per user request */}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-primary/30 rounded-full mb-8 mt-12"
            >
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-300">Login Required to Access Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tighter"
            >
              HIRE <span className="text-primary">FASTER.</span><br />
              BETTER. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">SMARTER.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light"
            >
              The AI-powered screening platform that automates resume parsing, scoring, and verification.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleSignUpClick}
                className="inline-flex items-center px-8 py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-colors duration-300"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-primary text-primary font-bold text-lg rounded-full hover:bg-primary hover:text-dark transition-colors duration-300"
              >
                Login to Continue
              </button>
            </motion.div>
          </div>
        </section>

        {/* Login Required Notice */}
        <section className="py-16 bg-surface border-y border-gray-800">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Secure Access Required
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                To use HireDesk's powerful recruitment tools, you need to create an account or login.
                All features including resume upload, bulk processing, AI scoring, and dashboard analytics
                are available after authentication.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Secure Authentication</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Data Privacy</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Personalized Experience</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-dark">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to streamline your recruitment process
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              {/* Feature 1 */}
              <motion.div variants={fadeInUp} className="p-8 bg-surface rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
                <Upload className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Resume Parsing</h3>
                <p className="text-gray-400">Instantly extract structured data from PDF and DOCX files using advanced NLP.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={fadeInUp} className="p-8 bg-surface rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
                <Cpu className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">AI Scoring</h3>
                <p className="text-gray-400">Automatically rank candidates based on job description relevance using vector embeddings.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl font-display font-bold mb-8">Data-Driven <br /><span className="text-primary">Hiring Decisions</span></h2>
                <ul className="space-y-6">
                  <li className="flex items-center text-xl text-gray-300">
                    <CheckCircle className="h-6 w-6 text-primary mr-4" />
                    Reduce screening time by 90%
                  </li>
                  <li className="flex items-center text-xl text-gray-300">
                    <CheckCircle className="h-6 w-6 text-primary mr-4" />
                    Eliminate unconscious bias
                  </li>
                  <li className="flex items-center text-xl text-gray-300">
                    <CheckCircle className="h-6 w-6 text-primary mr-4" />
                    Verify candidate authenticity
                  </li>
                  <li className="flex items-center text-xl text-gray-300">
                    <CheckCircle className="h-6 w-6 text-primary mr-4" />
                    Improve quality of hire
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary blur-[100px] opacity-20"></div>
                <div className="relative bg-dark p-8 rounded-3xl border border-gray-800">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-gray-400 text-sm">Total Candidates</p>
                      <p className="text-4xl font-bold">1,284</p>
                    </div>
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">75% Match Rate Improvement</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-dark">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Why Choose <span className="text-primary">HireDesk?</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Built for modern recruitment teams who demand efficiency and accuracy
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeInUp} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Process hundreds of resumes in seconds, not hours</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Highly Accurate</h3>
                <p className="text-gray-400">AI-powered matching ensures the best candidates rise to the top</p>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Scalable Solution</h3>
                <p className="text-gray-400">From startups to enterprises, grow without limits</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Ready to Transform Your <span className="text-primary">Hiring Process?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10">
                Join thousands of recruiters who are already using HireDesk to find the perfect candidates faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleSignUpClick}
                  className="inline-flex items-center px-10 py-5 bg-primary text-dark font-bold text-xl rounded-full hover:bg-white transition-colors duration-300"
                >
                  Start Free Trial <ArrowRight className="ml-2 h-6 w-6" />
                </button>
                <button
                  onClick={handleLoginClick}
                  className="inline-flex items-center px-10 py-5 bg-transparent border-2 border-gray-700 text-white font-bold text-xl rounded-full hover:border-primary hover:text-primary transition-colors duration-300"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-dark border-t border-gray-800">
          <div className="container mx-auto px-6 text-center">
            <div className="mb-6">
              <div className="text-3xl font-display font-bold text-white tracking-tighter inline-block">
                Hire<span className="text-primary">Desk</span>
              </div>
            </div>
            <p className="text-gray-500 mb-4">AI-Powered Recruitment Platform</p>
            <p className="text-gray-600 text-sm">© 2024 HireDesk. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <RoleSelectionModal
        isOpen={roleSelectionOpen}
        onClose={() => setRoleSelectionOpen(false)}
        mode={roleSelectionMode}
      />
    </>
  );
}
