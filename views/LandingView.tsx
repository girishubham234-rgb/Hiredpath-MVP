
import React, { useState, useEffect } from 'react';
import { AppRole } from '../types';
import { TRUST_LOGOS } from '../constants';
import { getSmartSuggestions, getPlatformInsights, getLiveMarketIntel, getNearbyOpportunities } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface LandingViewProps {
  onStart: (role: AppRole) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  const [currentSalary, setCurrentSalary] = useState(400000);
  const [insightIndex, setInsightIndex] = useState(0);
  const [marketSuggestions, setMarketSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Market Intel Explorer State
  const [intelQuery, setIntelQuery] = useState("");
  const [intelResult, setIntelResult] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);

  // Maps Grounding State
  const [nearbyResult, setNearbyResult] = useState<any>(null);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);

  const insights = [
    { title: "Placement Tip", text: "Mastering System Design increases your salary ceiling by 40%.", icon: "💎" },
    { title: "Market Trend", text: "Fintech hiring is peaking in Q4 for Node.js specialists.", icon: "📈" },
    { title: "HiredPath Fact", text: "Students using our AI roadmap place 3x faster than traditional methods.", icon: "⚡" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 5000);
    fetchMarketInsights();
    return () => clearInterval(interval);
  }, []);

  const fetchMarketInsights = async () => {
    setIsAiLoading(true);
    try {
      const data = await getSmartSuggestions('landing', { context: 'general_trends' });
      setMarketSuggestions(data);
    } catch (e) {
      setMarketSuggestions([
        { title: 'AI Scaling', suggestion: 'Junior roles are pivoting to AI tool proficiency. Learn prompt engineering.', priority: 'High' },
        { title: 'Global Remote', suggestion: 'Remote hiring is up 22% for backend architects with distributed systems proof.', priority: 'Medium' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExploreIntel = async () => {
    if (!intelQuery) return;
    setIsIntelLoading(true);
    try {
      const result = await getLiveMarketIntel(intelQuery);
      setIntelResult(result);
    } catch (e) {
      setIntelResult({ text: "Could not fetch live trends. Please try again later.", sources: [] });
    } finally {
      setIsIntelLoading(false);
    }
  };

  const handleFindNearby = () => {
    setIsNearbyLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsNearbyLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const result = await getNearbyOpportunities(pos.coords.latitude, pos.coords.longitude);
        setNearbyResult(result);
      } catch (e) {
        setNearbyResult({ text: "Unable to detect nearby offices.", sources: [] });
      } finally {
        setIsNearbyLoading(false);
      }
    }, (error) => {
      setIsNearbyLoading(false);
      alert(`Location access denied: ${error.message}`);
    });
  };

  const predictedSalary = currentSalary * 2.8;

  return (
    <div className="relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Industry Ticker */}
      <div className="bg-slate-900 py-3 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-[60]">
        <div className="inline-block animate-marquee hover:pause cursor-default">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mx-12">React.js +45% Demand Index</span>
           <span className="text-[10px] font-black text-white uppercase tracking-widest mx-12">Average Tier 1 CTC: ₹16.4 LPA</span>
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mx-12">AI Engineering Jobs Up 120% YoY</span>
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mx-12">Skill Gap: 68% in Cloud Native</span>
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mx-12">React.js +45% Demand Index</span>
           <span className="text-[10px] font-black text-white uppercase tracking-widest mx-12">Average Tier 1 CTC: ₹16.4 LPA</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center glass-morphism sticky top-0 z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group cursor-pointer hover:rotate-12 transition-all">
            <span className="text-white font-black text-2xl tracking-tighter">H</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">HiredPath</span>
        </div>
        <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <a href="#engine" className="hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-600 pb-1">Engine</a>
          <a href="#explorer" className="hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-600 pb-1">Market Intel</a>
          <a href="#nearby" className="hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-600 pb-1">Nearby</a>
          <a href="#employer" className="hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-600 pb-1">Employers</a>
        </div>
        <button 
          onClick={() => onStart(AppRole.STUDENT)}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-2xl transition-all shadow-xl"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-40 text-center bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="absolute top-24 right-12 hidden xl:block w-72 animate-in slide-in-from-right-10 duration-1000">
          <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl border border-white/10 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{insights[insightIndex].icon}</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{insights[insightIndex].title}</span>
            </div>
            <p className="text-white text-xs font-bold leading-relaxed italic animate-in fade-in slide-in-from-bottom-2">"{insights[insightIndex].text}"</p>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live HiredPath Insight</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-indigo-100 shadow-sm animate-bounce">
            AI-Native Placement Ecosystem
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 leading-[0.85] mb-12 tracking-tighter">
            Train for a Role. <br />
            <span className="text-indigo-600 italic">Get Hired by a Company.</span>
          </h1>
          <p className="text-2xl md:text-3xl text-slate-500 mb-20 max-w-4xl mx-auto font-medium leading-relaxed italic opacity-80">
            The world's first end-to-end placement engine bridging academia and industry with verifiable skill proof.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <button 
              onClick={() => onStart(AppRole.STUDENT)}
              className="bg-indigo-600 text-white px-16 py-8 rounded-[40px] text-2xl font-black shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all"
            >
              Start Student Path
            </button>
            <div className="flex gap-6">
              <button onClick={() => onStart(AppRole.COLLEGE)} className="bg-white text-slate-900 border-4 border-slate-50 px-10 py-7 rounded-[40px] text-xl font-black hover:bg-slate-50 transition-all shadow-sm">
                For Colleges
              </button>
              <button onClick={() => onStart(AppRole.COMPANY)} className="bg-slate-900 text-white px-10 py-7 rounded-[40px] text-xl font-black hover:bg-slate-800 transition-all shadow-2xl">
                For Employers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intel Explorer Section */}
      <section id="explorer" className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
           <div className="text-center mb-20">
              <h2 className="text-6xl font-black tracking-tighter mb-6 uppercase italic">AI Market <span className="text-indigo-500">Intel.</span></h2>
              <p className="text-slate-400 text-xl font-medium italic opacity-70">Ask Gemini for real-time career suggestions grounded by Google Search.</p>
           </div>
           
           <div className="bg-white/5 border border-white/10 p-4 rounded-[40px] flex flex-col md:flex-row gap-4 mb-16 shadow-2xl">
              <input 
                type="text" 
                value={intelQuery}
                onChange={(e) => setIntelQuery(e.target.value)}
                placeholder="Ask about a role: 'AI Engineer salaries in 2025'..."
                className="flex-1 bg-transparent px-10 py-6 text-xl font-bold outline-none border-none placeholder:text-slate-700"
                onKeyDown={(e) => e.key === 'Enter' && handleExploreIntel()}
              />
              <button 
                onClick={handleExploreIntel}
                disabled={isIntelLoading}
                className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {isIntelLoading ? 'Analyzing...' : 'Explore Intel →'}
              </button>
           </div>

           {intelResult && (
             <div className="bg-white/5 border border-indigo-500/20 p-12 rounded-[56px] animate-in zoom-in duration-500">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-8">AI Strategic Suggestions</div>
                <div className="text-xl font-medium italic text-slate-300 leading-relaxed mb-12 whitespace-pre-wrap">
                   {intelResult.text}
                </div>
                {intelResult.sources && intelResult.sources.length > 0 && (
                   <div className="pt-8 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-6">Verification Sources</p>
                      <div className="flex flex-wrap gap-4">
                         {intelResult.sources.map((src: any, i: number) => (
                            <a key={i} href={src.uri} target="_blank" className="bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black text-indigo-300 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5">
                               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                               {src.title || 'Source'}
                            </a>
                         ))}
                      </div>
                   </div>
                )}
             </div>
           )}
        </div>
      </section>

      {/* Nearby Opportunities Pulse (Maps Grounding) */}
      <section id="nearby" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
              <div className="max-w-xl">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">Local Opportunity <span className="text-indigo-600 italic">Pulse.</span></h2>
                 <p className="text-slate-500 text-xl font-medium italic opacity-70">Detect nearby hiring companies and corporate offices using AI Maps grounding.</p>
              </div>
              <button 
                onClick={handleFindNearby}
                disabled={isNearbyLoading}
                className="bg-slate-900 text-white px-10 py-5 rounded-[32px] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
              >
                {isNearbyLoading ? 'Locating...' : 'Detect Nearby Offices 📍'}
              </button>
           </div>

           {nearbyResult && (
             <div className="bg-white border border-slate-200 p-12 rounded-[56px] shadow-sm animate-in fade-in">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Nearby Institutional Hubs</div>
                <div className="text-lg font-bold text-slate-700 italic leading-relaxed mb-10">
                   {nearbyResult.text}
                </div>
                <div className="flex flex-wrap gap-4">
                   {nearbyResult.sources && nearbyResult.sources.map((src: any, i: number) => (
                      <a key={i} href={src.uri} target="_blank" className="bg-slate-50 px-6 py-3 rounded-2xl text-[10px] font-black text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2 border border-slate-100">
                         {src.title || 'View Place'} ↗
                      </a>
                   ))}
                </div>
             </div>
           )}
        </div>
      </section>

      {/* Dynamic Market Suggestions Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
             <div className="max-w-2xl">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-6 uppercase italic">Strategic <span className="text-indigo-600">Pulse.</span></h2>
                <p className="text-slate-500 text-xl font-medium italic opacity-70">Gemini-driven career suggestions based on real-time global hiring data.</p>
             </div>
             <button onClick={fetchMarketInsights} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 pb-2 border-b-2 border-indigo-600 transition-all">Update Live Trends</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
             {isAiLoading ? (
               [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[56px] animate-pulse"></div>)
             ) : (
               marketSuggestions.map((s, i) => (
                 <div key={i} className="bg-slate-50 p-12 rounded-[56px] border border-transparent hover:border-indigo-600 transition-all group cursor-default">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{s.title}</span>
                       <span className={`text-[8px] bg-indigo-600 text-white px-3 py-1 rounded-full uppercase font-black`}>{s.priority} Impact</span>
                    </div>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed italic group-hover:text-slate-900 transition-all">"{s.suggestion}"</p>
                 </div>
               ))
             )}
          </div>
        </div>
      </section>

      <footer className="py-24 bg-slate-900 text-slate-500 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-bold mb-4 text-white uppercase tracking-widest">HiredPath Ecosystem</p>
          <div className="flex justify-center gap-8 mb-8">
            <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Media Kit</a>
            <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Terms</a>
            <a href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Privacy</a>
          </div>
          <p className="opacity-40 uppercase tracking-[0.5em] text-[10px] font-black">&copy; 2024 HiredPath Core.</p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LandingView;
