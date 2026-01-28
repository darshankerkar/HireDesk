import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload, Cpu, ShieldCheck, Users, Zap, Target, TrendingUp, Lock, FileSpreadsheet, Sparkles, Star, Eye, BarChart3, FileCheck } from 'lucide-react';
import RoleSelectionModal from '../components/RoleSelectionModal';
import { HeroBackground } from '../components/HeroBackground';
import axios from 'axios';
import config from '../../config';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// 3D Product Mockup Component
const ProductMockup = ({ imageSrc, title, description, reverse = false, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}
    >
      <div className={reverse ? 'lg:col-start-2' : ''}>
        <motion.h3
          className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-[-0.02em] bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: reverse ? 30 : -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-xl text-gray-400 leading-relaxed"
          initial={{ opacity: 0, x: reverse ? 30 : -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        >
          {description}
        </motion.p>
      </div>

      <motion.div
        className={`relative ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
        initial={{ opacity: 0, scale: 0.9, rotateY: reverse ? -15 : 15 }}
        animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
        transition={{ duration: 1, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
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



// 3D Spline Background using HTML Canvas
const SplineBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animationFrame;
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.002;

      // Create gradient mesh effect
      for (let i = 0; i < 5; i++) {
        const x = width * (0.2 + i * 0.15) + Math.sin(time + i) * 100;
        const y = height * (0.3 + Math.sin(time * 0.5 + i) * 0.2);
        const radius = width * 0.4;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `hsla(${60 + i * 20}, 70%, 60%, 0.05)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none opacity-60" />;
};

const NoiseTexture = () => (
  <div
    className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }}
  />
);

// Spotlight Card Component relative to mouse position
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || !isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      <div className="relative h-full">
        {children}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState('signup');
  const [stats, setStats] = useState({
    totalCandidates: 0,
    avgScore: 0
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]); // Fade out faster
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Parallax for the hero image
  const heroImageY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroImageRotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]); // Tilt up as you scroll
  const heroImageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  // Mouse movement effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

        <SplineBackground />
        <NoiseTexture />

        {/* Grid overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>

        {/* Navigation Bar */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
                  Hire<span className="text-primary group-hover:text-white transition-colors duration-300">Desk</span>
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

        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden perspective-[2000px]">
          <HeroBackground />
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="container mx-auto px-6 relative z-10 text-center max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <div className="text-6xl md:text-8xl font-display font-bold text-white tracking-[-0.03em]">
                Hire<span className="text-primary">Desk</span>
              </div>
            </motion.div>



            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-8 tracking-[-0.03em] leading-[1.1] text-white"
            >
              Recruitment built for <br />
              the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-gradient-slow">AI era.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Automate resume screening, rank candidates with precision,<br className="hidden md:block" />
              and hire top talent 90% faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
            >
              <motion.button
                onClick={handleSignUpClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-all duration-300"
              >
                <span>Start Hiring</span>
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

          {/* Cinematic 3D Hero Image */}
          <div className="container mx-auto px-4 max-w-7xl perspective-[2000px]">
            <motion.div
              style={{
                y: heroImageY,
                rotateX: heroImageRotateX,
                scale: heroImageScale,
                transformStyle: 'preserve-3d'
              }}
              initial={{ opacity: 0, rotateX: 45, y: 100 }}
              animate={{ opacity: 1, rotateX: 25, y: 0 }}
              transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
              className="relative w-full aspect-[16/10] mx-auto perspective-[2000px]"
            >
              {/* Refined Backlight/Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[120px] -z-10 rounded-full mix-blend-screen" />

              {/* Main Container with Gradient Mask */}
              <div
                className="relative w-full h-full rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)'
                }}
              >
                {/* Window Controls */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-2 z-20">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
                  <div className="mx-auto text-xs text-gray-500 font-medium tracking-wide">Job Dashboard</div>
                </div>

                {/* Image Content */}
                <div className="w-full h-full pt-10 bg-[#080808]">
                  <img
                    src="/jobs.png"
                    alt="HireDesk Dashboard Interface"
                    className="w-full h-auto object-cover object-top opacity-95"
                  />

                  {/* Subtle Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-20 pointer-events-none" />
                </div>
              </div>

              {/* Reflection/Ground Glow */}
              <div
                className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-primary/10 to-transparent blur-3xl opacity-30 pointer-events-none"
                style={{ transform: 'rotateX(180deg) scaleY(0.5)' }}
              />
            </motion.div>
          </div>
        </section>



        {/* Login Required Notice */}
        <section className="py-32 bg-white/[0.02] backdrop-blur-sm border-y border-white/5 relative overflow-hidden">
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
                To use HireDesk's powerful recruitment tools, you need to create an account or login.
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
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 text-gray-300 bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
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
        <section className="py-40 bg-[#0a0a0a] relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={fadeInUp}
              className="text-center mb-24"
            >
              <h2 className="text-6xl md:text-7xl font-display font-bold mb-6 tracking-[-0.03em] bg-gradient-to-b from-white via-white to-gray-600 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-2xl text-gray-500 tracking-wide">
                Everything you need to streamline your recruitment process
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Upload,
                  title: 'Resume Parsing',
                  description: 'Instantly extract structured data from PDF and DOCX files using advanced NLP.',
                  gradient: 'from-blue-500/20 to-primary/20'
                },
                {
                  icon: Cpu,
                  title: 'AI Scoring',
                  description: 'Automatically rank candidates based on job description relevance using vector embeddings.',
                  gradient: 'from-purple-500/20 to-primary/20'
                },
                {
                  icon: FileSpreadsheet,
                  title: 'Bulk Upload',
                  description: 'Upload multiple candidates at once using CSV or Excel files for rapid processing.',
                  gradient: 'from-pink-500/20 to-primary/20',
                  badge: 'PAID'
                }
              ].map((feature, index) => (
                <SpotlightCard key={index} className="group p-10 h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  />
                  <div className="relative z-10 h-full flex flex-col">
                    {feature.badge && (
                      <div className="absolute top-0 right-0 px-3 py-1.5 bg-primary text-black text-xs font-bold rounded-full">
                        {feature.badge}
                      </div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-8 group-hover:bg-primary/20 transition-colors duration-500 border border-primary/20"
                    >
                      <feature.icon className="h-10 w-10 text-primary" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </SpotlightCard>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-40 bg-[#0a0a0a] relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-150px" }}
              variants={fadeInUp}
              className="text-center mb-32"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-[-0.03em]">
                Built for speed and precision
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Every feature is designed to help you clear your hiring queue faster.
              </p>
            </motion.div>

            <div className="space-y-40">
              <ProductMockup
                imageSrc="/resumeanalyzer.png"
                title="AI Resume Intelligence"
                description="Instantly extract skills, experience, and education from thousands of resumes. Our AI identifies the best matches based on deep semantic understanding, not just keyword matching."
                delay={0}
              />

              <ProductMockup
                imageSrc="/resumeanalyzerrecruiter.png"
                title="Recruiter Command Center"
                description="A powerful dashboard that gives you a bird's-eye view of your entire hiring pipeline. Identify bottlenecks, track candidate progress, and collaborate with your team in real-time."
                reverse={true}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-gradient-to-b from-white/[0.02] to-[#0a0a0a] relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
          <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-[-0.03em]"
            >
              Ready to automate <br /> your hiring?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of forward-thinking companies using HireDesk to find the best talent, faster.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <button
                onClick={handleSignUpClick}
                className="group relative inline-flex items-center px-10 py-5 bg-primary text-black font-bold text-lg rounded-full hover:bg-white transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 bg-[#0a0a0a] border-t border-white/5 text-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2 text-white font-bold text-xl">
                Hire<span className="text-primary">Desk</span>
              </div>
              <div className="flex gap-8 text-gray-500">
                <a href="#" className="hover:text-white transition-colors">Features</a>
                <a href="#" className="hover:text-white transition-colors">Method</a>
                <a href="#" className="hover:text-white transition-colors">Customers</a>
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">Changelog</a>
              </div>
              <div className="text-gray-600">
                © 2024 HireDesk Inc.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <RoleSelectionModal
        isOpen={roleSelectionOpen}
        onClose={() => setRoleSelectionOpen(false)}
        mode={roleSelectionMode}
      />

      <style jsx>{`
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
