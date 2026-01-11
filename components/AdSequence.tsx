
import React, { useState, useEffect } from 'react';

interface AdContent {
  tag: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  link: string;
}

interface AdSequenceProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CUSTOM_ADS: AdContent[] = [
  {
    tag: "Career Accelerator",
    title: "The Executive Portfolio",
    description: "Go beyond the resume. Showcase your impact with our premium digital portfolio templates designed for high-level roles.",
    cta: "Explore Portfolios",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800",
    link: "#"
  },
  {
    tag: "Network Pro",
    title: "AI LinkedIn Optimizer",
    description: "Sync your newly optimized resume with your LinkedIn profile headline, summary, and experience automatically.",
    cta: "Optimize LinkedIn",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=800",
    link: "#"
  }
];

const AdSequence: React.FC<AdSequenceProps> = ({ onComplete, onCancel }) => {
  const [adIndex, setAdIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (adIndex < CUSTOM_ADS.length - 1) {
        setAdIndex(adIndex + 1);
        setTimeLeft(6);
      } else {
        handleFinish();
      }
    }
  }, [timeLeft, adIndex]);

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(onComplete, 500);
  };

  const handleSkip = () => {
    if (timeLeft <= 1) {
      if (adIndex < CUSTOM_ADS.length - 1) {
        setAdIndex(adIndex + 1);
        setTimeLeft(6);
      } else {
        handleFinish();
      }
    }
  };

  const currentAd = CUSTOM_ADS[adIndex];
  const canSkip = timeLeft <= 1;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-xl w-full glass-card rounded-[3.5rem] overflow-hidden animate-in zoom-in fade-in duration-500 border-white/10 shadow-3xl">
        
        {/* Ad Header/Image */}
        <div className="relative h-64 overflow-hidden">
          <img src={currentAd.image} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" alt="Sponsor" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
          <div className="absolute top-8 left-8">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-xl">
              {currentAd.tag}
            </span>
          </div>
          <button onClick={onCancel} className="absolute top-8 right-8 w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white transition-all border border-white/5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Ad Content */}
        <div className="p-12 text-center">
          <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">
            {currentAd.title}
          </h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12 max-w-sm mx-auto">
            {currentAd.description}
          </p>

          <div className="space-y-8">
            <a href={currentAd.link} target="_blank" className="block w-full btn-premium text-white font-black py-6 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl">
              {currentAd.cta}
            </a>
            
            <div className="space-y-4">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${((6 - timeLeft) / 6) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  {timeLeft > 0 ? `Optimization Draft ${adIndex + 1}/2` : 'Build Ready'}
                </p>
                <button
                  onClick={handleSkip}
                  className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    canSkip ? 'bg-white/10 border-white/20 text-white hover:scale-105' : 'text-slate-700 border-white/5 cursor-not-allowed opacity-50'
                  }`}
                  disabled={!canSkip}
                >
                  {timeLeft > 1 ? `Skip in ${timeLeft - 1}s` : 'Skip to Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSequence;
