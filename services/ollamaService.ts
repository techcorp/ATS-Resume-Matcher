
import { OLLAMA_BASE_URL, ANALYSIS_PROMPT, OPTIMIZATION_PROMPT } from '../constants';
import { AnalysisResult, OptimizedResume } from '../types';

export class OllamaService {
  private static async callOllama(model: string, prompt: string): Promise<any> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error(`Model '${model}' not found. Run 'ollama pull ${model}' in your terminal.`);
        throw new Error(`Ollama Error: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.response);
    } catch (error: any) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error("Ollama connection refused. Ensure Ollama is running and OLLAMA_ORIGINS='*' is configured.");
      }
      throw error;
    }
  }

  static async analyzeResume(model: string, resumeText: string, jd: string): Promise<AnalysisResult> {
    return await this.callOllama(model, ANALYSIS_PROMPT(resumeText, jd));
  }

  static async optimizeResume(model: string, resumeText: string, jd: string): Promise<OptimizedResume> {
    return await this.callOllama(model, OPTIMIZATION_PROMPT(resumeText, jd));
  }
}
