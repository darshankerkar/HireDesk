import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, FileText, Search, TrendingUp, 
  CheckCircle, Clock, Send, Award, Users, MapPin, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../contexts/AuthContext';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const jobsRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
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

  useEffect(() => {
    // Filter jobs based on search
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

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
      setFilteredJobs(allJobs);
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

  const scrollToJobs = () => {
    jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getApplicationStatus = (app) => {
    const score = app.score || 0;
    if (score >= 70) return { label: 'Selected', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-900' };
    if (score >= 40) return { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-900' };
    return { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-900' };
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

        {/* Latest Jobs with Search */}
        <motion.div
          ref={jobsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Job Openings</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No jobs found matching your search' : 'No jobs available at the moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
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

      {/* Activity Modal */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActivityModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Applications</h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-2 hover:bg-dark rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Alert CircleClassName="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">You haven't applied to any jobs yet</p>
                  <button
                    onClick={() => {
                      setShowActivityModal(false);
                      navigate('/upload-resume');
                    }}
                    className="mt-4 px-6 py-2 bg-primary text-dark rounded-lg hover:bg-white transition-colors"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app, index) => {
                    const status = getApplicationStatus(app);
                    const jobTitle = jobs.find(j => j.id === app.job)?.title || 'Unknown Job';
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-dark rounded-xl border border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-white">{jobTitle}</h3>
                            <p className="text-sm text-gray-400">Applied: {new Date(app.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 ${status.bg} ${status.color} ${status.border} text-xs font-medium rounded-full border`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Award className="h-4 w-4 text-primary" />
                          <span>Match Score: {app.score?.toFixed(1) || 0}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
