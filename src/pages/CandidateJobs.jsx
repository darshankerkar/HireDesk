import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Briefcase, MapPin, Clock, DollarSign,
    Building, CheckCircle, Filter, ChevronDown, X,
    Calendar, Users, BarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../contexts/AuthContext';
import JobDetailsModal from '../components/JobDetailsModal';

export default function CandidateJobs() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('any');
    const [filterCompetition, setFilterCompetition] = useState('any'); // 'any', 'low', 'moderate', 'high'
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        // Redirect recruiters to dashboard - this page is for candidates only
        if (currentUser && currentUser.role === 'RECRUITER') {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (currentUser && currentUser.role === 'CANDIDATE') {
            fetchJobsAndApplications();
        }
    }, [currentUser]);

    useEffect(() => {
        filterAndSortJobs();
    }, [searchQuery, filterStatus, filterDate, filterCompetition, sortBy, jobs, applications]);

    const fetchJobsAndApplications = async () => {
        try {
            setLoading(true);
            const jobsResponse = await axios.get(`${config.apiUrl}/api/recruitment/jobs/`);
            const allJobs = jobsResponse.data;

            const candidatesResponse = await axios.get(`${config.apiUrl}/api/recruitment/candidates/`);
            const userApplications = candidatesResponse.data.filter(
                candidate => candidate.email === currentUser?.email
            );

            setJobs(allJobs);
            setApplications(userApplications);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortJobs = () => {
        let result = [...jobs];

        // 1. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query) ||
                (job.company && job.company.toLowerCase().includes(query))
            );
        }

        // 2. Status Filter
        if (filterStatus !== 'all') {
            result = result.filter(job => {
                const hasApplied = applications.some(app => app.job === job.id);
                if (filterStatus === 'applied') return hasApplied;
                if (filterStatus === 'open') return !hasApplied;
                return true;
            });
        }

        // 3. Date Posted Filter
        if (filterDate !== 'any') {
            const now = new Date();
            result = result.filter(job => {
                const jobDate = new Date(job.created_at);
                const diffHours = (now - jobDate) / (1000 * 60 * 60);

                if (filterDate === '24h') return diffHours <= 24;
                if (filterDate === '7d') return diffHours <= 24 * 7;
                if (filterDate === '30d') return diffHours <= 24 * 30;
                return true;
            });
        }

        // 4. Competition Filter
        if (filterCompetition !== 'any') {
            result = result.filter(job => {
                const count = job.candidate_count || 0;
                if (filterCompetition === 'low') return count < 10;
                if (filterCompetition === 'moderate') return count >= 10 && count <= 50;
                if (filterCompetition === 'high') return count > 50;
                return true;
            });
        }

        // 5. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            switch (sortBy) {
                case 'newest': return dateB - dateA;
                case 'oldest': return dateA - dateB;
                case 'most_applicants': return (b.candidate_count || 0) - (a.candidate_count || 0);
                case 'least_applicants': return (a.candidate_count || 0) - (b.candidate_count || 0);
                default: return dateB - dateA;
            }
        });

        setFilteredJobs(result);
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-dark text-secondary py-8 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Explore <span className="text-primary">Opportunities</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Discover roles that match your skills and take the next step in your career.
                    </p>
                </motion.div>

                {/* Search and Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-gray-800 rounded-2xl p-4 mb-4 sticky top-24 z-30 shadow-xl shadow-black/20"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by job title, keyword, or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Main Filter Dropdowns */}
                            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary cursor-pointer min-w-[140px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Not Applied</option>
                                    <option value="applied">Applied</option>
                                </select>

                                <select
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary cursor-pointer min-w-[140px]"
                                >
                                    <option value="any">Any Time</option>
                                    <option value="24h">Past 24 Hours</option>
                                    <option value="7d">Past Week</option>
                                    <option value="30d">Past Month</option>
                                </select>

                                <select
                                    value={filterCompetition}
                                    onChange={(e) => setFilterCompetition(e.target.value)}
                                    className="px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary cursor-pointer min-w-[170px]"
                                >
                                    <option value="any">Any Competition</option>
                                    <option value="low">Low (&lt; 10)</option>
                                    <option value="moderate">Moderate (10-50)</option>
                                    <option value="high">High (50+)</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary cursor-pointer min-w-[160px]"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="most_applicants">Most Popular</option>
                                    <option value="least_applicants">Least Competition</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count & Active Filters */}
                <div className="mb-6 flex items-center justify-between px-2">
                    <p className="text-gray-400">
                        Showing <span className="text-white font-bold">{filteredJobs.length}</span> jobs
                    </p>
                    {(searchQuery || filterStatus !== 'all' || filterDate !== 'any' || filterCompetition !== 'any') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                                setFilterDate('any');
                                setFilterCompetition('any');
                                setSortBy('newest');
                            }}
                            className="text-primary text-sm hover:underline"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job, index) => {
                                const hasApplied = applications.some(app => app.job === job.id);
                                return (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleJobClick(job)}
                                        className="bg-surface rounded-2xl border border-gray-800 p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group relative flex flex-col h-full cursor-pointer"
                                    >
                                        {/* Badge */}
                                        <div className="absolute top-4 right-4">
                                            {hasApplied ? (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20 flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Applied
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        {/* Company Icon Placeholder */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <Briefcase className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                                <Building className="h-4 w-4" />
                                                <span>{job.company || 'Tech Company'}</span>
                                            </div>

                                            <p className="text-gray-400 text-sm line-clamp-3 mb-6 min-h-[60px]">
                                                {job.description}
                                            </p>

                                            {/* Metadata Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <div className="px-2 py-1 bg-dark rounded-md border border-gray-800 text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimeAgo(job.created_at)}
                                                </div>
                                                <div className="px-2 py-1 bg-dark rounded-md border border-gray-800 text-xs text-gray-400 flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {job.candidate_count || 0} applicants
                                                </div>
                                                {job.description.toLowerCase().includes('remote') && (
                                                    <div className="px-2 py-1 bg-dark rounded-md border border-gray-800 text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Remote
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent opening modal
                                                navigate(`/upload-resume?jobId=${job.id}`);
                                            }}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${hasApplied
                                                ? 'bg-dark border border-gray-700 text-gray-300 hover:bg-gray-800'
                                                : 'bg-primary text-dark hover:bg-white hover:scale-[1.02]'
                                                }`}
                                        >
                                            {hasApplied ? 'View Application' : 'Apply Now'}
                                        </button>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-20 h-20 bg-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                                    <Search className="h-8 w-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    We couldn't find any jobs matching your current filters. Try adjusting your search query or filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterStatus('all');
                                        setFilterDate('any');
                                        setFilterCompetition('any');
                                        setSortBy('newest');
                                    }}
                                    className="mt-6 px-6 py-2 bg-dark border border-gray-700 rounded-full text-primary hover:bg-gray-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Job Details Modal */}
                <JobDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    job={selectedJob}
                    onApply={() => navigate(`/upload-resume?jobId=${selectedJob?.id}`)}
                    hasApplied={selectedJob ? applications.some(app => app.job === selectedJob.id) : false}
                />
            </div>
        </div>
    );
}
