import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, Activity, Plus, FileText, ArrowUpRight, ArrowRight, UserPlus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    totalResumes: 0,
    avgMatchRate: 0
  });
  const [pipelineStats, setPipelineStats] = useState({
    highMatch: 0,
    mediumMatch: 0,
    lowMatch: 0
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        api.get('/recruitment/jobs/'),
        api.get('/recruitment/candidates/')
      ]);

      // Filter jobs by current user's email
      // Include jobs with null email (legacy) or matching email (new)
      const allJobs = jobsRes.data;
      const userJobs = allJobs.filter(job => 
        !job.posted_by_email || job.posted_by_email === currentUser?.email
      );
      
      // Get candidates only for user's jobs
      const allCandidates = candidatesRes.data;
      const userJobIds = userJobs.map(j => j.id);
      const userCandidates = allCandidates.filter(c => userJobIds.includes(c.job));

      const activeJobs = userJobs.filter(job => job.is_active).length;
      const totalCandidates = userCandidates.length;
      const totalResumes = userCandidates.filter(c => c.resume).length;

      // Calculate Average Match Rate
      let avgMatchRate = 0;
      let highMatch = 0;
      let mediumMatch = 0;
      let lowMatch = 0;

      if (totalCandidates > 0) {
        const totalScore = userCandidates.reduce((sum, c) => sum + (c.score || 0), 0);
        avgMatchRate = Math.round(totalScore / totalCandidates);
        
        userCandidates.forEach(c => {
          const score = c.score || 0;
          if (score >= 80) highMatch++;
          else if (score >= 50) mediumMatch++;
          else lowMatch++;
        });
      }

      setStats({
        activeJobs,
        totalCandidates,
        totalResumes,
        avgMatchRate
      });
      
      setPipelineStats({
        highMatch,
        mediumMatch,
        lowMatch
      });

      // Get recent items - sorted by ID (assuming higher ID = newer)
      const sortedCandidates = [...userCandidates].sort((a, b) => b.id - a.id).slice(0, 5);
      const sortedJobs = [...userJobs].sort((a, b) => b.id - a.id).slice(0, 3);

      setRecentCandidates(sortedCandidates);
      setRecentJobs(sortedJobs);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <motion.h1 variants={itemVariants} className="text-4xl font-display font-bold text-white mb-2 tracking-tight">
                Dashboard
              </motion.h1>
              <motion.p variants={itemVariants} className="text-gray-400">
                Overview of your recruitment pipeline and activities.
              </motion.p>
            </div>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Link to="/upload-resume" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors">
                <UserPlus className="w-4 h-4" />
                <span>Add Candidate</span>
              </Link>
              <Link to="/jobs" className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,242,35,0.3)]">
                <Plus className="w-4 h-4" />
                <span>Post New Job</span>
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Card 1: Active Jobs */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-0.5 hover:bg-gradient-to-br hover:from-white/10 hover:to-primary/20 transition-all duration-300 group">
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[15px] p-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-primary/10" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-black transition-colors duration-300 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
                <div className="space-y-1 relative z-10">
                  <dt className="text-sm font-medium text-gray-400">Open Positions</dt>
                  <dd className="text-3xl font-bold text-white tracking-tight">
                    {loading ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : stats.activeJobs}
                  </dd>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Candidates */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-0.5 hover:bg-gradient-to-br hover:from-white/10 hover:to-purple-500/20 transition-all duration-300 group">
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[15px] p-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/10" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 text-purple-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">Total</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <dt className="text-sm font-medium text-gray-400">Total Candidates</dt>
                  <dd className="text-3xl font-bold text-white tracking-tight">
                    {loading ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : stats.totalCandidates}
                  </dd>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Resumes */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-0.5 hover:bg-gradient-to-br hover:from-white/10 hover:to-blue-500/20 transition-all duration-300 group">
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[15px] p-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 text-blue-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">Processed</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <dt className="text-sm font-medium text-gray-400">Resumes Parsed</dt>
                  <dd className="text-3xl font-bold text-white tracking-tight">
                    {loading ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : stats.totalResumes}
                  </dd>
                </div>
              </div>
            </motion.div>

            {/* Card 4: AI Score */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-0.5 hover:bg-gradient-to-br hover:from-white/10 hover:to-green-500/20 transition-all duration-300 group">
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl rounded-[15px] p-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/10" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 text-green-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  {/* Simple visual indicator */}
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    <svg className="transform -rotate-90 w-full h-full">
                      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-800" />
                      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-green-500" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - stats.avgMatchRate / 100)}`} />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <dt className="text-sm font-medium text-gray-400">Avg AI Match</dt>
                  <dd className="text-3xl font-bold text-white tracking-tight">
                    {loading ? <div className="h-8 w-16 bg-white/10 animate-pulse rounded" /> : `${stats.avgMatchRate}%`}
                  </dd>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main: Recent Candidates */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Recent Candidates
                  </h2>
                  <Link to="/jobs" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading candidates...</div>
                  ) : recentCandidates.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <p>No candidates processed yet.</p>
                      <Link to="/upload-resume" className="mt-4 text-primary hover:underline text-sm">Upload a resume to get started</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {recentCandidates.map((candidate, index) => (
                        <div key={index} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-sm font-bold text-gray-300 group-hover:border-primary/50 transition-colors">
                            {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                              {candidate.name || 'Unknown Candidate'}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {candidate.email || 'No email'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${
                              candidate.score >= 80 ? 'text-green-400' :
                              candidate.score >= 50 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {candidate.score ? candidate.score.toFixed(1) : 0}% Match
                            </div>
                            <p className="text-xs text-gray-600">AI Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sidebar: Recent Jobs & Analytics */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Candidate Score Distribution */}
              <div className="glass-card rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Match Score Distribution
                </h3>
                <div className="space-y-5">
                  {/* High Match */}
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 group-hover:text-white transition-colors">High Match (≥80%)</span>
                      <span className="text-white font-medium">{pipelineStats.highMatch}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.totalCandidates ? (pipelineStats.highMatch / stats.totalCandidates) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" 
                      />
                    </div>
                  </div>
                  
                  {/* Medium Match */}
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 group-hover:text-white transition-colors">Medium Match (50-79%)</span>
                      <span className="text-white font-medium">{pipelineStats.mediumMatch}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.totalCandidates ? (pipelineStats.mediumMatch / stats.totalCandidates) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" 
                      />
                    </div>
                  </div>

                  {/* Low Match */}
                  <div className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 group-hover:text-white transition-colors">Low Match (&lt;50%)</span>
                      <span className="text-white font-medium">{pipelineStats.lowMatch}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.totalCandidates ? (pipelineStats.lowMatch / stats.totalCandidates) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="glass-card rounded-2xl border border-white/5 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    Active Jobs
                  </h3>
                </div>
                
                {loading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : recentJobs.length === 0 ? (
                  <div className="text-sm text-gray-500">No active jobs.</div>
                ) : (
                  <div className="space-y-3">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-white group-hover:text-primary transition-colors">{job.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {job.candidate_count || 0} candidates
                            </p>
                          </div>
                          <span className="flex h-2 w-2 rounded-full bg-green-500 mt-1.5 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/jobs" className="block mt-4 text-center text-sm text-gray-400 hover:text-white transition-colors py-2 border-t border-white/5">
                  View All Jobs
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
