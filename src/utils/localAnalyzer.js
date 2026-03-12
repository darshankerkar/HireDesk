/**
 * Resume Analyzer - Local Implementation
 * Uses the backend knowledge set to analyze resumes offline
 * Based on the ML service's scoring logic
 */

import { 
  SKILLS_TAXONOMY, 
  DOMAIN_METADATA, 
  SCORING_WEIGHTS,
  PREMIUM_CERTIFICATIONS,
  DEGREE_SCORES
} from '../data/knowledgeSet';

/**
 * Detect domain from resume text
 */
function detectDomain(text) {
  const textLower = text.toLowerCase();
  const domainScores = {};

  Object.entries(DOMAIN_METADATA).forEach(([domainName, metadata]) => {
    let score = 0;

    // Check keywords
    metadata.keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 2;
      }
    });

    // Check exclusive skills (strong signal)
    metadata.exclusive_skills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        score += 3;
      }
    });

    domainScores[domainName] = score;
  });

  const maxScore = Math.max(...Object.values(domainScores));
  if (maxScore < 3) return 'general';

  return Object.keys(domainScores).reduce((a, b) => 
    domainScores[a] > domainScores[b] ? a : b
  );
}

/**
 * Extract skills from resume text
 */
function extractSkills(text) {
  const textLower = text.toLowerCase();
  const foundSkills = [];
  const skillsByCategory = {};

  Object.entries(SKILLS_TAXONOMY).forEach(([category, skills]) => {
    skillsByCategory[category] = [];
    
    skills.forEach(skill => {
      // Use word boundary matching to avoid false positives
      const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(textLower)) {
        foundSkills.push(skill);
        skillsByCategory[category].push(skill);
      }
    });
  });

  return { foundSkills, skillsByCategory };
}

/**
 * Extract certifications from text
 */
function extractCertifications(text) {
  const textLower = text.toLowerCase();
  const foundCerts = [];

  Object.entries(PREMIUM_CERTIFICATIONS).forEach(([category, certs]) => {
    certs.forEach(cert => {
      if (textLower.includes(cert.toLowerCase())) {
        foundCerts.push({ cert, category });
      }
    });
  });

  return foundCerts;
}

/**
 * Extract degree information
 */
function extractDegree(text) {
  const textLower = text.toLowerCase();
  let highestDegree = null;
  let highestScore = 0;

  Object.entries(DEGREE_SCORES).forEach(([degree, score]) => {
    if (textLower.includes(degree.toLowerCase())) {
      if (score > highestScore) {
        highestScore = score;
        highestDegree = degree;
      }
    }
  });

  return { degree: highestDegree, score: highestScore };
}

/**
 * Estimate years of experience from text
 */
function extractExperience(text) {
  const textLower = text.toLowerCase();
  
  // Look for explicit mentions like "5 years", "5+ years", "5-7 years"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i,
    /experience[:\s]+(\d+)\+?\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)/i
  ];

  for (const pattern of patterns) {
    const match = textLower.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Count experience sections (rough estimation)
  const experienceSections = (textLower.match(/experience|work history|employment/g) || []).length;
  const jobTitles = (textLower.match(/engineer|developer|manager|analyst|designer|specialist/g) || []).length;
  
  // Rough heuristic: if multiple job mentions, assume some experience
  if (jobTitles >= 3) return 3;
  if (jobTitles >= 2) return 2;
  if (jobTitles >= 1) return 1;
  
  return 0;
}

/**
 * Check for ATS-friendly formatting
 */
function checkATSCompatibility(text) {
  const issues = [];
  const recommendations = [];

  // Check length
  if (text.length < 500) {
    issues.push("Resume seems too short (less than 500 characters)");
    recommendations.push("Expand your resume with more details about your experience and achievements");
  }

  // Check for contact info patterns
  const hasEmail = /@/.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  
  if (!hasEmail) {
    issues.push("No email address detected");
    recommendations.push("Add your professional email address");
  }
  
  if (!hasPhone) {
    issues.push("No phone number detected");
    recommendations.push("Include your contact phone number");
  }

  // Check for key sections
  const hasExperience = /experience|work history|employment/i.test(text);
  const hasEducation = /education|academic|university|college|degree/i.test(text);
  const hasSkills = /skills|technologies|proficiencies/i.test(text);

  if (!hasExperience) {
    issues.push("No clear experience section found");
    recommendations.push("Add a dedicated 'Experience' or 'Work History' section");
  }

  if (!hasEducation) {
    issues.push("No education section detected");
    recommendations.push("Include your educational background");
  }

  if (!hasSkills) {
    issues.push("No skills section found");
    recommendations.push("Add a 'Skills' section with your technical and soft skills");
  }

  return { issues, recommendations };
}

