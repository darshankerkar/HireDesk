import axios from 'axios';

/**
 * Send a message to Gemini AI via serverless function
 * This keeps the API key secure on the server-side
 * @param {string} userMessage - The user's message
 * @param {Array} jobs - Array of job objects for context
 * @returns {Promise<string>} - AI response text
 */
export async function sendMessage(userMessage, jobs = []) {
  try {
    // Call the serverless function instead of Gemini directly
    const response = await axios.post('/api/chat', {
      message: userMessage,
      jobsContext: jobs
    });

    if (response.data.success) {
      return response.data.response;
    } else {
      throw new Error(response.data.error || 'Failed to get AI response');
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check if it's a network error or API error
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'Failed to get AI response. Please try again.');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Unable to connect to chat service. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

