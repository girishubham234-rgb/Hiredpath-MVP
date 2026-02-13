
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getSmartSuggestions } from '../services/geminiService';

interface CompanyFlowProps {
  onLogout: () => void;
}

type CompanyView = 'signup' | 'otp' | 'create-role' | 'model-selection' | 'candidates' | 'interview-feedback' | 'offer';

interface Candidate {
  id: number;
  n: string; // Name
  c: string; // College
  r: number; // Readiness Score
  s: string; // Specialty/Role
  loc: string; // Location
  exp: 'Intern' | 'Entry Level' | 'Junior';
  skills: string[];
}

const CANDIDATES_POOL: Candidate[] = [
  { id: 1, n: 'Arnav Varma', c: 'IIT Delhi', r: 94, s: 'Frontend Lead', loc: 'Bangalore', exp: 'Junior', skills: ['React', 'TypeScript'] },
  { id: 2, n: 'Sanya Gupta', c: 'BITS Pilani', r: 88, s: 'Fullstack Dev', loc: 'Mumbai', exp: 'Entry Level', skills: ['Node.js', 'React'] },
  { id: 3, n: 'Rahul Mehta', c: 'VIT Vellore', r: 72, s: 'Backend Dev', loc: 'Remote', exp: 'Intern', skills: ['Python', 'SQL'] },
  { id: 4, n: 'Anjali Rao', c: 'NIT Trichy', r: 91, s: 'UI/UX Designer', loc: 'Bangalore', exp: 'Entry Level', skills: ['Figma', 'React'] },
  { id: 5, n: 'Vikram Singh', c: 'DTU', r: 85, s: 'DevOps Engineer', loc: 'Delhi', exp: 'Junior', skills: ['AWS', 'Docker'] },
  { id: 6, n: 'Priya Sharma', c: 'SRM University', r: 96, s: 'Cloud Architect', loc: 'Bangalore', exp: 'Junior', skills: ['AWS', 'Terraform'] },
  { id: 7, n: 'Karan Johar', c: 'Manipal IT', r: 79, s: 'SDE-1', loc: 'Hyderabad', exp: 'Entry Level', skills: ['Java', 'Spring'] },
];

