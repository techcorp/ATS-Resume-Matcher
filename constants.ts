
import { OllamaModel } from './types';

// Check for environment variables (supports standard and Next.js style prefixes used in your Docker config)
const ENV_URL = typeof process !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_OLLAMA_URL || process.env.OLLAMA_URL) 
  : null;

export const OLLAMA_BASE_URL = ENV_URL || 'http://localhost:11434';

export const OLLAMA_MODELS: OllamaModel[] = [
  { name: 'Llama 3 (Balanced)', value: 'llama3' },
  { name: 'Mistral (Fast)', value: 'mistral' },
  { name: 'DeepSeek Coder (Technical)', value: 'deepseek-coder' }
];

export const ANALYSIS_PROMPT = (resume: string, jd: string) => `
Analyze this RESUME against the JOB DESCRIPTION.
Output ONLY a strictly valid JSON object. Do not include any text before or after the JSON.

RESUME:
${resume}

JOB DESCRIPTION:
${jd}

JSON SCHEMA:
{
  "overallScore": number (0-100),
  "skillsMatch": number (0-100),
  "experienceRelevance": number (0-100),
  "keywordMatch": number (0-100),
  "educationAlignment": number (0-100),
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["tip1", "tip2"],
  "summary": "Short professional overview"
}
`;

export const OPTIMIZATION_PROMPT = (resume: string, jd: string) => `
Optimize this RESUME for the JOB DESCRIPTION using the STAR method.
Output ONLY a strictly valid JSON object.

RESUME:
${resume}

JOB DESCRIPTION:
${jd}

JSON SCHEMA:
{
  "header": "Name and Contact",
  "summary": "Tailored summary",
  "experience": ["STAR bullet 1", "STAR bullet 2"],
  "skills": ["Skill 1", "Skill 2"]
}
`;
