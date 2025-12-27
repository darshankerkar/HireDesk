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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Bulk Upload Candidates
          </h1>
          <p className="text-gray-400">
            Upload multiple candidates at once using CSV or Excel files
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-purple-500/20">
          {/* Template Download */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Job Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">
              Select Job <span className="text-red-400">*</span>
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-gray-700/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
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
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">
              Upload CSV/Excel File <span className="text-red-400">*</span>
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
                className="flex items-center justify-center gap-3 w-full bg-gray-700/30 border-2 border-dashed border-purple-500/50 rounded-lg p-8 cursor-pointer hover:border-purple-500 hover:bg-gray-700/50 transition-all"
              >
                <Upload className="w-8 h-8 text-purple-400" />
                <div className="text-center">
                  <p className="text-white font-medium">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    CSV or Excel (max 50MB)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !jobId || uploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Process
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
            {/* Summary */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Upload Results</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Rows</p>
                  <p className="text-2xl font-bold text-white">
                    {results.summary.total_rows}
                  </p>
                </div>
                
                <div className="bg-green-500/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Successful</p>
                  <p className="text-2xl font-bold text-green-400">
                    {results.summary.successful}
                  </p>
                </div>
                
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">
                    {results.summary.failed}
                  </p>
                </div>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4">
                <p className="text-purple-300 font-medium">
                  Success Rate: {results.summary.success_rate}
                </p>
              </div>
            </div>

            {/* Detailed Results */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Row-by-Row Results</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="text-white font-medium">
                          Row {result.row}: {result.name || 'Unknown'}
                        </p>
                        {result.status === 'success' && (
                          <p className="text-sm text-gray-400">
                            Score: {result.score} | ID: {result.candidate_id}
                          </p>
                        )}
                        {result.error && (
                          <p className="text-sm text-red-300">{result.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.status === 'success' ? 'bg-green-500/20 text-green-300' :
                      result.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
