
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { predictBatchSuccess, getSmartSuggestions } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface AdminFlowProps {
  onLogout: () => void;
}

type AdminView = 'health' | 'engine' | 'forecasting' | 'media';

const AdminFlow: React.FC<AdminFlowProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminView>('health');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState("");

  // Forecasting State
  const [selectedCohort, setSelectedCohort] = useState("Batch 2024-A");
  const [cohortStats, setCohortStats] = useState({
    size: 2400,
    avgScore: 78,
    completionRate: 64,
    marketDemand: 82,
    topSpecialty: 'Frontend Architecture'
  });

  const [engineWeights, setEngineWeights] = useState([
    { label: 'Technical Proficiency', weight: 45 },
    { label: 'System Design Logic', weight: 25 },
    { label: 'Behavioral Culture Fit', weight: 20 },
    { label: 'Experience Bonus', weight: 10 }
  ]);
  
  const velocityData = [
    { category: 'Sourcing', HiredPath: 2, Industry: 14 },
    { category: 'Assessment', HiredPath: 1, Industry: 10 },
    { category: 'Interviews', HiredPath: 4, Industry: 12 },
    { category: 'Offer', HiredPath: 2, Industry: 9 },
    { category: 'Total Days', HiredPath: 9, Industry: 45 },
  ];

  const cohortTrend = [
    { name: 'W1', score: 45 },
    { name: 'W2', score: 52 },
    { name: 'W3', score: 68 },
    { name: 'W4', score: 74 },
    { name: 'W5', score: 78 },
  ];

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const data = await getSmartSuggestions('admin', { users: 124000, arr: 2.4, churn: 4.2 });
      setSuggestions(data);
    } catch (e) {
      setSuggestions([
        { title: 'Rev Tuning', suggestion: 'Increase fees for scarcity roles.', priority: 'High', actionLabel: 'Tune Engine', targetView: 'engine' },
        { title: 'Scale Warning', suggestion: 'Infrastructure at 82% capacity.', priority: 'High', actionLabel: 'View Health', targetView: 'health' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestionAction = (target: string) => {
    if (target === 'health') setActiveTab('health');
    if (target === 'engine') setActiveTab('engine');
    if (target === 'forecasting') setActiveTab('forecasting');
  };

  const handleRunForecast = async () => {
    setIsPredicting(true);
    setPrediction(null);
    try {
      const stats = { 
        cohort: selectedCohort,
        ...cohortStats,
        activeUsers: 124000, 
        avgReadiness: 72, 
        hiringPartners: 120,
        currentMarket: "High demand in AI/ML, steady in Web3, cooling in Legacy Java"
      };
      const forecast = await predictBatchSuccess(stats);
      setPrediction(forecast || "");
    } catch (e) {
      setPrediction("Estimated 92% placement success with $4.2M ARR projection for Q4. Recommendations: Focus on System Design for bottom 20% tier.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleGeneratePitchVideo = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    setIsVideoGenerating(true);
    setVideoUrl(null);
    setVideoStatusMessage("Initializing Veo 3.1 Creative Engine...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const messages = [
        "Synthesizing persona montages...",
        "Rendering AI-native training environments...",
        "Polishing institutional dashboards...",
        "Finalizing corporate recruitment sequences...",
        "Encoding futuristic presentation video..."
      ];
      
      let msgIdx = 0;
      const msgInterval = setInterval(() => {
        setVideoStatusMessage(messages[msgIdx % messages.length]);
        msgIdx++;
      }, 8000);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'A professional promotional cinematic video for HiredPath. A futuristic split-screen montage: on the left, an elite engineering student coding; in the middle, a college dean viewing a rising bar chart; on the right, a recruiter hiring talent. Cinematic lighting, motion graphics, 4K quality.',
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      clearInterval(msgInterval);
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error("Video Gen Error:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      setVideoStatusMessage("An error occurred during video synthesis. Please check Billing.");
    } finally {
      setIsVideoGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 flex selection:bg-indigo-900 selection:text-white">
      <aside className="w-96 bg-slate-900 border-r border-slate-800 p-12 flex flex-col gap-12 h-screen sticky top-0 shadow-2xl overflow-y-auto">
        <div className="text-white font-black text-4xl tracking-tighter flex items-center gap-4"><div className="w-12 h-12 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white text-2xl shadow-xl">A</div> HiredPath Core</div>
        <nav className="flex-1 space-y-4">
          {[
            {id:'health',l:'Platform Telemetry'}, 
            {id:'engine',l:'Training Engine'}, 
            {id:'forecasting',l:'Predictive Success'},
            {id:'media',l:'Media Center'}
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`w-full text-left px-8 py-6 rounded-[32px] font-black text-base transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40' : 'hover:bg-slate-800 hover:text-white'}`}>{t.l}</button>
          ))}
        </nav>
        <button onClick={onLogout} className="text-[10px] font-black hover:text-rose-500 transition-all uppercase tracking-[0.4em] text-slate-700 pb-10">Terminate Session</button>
      </aside>

      <main className="flex-1 p-24 overflow-y-auto">
        {activeTab === 'health' && (
          <div className="space-y-24 animate-in fade-in duration-1000">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-7xl font-black text-white tracking-tighter mb-6 leading-none uppercase italic">System Health.</h1>
                <p className="text-slate-500 text-2xl font-medium italic opacity-70">Infrastructure Telemetry • Engine Velocity.</p>
              </div>
            </header>
            <div className="grid grid-cols-4 gap-12">
               {[{l:'Users', v:'124k'}, {l:'Placement', v:'92%'}, {l:'ARR', v:'$2.4M'}, {l:'Churn', v:'4.2%'}].map(k => (
                 <div key={k.l} className="bg-slate-900 p-12 rounded-[56px] border border-slate-800 shadow-2xl group transition-all hover:border-indigo-500/50">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 group-hover:text-indigo-400">{k.l}</div>
                    <div className="text-5xl font-black text-white mb-3 tracking-tighter leading-none">{k.v}</div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-3 gap-16">
               <div className="col-span-2 bg-slate-900 p-16 rounded-[72px] border border-slate-800 h-[600px] shadow-2xl relative overflow-hidden">
                  <h4 className="text-white font-black text-3xl mb-16 tracking-tight uppercase">Hiring Velocity (Days)</h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={velocityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'black' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} cursor={{ fill: '#1e293b' }} />
                      <Bar name="HiredPath" dataKey="HiredPath" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                      <Bar name="Industry" dataKey="Industry" fill="#334155" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="bg-slate-900 p-12 rounded-[56px] border border-slate-800 flex flex-col shadow-2xl relative overflow-hidden">
                  <h4 className="text-white font-black text-2xl tracking-tight mb-10 uppercase relative z-10 italic">Strategic Suggestions</h4>
                  <div className="space-y-6 flex-1 overflow-y-auto relative z-10">
                    {isAiLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl"></div>)
                      </div>
                    ) : (
                      suggestions.map((s, i) => (
                        <div key={i} className="p-6 rounded-[32px] border-2 border-white/5 bg-white/5 hover:border-indigo-600 transition-all group">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{s.title}</span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${s.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-slate-500'}`}>{s.priority}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-400 italic leading-relaxed mb-4">{s.suggestion}</p>
                           <button onClick={() => handleSuggestionAction(s.targetView)} className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-4 py-2 rounded-xl group-hover:bg-indigo-500 transition-all">{s.actionLabel} →</button>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="space-y-20 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-7xl font-black text-white tracking-tighter mb-6 leading-none uppercase italic underline decoration-indigo-600 decoration-8 underline-offset-[16px]">Predictive Hub.</h1>
                <p className="text-slate-500 text-2xl font-medium italic opacity-70">Modeling Student Performance vs Market Liquidity.</p>
              </div>
              <button 
                onClick={handleRunForecast} 
                disabled={isPredicting}
                className="bg-indigo-600 text-white px-12 py-6 rounded-[40px] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
              >
                {isPredicting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Synthesizing Forecast...
                  </>
                ) : (
                  <>Run Success Forecast →</>
                )}
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 bg-slate-900 p-16 rounded-[80px] border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                  <h4 className="text-white font-black text-3xl uppercase tracking-tight italic">Cohort Baseline: {selectedCohort}</h4>
                  <select 
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] outline-none"
                  >
                    <option>Batch 2024-A</option>
                    <option>Batch 2024-B</option>
                    <option>Graduate Elite Pool</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-8 mb-16">
                  {[
                    {l:'Cohort Size', v:cohortStats.size, u:''},
                    {l:'Avg Performance', v:cohortStats.avgScore, u:'%'},
                    {l:'Syllabus Comp.', v:cohortStats.completionRate, u:'%'}
                  ].map(s => (
                    <div key={s.l} className="bg-slate-950 p-8 rounded-[40px] border border-white/5 text-center">
                      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{s.l}</div>
                      <div className="text-5xl font-black text-indigo-400 leading-none">{s.v}{s.u}</div>
                    </div>
                  ))}
                </div>

                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cohortTrend}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" tick={{fill:'#64748b', fontWeight:'black'}} axisLine={false} />
                      <YAxis tick={{fill:'#64748b', fontWeight:'black'}} axisLine={false} />
                      <Tooltip contentStyle={{borderRadius:'24px', border:'none', backgroundColor:'#0f172a', color:'#fff'}} />
                      <Area name="Cohort Avg Score" type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={6} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-slate-900 p-12 rounded-[64px] border border-slate-800 shadow-2xl">
                  <h4 className="text-white font-black text-2xl mb-8 tracking-tight uppercase italic underline decoration-indigo-600 decoration-4">Market Correlation</h4>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>Hiring Demand Index</span>
                        <span className="text-emerald-400">High (82%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[82%]"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>Candidate Liquidity</span>
                        <span className="text-amber-400">Tight (45%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[45%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 p-6 bg-slate-950 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 italic">"Scarcity premium in {cohortStats.topSpecialty} roles is at a 14-month high. Strategic advantage: HIGH."</p>
                  </div>
                </div>

                <div className="bg-indigo-600 p-12 rounded-[64px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl italic">AI</div>
                  <h4 className="text-white font-black text-2xl mb-6 tracking-tight uppercase">Success Predictor</h4>
                  <p className="text-indigo-100 font-bold italic leading-relaxed text-sm">Predict next-quarter placement success using HiredPath's proprietary modeling engine.</p>
                </div>
              </div>
            </div>

            {prediction && (
              <div className="bg-slate-900 border-4 border-indigo-500/20 p-16 rounded-[80px] shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-500/20">🧠</div>
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Gemini Success Modeling Result</h3>
                    <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em]">Deep Reasoning Execution Complete</p>
                  </div>
                </div>
                <div className="text-2xl font-medium italic text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {prediction}
                </div>
                <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {l:'Estimated Placement', v:'94.2%', c:'text-emerald-400'},
                    {l:'Revenue Projection', v:'$1.85M', c:'text-white'},
                    {l:'Hiring Speedup', v:'3.4x', c:'text-indigo-400'},
                    {l:'Partner Satisfaction', v:'98%', c:'text-indigo-400'}
                  ].map(r => (
                    <div key={r.l} className="bg-slate-950 p-8 rounded-[40px] border border-white/5">
                      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">{r.l}</div>
                      <div className={`text-4xl font-black ${r.c} tracking-tighter`}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-24 animate-in fade-in duration-700">
             <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-7xl font-black text-white tracking-tighter mb-6 leading-none uppercase italic">Media Center.</h1>
                  <p className="text-slate-500 text-2xl font-medium italic opacity-70">Generate cinematic assets with Veo 3.1.</p>
                </div>
                {!videoUrl && !isVideoGenerating && (
                  <button 
                    onClick={handleGeneratePitchVideo} 
                    className="bg-indigo-600 text-white px-12 py-6 rounded-[40px] font-black text-2xl shadow-2xl hover:scale-105 transition-all"
                  >
                    Generate Presentation Video
                  </button>
                )}
             </header>

             {isVideoGenerating && (
               <div className="bg-slate-900 border border-indigo-500/20 p-24 rounded-[80px] text-center flex flex-col items-center gap-12">
                  <div className="w-24 h-24 border-8 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-white tracking-tight uppercase animate-pulse">{videoStatusMessage}</h3>
                    <p className="text-slate-500 text-lg italic">Cinematic synthesis takes a few minutes.</p>
                  </div>
               </div>
             )}

             {videoUrl && (
               <div className="bg-slate-900 border border-indigo-500/40 p-12 rounded-[80px] shadow-2xl animate-in zoom-in overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">HiredPath: Ecosystem Montage</h3>
                    <div className="flex gap-6">
                      <a href={videoUrl} download="hiredpath_pitch.mp4" className="text-[12px] font-black uppercase tracking-widest text-indigo-400 border-b-2 border-indigo-400 pb-1">Download Video</a>
                      <button onClick={() => setVideoUrl(null)} className="text-[12px] font-black uppercase tracking-widest text-slate-600">Generate New</button>
                    </div>
                  </div>
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full rounded-[48px] border-4 border-slate-800 shadow-2xl" 
                    autoPlay 
                    loop
                  />
               </div>
             )}
          </div>
        )}

        {activeTab === 'engine' && (
           <div className="space-y-24">
              <h1 className="text-7xl font-black text-white tracking-tighter mb-6 leading-none uppercase italic">Matching Engine.</h1>
              <div className="grid md:grid-cols-2 gap-16">
                 <div className="bg-slate-900 p-16 rounded-[72px] border border-slate-800 shadow-2xl">
                    <h4 className="text-white font-black text-3xl mb-16 tracking-tight uppercase">Algorithm Weights</h4>
                    <div className="space-y-12">
                      {engineWeights.map((metric, i) => (
                        <div key={metric.label} className="space-y-5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                             <span>{metric.label}</span>
                             <span className="text-indigo-400">{metric.weight}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            value={metric.weight}
                            onChange={(e) => {
                               const newWeights = [...engineWeights];
                               newWeights[i].weight = parseInt(e.target.value);
                               setEngineWeights(newWeights);
                            }}
                            className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminFlow;
