import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload, Cpu, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function Home() {
  return (
    <div className="bg-dark min-h-screen text-secondary overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-dark to-dark opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-tighter"
          >
            HIRE <span className="text-primary">FASTER.</span><br />
            BETTER. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">SMARTER.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light"
          >
            The AI-powered screening platform that automates resume parsing, scoring, and verification.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link to="/dashboard" className="inline-flex items-center px-8 py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-colors duration-300">
              Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp} className="p-8 bg-dark rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
              <Upload className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Resume Parsing</h3>
              <p className="text-gray-400">Instantly extract structured data from PDF and DOCX files using advanced NLP.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeInUp} className="p-8 bg-dark rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
              <Cpu className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">AI Scoring</h3>
              <p className="text-gray-400">Automatically rank candidates based on job description relevance using vector embeddings.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeInUp} className="p-8 bg-dark rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300">
              <ShieldCheck className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Fraud Detection</h3>
              <p className="text-gray-400">Detect fake certificates and manipulated documents with OCR and anomaly detection.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-dark relative">
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
              <div className="relative bg-surface p-8 rounded-3xl border border-gray-800">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-gray-400 text-sm">Total Candidates</p>
                    <p className="text-4xl font-bold">1,284</p>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4"></div>
                </div>
                <p className="mt-4 text-sm text-gray-400">75% Match Rate Improvement</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-surface border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500">© 2024 HireDesk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