/**
 * Analyze content quality
 */
function analyzeContent(text, skills) {
  const insights = [];
  const textLower = text.toLowerCase();

  // Check for action verbs (good for ATS)
  const actionVerbs = ['developed', 'managed', 'led', 'created', 'implemented', 'designed', 'improved', 'increased', 'reduced'];
  const actionVerbCount = actionVerbs.filter(verb => textLower.includes(verb)).length;

  if (actionVerbCount >= 5) {
    insights.push("✓ Strong use of action verbs (good for ATS)");
  } else if (actionVerbCount >= 2) {
    insights.push("⚠ Use more action verbs like 'developed', 'led', 'implemented'");
  } else {
    insights.push("✗ Weak action verb usage - start bullet points with strong action verbs");
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\s*(?:users|clients|projects|hours|days)/.test(text);
  if (hasNumbers) {
    insights.push("✓ Contains quantifiable achievements (excellent!)");
  } else {
    insights.push("⚠ Add quantifiable achievements (e.g., 'Increased sales by 25%', 'Managed team of 5')");
  }

  // Skill diversity
  const categoryCount = Object.keys(skills.skillsByCategory).filter(
    cat => skills.skillsByCategory[cat].length > 0
  ).length;

  if (categoryCount >= 5) {
    insights.push("✓ Diverse skill set across multiple domains");
  } else if (categoryCount >= 3) {
    insights.push("⚠ Consider adding more diverse skills");
  } else {
    insights.push("✗ Limited skill diversity - expand your skill set");
  }

  return insights;
}

/**
 * Main analysis function
 */
export function analyzeResumeLocally(resumeText) {
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      success: false,
      error: "Resume text is too short or empty. Please provide a complete resume."
    };
  }

  // Extract all features
  const domain = detectDomain(resumeText);
  const skills = extractSkills(resumeText);
  const certifications = extractCertifications(resumeText);
  const degree = extractDegree(resumeText);
  const experience = extractExperience(resumeText);
  const atsCheck = checkATSCompatibility(resumeText);
  const contentAnalysis = analyzeContent(resumeText, skills);

  // Calculate estimated score components
  const skillScore = Math.min(skills.foundSkills.length / 10, 1) * 100; // 10+ skills = 100%
  const expScore = Math.min(experience / 7, 1) * 100; // 7+ years = 100%
  const certScore = Math.min(certifications.length / 3, 1) * 100; // 3+ certs = 100%
  const degreeScore = (degree.score / 5) * 100; // PhD = 100%

  // Weighted overall score
  const overallScore = Math.round(
    (skillScore * SCORING_WEIGHTS.hard_skills) +
    (expScore * SCORING_WEIGHTS.experience) +
    (certScore * SCORING_WEIGHTS.certifications) +
    (degreeScore * SCORING_WEIGHTS.degree) +
    (50 * SCORING_WEIGHTS.semantic_sim) + // Default semantic score
    (50 * SCORING_WEIGHTS.soft_skills) // Default soft skills score
  );

  return {
    success: true,
    analysis: {
      overallScore,
      domain,
      experience,
      skills: skills.foundSkills,
      skillsByCategory: skills.skillsByCategory,
      certifications,
      degree: degree.degree,
      degreeScore: degree.score,
      atsCompatibility: atsCheck,
      contentInsights: contentAnalysis,
      scoreBreakdown: {
        skills: Math.round(skillScore),
        experience: Math.round(expScore),
        certifications: Math.round(certScore),
        education: Math.round(degreeScore)
      }
    }
  };
}

/**
 * Format analysis into readable text for display
 */
