
import React, { useState, useEffect } from 'react';
import { 
  AppStep, 
  AnalysisResult, 
  JobData, 
  OptimizedResume 
} from './types.ts';
import { OllamaService } from './services/ollamaService.ts';
import { OLLAMA_MODELS } from './constants.ts';
import AdSequence from './components/AdSequence.tsx';

console.log("ATS Pro: App component module loaded.");

const initPdfWorker = () => {
  if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
};

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 p-6">
    <div className="container mx-auto max-w-7xl">
      <div className="glass-card rounded-3xl px-8 py-5 flex items-center justify-between border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-all group-hover:rotate-12 group-hover:scale-110">A</div>
          <span className="text-xl font-black tracking-tighter text-white">ATS <span className="text-indigo-500">PRO</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-8">
            <span className="text-[10px] font-bold text-slate-400 cursor-default uppercase tracking-widest">Local Intel</span>
            <span className="text-[10px] font-bold text-slate-400 cursor-default uppercase tracking-widest">Optimization</span>
          </nav>
          <div className="w-px h-4 bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Ollama Node Active</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [step, setStep] = useState<AppStep>(AppStep.Input);
  const [model, setModel] = useState(OLLAMA_MODELS[0].value);
  const [jobData, setJobData] = useState<JobData>({ title: '', description: '' });
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [optimized, setOptimized] = useState<OptimizedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAds, setShowAds] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  useEffect(() => {
    console.log("ATS Pro: Main component mounted.");
    initPdfWorker();
    const timer = setTimeout(() => {
        console.log("ATS Pro: Splash screen sequence finished.");
        setIsSplashComplete(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isProcessing && (step === AppStep.Analyzing || step === AppStep.Optimizing)) {
      interval = window.setInterval(() => {
        setProgress(prev => (prev < 92 ? prev + Math.random() * 4 : prev + 0.1));
      }, 600);
    } else if (!isProcessing && !isUploading) setProgress(0);
    return () => clearInterval(interval);
  }, [isProcessing, step, isUploading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Invalid format. Please upload a PDF.'); return; }
    
    if (!(window as any).pdfjsLib) {
      setError('PDF Engine not ready. Please refresh the page.');
      return;
    }

    try {
      setError(null); setIsUploading(true); setProgress(10); setProgressMessage('Parsing Document...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => (item as any).str).join(' ') + '\n';
        setProgress(Math.floor(20 + (i / pdf.numPages) * 75));
      }
      setResumeText(text); setProgress(100);
      setTimeout(() => { setIsUploading(false); setProgress(0); }, 600);
    } catch (err) { 
      setError('PDF Error: Document might be encrypted or non-standard.'); 
      setIsUploading(false); 
    }
  };

  const startAnalysis = async () => {
    if (!jobData.description || !resumeText) { setError('Ensure Job Description and Resume are provided.'); return; }
    setIsProcessing(true); setStep(AppStep.Analyzing); setError(null);
    setProgressMessage(`Inference: ${model}...`);
    try {
      const res = await OllamaService.analyzeResume(model, resumeText, jobData.description);
      setAnalysis(res); setStep(AppStep.Result);
    } catch (err: any) { 
      setError(err.message); 
      setStep(AppStep.Input); 
    } finally { setIsProcessing(false); }
  };

  const startOptimization = async () => {
    setIsProcessing(true); setStep(AppStep.Optimizing);
    setProgressMessage('Calibrating Career Benchmarks...');
    try {
      const res = await OllamaService.optimizeResume(model, resumeText, jobData.description);
      setOptimized(res); setStep(AppStep.Result);
    } catch (err: any) { 
      setError(err.message); 
      setStep(AppStep.Result); 
    } finally { setIsProcessing(false); setShowAds(false); }
  };

  const handleDownload = () => {
    if (!optimized) return;
    setIsExporting(true);
    setTimeout(() => {
      const content = `${optimized.header}\n\nSUMMARY\n${optimized.summary}\n\nSKILLS\n${optimized.skills.join(', ')}\n\nEXPERIENCE\n${optimized.experience.join('\n')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ATS_Optimized_Resume.txt`;
      link.click();
      setIsExporting(false); setShowExportConfirm(false); setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1500);
  };

  if (!isSplashComplete) return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]">
      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-5xl animate-pulse shadow-2xl">A</div>
      <p className="mt-8 text-indigo-400 font-black uppercase tracking-[0.6em] text-[10px]">Ollama Node Init</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full animate-float-delayed"></div>
      </div>

      <main className="flex-grow container mx-auto px-6 pt-32 pb-24 max-w-7xl relative z-10">
        {error && (
          <div className="mb-10 p-6 glass-card border-red-500/20 rounded-3xl text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 text-xl">!</div>
            <div className="flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="text-white opacity-50 hover:opacity-100">×</button>
          </div>
        )}

        {step === AppStep.Input && (
          <div className="animate-in fade-in duration-1000">
            <div className="mb-20 text-center relative pt-12">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-6 py-2 mb-8">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Local-Only AI Infrastructure</span>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85] hero-gradient-text">
                Hire-Ready <br/>
                <span className="text-indigo-500">Resume Intel.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-20">
                The ultimate ATS bypass engine. Private, local, and incredibly accurate resume optimization.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7">
                <div className="glass-card rounded-[3rem] p-10 h-full">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-10">01 Target Role</h3>
                  <div className="space-y-6">
                    <input 
                      value={jobData.title} 
                      onChange={e => setJobData({...jobData, title: e.target.value})} 
                      className="w-full glass-input rounded-2xl px-8 py-6 text-white placeholder-slate-600 font-bold text-xl" 
                      placeholder="Target Job Title" 
                    />
                    <textarea 
                      value={jobData.description} 
                      onChange={e => setJobData({...jobData, description: e.target.value})} 
                      className="w-full glass-input rounded-[2.5rem] px-8 py-8 text-white placeholder-slate-600 h-[30rem] resize-none leading-relaxed" 
                      placeholder="Paste the Job Description here..." 
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="glass-card rounded-[3rem] p-10 flex-grow">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-10">02 Career Artifact</h3>
                  <label className="block border-2 border-dashed border-white/5 rounded-[2.5rem] p-16 text-center bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer h-full flex flex-col items-center justify-center">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                    {isUploading ? (
                      <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-indigo-600/10 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter">{resumeText ? 'PDF Loaded' : 'Import PDF'}</p>
                        {resumeText && <p className="text-[10px] text-indigo-400 mt-2 font-black uppercase tracking-widest">Click to Replace</p>}
                      </>
                    )}
                  </label>
                </div>

                <div className="glass-card rounded-[2.5rem] p-8 border-indigo-500/10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Analysis Engine</p>
                   <div className="relative group">
                     <select 
                        value={model} 
                        onChange={e => setModel(e.target.value)} 
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-white font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        {OLLAMA_MODELS.map(m => (
                          <option key={m.value} value={m.value} className="bg-slate-950 text-white font-bold py-4">
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={startAnalysis} 
                  disabled={isProcessing || isUploading || !resumeText || !jobData.description} 
                  className="w-full btn-premium text-white font-black py-8 rounded-[3rem] text-2xl tracking-tighter uppercase shadow-2xl disabled:opacity-30"
                >
                  {isProcessing ? 'Connecting...' : 'Generate Intel Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(step === AppStep.Analyzing || step === AppStep.Optimizing) && (
          <div className="py-48 text-center animate-in fade-in duration-1000">
            <div className="relative w-80 h-80 mx-auto mb-20">
              <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] rounded-full animate-pulse"></div>
              <svg className="w-full h-full -rotate-90 relative z-10">
                <circle cx="160" cy="160" r="150" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="20" />
                <circle cx="160" cy="160" r="150" fill="none" stroke="url(#indigo-grad)" strokeWidth="20" strokeDasharray="942" strokeDashoffset={942 - (942 * progress) / 100} strokeLinecap="round" className="transition-all duration-700 ease-out score-glow" />
                <defs><linearGradient id="indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-9xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
              </div>
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase">{progressMessage}</h2>
          </div>
        )}

        {step === AppStep.Result && analysis && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <button onClick={() => { setStep(AppStep.Input); setOptimized(null); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-4 hover:translate-x-[-4px] transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                  New Analysis
                </button>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">Intelligence Report.</h2>
              </div>
              {exportSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">Build Exported</span>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 glass-card rounded-[4rem] p-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 mb-12">Match Quality</h3>
                <div className="relative w-64 h-64 mb-12">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="18" />
                    <circle cx="128" cy="128" r="120" fill="none" stroke={analysis.overallScore >= 75 ? '#10b981' : analysis.overallScore >= 50 ? '#f59e0b' : '#6366f1'} strokeWidth="18" strokeDasharray="753.6" strokeDashoffset={753.6 - (753.6 * analysis.overallScore) / 100} strokeLinecap="round" className="transition-all duration-1000 score-glow" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl font-black text-white tracking-tighter">{analysis.overallScore}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 glass-card rounded-[4rem] p-16">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 mb-12">Semantic Alignment</h3>
                <div className="grid md:grid-cols-2 gap-16">
                  {[
                    { l: 'Hard Skills', v: analysis.skillsMatch, c: 'from-indigo-600 to-indigo-400' },
                    { l: 'Experience', v: analysis.experienceRelevance, c: 'from-blue-600 to-blue-400' },
                    { l: 'Keywords', v: analysis.keywordMatch, c: 'from-violet-600 to-indigo-600' },
                    { l: 'Integrity', v: analysis.educationAlignment, c: 'from-indigo-500 to-emerald-500' }
                  ].map((x, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">{x.l}</span>
                        <span className="text-4xl font-black text-white tracking-tighter">{x.v}%</span>
                      </div>
                      <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-[3px]">
                        <div className={`h-full bg-gradient-to-r ${x.c} rounded-full transition-all duration-1000`} style={{ width: `${x.v}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!optimized && (
              <div className="p-32 bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[6rem] text-center shadow-3xl relative overflow-hidden group">
                <h2 className="text-7xl font-black text-white mb-10 tracking-tighter leading-none">STAR-Method <br/> Optimization.</h2>
                <p className="text-indigo-100/70 mb-16 max-w-3xl mx-auto font-medium text-2xl leading-relaxed">Let local AI re-engineer your experience bullets using Situation, Task, Action, and Result modeling.</p>
                <button onClick={() => setShowAds(true)} className="bg-white text-indigo-800 font-black px-24 py-10 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all uppercase tracking-[0.3em] text-sm">
                  Unlock Optimized Draft
                </button>
              </div>
            )}

            {optimized && (
              <div className="animate-in slide-in-from-bottom-12 duration-1000 pt-16">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                  <h2 className="text-6xl font-black text-white tracking-tighter">Optimized Build 1.0</h2>
                  <button onClick={() => setShowExportConfirm(true)} className="btn-premium text-white px-20 py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4">
                    Deploy Local Build
                  </button>
                </div>
                <div className="bg-white rounded-[5rem] p-24 text-slate-900 shadow-3xl border-t-[16px] border-indigo-600">
                  <div className="max-w-4xl mx-auto space-y-24">
                    <header className="text-center">
                      <h1 className="text-6xl font-black uppercase tracking-[0.3em] mb-8 text-slate-900">{optimized.header.split('\n')[0]}</h1>
                    </header>
                    <section>
                      <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.6em] mb-12">Executive Profile</h4>
                      <p className="text-3xl leading-relaxed text-slate-800 font-bold tracking-tight">{optimized.summary}</p>
                    </section>
                    <section>
                      <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.6em] mb-12">Performance matrix</h4>
                      <ul className="space-y-16">
                        {optimized.experience.map((e,i)=>(
                          <li key={i} className="flex gap-12 group">
                            <div className="w-4 h-4 bg-indigo-600 rounded-full mt-[20px] flex-shrink-0"></div>
                            <p className="text-2xl leading-relaxed text-slate-800 font-semibold">{e}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showExportConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
          <div className="glass-card rounded-[3.5rem] p-16 max-w-xl w-full text-center border-white/10 shadow-3xl">
            <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">Export Draft?</h3>
            <p className="text-slate-400 text-lg font-medium mb-12">Your resume has been re-engineered using Ollama's local inference engine.</p>
            <div className="flex flex-col gap-4">
              <button onClick={handleDownload} disabled={isExporting} className="w-full btn-premium text-white font-black py-7 rounded-[2.5rem] text-sm uppercase tracking-[0.3em] disabled:opacity-50">
                {isExporting ? 'Packaging...' : 'Confirm & Export'}
              </button>
              <button onClick={() => setShowExportConfirm(false)} disabled={isExporting} className="w-full bg-white/5 text-slate-300 font-black py-7 rounded-[2.5rem] text-sm uppercase tracking-[0.3em]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 py-32 bg-black/40 text-center">
        <span className="text-5xl font-black text-white tracking-tighter opacity-20">ATS PRO</span>
        <p className="mt-8 text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">© 2024 ATS PRO — LOCAL INFRASTRUCTURE</p>
      </footer>

      {showAds && <AdSequence onComplete={startOptimization} onCancel={() => setShowAds(false)} />}
    </div>
  );
};

export default App;
