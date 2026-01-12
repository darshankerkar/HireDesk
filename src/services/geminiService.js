import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Send a message to Gemini AI with job context
 * @param {string} userMessage - The user's message
 * @param {Array} jobs - Array of job objects for context
 * @returns {Promise<string>} - AI response text
 */
export async function sendMessage(userMessage, jobs = []) {
  try {
    // Initialize the model - using gemini-2.5-flash for speed and compatibility
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format jobs data for context
    const jobsContext = jobs.map(job => 
      `Job Title: ${job.title}\n` +
      `Description: ${job.description}\n` +
      `Requirements: ${job.requirements || 'Not specified'}\n` +
      `Candidates: ${job.candidate_count || 0}\n`
    ).join('\n---\n');

    // Construct the system prompt with job context
    const systemPrompt = `You are HireDesk's AI assistant, helping job seekers understand available positions.

Current job openings:
${jobsContext || 'No jobs currently available.'}

Your role:
- Answer questions about job requirements, responsibilities, and qualifications
- Help candidates understand which positions match their skills
- Be friendly, concise, and professional
- If asked about specific jobs, reference them by title
- If asked about application process, direct them to upload their resume on the platform

Keep responses brief (2-3 sentences unless more detail is requested).`;

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}
