import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, FileText, Search, TrendingUp, 
  CheckCircle, Clock, Send, Award, Users, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../contexts/AuthContext';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableJobs: 0,
    applicationsSubmitted: 0,
    avgMatchScore: 0
  });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Fetch all available jobs
      const jobsResponse = await axios.get(`${config.apiUrl}/api/recruitment/jobs/`);
      const allJobs = jobsResponse.data;
      
      // Fetch user's applications (candidates uploaded for jobs)
      const candidatesResponse = await axios.get(`${config.apiUrl}/api/recruitment/candidates/`);
      const userApplications = candidatesResponse.data.filter(
        candidate => candidate.email === currentUser?.email
      );

      setJobs(allJobs);
      setApplications(userApplications);

      // Calculate stats
      const avgScore = userApplications.length > 0
        ? userApplications.reduce((sum, app) => sum + (app.score || 0), 0) / userApplications.length
        : 0;

      setStats({
        availableJobs: allJobs.length,
        applicationsSubmitted: userApplications.length,
        avgMatchScore: Math.round(avgScore)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Briefcase,
      label: 'Available Jobs',
      value: stats.availableJobs,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Send,
      label: 'Applications',
      value: stats.applicationsSubmitted,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Award,
      label: 'Avg. Match',
      value: `${stats.avgMatchScore}%`,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    }
  ];

  const quickActions = [
    {
      icon: Search,
      label: 'Browse Jobs',
      description: 'Find your next opportunity',
      onClick: () => navigate('/upload-resume'),
      color: 'bg-primary'
    },
    {
      icon: FileText,
      label: 'Upload Resume',
      description: 'Apply to a job',
      onClick: () => navigate('/upload-resume'),
      color: 'bg-blue-500'
    },
    {
      icon: TrendingUp,
      label: 'View Activity',
      description: 'Track your applications',
      onClick: () => navigate('/candidate-dashboard'),
      color: 'bg-purple-500'
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
            Candidate <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Find your dream job and track your applications
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
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

        {/* Latest Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Job Openings</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No jobs available at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const hasApplied = applications.some(app => app.job === job.id);
                return (
                  <div
                    key={job.id}
                    className="p-4 bg-dark rounded-xl border border-gray-800 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-400">{job.company || 'Company'}</p>
                      </div>
                      {hasApplied ? (
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                          Applied
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Open
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Full-time
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.candidate_count || 0} Applicants
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate('/upload-resume')}
                        className="text-primary hover:text-white font-medium transition-colors"
                      >
                        {hasApplied ? 'View Application' : 'Apply Now'} →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            Pro Tips for Job Seekers
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
              Upload a well-formatted resume (PDF or DOCX) for better AI parsing
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
              Tailor your resume to match job descriptions for higher match scores
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
              Use the AI chat assistant for career advice and interview preparation
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
