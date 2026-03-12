/**
 * Backend Knowledge Set - Embedded from ML Service
 * This contains the skills taxonomy, domain metadata, and scoring criteria
 * used by the ML model for resume analysis
 */

export const SKILLS_TAXONOMY = {
  "Programming Languages": [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "Ruby", "Go",
    "Swift", "Kotlin", "PHP", "Rust", "Scala", "Perl", "R", "Matlab"
  ],

  "Web Frameworks": [
    "React", "Angular", "Vue.js", "Next.js", "Node.js", "Django", "Flask",
    "FastAPI", "Spring Boot", "ASP.NET", "Ruby on Rails", "Laravel", "Express.js"
  ],

  "Machine Learning & AI": [
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy",
    "OpenCV", "NLP", "Computer Vision", "Deep Learning",
    "Reinforcement Learning", "Hugging Face"
  ],

  "Cloud & DevOps": [
    "AWS", "Azure", "Google Cloud Platform", "GCP", "Docker", "Kubernetes",
    "Jenkins", "Terraform", "Ansible", "CircleCI", "GitLab CI",
    "Linux", "Bash", "Nginx", "CI/CD", "Cloud Security"
  ],

  "Databases": [
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle",
    "SQL Server", "DynamoDB", "Cassandra", "Elasticsearch", "SQLite"
  ],

  "Cybersecurity": [
    "Penetration Testing", "Ethical Hacking", "Vulnerability Assessment",
    "Network Security", "Kali Linux", "Metasploit", "Burp Suite",
    "Nmap", "Wireshark", "OWASP", "SIEM", "Splunk", "SOC",
    "Incident Response", "Forensics", "Cryptography",
    "Malware Analysis", "Threat Modeling", "Security Auditing"
  ],

  "Data Science": [
    "Data Analysis", "Data Visualization", "Tableau", "Power BI",
    "Big Data", "Hadoop", "Spark", "ETL", "Data Warehousing",
    "Business Intelligence", "Statistics", "Predictive Analytics"
  ],

  "Mobile Development": [
    "Android", "iOS", "React Native", "Flutter", "Xamarin", "Swift UI", "Kotlin Multiplatform"
  ],

  "Marketing": [
    "SEO", "SEM", "Google Ads", "Facebook Ads", "Social Media Marketing",
    "Content Marketing", "Email Marketing", "Marketing Analytics",
    "Google Analytics", "HubSpot", "Mailchimp",
    "Campaign Management", "Brand Strategy", "Market Research",
    "Customer Analytics", "A/B Testing", "Conversion Optimization",
    "Meta Blueprint", "Copywriting", "Marketing Automation"
  ],

  "Sales": [
    "CRM", "Salesforce", "Lead Generation", "B2B Sales", "B2C Sales",
    "Account Management", "Sales Pipeline", "Prospecting",
    "Cold Calling", "Negotiation", "Revenue Growth",
    "Sales Strategy", "Customer Acquisition", "Deal Closing"
  ],

  "HR": [
    "Recruitment", "Talent Acquisition", "HRIS", "Performance Management",
    "Employee Relations", "Compensation", "Benefits", "Onboarding",
    "Training & Development", "Organizational Development",
    "Workday", "SAP SuccessFactors", "ATS", "Talent Management"
  ],

  "Design & UX": [
    "UI Design", "UX Design", "Figma", "Adobe XD", "Sketch",
    "User Research", "Wireframing", "Prototyping",
    "Interaction Design", "Design Systems", "Accessibility",
    "Adobe Photoshop", "Adobe Illustrator", "InVision"
  ],

  "Product Management": [
    "Product Strategy", "Roadmapping", "User Stories", "PRD",
    "Agile Product Management", "Stakeholder Management",
    "Product Analytics", "Go-to-Market", "Feature Prioritization",
    "Product Vision", "Customer Discovery", "Backlog Management"
  ],

  "Operations & Management": [
    "Operations Management", "Process Optimization",
    "Supply Chain", "Vendor Management", "Business Operations",
    "Risk Management", "Compliance", "Logistics",
    "Inventory Management", "Operational Excellence"
  ],

  "Finance & Accounting": [
    "Financial Analysis", "Accounting", "Budgeting",
    "Forecasting", "Taxation", "Auditing",
    "Financial Modeling", "Cost Analysis", "Financial Reporting",
    "GAAP", "QuickBooks", "Excel Financial Analysis"
  ],

  "Quality Assurance": [
    "Manual Testing", "Automation Testing", "Selenium",
    "Cypress", "JUnit", "Test Cases", "Bug Tracking",
    "Regression Testing", "Performance Testing", "API Testing",
    "Test Planning", "JIRA", "Postman"
  ],

  "Customer Support": [
    "Customer Support", "Customer Success", "Zendesk",
    "Freshdesk", "Technical Support", "Issue Resolution",
    "Client Communication", "Ticketing Systems", "Customer Satisfaction"
  ],

  "Business Analysis": [
    "Business Analysis", "Requirements Gathering", "Process Mapping",
    "Gap Analysis", "Stakeholder Analysis", "SWOT Analysis",
    "Business Process Modeling", "User Acceptance Testing",
    "Documentation", "Visio", "Business Intelligence"
  ],

  "Content & Writing": [
    "Content Writing", "Technical Writing", "Copywriting",
    "Blogging", "Journalism", "Proofreading", "Editing",
    "SEO Writing", "Content Strategy", "Creative Writing",
    "Grant Writing", "Documentation"
  ],

  "Legal & Compliance": [
    "Legal Research", "Contract Management", "Compliance",
    "Regulatory Affairs", "Corporate Law", "Intellectual Property",
    "GDPR", "Legal Documentation", "Risk Assessment",
    "Corporate Governance"
  ],

  "Soft Skills": [
    "Communication", "Leadership", "Teamwork",
    "Problem Solving", "Critical Thinking",
    "Time Management", "Adaptability",
    "Project Management", "Agile", "Scrum",
    "Presentation Skills", "Conflict Resolution"
  ]
};

