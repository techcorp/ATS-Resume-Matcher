# ATS Pro: AI Resume Matcher & Optimizer (Production Guide)

ATS Pro is a high-fidelity, local-first AI system designed to give job seekers an unfair advantage. It runs entirely on your infrastructure using **Ollama**, ensuring 100% data privacy.

---

## 🚀 Setup Guide

### 1. Prerequisite: Ollama
Ollama is the engine that runs the LLMs. Download it from [ollama.com](https://ollama.com).

#### For Local Machine:
Simply run the installer. Once installed, pull the required models:
```bash
ollama pull llama3
ollama pull mistral
ollama pull deepseek-coder
```

#### For VPS (Linux):
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Configure Ollama for Web Access (VPS ONLY)
If you are hosting the web app on one server and Ollama on another, you must enable **CORS**.

**On Linux (Systemd):**
1. Edit the service: `sudo systemctl edit ollama.service`
2. Add these lines under the `[Service]` section:
   ```ini
   Environment="OLLAMA_ORIGINS=*"
   Environment="OLLAMA_HOST=0.0.0.0"
   ```
3. Restart:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart ollama
   ```

### 3. Application Setup
The application is a modern React frontend that communicates directly with the Ollama API from the user's browser.

#### Local Development:
1. Clone the repository.
2. Create a `.env` file based on `.env.example`.
3. Install dependencies: `npm install`.
4. Start the dev server: `npm run dev`.

#### Production / VPS Deployment (Docker):
Use the provided `docker-compose.yml` to spin up the entire stack.

```bash
docker-compose up -d --build
```
This will start:
- **ATS Pro Frontend** on port `3000`.
- **Ollama Engine** on port `11434`.

---

## 🏗️ Technical Architecture

### LLM Prompting Logic
- **Analysis Engine**: Uses a strict JSON schema to force the LLM to output numerical scores and structured feedback.
- **Optimization Engine**: Implements the **STAR method** (Situation, Task, Action, Result) for rewriting resume bullets.
- **JSON Formatting**: We utilize Ollama's `format: "json"` flag to ensure consistent output.

### Privacy & Security
- **Local Parsing**: PDF extraction happens in the user's browser using `pdf.js`. No file content is sent to a third-party server.
- **Direct Inference**: The browser sends the parsed text directly to your Ollama endpoint.

---

## 🛠️ Model Switcher
You can easily add more models by updating the `OLLAMA_MODELS` array in `constants.ts`. Make sure to `ollama pull [model-name]` on your server first.

## 📺 Ad Simulation
To access the "Optimization" feature, the system requires viewing a sequence of two promotional frames. This logic is modularized in `components/AdSequence.tsx`.
