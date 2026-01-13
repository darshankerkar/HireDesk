import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function to handle Gemini AI chat requests
 * This keeps the API key secure on the server-side
 */
export default async function handler(req, res) {
  // Set CORS headers for local development and production
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, jobsContext } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Initialize Gemini with server-side API key
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('VITE_GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format jobs data for context
    const jobsData = Array.isArray(jobsContext) ? jobsContext.map(job => 
      `Job Title: ${job.title}\n` +
      `Description: ${job.description}\n` +
      `Requirements: ${job.requirements || 'Not specified'}\n` +
      `Candidates: ${job.candidate_count || 0}\n`
    ).join('\n---\n') : 'No jobs currently available.';

    // Construct the system prompt with job context
    const systemPrompt = `You are HireDesk's AI assistant, helping job seekers understand available positions.

Current job openings:
${jobsData}

Your role:
- Answer questions about job requirements, responsibilities, and qualifications
- Help candidates understand which positions match their skills
- Be friendly, concise, and professional
- If asked about specific jobs, reference them by title
- If asked about application process, direct them to upload their resume on the platform

Keep responses brief (2-3 sentences unless more detail is requested).`;

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    return res.status(200).json({ 
      success: true,
      response: responseText 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return user-friendly error message
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get AI response. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
