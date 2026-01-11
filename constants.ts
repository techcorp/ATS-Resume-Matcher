
import { OllamaModel } from './types.ts';

const getOllamaUrl = () => {
  try {
    if (typeof window !== 'undefined') {
      const win = window as any;
      // 1. Check for explicit injection
      if (win.ENV_OLLAMA_URL && win.ENV_OLLAMA_URL !== "OLLAMA_URL_PLACEHOLDER") {
        return win.ENV_OLLAMA_URL;
      }
      
      // 2. Fail-safe check for process.env
      if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_OLLAMA_URL) {
        return process.env.NEXT_PUBLIC_OLLAMA_URL;
      }
      
      // 3. Fallback to common dev port
      return 'http://localhost:11434';
    }
  } catch (e) {
    console.warn("ATS Pro: Error reading environment variables, falling back to localhost.");
  }
  return 'http://localhost:11434';
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
