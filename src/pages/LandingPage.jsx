import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload, Cpu, ShieldCheck, Users, Zap, Target, TrendingUp, Lock, FileSpreadsheet, Sparkles, Star, Eye, BarChart3, FileCheck } from 'lucide-react';
import RoleSelectionModal from '../components/RoleSelectionModal';
import SignUpModal from '../components/SignUpModal';
import { HeroBackground } from '../components/HeroBackground';
import axios from 'axios';
import config from '../../config';
import { useBranding } from '../contexts/BrandingContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// 3D Product Mockup Component
const ProductMockup = ({ imageSrc, title, description, reverse = false, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}
    >
      <div className={reverse ? 'lg:col-start-2' : ''}>
        <motion.h3
          className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-[-0.02em] bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: delay * 0.5 + 0.1 }}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-xl text-gray-400 leading-relaxed"
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: delay * 0.5 + 0.15 }}
        >
          {description}
        </motion.p>
      </div>

      <motion.div
        className={`relative ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
        initial={{ opacity: 0, scale: 0.95, rotateY: reverse ? -10 : 10 }}
        animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
        transition={{ duration: 0.5, delay: delay * 0.5 + 0.2, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{
          scale: 1.02,
          rotateY: reverse ? -5 : 5,
          transition: { duration: 0.4 }
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-3xl -z-10"></div>

        {/* Image container with 3D effect */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm group">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};



export default function LandingPage() {
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState('signup');
  const [recruiterSignUpOpen, setRecruiterSignUpOpen] = useState(false);
  const [candidateSignUpOpen, setCandidateSignUpOpen] = useState(false);
  const brand = useBranding();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    avgScore: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const jobsResponse = await axios.get(`${config.apiUrl}/api/recruitment/jobs/`);
      const jobs = jobsResponse.data;

      let totalCandidates = 0;
      let totalScore = 0;
      let scoreCount = 0;

      for (const job of jobs) {
        try {
          const candidatesResponse = await axios.get(
            `${config.apiUrl}/api/recruitment/jobs/${job.id}/candidates/`
          );
          const candidates = candidatesResponse.data;
          totalCandidates += candidates.length;

          candidates.forEach(candidate => {
            if (candidate.score !== null && candidate.score !== undefined) {
              totalScore += parseFloat(candidate.score);
              scoreCount++;
            }
          });
        } catch (error) {
          if (job.candidate_count) {
            totalCandidates += job.candidate_count;
          }
        }
      }

      setStats({
        totalCandidates,
        avgScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(0) : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignUpClick = () => {
    setRoleSelectionMode('signup');
    setRoleSelectionOpen(true);
  };

  const handleStartHiringClick = () => {
    setRecruiterSignUpOpen(true);
  };

  const handleStartFreeTrialClick = () => {
    setCandidateSignUpOpen(true);
  };

  const handleLoginClick = () => {
    setRoleSelectionMode('login');
    setRoleSelectionOpen(true);
  };

  return (
    <>
      <div className="bg-[#0a0a0a] min-h-screen text-secondary overflow-hidden relative">
        {/* Animated mesh background */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>


        {/* Grid overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>

        {/* Navigation Bar */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed w-full z-50 bg-[#0a0a0a]/60 backdrop-blur-xl border-b border-white/5"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <motion.div
                className="flex-shrink-0 flex items-center group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl font-display font-bold text-white tracking-[-0.02em]">
                  {brand.appNameParts.first}<span className="text-primary group-hover:text-white transition-colors duration-300">{brand.appNameParts.highlight}</span>
                </div>
              </motion.div>

              <div className="flex items-center gap-4">
                <motion.button
                  onClick={handleLoginClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm"
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={handleSignUpClick}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212, 255, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-primary text-black text-sm font-bold hover:bg-white transition-all duration-300 shadow-md shadow-primary/20"
                >
                  Sign Up
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section - Text Only, Centered in Viewport */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden perspective-[2000px]">
          <HeroBackground />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-6 relative z-10 text-center max-w-5xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 tracking-[-0.03em] leading-[1.1] text-white"
            >
              Recruitment built for <br />
              the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-gradient-slow">AI era.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
            >
              AI-powered recruitment software (SaaS platform) for companies.<br className="hidden md:block" />
              Screen and find top talent 90% faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={handleStartHiringClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-all duration-300"
              >
                <span>For Companies</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              <motion.button
                onClick={handleLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-gray-300 font-medium text-lg hover:text-white transition-colors duration-300"
              >
                Log in <ArrowRight className="ml-1 h-4 w-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Dashboard Image - Below the Fold */}
        <section className="relative py-16 overflow-hidden perspective-[2000px]">
          <div className="container mx-auto px-4 max-w-7xl perspective-[2000px]">
            <motion.div
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ opacity: 0, rotateX: 45, y: 100 }}
              whileInView={{ opacity: 1, rotateX: 25, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full aspect-[16/10] mx-auto perspective-[2000px]"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[120px] -z-10 rounded-full mix-blend-screen" />
              <div
                className="relative w-full h-full rounded-xl overflow-hidden bg-dark border border-gray-800 shadow-2xl"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-surface/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-center z-20">
                  <div className="text-xs text-gray-500 font-medium tracking-wide">Job Dashboard</div>
                </div>
                <div className="w-full h-full pt-10 bg-dark">
                  <img
                    src="/jobs.png"
                    alt="Recrify Dashboard Interface"
                    className="w-full h-auto object-cover object-top opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-20 pointer-events-none" />
                </div>
              </div>
              <div
                className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-primary/10 to-transparent blur-3xl opacity-30 pointer-events-none"
                style={{ transform: 'rotateX(180deg) scaleY(0.5)' }}
              />
            </motion.div>
          </div>
        </section>



        {/* Login Required Notice */}
        <section className="py-32 bg-surface backdrop-blur-sm border-y border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
          <div className="container mx-auto px-6 relative z-10 max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center"
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-8 backdrop-blur-sm border border-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Lock className="h-12 w-12 text-primary" />
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-[-0.02em] bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Secure Access Required
              </h2>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-3xl mx-auto">
                To use {brand.appName}'s powerful recruitment tools, you need to create an account or login.
                All features including resume upload, bulk processing, AI scoring, and dashboard analytics
                are available after authentication.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { icon: ShieldCheck, text: 'Secure Authentication' },
                  { icon: Lock, text: 'Data Privacy' },
                  { icon: Sparkles, text: 'Personalized Experience' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className="flex items-center gap-3 text-gray-300 bg-dark px-6 py-3 rounded-full border border-gray-800 hover:border-primary transition-colors duration-300"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 bg-surface">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-[-0.03em] text-white">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-400 tracking-wide">
                Everything you need to streamline your recruitment process
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              {[
                {
                  icon: Upload,
                  title: 'Resume Parsing',
                  description: 'Instantly extract structured data from PDF and DOCX files using advanced NLP.',
                },
                {
                  icon: Cpu,
                  title: 'AI Scoring',
                  description: 'Automatically rank candidates based on job description relevance using vector embeddings.',
                },
                {
                  icon: FileSpreadsheet,
                  title: 'Bulk Upload',
                  description: 'Upload multiple candidates at once using CSV or Excel files for rapid processing.',
                  badge: 'PAID'
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp} 
                  className="relative p-8 bg-dark rounded-2xl border border-gray-800 hover:border-primary transition-colors duration-300"
                >
                  {feature.badge && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-primary text-dark text-xs font-bold rounded">
                      {feature.badge}
                    </div>
                  )}
                  <feature.icon className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-28 bg-dark relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-[-0.03em]">
                Built for speed and precision
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Every feature is designed to help you clear your recruitment pipeline faster.
              </p>
            </motion.div>

            <div className="space-y-24">
              <ProductMockup
                imageSrc="/resumeanalyzer.png"
                title="AI Resume Intelligence"
                description="Instantly extract skills, experience, and education from thousands of resumes. Our AI identifies the best matches based on deep semantic understanding, not just simple keywords."
                delay={0}
              />

              <ProductMockup
                imageSrc="/resumeanalyzerrecruiter.png"
                title="Recruiter Command Center"
                description="A powerful dashboard that gives you a bird's-eye view of your entire candidate pipeline. Identify bottlenecks, track candidate progress, and collaborate with your team in real-time."
                reverse={true}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section - Animated background like hero */}
        <section className="py-24 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-dark"></div>
          
          {/* Additional glow for emphasis */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] rounded-full"></div>
          
          <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-display font-bold mb-8 tracking-[-0.03em]"
            >
              Ready to transform <br />your recruitment?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of forward-thinking companies using {brand.appName} to find the best talent, faster.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <button
                onClick={handleStartFreeTrialClick}
                className="group relative inline-flex items-center px-10 py-5 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
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

      <RoleSelectionModal
        isOpen={roleSelectionOpen}
        onClose={() => setRoleSelectionOpen(false)}
        mode={roleSelectionMode}
      />

      <SignUpModal
        isOpen={recruiterSignUpOpen}
        onClose={() => setRecruiterSignUpOpen(false)}
        preselectedRole="RECRUITER"
      />

      <SignUpModal
        isOpen={candidateSignUpOpen}
        onClose={() => setCandidateSignUpOpen(false)}
        preselectedRole="CANDIDATE"
      />

      <style>{`
        @keyframes gradient-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-slow {
          animation: gradient-slow 5s ease infinite;
        }
      `}</style>
    </>
  );
}
