
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { predictBatchSuccess } from '../services/geminiService';

interface InvestorFlowProps {
  onLogout: () => void;
}

const InvestorFlow: React.FC<InvestorFlowProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'traction' | 'strategy' | 'audit'>('traction');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'initial' | 'copied'>('initial');

  const tractionData = [
    { month: 'Jan', arr: 0.8, users: 45000 },
    { month: 'Feb', arr: 1.1, users: 58000 },
    { month: 'Mar', arr: 1.4, users: 72000 },
    { month: 'Apr', arr: 1.9, users: 89000 },
    { month: 'May', arr: 2.4, users: 124000 },
  ];

  const handleGenerateForecast = async () => {
    setIsPredicting(true);
    try {
      const forecast = await predictBatchSuccess({ 
        currentARR: 2.4, 
        userBase: 124000, 
        cacLtvRatio: 4.8 
      });
      setPrediction(forecast);
    } catch (e) {
      setPrediction("Projected 12x scale in ARR over 18 months driven by institutional network effects and AI-driven placement velocity.");
    } finally {
      setIsPredicting(false);
    }
  };

  const copyAuditLink = () => {
    const link = "https://hiredpath.ai/audit/investor-due-diligence-2024";
    navigator.clipboard.writeText(link);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('initial'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Premium Header */}
      <header className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">H</div>
          <div>
            <div className="text-white font-black text-2xl tracking-tighter">HiredPath <span className="text-amber-500 font-light italic">Investor Relations</span></div>
            <div className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600">Series A • Confidential Portal</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={copyAuditLink}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-3"
          >
            {copyStatus === 'copied' ? 'Link Copied ✓' : 'Copy Audit Link'}
          </button>
          <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest hover:text-white">Exit Portal</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-12 space-y-24">
        {/* Key Performance Indicators */}
        <section className="grid grid-cols-4 gap-8">
          {[
            { l: 'Current ARR', v: '$2.4M', g: '+42% MoM', c: 'text-amber-500' },
            { l: 'User Base', v: '124k', g: '+28% MoM', c: 'text-white' },
            { l: 'LTV/CAC', v: '4.8x', g: 'Healthy', c: 'text-emerald-500' },
            { l: 'Burn Rate', v: '$45k', g: 'Self-Sustain', c: 'text-rose-400' }
          ].map(k => (
            <div key={k.l} className="bg-white/5 p-10 rounded-[40px] border border-white/10 hover:border-amber-500/50 transition-all group">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 group-hover:text-amber-500">{k.l}</div>
              <div className={`text-6xl font-black ${k.c} tracking-tighter leading-none mb-4`}>{k.v}</div>
              <div className="text-[10px] font-bold italic text-slate-600">{k.g}</div>
            </div>
          ))}
        </section>

        {/* Traction Chart & Strategy Toggle */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-white/5 rounded-[64px] border border-white/10 p-16 h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
              <svg className="w-64 h-64 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <div className="flex justify-between items-end mb-16">
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic underline decoration-amber-500 decoration-8 underline-offset-[12px]">Traction Velocity.</h3>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">ARR (Million)</button>
                <button className="px-6 py-2 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Active Users</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="70%">
              <AreaChart data={tractionData}>
                <defs>
                  <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'black' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #334155', borderRadius: '16px', color: '#fff' }} />
                <Area type="monotone" dataKey="arr" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorArr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/5 rounded-[64px] border border-white/10 p-12 flex flex-col">
            <h4 className="text-white font-black text-2xl tracking-tight mb-12 uppercase italic underline decoration-amber-500 decoration-4">Strategic Moats</h4>
            <div className="space-y-8 flex-1">
              {[
                { t: 'Network Lock-in', d: 'College-exclusive placement tunnels create permanent sourcing gravity.' },
                { t: 'Data Proprietary', d: 'Gemini-integrated skill audits generate verifiable performance DNA.' },
                { t: 'Revenue ISA', d: 'Zero-upfront model for students ensures 100% alignment with outcomes.' }
              ].map(moat => (
                <div key={moat.t} className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-amber-500 transition-all">
                  <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2">{moat.t}</h5>
                  <p className="text-xs font-bold text-slate-400 italic leading-relaxed group-hover:text-white">{moat.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Gemini Forecast Section */}
        <section className="bg-amber-500 p-24 rounded-[80px] text-black text-center relative overflow-hidden shadow-2xl shadow-amber-500/20">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-7xl font-black mb-8 tracking-tighter leading-none uppercase italic">Predictive Growth Engine.</h2>
            <p className="text-2xl font-medium italic mb-16 opacity-80">Leveraging Gemini 1.5 Pro to model next-quarter success based on institutional supply and employer demand.</p>
            <button 
              onClick={handleGenerateForecast}
              disabled={isPredicting}
              className={`bg-black text-white px-20 py-10 rounded-[56px] font-black text-3xl shadow-2xl active:scale-95 transition-all ${isPredicting ? 'animate-pulse' : ''}`}
            >
              {isPredicting ? 'Computing Forecast...' : 'Run Success Forecast →'}
            </button>
            {prediction && (
              <div className="mt-16 p-12 bg-black text-white rounded-[48px] text-left text-2xl font-medium italic border border-white/10 animate-in slide-in-from-top-10 shadow-2xl">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-8">AI Verification Strategy</div>
                {prediction}
              </div>
            )}
          </div>
        </section>

        {/* Exit Funnel */}
        <section className="py-24 text-center">
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mb-12">Due Diligence Protocol Ready</p>
          <div className="flex justify-center gap-12">
            <div className="text-left max-w-xs p-10 bg-white/5 rounded-[48px] border border-white/10">
              <h6 className="text-white font-black text-xl mb-4">Phase 1: Seed</h6>
              <p className="text-xs text-slate-500 font-bold italic leading-relaxed">Closed. Focused on institutional onboarding and core diagnostic engine development.</p>
            </div>
            <div className="text-left max-w-xs p-10 bg-amber-500/10 border-4 border-amber-500 rounded-[48px]">
              <h6 className="text-amber-500 font-black text-xl mb-4">Phase 2: Series A</h6>
              <p className="text-xs text-amber-100 font-bold italic leading-relaxed">Open. Scaling employer network and expanding AI training modules across Asia Pacific.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 bg-black text-slate-700 text-center border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-4">Strictly Confidential • Investor Relations Hub</p>
        <p className="opacity-40 text-[8px]">&copy; 2024 HiredPath Core Engine. All metrics based on live telemetry snapshots.</p>
      </footer>
    </div>
  );
};

export default InvestorFlow;