export const DOMAIN_METADATA = {
  "security": {
    "categories": ["Cybersecurity"],
    "keywords": ["security", "penetration", "ethical hacker", "vulnerability", "cybersecurity", "infosec", "siem", "soc", "firewall", "threat"],
    "exclusive_skills": ["metasploit", "burp suite", "kali linux", "nmap", "malware analysis", "oscp", "ceh", "cissp"]
  },

  "marketing": {
    "categories": ["Marketing"],
    "keywords": ["marketing", "seo", "sem", "campaign", "brand", "advertising", "social media", "content", "digital marketing", "growth"],
    "exclusive_skills": ["google ads", "facebook ads", "hubspot", "mailchimp", "copywriting", "meta blueprint"]
  },

  "development": {
    "categories": ["Programming Languages", "Web Frameworks", "Mobile Development"],
    "keywords": ["developer", "software engineer", "programmer", "coding", "backend", "frontend", "full stack", "web development"],
    "exclusive_skills": ["react", "angular", "node.js", "django", "spring boot", "docker", "kubernetes"]
  },

  "data": {
    "categories": ["Data Science", "Machine Learning & AI"],
    "keywords": ["data scientist", "data analyst", "analytics", "ml engineer", "ai", "business intelligence", "data engineering"],
    "exclusive_skills": ["tensorflow", "pytorch", "tableau", "power bi", "hadoop", "spark", "scikit-learn"]
  },

  "sales": {
    "categories": ["Sales"],
    "keywords": ["sales", "account executive", "business development", "revenue", "crm", "account manager"],
    "exclusive_skills": ["salesforce", "lead generation", "cold calling", "prospecting", "b2b sales"]
  },

  "hr": {
    "categories": ["HR"],
    "keywords": ["hr", "human resources", "recruiter", "talent acquisition", "people operations", "hris"],
    "exclusive_skills": ["workday", "sap successfactors", "ats", "recruitment", "compensation"]
  },

  "design": {
    "categories": ["Design & UX"],
    "keywords": ["designer", "ui", "ux", "product design", "visual design", "graphic design", "user experience"],
    "exclusive_skills": ["figma", "adobe xd", "sketch", "wireframing", "prototyping", "user research"]
  },

  "product": {
    "categories": ["Product Management"],
    "keywords": ["product manager", "product owner", "roadmap", "prd", "product strategy", "feature"],
    "exclusive_skills": ["roadmapping", "user stories", "product analytics", "prd", "backlog management"]
  },

  "finance": {
    "categories": ["Finance & Accounting"],
    "keywords": ["finance", "accounting", "financial analyst", "budget", "financial planning", "cpa"],
    "exclusive_skills": ["financial modeling", "forecasting", "auditing", "gaap", "financial reporting"]
  },

  "qa": {
    "categories": ["Quality Assurance"],
    "keywords": ["qa", "quality assurance", "tester", "testing", "automation", "test engineer"],
    "exclusive_skills": ["selenium", "cypress", "automation testing", "test cases", "regression testing"]
  },

  "devops": {
    "categories": ["Cloud & DevOps"],
    "keywords": ["devops", "site reliability", "sre", "cloud engineer", "infrastructure engineer", "platform engineer", "ci/cd"],
    "exclusive_skills": ["docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd pipelines"]
  },

  "operations": {
    "categories": ["Operations & Management"],
    "keywords": ["operations", "operations manager", "process", "supply chain", "logistics", "vendor"],
    "exclusive_skills": ["process optimization", "supply chain", "vendor management", "logistics"]
  },

  "content": {
    "categories": ["Content & Writing"],
    "keywords": ["content writer", "technical writer", "copywriter", "editor", "journalist", "blogger"],
    "exclusive_skills": ["content writing", "technical writing", "seo writing", "content strategy"]
  },

  "support": {
    "categories": ["Customer Support"],
    "keywords": ["customer support", "customer success", "technical support", "help desk", "support engineer"],
    "exclusive_skills": ["zendesk", "freshdesk", "ticketing systems", "customer satisfaction"]
  },

  "business": {
    "categories": ["Business Analysis"],
    "keywords": ["business analyst", "ba", "requirements", "process analyst", "systems analyst"],
    "exclusive_skills": ["business analysis", "requirements gathering", "process mapping", "gap analysis"]
  },

  "legal": {
    "categories": ["Legal & Compliance"],
    "keywords": ["legal", "compliance", "lawyer", "attorney", "legal counsel", "regulatory"],
    "exclusive_skills": ["legal research", "contract management", "compliance", "regulatory affairs", "gdpr"]
  }
};

// Scoring weights used by the ML model
export const SCORING_WEIGHTS = {
  hard_skills: 0.20,      // 20% - Hard technical skills
  experience: 0.40,       // 40% - Years of experience
  certifications: 0.15,   // 15% - Professional certifications
  degree: 0.10,           // 10% - Educational qualification
  semantic_sim: 0.10,     // 10% - Semantic similarity
  soft_skills: 0.05       // 5% - Soft skills
};

// Premium certifications (highest value)
export const PREMIUM_CERTIFICATIONS = {
  security: ["OSCP", "CEH", "CISSP", "CISM", "CCSP"],
  cloud: ["AWS Certified", "Azure Certified", "GCP Certified"],
  data: ["TensorFlow Developer", "Google Data Analytics"],
  project: ["PMP", "PRINCE2", "Scrum Master"],
  general: ["Six Sigma", "ITIL", "CompTIA"]
};

// Degree scoring scale
export const DEGREE_SCORES = {
  "PhD": 5,
  "Doctorate": 5,
  "Masters": 3,
  "M.Tech": 3,
  "MBA": 3,
  "M.Sc": 3,
  "Bachelors": 1,
  "B.Tech": 1,
  "B.E.": 1,
  "B.Sc": 1
};
