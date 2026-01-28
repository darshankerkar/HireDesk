import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Briefcase, MapPin, Clock, DollarSign,
    Building, CheckCircle, Calendar, Users, FileText
} from 'lucide-react';

export default function JobDetailsModal({ isOpen, onClose, job, onApply, hasApplied }) {
    if (!job) return null;

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-surface border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 bg-dark/50">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center shrink-0">
                                        <Briefcase className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                                            <Building className="h-4 w-4" />
                                            <span className="font-medium">{job.company || 'Tech Company'}</span>
                                        </div>
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {hasApplied ? (
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-bold rounded border border-green-500/20 flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Applied
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded border border-primary/20">
                                                    Active
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-dark border border-gray-700 rounded text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatTimeAgo(job.created_at)}
                                            </span>
                                            <span className="px-2 py-0.5 bg-dark border border-gray-700 rounded text-xs text-gray-400 flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {job.candidate_count || 0} Applicants
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Description */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Job Description
                                </h3>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                                    {job.description}
                                </div>
                            </section>

                            {/* Requirements */}
                            {job.requirements && (
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        Requirements
                                    </h3>
                                    <div className="text-gray-300 leading-relaxed whitespace-pre-line bg-dark/30 p-4 rounded-xl border border-gray-800">
                                        {job.requirements}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-800 bg-dark/50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    onApply();
                                    onClose();
                                }}
                                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${hasApplied
                                        ? 'bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500' // View Application style
                                        : 'bg-primary text-dark hover:bg-white hover:scale-105 shadow-lg shadow-primary/20' // Apply style
                                    }`}
                            >
                                {hasApplied ? 'View Application' : 'Apply For This Position'}
                            </button>
                        </div>

                        {/* Custom Scrollbar Styles */}
                        <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #374151;
                border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #4B5563;
                }
            `}</style>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
