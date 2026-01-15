import React, { useState, useEffect } from 'react';
import { Briefcase, Users, ChevronRight, ChevronDown, Download, Edit2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import CandidateProfileModal from '../components/CandidateProfileModal';

export default function Jobs() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);
  const [editJobModalOpen, setEditJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/recruitment/jobs/');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const isRecruiter = userData.role === 'RECRUITER';
      
      if (isRecruiter) {
        // Recruiters only see their own jobs
        const userJobs = response.data.filter(job => 
          job.posted_by_email === currentUser?.email
        );
        setJobs(userJobs);
      } else {
        // Candidates see ALL jobs
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCandidates = async (jobId) => {
    setLoadingCandidates(true);
    try {
      const response = await api.get(`/recruitment/jobs/${jobId}/candidates/`);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleJobClick = (jobId) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setCandidates([]);
    } else {
      setSelectedJobId(jobId);
      fetchCandidates(jobId);
    }
  };

  const handleJobAdded = (newJob) => {
    setJobs([...jobs, newJob]);
  };

  const handleEditClick = (e, job) => {
    e.stopPropagation(); // Prevent toggling the accordion
    setJobToEdit(job);
    setEditJobModalOpen(true);
  };

  const handleJobUpdated = (updatedJob) => {
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
  };

  const handleDownloadResume = async (e, candidate) => {
    e.stopPropagation();
    
    if (!candidate.resume?.download_url) {
      toast.error('No resume file available');
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const downloadUrl = `${apiBaseUrl}${candidate.resume.download_url}`;
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${candidate.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume. Please try again');
    }
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    setProfileModalOpen(true);
  };

  const formatUploadTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-primary/20 to-purple-900/20 border border-white/10 p-8 mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Open <span className="text-primary">Positions</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Manage your recruitment pipeline efficiently. View active job listings, track candidate applications, and analyze AI-generated scores all in one place.
              </p>
            </div>
            <button 
              onClick={() => setAddJobModalOpen(true)}
              className="px-8 py-4 bg-primary text-dark font-bold text-lg rounded-xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Briefcase className="h-5 w-5" />
              Post New Job
            </button>
          </div>
        </div>
      
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-gray-800">
              <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Jobs</h3>
              <p className="text-gray-400">Get started by posting your first job opening.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-surface rounded-xl border border-gray-800 overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5 group">
                {/* Job Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{job.title}</h2>
                        <button 
                          onClick={(e) => handleEditClick(e, job)}
                          className="p-1 text-gray-500 hover:text-primary transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-400 mt-1">{job.description}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        {job.candidate_count || 0} Candidates
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm font-medium border border-green-900">
                        Active
                      </span>
                      {selectedJobId === job.id ? (
                        <ChevronDown className="h-5 w-5 text-primary transition-transform" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidates List */}
                <AnimatePresence>
                  {selectedJobId === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-800"
                    >
                      <div className="p-6 bg-dark/50">
                        <h3 className="text-lg font-bold text-white mb-4">Candidates for this role</h3>
                        
                        {loadingCandidates ? (
                          <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : candidates.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            No candidates found for this job role
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-800">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Resume Score
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Uploaded
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {candidates.map((candidate) => (
                                  <motion.tr
                                    key={candidate.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleCandidateClick(candidate)}
                                    className="hover:bg-white/5 cursor-pointer transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                          {candidate.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-white">{candidate.name}</div>
                                          <div className="text-sm text-gray-500">{candidate.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                        candidate.score >= 80 
                                          ? 'bg-green-900/30 text-green-400 border-green-900' 
                                          : candidate.score >= 50 
                                          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900' 
                                          : candidate.score >= 20
                                          ? 'bg-orange-900/30 text-orange-400 border-orange-900'
                                          : 'bg-red-900/30 text-red-400 border-red-900'
                                      }`}>
                                        {candidate.score.toFixed(1)}% Match
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center text-gray-400 text-sm">
                                        <Clock className="h-4 w-4 mr-1.5 text-primary" />
                                        {formatUploadTime(candidate.resume?.uploaded_at)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button 
                                        onClick={(e) => handleDownloadResume(e, candidate)}
                                        className="text-gray-400 hover:text-primary transition-colors"
                                        title="Download Resume"
                                      >
                                        <Download className="h-5 w-5" />
                                      </button>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      <AddJobModal
        isOpen={addJobModalOpen}
        onClose={() => setAddJobModalOpen(false)}
        onJobAdded={handleJobAdded}
      />
      
      <EditJobModal
        isOpen={editJobModalOpen}
        onClose={() => setEditJobModalOpen(false)}
        job={jobToEdit}
        onJobUpdated={handleJobUpdated}
      />

      <CandidateProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
}