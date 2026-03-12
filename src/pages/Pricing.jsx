import React from 'react';
import { motion } from 'framer-motion';

export default function Pricing() {
  return (
    <div className="bg-dark min-h-screen text-secondary py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-dark to-dark opacity-50"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Transparent Pricing</h1>
          <p className="text-xl text-gray-400">Simple, predictable pricing for companies of all sizes.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-gray-800 rounded-3xl p-8 md:p-10 text-center flex flex-col h-full hover:border-gray-500 transition-colors duration-300"
          >
            <h2 className="text-3xl font-bold mb-4">Free Plan</h2>
            <div className="text-5xl font-display font-bold text-white mb-6">
              $0<span className="text-xl text-gray-400 font-normal">/month</span>
            </div>
            <p className="text-gray-400 mb-8 mx-auto">
              Perfect for getting started and exploring limited features.
            </p>
            
            <ul className="text-left space-y-4 mb-8 flex-grow">
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic Resume Upload
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Limited Resume Parsing
              </li>
              <li className="flex items-center text-gray-300 opacity-50">
                <svg className="h-6 w-6 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Advanced AI Candidate Scoring
              </li>
            </ul>

            <a href="/?signup=true" className="w-full inline-block px-8 py-4 bg-transparent border border-gray-600 text-white font-bold text-lg rounded-full hover:bg-gray-800 transition-colors duration-300">
              Get Started Free
            </a>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border-2 border-primary rounded-3xl p-8 md:p-10 text-center flex flex-col h-full relative"
          >
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary text-dark px-4 py-1 rounded-full font-bold text-sm tracking-wide">
              MOST POPULAR
            </div>
            <h2 className="text-3xl font-bold mb-4">Pro Plan</h2>
            <div className="text-5xl font-display font-bold text-primary mb-6">
              $3<span className="text-xl text-gray-400 font-normal">/month</span>
              <div className="text-sm font-normal text-gray-500 mt-1">per recruiter</div>
            </div>
            <p className="text-gray-400 mb-8 mx-auto">
              Everything you need for AI-powered recruitment automation. Get full access.
            </p>
            
            <ul className="text-left space-y-4 mb-8 flex-grow">
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited Resume Parsing & Analysis
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced AI Candidate Scoring
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bulk Resume Upload (CSV/Excel)
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Automated Interview Room Management
              </li>
            </ul>

            <a href="/?signup=true" className="w-full inline-block px-8 py-4 bg-primary text-dark font-bold text-lg rounded-full hover:bg-white transition-colors duration-300">
              Upgrade to Pro
            </a>
          </motion.div>
        </div>

        <p className="text-sm text-gray-500 italic mt-12 text-center">
          Note: Recify is a subscription-based software platform. We do not provide job placement services.
        </p>
      </div>
    </div>
  );
}
