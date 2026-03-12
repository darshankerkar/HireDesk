import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, FileText, Search, TrendingUp,
  CheckCircle, Clock, Send, Award, Calendar, X, AlertCircle, Video, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../contexts/AuthContext';
import { usePreloadedData } from '../contexts/DataPreloadContext';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const preloaded = usePreloadedData();
  const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const sessionEmail = currentUser?.email || storedUserData?.email;
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    availableJobs: 0,
    applicationsSubmitted: 0,
    avgMatchScore: 0,
    upcomingInterviews: 0,
    acceptanceRate: 0
  });

  useEffect(() => {
    if (!sessionEmail) {
      setLoading(false);
      return;
    }
    processData();
  }, [sessionEmail, preloaded?.jobs, preloaded?.userCandidates, preloaded?.userInterviews]);

  const processData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allJobs = Array.isArray(preloaded?.jobs)
        ? preloaded.jobs
        : (await axios.get(`${config.apiUrl}/api/recruitment/jobs/`).then(r => r.data).catch(() => []));

      let userApplications = Array.isArray(preloaded?.userCandidates)
        ? [...preloaded.userCandidates]
        : (await api.get(`/recruitment/candidates/?email=${encodeURIComponent(sessionEmail)}`).then(r => r.data).catch(() => []));

      const userInterviews = Array.isArray(preloaded?.userInterviews)
        ? preloaded.userInterviews
        : (await api.get('/recruitment/my-interviews/').then(r => r.data).catch(() => []));

      // Merge localStorage fallbacks
      if (sessionEmail) {
        const backendJobIds = new Set(userApplications.map(a => a.job));

        // Rich candidate data from localStorage
        const richKey = `candidate_apps_${sessionEmail}`;
        const richApps = JSON.parse(localStorage.getItem(richKey) || '[]');
        richApps.forEach(localApp => {
          if (!backendJobIds.has(localApp.job)) {
            userApplications.push(localApp);
            backendJobIds.add(localApp.job);
          }
        });

        // Simple job ID list from localStorage
        const simpleKey = `applications_${sessionEmail}`;
        const simpleJobIds = JSON.parse(localStorage.getItem(simpleKey) || '[]');
        simpleJobIds.forEach(jobId => {
          if (!backendJobIds.has(jobId)) {
            const matchedJob = allJobs.find(j => j.id === jobId);
            userApplications.push({
              id: `local-${jobId}`,
              job: jobId,
              job_title: matchedJob?.title || `Job #${jobId}`,
              score: 0,
              created_at: new Date().toISOString()
            });
            backendJobIds.add(jobId);
          }
        });
      }

      setJobs(allJobs);
      setApplications(userApplications);
      setInterviews(userInterviews);

      // Calculate stats
      const avgScore = userApplications.length > 0
        ? userApplications.reduce((sum, app) => sum + (app.score || 0), 0) / userApplications.length
        : 0;

      const upcoming = userInterviews.filter(
        i => i.status === 'SCHEDULED' && new Date(i.scheduled_time) > new Date()
      );

      // Calculate acceptance rate (shortlisted = score >= 70)
      const shortlisted = userApplications.filter(a => (a.score || 0) >= 70).length;
      const acceptanceRate = userApplications.length > 0
        ? Math.round((shortlisted / userApplications.length) * 100)
        : 0;

      setStats({
        availableJobs: allJobs.length,
        applicationsSubmitted: userApplications.length,
        avgMatchScore: Math.round(avgScore),
        upcomingInterviews: upcoming.length,
        acceptanceRate
      });
    } catch (err) {
      console.error('Error processing dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatus = (app) => {
    const score = app.score || 0;
    if (score >= 70) return { label: 'Shortlisted', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    if (score >= 40) return { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { label: 'Needs Improvement', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBarColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatInterviewTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const statCards = [
    {
      icon: Briefcase,
      label: 'Total Jobs',
      value: stats.availableJobs,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      onClick: () => navigate('/candidate-jobs')
    },
    {
      icon: CheckCircle,
      label: 'Acceptance Rate',
      value: `${stats.acceptanceRate}%`,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      onClick: null
    },
    {
      icon: Award,
      label: 'Avg. Match',
      value: `${stats.avgMatchScore}%`,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      onClick: null
    },
    {
      icon: Video,
      label: 'Interviews',
      value: stats.upcomingInterviews,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      onClick: null
    }
  ];

  const quickActions = [
    {
      icon: Search,
      label: 'Browse Jobs',
      description: 'Find your next opportunity',
      onClick: () => navigate('/candidate-jobs'),
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
      label: 'Resume Analyzer',
      description: 'AI-powered resume analysis',
      onClick: () => navigate('/resume-analyzer'),
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
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
            Welcome back, {(currentUser?.displayName || sessionEmail?.split('@')[0] || 'Candidate')}
          </p>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
            <button onClick={() => processData()} className="ml-auto text-red-400 hover:text-red-300 text-sm underline">
              Retry
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.onClick}
              className={`bg-surface border border-gray-800 rounded-2xl p-5 hover:border-primary/50 transition-colors ${stat.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Applications List - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-surface border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  My Applications
                </h2>
                <span className="text-xs text-gray-500">
                  {applications.length} total
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 mb-1">No applications yet</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload your resume to start applying for jobs
                  </p>
                  <button
                    onClick={() => navigate('/upload-resume')}
                    className="px-5 py-2 bg-primary text-dark text-sm font-semibold rounded-lg hover:bg-white transition-colors"
                  >
                    Upload Resume
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {applications.slice(0, 10).map((app, index) => {
                    const status = getApplicationStatus(app);
                    const score = app.score || 0;
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="p-4 hover:bg-dark/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {app.job_title || `Job #${app.job}`}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Applied {formatDate(app.created_at)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 ${status.bg} ${status.color} ${status.border} text-xs font-medium rounded-full border ml-3 flex-shrink-0`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getScoreBarColor(score)}`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                            {score.toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Upcoming Interviews */}
            <div className="bg-surface border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-400" />
                  Upcoming Interviews
                </h2>
              </div>
              {interviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduled_time) > new Date()).length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming interviews</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {interviews
                    .filter(i => i.status === 'SCHEDULED' && new Date(i.scheduled_time) > new Date())
                    .slice(0, 5)
                    .map((interview) => (
                      <div key={interview.id} className="p-4">
                        <h4 className="font-medium text-white text-sm truncate">{interview.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {formatInterviewTime(interview.scheduled_time)}
                          </span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                          {interview.interview_type}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Match Score Summary */}
            {stats.applicationsSubmitted > 0 && (
              <div className="bg-gradient-to-br from-surface to-primary/5 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-xs font-medium mb-2">Average Match Score</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className={`text-3xl font-bold ${getScoreColor(stats.avgMatchScore)}`}>
                    {stats.avgMatchScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stats.avgMatchScore, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${getScoreBarColor(stats.avgMatchScore)}`}
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  {stats.avgMatchScore >= 70
                    ? 'Excellent match rate!'
                    : stats.avgMatchScore >= 40
                    ? 'Good potential — keep improving!'
                    : 'Tip: Tailor your resume to job descriptions'}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className="bg-surface border border-gray-800 rounded-2xl p-5 text-left hover:border-primary/50 transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">{action.label}</h3>
                <p className="text-xs text-gray-400">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Pro Tips for Job Seekers
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              Upload a well-formatted resume (PDF or DOCX) for better AI parsing
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              Tailor your resume to match job descriptions for higher match scores
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              Use the AI chat assistant for career advice and interview preparation
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              Make sure your resume email matches your account email for proper tracking
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
