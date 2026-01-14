import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, TrendingUp, FileText, Upload, 
  Plus, Eye, Download, Calendar, Award, BarChart3 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    avgScore: 0,
    recentApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs and candidates data
      const jobsResponse = await axios.get(`${config.apiUrl}/api/jobs/`);
      const jobs = jobsResponse.data;

      let totalCandidates = 0;
      let totalScore = 0;
      let scoreCount = 0;

      for (const job of jobs) {
        if (job.candidates) {
          totalCandidates += job.candidates.length;
          job.candidates.forEach(candidate => {
            if (candidate.score) {
              totalScore += candidate.score;
              scoreCount++;
            }
          });
        }
      }

      setStats({
        totalJobs: jobs.length,
        totalCandidates,
        avgScore: scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0,
        recentApplications: totalCandidates // Simplified for demo
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: stats.totalJobs,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      trend: '+12%'
    },
    {
      icon: Users,
      label: 'Total Candidates',
      value: stats.totalCandidates,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+8%'
    },
    {
      icon: Award,
      label: 'Avg. Score',
      value: `${stats.avgScore}%`,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      trend: '+5%'
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: stats.recentApplications,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      trend: '+18%'
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Post New Job',
      description: 'Create a new job posting',
      onClick: () => navigate('/jobs'),
      color: 'bg-primary'
    },
    {
      icon: Upload,
      label: 'Bulk Upload',
      description: 'Upload multiple resumes',
      onClick: () => navigate('/bulk-upload'),
      color: 'bg-blue-500'
    },
    {
      icon: Eye,
      label: 'View All Jobs',
      description: 'Manage job postings',
      onClick: () => navigate('/jobs'),
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed insights',
      onClick: () => navigate('/dashboard'),
      color: 'bg-green-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Recruiter <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your recruitment pipeline and find the best candidates
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className="bg-surface border border-gray-800 rounded-2xl p-6 text-left hover:border-primary/50 transition-all group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{action.label}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Platform Features</h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:text-white transition-colors text-sm font-medium"
            >
              View Full Analytics →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark rounded-xl border border-gray-800">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-white mb-1">Resume Parsing</h3>
              <p className="text-sm text-gray-400">AI-powered extraction from PDFs and DOCX</p>
            </div>
            
            <div className="p-4 bg-dark rounded-xl border border-gray-800">
              <Award className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="font-bold text-white mb-1">AI Scoring</h3>
              <p className="text-sm text-gray-400">Automatic candidate ranking & matching</p>
            </div>
            
            <div className="p-4 bg-dark rounded-xl border border-gray-800">
              <Calendar className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-white mb-1">Bulk Processing</h3>
              <p className="text-sm text-gray-400">Upload and process multiple resumes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
