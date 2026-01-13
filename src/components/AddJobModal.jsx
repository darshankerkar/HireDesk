import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, FileText } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function AddJobModal({ isOpen, onClose, onJobAdded }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/recruitment/jobs/', {
        title,
        description,
        requirements,
        posted_by_email: currentUser?.email  // Add user email to track ownership
      });
      
      onJobAdded(response.data);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setRequirements('');
    } catch (err) {
      console.error("Job creation error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = 'Failed to create job';
      
      if (err.response?.data) {
        // Check for various error formats
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface border border-gray-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-primary" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                Post New Job
              </h2>
              <p className="text-gray-400 ml-16">
                Create a new position to start tracking candidates
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Job Title</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Senior React Developer"
                    className="w-full pl-12 pr-4 py-4 bg-dark/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Description</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Brief description of the role..."
                    className="w-full pl-12 pr-4 py-4 bg-dark/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Requirements</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    required
                    rows={3}
                    placeholder="Skills and qualifications required..."
                    className="w-full pl-12 pr-4 py-4 bg-dark/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-dark font-bold text-lg rounded-xl hover:from-white hover:to-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-lg shadow-primary/20 hover:shadow-white/20 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    Creating Position...
                  </div>
                ) : (
                  'Post Job Position'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
