
# ATS Pro: AI Resume Matcher & Optimizer

ATS Pro is a high-fidelity, local-first AI system designed to give job seekers an unfair advantage. It runs entirely on your infrastructure using **Ollama**, ensuring 100% data privacy.

---

## 🚀 Setup Guide

### 1. Prerequisite: Ollama
Download and install Ollama from [ollama.com](https://ollama.com). Pull your preferred models:
```bash
ollama pull llama3
ollama pull mistral
```

### 2. Configure .env
Create a `.env` file in the root directory:
```env
# The URL of your Ollama service. 
# For local dev: http://localhost:11434
# For production/VPS: Use the server IP or domain
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# If you ever decide to enable Gemini fallback (optional)
# API_KEY=your_google_gemini_api_key
```

### 3. Connection Troubleshooting
If you get "Connection Refused" while the app is running:
1. Ensure Ollama is running.
2. Set the `OLLAMA_ORIGINS` environment variable to `*` to allow the browser to talk to the local API.
   - **Windows (PowerShell):** `$env:OLLAMA_ORIGINS="*"; ollama serve`
   - **Mac/Linux:** `OLLAMA_ORIGINS="*" ollama serve`

---

## 🏗️ Technical Architecture
- **Frontend**: React 19 + Tailwind CSS
- **PDF Engine**: PDF.js (Local extraction)
- **AI Engine**: Ollama (Local LLM Inference)
- **Privacy**: No resume data ever leaves your local environment.
