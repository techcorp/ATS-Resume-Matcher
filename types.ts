
export interface AnalysisResult {
  overallScore: number;
  skillsMatch: number;
  experienceRelevance: number;
  keywordMatch: number;
  educationAlignment: number;
  missingSkills: string[];
  suggestions: string[];
  summary: string;
}

export interface OptimizedResume {
  header: string;
  summary: string;
  experience: string[];
  skills: string[];
}

export enum AppStep {
  Input = 'INPUT',
  Analyzing = 'ANALYZING',
  Result = 'RESULT',
  Optimizing = 'OPTIMIZING'
}

export interface JobData {
  title: string;
  description: string;
}

export interface OllamaModel {
  name: string;
  value: string;
}
