import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Target,
    TrendingUp,
    Award,
    Loader2,
    X,
    Download
} from 'lucide-react';
import axios from 'axios';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function ResumeAnalyzer() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [pastedText, setPastedText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [useUploadedResume, setUseUploadedResume] = useState(false);
    const [inputMode, setInputMode] = useState('file'); // 'file' or 'paste'
    const fileInputRef = useRef(null);

    const features = [
        {
            icon: Target,
            title: 'Content Analysis',
            description: 'Evaluates the quality and relevance of your resume content'
        },
        {
            icon: TrendingUp,
            title: 'ATS Optimization',
            description: 'Suggests improvements for Applicant Tracking Systems'
        },
        {
            icon: Award,
            title: 'Skills Assessment',
            description: 'Reviews your skills section and recommends additions'
        },
        {
            icon: Sparkles,
            title: 'Format & Structure',
            description: 'Analyzes layout, formatting, and overall presentation'
        }
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                setSelectedFile(file);
                setError(null);
                setUseUploadedResume(false);
            } else {
                setError('Please upload a PDF or DOCX file');
            }
        }
    };

    const handleUseUploadedResume = () => {
        // Check if there's a previously uploaded resume in localStorage
        const uploadedResume = localStorage.getItem('uploadedResume');
        if (uploadedResume) {
            const resumeData = JSON.parse(uploadedResume);
            setSelectedFile({ name: resumeData.fileName, fromStorage: true, data: resumeData });
            setUseUploadedResume(true);
            setError(null);
        } else {
            setError('No previously uploaded resume found. Please upload a new file.');
        }
    };

    const extractTextFromFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    // For simplicity, we'll use the text content directly
                    // In production, you'd want proper PDF/DOCX parsing
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const analyzeResume = async () => {
        if (!selectedFile && !pastedText.trim()) {
            setError('Please upload a file or paste your resume text');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            let resumeText = '';

            if (pastedText.trim()) {
                // Use pasted text directly
                resumeText = pastedText;
            } else if (selectedFile.fromStorage) {
                // Use the stored resume data
                resumeText = selectedFile.data.extractedText || selectedFile.data.fileName;
            } else {
                // Extract text from uploaded file
                resumeText = await extractTextFromFile(selectedFile);
            }

            // Truncate resume text to avoid 413 error (max 10000 chars)
            const truncatedText = resumeText.substring(0, 10000);
            
            // Call the serverless function instead of Gemini directly
            const response = await axios.post('/api/resume-analyzer', {
                resumeText: truncatedText
            });

            if (response.data.success) {
                setAnalysis(response.data.analysis);
            } else {
                throw new Error(response.data.error || 'Failed to analyze resume');
            }
        } catch (err) {
            console.error('Analysis error:', err);

            // Handle different error types
            if (err.response) {
                // Server responded with error
                setError(err.response.data.error || 'Failed to analyze resume. Please try again.');
            } else if (err.request) {
                // Request made but no response
                setError('Unable to connect to analysis service. Please check your connection.');
            } else {
                // Something else happened
                setError('Failed to analyze resume. Please try again.');
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const formatAnalysisText = (text) => {
        // Split by lines and format
        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Headers (lines with **)
            if (line.includes('**')) {
                const headerText = line.replace(/\*\*/g, '');
                return (
                    <h3 key={index} className="text-xl font-bold text-primary mt-6 mb-3">
                        {headerText}
                    </h3>
                );
            }
            // Bullet points
            else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                const bulletText = line.replace(/^[\*\-]\s*/, '');
                return (
                    <div key={index} className="flex items-start gap-3 mb-2 ml-4">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{bulletText}</p>
                    </div>
                );
            }
            // Regular paragraphs
            else if (line.trim()) {
                return (
                    <p key={index} className="text-gray-300 mb-3">
                        {line}
                    </p>
                );
            }
            return null;
        });
    };

    return (
        <div className="min-h-screen bg-dark text-secondary py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-primary/30 rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm text-gray-300">AI-Powered Resume Analysis</span>
                    </div>
                </motion.div>


                {/* Features Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="p-6 bg-surface rounded-xl border border-gray-800 hover:border-primary/50 transition-colors duration-300"
                        >
                            <feature.icon className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface rounded-2xl border border-gray-800 p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setInputMode('file')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                inputMode === 'file'
                                    ? 'bg-primary text-dark'
                                    : 'bg-dark text-gray-400 hover:text-white'
                            }`}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setInputMode('paste')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                inputMode === 'paste'
                                    ? 'bg-primary text-dark'
                                    : 'bg-dark text-gray-400 hover:text-white'
                            }`}
                        >
                            Paste Text
                        </button>
                    </div>

                    <div className="space-y-4">
                        {inputMode === 'file' ? (
                            <>
                                {/* File Upload */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors duration-300"
                                >
                                    <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-2">
                                        {selectedFile && !selectedFile.fromStorage
                                            ? selectedFile.name
                                            : 'Click to upload resume'}
                                    </p>
                                    <p className="text-sm text-gray-500">PDF or DOCX format</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Or Divider */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-gray-800"></div>
                                    <span className="text-gray-500 text-sm">OR</span>
                                    <div className="flex-1 h-px bg-gray-800"></div>
                                </div>

                                {/* Use Previously Uploaded Resume */}
                                <button
                                    onClick={handleUseUploadedResume}
                                    className="w-full py-4 px-6 bg-dark border border-gray-700 rounded-xl hover:border-primary transition-colors duration-300 flex items-center justify-center gap-3"
                                >
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span>Use Previously Uploaded Resume</span>
                                </button>

                                {useUploadedResume && selectedFile && (
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Using: {selectedFile.name}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Paste Text Area */}
                                <div>
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => {
                                            setPastedText(e.target.value);
                                            setError(null);
                                        }}
                                        placeholder="Paste your resume text here... (Include your name, skills, experience, education, etc.)"
                                        rows={12}
                                        className="w-full p-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {pastedText.length} / 10000 characters
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
                            >
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-500">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Analyze Button */}
                    <button
                        onClick={analyzeResume}
                        disabled={(!selectedFile && !pastedText.trim()) || analyzing}
                        className="w-full mt-6 py-4 px-6 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Analyzing Resume...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Analyze Resume
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Analysis Results */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-surface rounded-2xl border border-gray-800 p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                    Analysis Results
                                </h2>
                                <button
                                    onClick={() => setAnalysis(null)}
                                    className="p-2 hover:bg-dark rounded-lg transition-colors duration-300"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {formatAnalysisText(analysis)}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 pt-6 border-t border-gray-800 flex gap-4">
                                <button
                                    onClick={() => {
                                        setAnalysis(null);
                                        setSelectedFile(null);
                                        setUseUploadedResume(false);
                                    }}
                                    className="px-6 py-3 bg-dark border border-gray-700 rounded-full hover:border-primary transition-colors duration-300"
                                >
                                    Analyze Another Resume
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Section */}
                {!analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 p-6 bg-surface/50 rounded-xl border border-gray-800"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            What Our Analyzer Checks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Content quality and relevance</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>ATS compatibility and keyword optimization</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Skills section completeness</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Format, structure, and readability</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Professional language and tone</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Achievement quantification</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
