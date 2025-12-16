import React from 'react';
import { X, Mail, Phone, Calendar, FileText, Award, Briefcase, Code, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateProfileModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const { resume } = candidate;
  const parsedData = resume?.parsed_data || {};
  
  const score = candidate.score || 0;
  const skills = parsedData.skills || [];
  const experience = parsedData.years || 0;
  const certifications = parsedData.certifications || [];
  const explanation = parsedData.explanation || [];
  const uploadedAt = resume?.uploaded_at;

  // Format uploaded date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 border-green-900 bg-green-900/30';
    if (score >= 50) return 'text-yellow-400 border-yellow-900 bg-yellow-900/30';
    if (score >= 20) return 'text-orange-400 border-orange-900 bg-orange-900/30';
    return 'text-red-400 border-red-900 bg-red-900/30';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-600 to-green-400';
    if (score >= 50) return 'from-yellow-600 to-yellow-400';
    if (score >= 20) return 'from-orange-600 to-orange-400';
    return 'from-red-600 to-red-400';
  };

  return (
    <AnimatePresence>
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
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl border border-gray-800 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{candidate.name}</h2>
                  <p className="text-gray-400 text-sm">Candidate Profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Resume Score Card */}
            <div className="bg-dark rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Resume Score Analysis
                </h3>
                <span className={`px-4 py-2 rounded-full border font-bold text-lg ${getScoreColor(score)}`}>
                  {score.toFixed(1)}%
                </span>
              </div>

              {/* Score Bar */}
              <div className="mb-4">
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${getScoreGradient(score)} relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Score Explanation */}
              {explanation && explanation.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Score Breakdown:</h4>
                  <div className="space-y-1">
                    {explanation.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-dark rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-white">{candidate.email || 'Not provided'}</p>
                  </div>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-white">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Resume Uploaded</p>
                    <p className="text-white">{formatDate(uploadedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience */}
              <div className="bg-dark rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Experience
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{experience}</div>
                  <div className="text-gray-400 text-sm mt-1">Years</div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-dark rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </h3>
                {certifications.length > 0 ? (
                  <div className="space-y-2">
                    {certifications.map((cert, index) => (
                      <div key={index} className="px-3 py-2 bg-primary/10 rounded-lg border border-primary/30 text-primary text-sm">
                        {cert}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">No certifications listed</p>
                )}
              </div>
            </div>

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="bg-dark rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Skills ({skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 rounded-lg border border-gray-700 text-gray-300 text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume File */}
            {resume?.file && (
              <div className="bg-dark rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume Document
                </h3>
                <a
                  href={resume.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  View Full Resume
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              {resume?.file && (
                <a
                  href={resume.file}
                  download
                  className="px-6 py-2 bg-primary hover:bg-white text-dark rounded-lg transition-colors font-medium"
                >
                  Download Resume
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
