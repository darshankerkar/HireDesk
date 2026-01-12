import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../utils/api';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Fetch jobs on component mount
  React.useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/recruitment/jobs/');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExt)) {
        setError('Invalid file type. Please upload CSV or Excel file.');
        setFile(null);
        return;
      }
      
      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('File too large. Maximum size is 50MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!jobId) {
      setError('Please select a job');
      return;
    }

    setUploading(true);
    setError('');
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobId);

    try {
      const response = await api.post('/recruitment/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      setFile(null);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,phone,resume_source\nJohn Doe,john@email.com,+1234567890,https://drive.google.com/file/d/xxx\nJane Smith,jane@email.com,+0987654321,/path/to/resume.pdf';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-secondary">
      {/* Hero Section - Similar to Home */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-dark to-dark opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 tracking-tighter">
              Bulk Upload <span className="text-primary">Candidates</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              Upload multiple candidates at once using CSV or Excel files
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12 bg-surface">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-dark rounded-3xl p-12 border border-gray-800">
              {/* Template Download */}
              <div className="mb-10">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-3 text-primary hover:text-white transition-colors text-lg font-medium"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* Job Selection */}
              <div className="mb-10">
                <label className="block text-white text-lg mb-4 font-medium">
                  Select Job <span className="text-primary">*</span>
                </label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full bg-surface border border-gray-700 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div className="mb-10">
                <label className="block text-white text-lg mb-4 font-medium">
                  Upload CSV/Excel File <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center gap-4 w-full bg-surface border-2 border-dashed border-gray-700 hover:border-primary rounded-xl p-16 cursor-pointer transition-all group"
                  >
                    <Upload className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-white font-medium text-xl mb-2">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-gray-400">
                        CSV or Excel (max 50MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-10 p-6 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || !jobId || uploading}
                className="w-full bg-primary hover:bg-white text-dark font-bold text-lg py-5 px-8 rounded-xl transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    Upload & Process
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

        {/* Results Section */}
        {results && (
          <section className="py-12 bg-dark">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-surface backdrop-blur-lg rounded-3xl p-12 border border-gray-800">
                  <h2 className="text-3xl font-display font-bold text-white mb-8">
                    Candidate Scores
                  </h2>
                  
                  {/* Candidate List */}
                  <div className="space-y-4">
                    {results.results.map((result, index) => (
                      <div
                        key={index}
                        className={`bg-dark rounded-2xl p-6 border ${
                          result.status === 'success' 
                            ? 'border-primary/30 hover:border-primary/50' 
                            : 'border-red-500/30'
                        } transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {result.status === 'success' ? (
                              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            )}
                            
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {result.name || 'Unknown'}
                              </h3>
                              {result.error && (
                                <p className="text-red-300 text-sm mt-1">{result.error}</p>
                              )}
                            </div>
                          </div>
                          
                          {result.status === 'success' && (
                            <div className="text-right">
                              <p className="text-gray-400 text-sm mb-1">Resume Score</p>
                              <p className="text-4xl font-bold text-primary">
                                {result.score || 0}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;

