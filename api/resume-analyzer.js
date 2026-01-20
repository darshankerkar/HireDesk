import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function to handle Resume Analysis with Gemini AI
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
    const { resumeText } = req.body;

    // Validate input
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required and must be a string' });
    }

    // Initialize Gemini with server-side API key
    const apiKey = process.env.GEMINI_RESUME_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_RESUME_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the analysis prompt
    const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume and provide detailed, constructive feedback. Structure your response in the following sections:

1. **Overall Impression** (2-3 sentences)
2. **Strengths** (3-5 bullet points)
3. **Areas for Improvement** (3-5 bullet points with specific suggestions)
4. **ATS Optimization Tips** (3-4 actionable recommendations)
5. **Skills & Keywords** (Suggest missing relevant skills or keywords)
6. **Formatting & Structure** (Comments on layout and readability)
7. **Action Items** (Top 3 priority changes to make)

Resume Content:
${resumeText}

Please provide professional, actionable, and encouraging feedback.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return res.status(200).json({ 
      success: true,
      analysis: analysisText 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return user-friendly error message
    return res.status(500).json({ 
      success: false,
      error: 'Failed to analyze resume. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
