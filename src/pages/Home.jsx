import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload, Cpu, ShieldCheck, Users, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePreloadedData } from '../contexts/DataPreloadContext';
import { useBranding } from '../contexts/BrandingContext';

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
  const [userData, setUserData] = useState(null);
  const { platformStats, jobs } = usePreloadedData() || {};
  const brand = useBranding();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    avgScore: 0
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Use preloaded platform stats instead of fetching all candidates
  useEffect(() => {
    if (platformStats) {
      setStats({
        totalCandidates: platformStats.total_candidates || 0,
        avgScore: platformStats.avg_score || 0
      });
    } else if (jobs && jobs.length > 0) {
      // Fallback: compute from jobs candidate_count
      let totalCandidates = 0;
      for (const job of jobs) {
        totalCandidates += job.candidate_count || 0;
      }
      setStats(prev => ({ ...prev, totalCandidates }));
    }
  }, [platformStats, jobs]);


  const isRecruiter = userData?.role === 'RECRUITER';
  const isPaid = userData?.is_paid;
  const dashboardUrl = (isRecruiter && isPaid) ? '/recruiter-dashboard' : '/candidate-dashboard';

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
            AI-powered recruitment automation software (SaaS platform) for companies.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link to={dashboardUrl} className="inline-flex items-center px-8 py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-colors duration-300">
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


            {/* Feature 3 - Bulk Upload (PAID) */}
            <motion.div variants={fadeInUp} className="relative p-8 bg-dark rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300 overflow-hidden">
                <div className="absolute top-4 right-4 px-2 py-1 bg-primary text-dark text-xs font-bold rounded">PAID</div>
                <FileSpreadsheet className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Bulk Upload</h3>
                <p className="text-gray-400">Upload multiple candidates at once using CSV or Excel files for rapid processing.</p>
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
              <h2 className="text-5xl font-display font-bold mb-8">Data-Driven <br /><span className="text-primary">Recruitment Decisions</span></h2>
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
                    <p className="text-4xl font-bold">{stats.totalCandidates.toLocaleString()}</p>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(stats.avgScore, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-400">{stats.avgScore}% Match Rate Improvement</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-10 pb-8 bg-surface border-t border-[#2a2a2a] mt-20">
        <div className="container mx-auto px-6 text-center max-w-[700px]">
          <p className="text-[#9CA3AF] text-sm leading-[1.6] mb-8 mx-auto">
            {brand.description}<br className="hidden md:block"/>
            We provide software tools for companies and do not operate as a job placement or recruitment agency.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-10 text-sm font-medium text-gray-300">
            <Link to="/terms" className="hover:text-primary transition-colors duration-300">Terms & Conditions</Link>
            <span className="text-gray-600 hidden md:inline">|</span>
            <Link to="/privacy" className="hover:text-primary transition-colors duration-300">Privacy Policy</Link>
            <span className="text-gray-600 hidden md:inline">|</span>
            <Link to="/refund" className="hover:text-primary transition-colors duration-300">Refund Policy</Link>
            <span className="text-gray-600 hidden md:inline">|</span>
            <Link to="/contact" className="hover:text-primary transition-colors duration-300">Contact</Link>
          </div>
          
          <p className="text-[#9CA3AF] text-sm mb-2">Built for modern hiring teams.</p>
          <p className="text-gray-600 text-sm">{brand.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
