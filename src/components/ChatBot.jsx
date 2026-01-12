import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { sendMessage } from '../services/geminiService';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const messagesEndRef = useRef(null);

    const quickActions = [
        "Show all available jobs",
        "What skills are in demand?",
        "Entry-level positions?"
    ];

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch jobs when chat opens
    useEffect(() => {
        if (isOpen && jobs.length === 0) {
            fetchJobs();
        }
    }, [isOpen]);

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm your HireDesk assistant. Ask me anything about our job openings!"
            }]);
        }
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/recruitment/jobs/');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleSendMessage = async (messageText = inputValue) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = messageText.trim();

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputValue('');
        setShowQuickActions(false);
        setIsLoading(true);

        try {
            // Get AI response
            const aiResponse = await sendMessage(userMessage, jobs);

            // Add AI message
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        handleSendMessage(action);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary to-lime-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    y: {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    }
                }}
            >
                <MessageCircle className="h-6 w-6 text-dark" />
            </motion.button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-md md:w-[400px] h-[600px] md:h-[600px] max-h-[80vh] bg-surface rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden"
                        style={{
                            maxWidth: window.innerWidth < 768 ? 'calc(100vw - 2rem)' : '400px'
                        }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary/20 to-lime-400/20 border-b border-gray-800 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold text-white">Job Assistant</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-primary to-lime-400 text-dark font-medium'
                                                : 'bg-dark border border-gray-800 text-gray-200'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Quick Actions */}
                            {showQuickActions && messages.length === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-2"
                                >
                                    <p className="text-xs text-gray-500 text-center">Quick questions:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {quickActions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickAction(action)}
                                                className="px-3 py-1.5 bg-dark border border-primary/30 text-primary text-sm rounded-full hover:bg-primary/10 transition-all duration-300"
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-dark border border-gray-800 p-3 rounded-2xl">
                                        <div className="flex space-x-1">
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-800 p-4 bg-dark/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about jobs..."
                                    disabled={isLoading}
                                    className="flex-1 bg-surface border border-gray-800 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-2 bg-primary text-dark rounded-xl hover:bg-lime-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
          background: #D4F223;
        }
      `}</style>
        </>
    );
}
