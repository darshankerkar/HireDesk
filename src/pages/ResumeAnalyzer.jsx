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
    X
} from 'lucide-react';
import axios from 'axios';
import { analyzeResumeWithGemini } from '../services/geminiService';

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
    const [targetRole, setTargetRole] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [inputMode, setInputMode] = useState('file');
    const fileInputRef = useRef(null);

    const features = [
        {
            icon: Target,
            title: 'Role-Fit Review',
            description: 'Assesses how your resume aligns with your target job role'
        },
        {
            icon: TrendingUp,
            title: 'Strengths and Gaps',
            description: 'Highlights strong points and areas recruiters may question'
        },
        {
            icon: Award,
            title: 'Improvement Plan',
            description: 'Provides practical, high-impact recommendations to improve your resume'
        },
        {
            icon: FileText,
            title: 'Rewrite Examples',
            description: 'Suggests better phrasing for weak or generic resume points'
        }
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (
            file.type === 'application/pdf' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            setSelectedFile(file);
            setError(null);
            return;
        }

        setError('Please upload a PDF or DOCX file');
    };

    const extractTextFromFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await axios.post(`${apiUrl}/recruitment/parse-resume-text/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000
            });

            if (response.data.success) {
                return response.data.text;
            }

            throw new Error(response.data.error || 'Failed to extract text from file');
        } catch (err) {
            console.error('Text extraction error:', err);
            throw new Error('Failed to extract text from file. Please try pasting text instead.');
        }
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
                resumeText = pastedText;
            } else {
                resumeText = await extractTextFromFile(selectedFile);
            }

            const result = await analyzeResumeWithGemini(resumeText, targetRole);
            setAnalysis(result);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const formatAnalysisText = (text) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const trimmed = line.trim();
            const onlyBoldHeading = /^\*\*[^*].*[^*]\*\*$/.test(trimmed);

            if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                const bulletText = trimmed.replace(/^[\*\-]\s*/, '').replace(/\*\*/g, '');
                return (
                    <div key={index} className="flex items-start gap-3 mb-2 ml-4">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{bulletText}</p>
                    </div>
                );
            }

            if (onlyBoldHeading) {
                const headerText = trimmed.replace(/\*\*/g, '');
                return (
                    <h3 key={index} className="text-xl font-bold text-primary mt-6 mb-3">
                        {headerText}
                    </h3>
                );
            }

            if (line.trim()) {
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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-primary/30 rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm text-gray-300">AI Analysis</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Analyzer</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Get recruiter-friendly feedback focused on strengths, weaknesses, and improvements for your target role
                    </p>
                </motion.div>

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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface rounded-2xl border border-gray-800 p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setInputMode('file')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                inputMode === 'file' ? 'bg-primary text-dark' : 'bg-dark text-gray-400 hover:text-white'
                            }`}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setInputMode('paste')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                inputMode === 'paste' ? 'bg-primary text-dark' : 'bg-dark text-gray-400 hover:text-white'
                            }`}
                        >
                            Paste Text
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Job Role (optional)</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Frontend Developer, Data Analyst, HR Executive"
                            className="w-full p-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-4">
                        {inputMode === 'file' ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors duration-300"
                            >
                                <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">{selectedFile ? selectedFile.name : 'Click to upload resume'}</p>
                                <p className="text-sm text-gray-500">PDF or DOCX format</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={pastedText}
                                    onChange={(e) => {
                                        setPastedText(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Paste your resume text here..."
                                    rows={12}
                                    className="w-full p-4 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-2">{pastedText.length} / 10000 characters</p>
                            </div>
                        )}
                    </div>

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

                            <div className="prose prose-invert max-w-none">{formatAnalysisText(analysis)}</div>

                            <div className="mt-8 pt-6 border-t border-gray-800 flex gap-4">
                                <button
                                    onClick={() => {
                                        setAnalysis(null);
                                        setSelectedFile(null);
                                        setPastedText('');
                                    }}
                                    className="px-6 py-3 bg-dark border border-gray-700 rounded-full hover:border-primary transition-colors duration-300"
                                >
                                    Analyze Another Resume
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 p-6 bg-surface/50 rounded-xl border border-gray-800"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            What This Analysis Focuses On
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Role-fit summary for your target position</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Strengths that improve recruiter confidence</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Weaknesses and missing information to fix</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Concrete improvement and rewrite guidance</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