export function formatAnalysisForDisplay(analysis) {
  const { 
    overallScore, 
    domain, 
    experience, 
    skills, 
    skillsByCategory,
    certifications, 
    degree,
    atsCompatibility,
    contentInsights,
    scoreBreakdown
  } = analysis;

  let output = '';

  // Overall Score
  output += `**Overall Resume Score: ${overallScore}%**\n\n`;
  
  if (overallScore >= 80) {
    output += `Excellent resume! You're well-positioned for job applications.\n\n`;
  } else if (overallScore >= 60) {
    output += `Good foundation, but there's room for improvement.\n\n`;
  } else if (overallScore >= 40) {
    output += `Your resume needs significant improvements to stand out.\n\n`;
  } else {
    output += `Your resume requires major revisions before applying.\n\n`;
  }

  // Detected Domain
  output += `**Detected Domain: ${domain.toUpperCase()}**\n`;
  output += `Your resume appears to be targeting ${domain} roles.\n\n`;

  // Score Breakdown
  output += `**Score Breakdown**\n`;
  output += `* Skills: ${scoreBreakdown.skills}% (Weight: ${SCORING_WEIGHTS.hard_skills * 100}%)\n`;
  output += `* Experience: ${scoreBreakdown.experience}% (Weight: ${SCORING_WEIGHTS.experience * 100}%)\n`;
  output += `* Certifications: ${scoreBreakdown.certifications}% (Weight: ${SCORING_WEIGHTS.certifications * 100}%)\n`;
  output += `* Education: ${scoreBreakdown.education}% (Weight: ${SCORING_WEIGHTS.degree * 100}%)\n\n`;

  // Experience
  output += `**Experience**\n`;
  if (experience === 0) {
    output += `* No clear experience mentioned (Consider: Are you a fresher? Mention internships, projects, or volunteer work)\n\n`;
  } else {
    output += `* Detected: ~${experience} years of experience\n\n`;
  }

  // Education
  output += `**Education**\n`;
  if (degree) {
    output += `* Highest Degree: ${degree}\n\n`;
  } else {
    output += `* No degree detected. Add your educational qualifications.\n\n`;
  }

  // Skills Detected
  output += `**Skills Found (${skills.length} total)**\n`;
  if (skills.length === 0) {
    output += `* ⚠️ No recognized skills detected. Add a dedicated skills section.\n\n`;
  } else {
    // Show top categories
    const topCategories = Object.entries(skillsByCategory)
      .filter(([_, skills]) => skills.length > 0)
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 5);

    topCategories.forEach(([category, categorySkills]) => {
      output += `* ${category}: ${categorySkills.join(', ')}\n`;
    });
    output += '\n';
  }

  // Certifications
  output += `**Certifications**\n`;
  if (certifications.length === 0) {
    output += `* No premium certifications detected\n`;
    output += `* Consider getting certifications in: ${domain === 'security' ? 'OSCP, CEH, CISSP' : domain === 'data' ? 'TensorFlow Developer, AWS ML' : domain === 'cloud' ? 'AWS Certified, Azure Certified' : 'relevant certifications for your field'}\n\n`;
  } else {
    certifications.forEach(({ cert, category }) => {
      output += `* ✓ ${cert} (${category})\n`;
    });
    output += '\n';
  }

  // ATS Compatibility
  output += `**ATS Optimization**\n`;
  if (atsCompatibility.issues.length === 0) {
    output += `* ✓ Good ATS compatibility!\n\n`;
  } else {
    output += `Issues Found:\n`;
    atsCompatibility.issues.forEach(issue => {
      output += `* ${issue}\n`;
    });
    output += '\n';
  }

  // Content Quality
  output += `**Content Quality Analysis**\n`;
  contentInsights.forEach(insight => {
    output += `* ${insight}\n`;
  });
  output += '\n';

  // Recommendations
  output += `**Top Recommendations**\n`;
  const recommendations = [];

  if (skills.length < 5) {
    recommendations.push(`Add more relevant ${domain} skills to your resume`);
  }

  if (experience < 2 && degree !== 'Masters' && degree !== 'PhD') {
    recommendations.push('Highlight projects, internships, or coursework to compensate for limited experience');
  }

  if (certifications.length === 0) {
    recommendations.push('Obtain industry-recognized certifications to boost credibility');
  }

  if (atsCompatibility.recommendations.length > 0) {
    recommendations.push(...atsCompatibility.recommendations.slice(0, 2));
  }

  if (!contentInsights.some(i => i.includes('quantifiable'))) {
    recommendations.push('Add quantifiable achievements (e.g., "Increased revenue by 30%")');
  }

  recommendations.slice(0, 5).forEach((rec, i) => {
    output += `${i + 1}. ${rec}\n`;
  });

  // Missing Skills Suggestions
  output += `\n**Suggested Skills for ${domain.toUpperCase()} Domain**\n`;
  const domainCategories = DOMAIN_METADATA[domain]?.categories || [];
  const suggestedSkills = [];

  domainCategories.forEach(category => {
    const categorySkills = SKILLS_TAXONOMY[category] || [];
    const missingSkills = categorySkills.filter(skill => 
      !skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    );
    suggestedSkills.push(...missingSkills.slice(0, 3));
  });

  if (suggestedSkills.length > 0) {
    output += `Consider adding: ${suggestedSkills.slice(0, 8).join(', ')}\n`;
  }

  return output;
}