const CompanyFlow: React.FC<CompanyFlowProps> = ({ onLogout }) => {
  const [view, setView] = useState<CompanyView>('signup');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleSkills, setRoleSkills] = useState('');
  const [roleSalary, setRoleSalary] = useState('');
  const [isSuggestingRole, setIsSuggestingRole] = useState(false);

  // Filter and Sort State
  const [filterExp, setFilterExp] = useState<string>('All');
  const [filterLoc, setFilterLoc] = useState<string>('All');
  const [filterMinReadiness, setFilterMinReadiness] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'readiness-desc' | 'readiness-asc' | 'name'>('readiness-desc');

  useEffect(() => {
    if (view === 'candidates') fetchSuggestions();
  }, [view]);

  const fetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const data = await getSmartSuggestions('company', { roles: 2, applicants: 42 });
      setSuggestions(data);
    } catch (e) {
      setSuggestions([
        { title: 'Talent Acquisition', suggestion: 'Direct hire pool is tightening. Start a "Train-then-Hire" batch.', priority: 'High', action: 'model-selection' },
        { title: 'Role Optimization', suggestion: 'Add "Next.js" to skills to increase applicant quality by 30%.', priority: 'Medium', action: 'create-role' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestionAction = (action?: string) => {
    if (action === 'model-selection') setView('model-selection');
    if (action === 'create-role') setView('create-role');
  };

  const handleAiSuggestRole = async () => {
    if (!roleTitle) return alert("Enter role title first!");
    setIsSuggestingRole(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest skills and salary band for: "${roleTitle}". Format Skills: [list], Salary: [band]`,
      });
      const text = response.text || "";
      setRoleSkills(text.includes("Skills:") ? text.split("Skills:")[1].split(", Salary:")[0].trim() : "React, Node.js");
      setRoleSalary(text.includes("Salary:") ? text.split("Salary:")[1].trim() : "16-24 LPA");
    } catch (e) {
      setRoleSkills("React, Node.js, Systems Design");
      setRoleSalary("12-20 LPA");
    } finally {
      setIsSuggestingRole(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    let list = [...CANDIDATES_POOL];

    // Filter by Experience
    if (filterExp !== 'All') {
      list = list.filter(c => c.exp === filterExp);
    }

    // Filter by Location
    if (filterLoc !== 'All') {
      list = list.filter(c => c.loc === filterLoc);
    }

    // Filter by Readiness
    list = list.filter(c => c.r >= filterMinReadiness);

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'readiness-desc') return b.r - a.r;
      if (sortBy === 'readiness-asc') return a.r - b.r;
      if (sortBy === 'name') return a.n.localeCompare(b.n);
      return 0;
    });

    return list;
  }, [filterExp, filterLoc, filterMinReadiness, sortBy]);

  const uniqueLocations = Array.from(new Set(CANDIDATES_POOL.map(c => c.loc))).sort();

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-slate-900 p-24 rounded-[100px] shadow-2xl border border-white/5 animate-in zoom-in duration-500 relative overflow-hidden">
           <h2 className="text-8xl font-black mb-16 leading-none tracking-tighter text-center uppercase">Employer <span className="text-indigo-500 italic underline decoration-indigo-500/20 underline-offset-[16px]">Portal.</span></h2>
           <div className="grid grid-cols-2 gap-12 mb-16">
              <div className="space-y-2"><label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em]">Company Name</label><input placeholder="e.g. Google India" className="w-full p-8 bg-slate-950 rounded-[40px] border-4 border-slate-800 focus:border-indigo-600 outline-none font-black text-2xl transition-all shadow-inner" /></div>
              <div className="space-y-2"><label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em]">HR Business Partner</label><input placeholder="hr@google.com" className="w-full p-8 bg-slate-950 rounded-[40px] border-4 border-slate-800 focus:border-indigo-600 outline-none font-black text-2xl transition-all shadow-inner" /></div>
           </div>
           <button onClick={() => setView('otp')} className="w-full bg-indigo-600 py-10 rounded-[64px] font-black text-4xl shadow-2xl active:scale-95 hover:bg-indigo-700 transition-all shadow-indigo-500/30">Authorize Session →</button>
        </div>
      </div>
    );
  }

  if (view === 'otp') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 p-24 rounded-[80px] shadow-2xl w-full max-w-lg border border-white/5 animate-in slide-in-from-bottom-4">
          <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase leading-none">Access Auth</h2>
          <div className="flex justify-center gap-6 mb-16">
            {[1, 2, 3, 4].map(i => <input key={i} type="text" maxLength={1} className="w-20 h-24 text-center text-5xl font-black rounded-3xl bg-slate-950 border-4 border-slate-800 focus:border-indigo-600 text-white outline-none shadow-inner transition-all" />)}
          </div>
          <button onClick={() => setView('create-role')} className="w-full bg-indigo-600 text-white py-8 rounded-[48px] font-black text-3xl active:scale-95 transition-all shadow-2xl">Enter Portal</button>
        </div>
      </div>
    );
  }

  if (view === 'create-role') {
    return (
      <div className="min-h-screen bg-slate-50 p-16 md:p-32">
        <div className="max-w-5xl mx-auto bg-white p-24 rounded-[100px] shadow-2xl border border-slate-100 animate-in fade-in glass-morphism relative overflow-hidden">
           <div className="flex justify-between items-start mb-20">
              <h2 className="text-8xl font-black text-slate-900 tracking-tighter leading-none uppercase">Create Role.</h2>
              <button onClick={handleAiSuggestRole} disabled={isSuggestingRole} className={`bg-indigo-600 text-white px-12 py-6 rounded-[32px] text-[12px] font-black uppercase tracking-[0.4em] shadow-xl ${isSuggestingRole ? 'animate-pulse' : ''}`}> {isSuggestingRole ? 'AI Computing...' : 'AI Suggest Strategy'} </button>
           </div>
           <div className="space-y-16">
             <div className="space-y-2"><label className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Hiring Role Title</label><input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Senior Frontend Architect" className="w-full p-10 border-8 border-slate-50 bg-slate-50 rounded-[48px] outline-none font-black text-4xl focus:border-indigo-600 transition-all shadow-inner" /></div>
             <div className="grid grid-cols-2 gap-12">
               <div className="space-y-2"><label className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Required Skills</label><input value={roleSkills} onChange={(e) => setRoleSkills(e.target.value)} placeholder="e.g. React, Node.js" className="w-full p-8 border-4 border-slate-50 bg-slate-50 rounded-[40px] outline-none font-black text-2xl focus:border-indigo-600 transition-all shadow-inner" /></div>
               <div className="space-y-2"><label className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Salary Band</label><input value={roleSalary} onChange={(e) => setRoleSalary(e.target.value)} placeholder="e.g. 16 - 24 LPA" className="w-full p-8 border-4 border-slate-50 bg-slate-50 rounded-[40px] outline-none font-black text-2xl focus:border-indigo-600 transition-all shadow-inner" /></div>
             </div>
             <button onClick={() => setView('model-selection')} className="w-full bg-slate-900 text-white py-10 rounded-[64px] font-black text-4xl shadow-2xl active:scale-95 transition-all">Next: Select Model →</button>
           </div>
        </div>
      </div>
    );
  }

  if (view === 'model-selection') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-9xl font-black text-slate-900 mb-24 tracking-tighter leading-none uppercase italic">Hiring <span className="text-indigo-600">Model.</span></h2>
        <div className="max-w-[1500px] w-full grid md:grid-cols-2 gap-16 px-10">
           <div onClick={() => setView('candidates')} className="bg-white p-24 rounded-[100px] border-[12px] border-transparent hover:border-indigo-600 transition-all cursor-pointer shadow-sm group glass-morphism text-left relative overflow-hidden">
              <h3 className="text-7xl font-black mb-8 text-slate-900 group-hover:text-indigo-600 transition-all leading-none uppercase">Direct Hire</h3>
              <p className="text-slate-500 font-medium italic text-3xl leading-relaxed opacity-80">Immediate access to Tier-1 benchmarked students with 90%+ readiness scores.</p>
           </div>
           <div onClick={() => setView('candidates')} className="bg-indigo-600 p-24 rounded-[100px] text-white cursor-pointer hover:scale-105 transition-all shadow-2xl text-left relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-20 opacity-10 font-black text-9xl">T</div>
              <h3 className="text-7xl font-black mb-8 text-white leading-none uppercase">Train-then-Hire</h3>
              <p className="text-indigo-100 font-medium italic text-3xl leading-relaxed opacity-90">Custom-tailor a 4-week cohort specifically for your internal technology stack.</p>
           </div>
        </div>
      </div>
    );
  }

  if (view === 'candidates') {
    return (
      <div className="min-h-screen bg-slate-50 p-16 md:p-32 flex flex-col">
        <header className="flex justify-between items-end mb-24">
           <div>
              <h1 className="text-9xl font-black text-slate-900 tracking-tighter leading-none uppercase italic underline decoration-indigo-600 decoration-[12px] underline-offset-[24px]">Talent Match.</h1>
              <p className="text-slate-500 text-3xl font-medium italic mt-4 opacity-70">AI-Ranked Candidates for {roleTitle || 'Senior Roles'}</p>
           </div>
           <button onClick={onLogout} className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] hover:text-rose-500 transition-all">Logout</button>
        </header>

        {/* Intelligence Pulse */}
        <div className="mb-16">
           <div className="bg-white p-8 rounded-[48px] border shadow-sm glass-morphism flex flex-col lg:flex-row gap-8 items-center justify-between">
              <div className="flex-1">
                <h4 className="font-black text-xl tracking-tighter text-slate-900 uppercase italic mb-4">Strategic Recruiting Intelligence</h4>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {isAiLoading ? (
                    <div className="flex gap-4 animate-pulse">
                      {[1, 2].map(i => <div key={i} className="h-20 w-64 bg-slate-50 rounded-3xl"></div>)}
                    </div>
                  ) : (
                    suggestions.map((s, i) => (
                      <div key={i} onClick={() => handleSuggestionAction(s.action)} className="flex-shrink-0 p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 hover:border-indigo-600 transition-all group cursor-pointer w-72">
                          <div className="flex justify-between items-center mb-2 text-[8px] font-black uppercase text-indigo-600 tracking-widest">
                             <span>{s.title}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 italic leading-tight">{s.suggestion}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="w-px h-20 bg-slate-100 hidden lg:block"></div>
              <div className="flex gap-6 items-center">
                 <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Benchmarking</div>
                    <div className="text-2xl font-black text-indigo-600">Tier-1 Elite</div>
                 </div>
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">⚡</div>
              </div>
           </div>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="mb-12 flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between">
           <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-4">Experience Level</label>
                 <select 
                   value={filterExp} 
                   onChange={(e) => setFilterExp(e.target.value)}
                   className="px-6 py-3 rounded-2xl border-2 border-white bg-white font-black text-[10px] uppercase outline-none shadow-sm focus:border-indigo-600 transition-all"
                 >
                   <option value="All">All Levels</option>
                   <option value="Intern">Intern</option>
                   <option value="Entry Level">Entry Level</option>
                   <option value="Junior">Junior</option>
                 </select>
              </div>

              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-4">Location</label>
                 <select 
                   value={filterLoc} 
                   onChange={(e) => setFilterLoc(e.target.value)}
                   className="px-6 py-3 rounded-2xl border-2 border-white bg-white font-black text-[10px] uppercase outline-none shadow-sm focus:border-indigo-600 transition-all"
                 >
                   <option value="All">All Locations</option>
                   {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                 </select>
              </div>

              <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-4">Min. Readiness ({filterMinReadiness}%)</label>
                 <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border-2 border-white bg-white shadow-sm">
                   <input 
                     type="range" min="0" max="100" 
                     value={filterMinReadiness} 
                     onChange={(e) => setFilterMinReadiness(parseInt(e.target.value))}
                     className="w-32 h-1.5 bg-slate-100 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                   />
                 </div>
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-4">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-6 py-3 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white font-black text-[10px] uppercase outline-none shadow-xl focus:bg-indigo-600 transition-all"
              >
                <option value="readiness-desc">Readiness: High to Low</option>
                <option value="readiness-asc">Readiness: Low to High</option>
                <option value="name">Candidate Name (A-Z)</option>
              </select>
           </div>
        </div>

        {/* Candidate List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
           {filteredCandidates.length > 0 ? (
             filteredCandidates.map(cand => (
               <div key={cand.id} className="bg-white p-20 rounded-[100px] border shadow-sm glass-morphism flex flex-col relative group hover:shadow-2xl transition-all animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-5xl text-slate-900 leading-none">{cand.n}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{cand.exp}</span>
                  </div>
                  <div className="text-[12px] font-black uppercase text-indigo-600 mb-10 tracking-[0.4em]">{cand.c} • {cand.loc}</div>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    {cand.skills.map(skill => (
                      <span key={skill} className="text-[8px] font-black uppercase text-slate-400 border px-2 py-1 rounded-lg">{skill}</span>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[56px] mb-12 shadow-inner border border-slate-100 flex items-center justify-between">
                     <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Readiness</span><div className="text-6xl font-black text-indigo-600 tracking-tighter">{cand.r}%</div></div>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-sm ${cand.r >= 90 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {cand.r >= 90 ? '✓' : '!'}
                     </div>
                  </div>
                  <button onClick={() => { setSelectedCandidate(cand); setView('interview-feedback'); }} className="mt-auto w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-xs uppercase tracking-[0.5em] active:scale-95 transition-all hover:bg-indigo-600 shadow-xl">Audit Candidate →</button>
               </div>
             ))
           ) : (
             <div className="col-span-full py-40 text-center">
                <div className="text-9xl mb-12 opacity-10">🔍</div>
                <h3 className="text-4xl font-black text-slate-300 uppercase italic">No matching talent found.</h3>
                <button 
                  onClick={() => { setFilterExp('All'); setFilterLoc('All'); setFilterMinReadiness(0); }}
                  className="mt-8 text-indigo-600 font-black uppercase tracking-widest text-[12px] underline"
                >
                  Clear All Filters
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (view === 'interview-feedback') {
    return (
       <div className="min-h-screen bg-slate-50 p-16 md:p-32 flex items-center justify-center">
          <div className="w-full max-w-7xl bg-white p-24 rounded-[100px] shadow-2xl border border-slate-100 glass-morphism animate-in zoom-in">
             <button onClick={() => setView('candidates')} className="text-[12px] font-black text-indigo-600 mb-12 uppercase tracking-[0.4em]">← Back to candidates</button>
             <h2 className="text-7xl font-black mb-16 tracking-tighter uppercase leading-none text-slate-900">Technical <span className="text-indigo-600 italic">Audit.</span></h2>
             <div className="grid md:grid-cols-2 gap-20 mb-24">
                <div className="p-16 bg-slate-50 rounded-[80px] border border-slate-100 flex flex-col justify-center">
                   <h4 className="text-[12px] font-black uppercase text-slate-400 mb-10 tracking-[0.4em]">AI Logic Verdict for {selectedCandidate?.n}</h4>
                   <p className="text-3xl font-bold text-slate-700 italic leading-relaxed mb-12">"Candidate demonstrated elite architectural precision. Logic and code quality are in the top 1% of the bench."</p>
                </div>
                <div className="p-16 bg-slate-900 text-white rounded-[80px] flex flex-col justify-center relative overflow-hidden">
                   <h4 className="text-[12px] font-black uppercase text-slate-500 mb-10 tracking-[0.5em]">Internal Evaluation</h4>
                   <textarea placeholder="Add evaluation notes..." className="w-full h-40 bg-white/5 border-4 border-white/10 rounded-[40px] p-8 text-white font-bold italic outline-none focus:border-indigo-600 transition-all mb-10"></textarea>
                   <button onClick={() => setView('offer')} className="w-full py-5 bg-indigo-600 rounded-[28px] font-black uppercase text-[10px] tracking-widest text-white shadow-xl">Move to Offer Release</button>
                </div>
             </div>
          </div>
       </div>
    );
  }

  if (view === 'offer') {
    return (
       <div className="min-h-screen bg-slate-900 text-white p-12 md:p-32 flex items-center justify-center">
          <div className="w-full max-w-7xl bg-slate-800 p-24 rounded-[120px] border border-white/5 animate-in zoom-in text-center relative overflow-hidden">
             <h2 className="text-9xl font-black mb-20 tracking-tighter uppercase italic leading-none">Offer <span className="text-indigo-500">Desk.</span></h2>
             <div className="grid md:grid-cols-2 gap-16 mb-24 text-left">
                <div className="p-16 bg-white/5 rounded-[80px] border border-white/10 flex flex-col items-center text-center">
                   <h4 className="text-[12px] font-black uppercase text-indigo-400 mb-12 tracking-[0.5em]">Selected Candidate</h4>
                   <div className="text-6xl font-black text-white mb-4 tracking-tighter leading-none">{selectedCandidate?.n}</div>
                   <p className="text-slate-500 font-bold uppercase text-[12px] tracking-[0.5em]">{selectedCandidate?.r}% READINESS SCORE</p>
                </div>
                <div className="p-16 bg-white/5 rounded-[80px] border border-white/10">
                   <h4 className="text-[12px] font-black uppercase text-slate-500 mb-12 tracking-[0.5em]">Offer Structure</h4>
                   <div className="space-y-10">
                      <div className="space-y-3"><label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Base CTC (LPA)</label><input defaultValue="16.5" className="w-full p-6 bg-slate-950 rounded-[32px] border-4 border-slate-700 text-white font-black text-3xl outline-none focus:border-indigo-600 shadow-inner" /></div>
                      <div className="space-y-3"><label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Bonus/Equity (LPA)</label><input defaultValue="2.0" className="w-full p-6 bg-slate-950 rounded-[32px] border-4 border-slate-700 text-white font-black text-3xl outline-none focus:border-indigo-600 shadow-inner" /></div>
                   </div>
                </div>
             </div>
             <button onClick={() => { alert(`Offer released to ${selectedCandidate?.n}'s Hub.`); setView('candidates'); }} className="w-full bg-indigo-600 py-12 rounded-[64px] font-black text-4xl shadow-2xl active:scale-95 transition-all shadow-indigo-500/40 uppercase">Release Job Offer →</button>
          </div>
       </div>
    );
  }

  return null;
};

export default CompanyFlow;
