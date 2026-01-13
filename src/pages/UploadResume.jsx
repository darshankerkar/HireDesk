import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function UploadResume() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    }
  }, [currentUser]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/recruitment/jobs/');
      // Filter jobs by current user's email
      const userJobs = response.data.filter(job => 
        job.posted_by_email === currentUser?.email
      );
      setJobs(userJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setUploadStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!uploadedFile || !selectedJob) {
      setUploadStatus({ type: 'error', message: 'Please select a file and job role' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('job_id', selectedJob);

    try {
      const response = await api.post('/recruitment/upload-resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus({
        type: 'success',
        message: 'Resume uploaded and processed successfully!'
      });
      setUploadedFile(null);
      setSelectedJob('');
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Upload <span className="text-primary">Resume</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Upload candidate resumes to screen them with our AI-powered system
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-surface rounded-3xl border border-gray-800 p-8 shadow-2xl">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : uploadedFile
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-700 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {uploadedFile ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-xl font-bold text-white mb-2">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-xl font-bold text-white mb-2">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop resume here'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                    <div className="flex justify-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-dark rounded">PDF</span>
                      <span className="px-2 py-1 bg-dark rounded">DOCX</span>
                      <span className="px-2 py-1 bg-dark rounded">JPG</span>
                      <span className="px-2 py-1 bg-dark rounded">JPEG</span>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Job Selection */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-primary mb-3">
                Select Job Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Choose a job role</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Message */}
            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl border ${
                  uploadStatus.type === 'success'
                    ? 'bg-green-900/30 border-green-900 text-green-400'
                    : 'bg-red-900/30 border-red-900 text-red-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p>{uploadStatus.message}</p>
                </div>
              </motion.div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || !selectedJob || uploading}
              className="w-full mt-8 py-4 bg-primary text-dark font-bold text-lg rounded-xl hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Upload Resume'
              )}
            </button>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-surface rounded-2xl border border-gray-800"
          >
            <h3 className="text-lg font-bold text-white mb-3">How it works:</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Upload a resume in PDF, DOCX, JPG, or JPEG format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ensure the resume contains a professional email address (e.g., john.doe@email.com) for better identification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Select the job role the candidate is applying for</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Our AI analyzes the resume and generates a match score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>View ranked candidates in the Jobs section</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
