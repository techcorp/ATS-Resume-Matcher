
import { OllamaModel } from './types.ts';

// Detect environment URL, with fallbacks for standard and browser-injected scenarios
const getOllamaUrl = () => {
  if (typeof window !== 'undefined' && (window as any).ENV_OLLAMA_URL) {
    return (window as any).ENV_OLLAMA_URL;
  }
  
  const processEnv = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string>;
  const envUrl = processEnv.NEXT_PUBLIC_OLLAMA_URL || processEnv.OLLAMA_URL;
  
  return envUrl || 'http://localhost:11434';
};

export const OLLAMA_BASE_URL = getOllamaUrl();

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
