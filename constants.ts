
import { OllamaModel } from './types.ts';

const getOllamaUrl = () => {
  if (typeof window !== 'undefined') {
    // 1. Check for Docker/Window runtime injection
    if ((window as any).ENV_OLLAMA_URL && (window as any).ENV_OLLAMA_URL !== "OLLAMA_URL_PLACEHOLDER") {
      return (window as any).ENV_OLLAMA_URL;
    }
    
    // 2. Safe check for process.env (prevents crash if process is undefined)
    try {
      const globalProcess = (window as any).process;
      if (globalProcess && globalProcess.env && globalProcess.env.NEXT_PUBLIC_OLLAMA_URL) {
        return globalProcess.env.NEXT_PUBLIC_OLLAMA_URL;
      }
    } catch(e) {
      console.warn("ATS Pro: Could not read process.env safely.");
    }
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
