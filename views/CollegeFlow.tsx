
import React, { useState, useEffect } from 'react';
// Fixed: Added missing CartesianGrid to the recharts import list.
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ComposedChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import { COLLEGE_PLANS } from '../constants';
import { getSmartSuggestions, getBatchRiskAnalysis } from '../services/geminiService';

interface CollegeFlowProps {
  onLogout: () => void;
}

type SubFlow = 'signup' | 'otp' | 'subscription' | 'dashboard' | 'training-dashboard' | 'students' | 'employers';

const CollegeFlow: React.FC<CollegeFlowProps> = ({ onLogout }) => {
  const [subFlow, setSubFlow] = useState<SubFlow>('signup');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<string | null>(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);

  const studentsData = [
    { n: 'Arnav Varma', p: '88%', s: '92', pr: '94%', st: 'Frontend Architect', risk: 'Low', logs: ["AI unlocked Performance Lab", "Scored 98% in CSS Heuristics"], dna: [{subject:'F',A:95,B:85},{subject:'B',A:70,B:90},{subject:'A',A:85,B:80},{subject:'S',A:90,B:85},{subject:'L',A:88,B:95},{subject:'Se',A:65,B:75}] },
    { n: 'Sanya Gupta', p: '72%', s: '84', pr: '78%', st: 'SDE-1 Meta', risk: 'Low', logs: ["Completed Module 02"], dna: [{subject:'F',A:85,B:85},{subject:'B',A:80,B:90},{subject:'A',A:65,B:80},{subject:'S',A:95,B:85},{subject:'L',A:92,B:95},{subject:'Se',A:70,B:75}] },
    { n: 'Rahul Mehta', p: '45%', s: '62', pr: '32%', st: 'Data Analyst', risk: 'High', logs: ["Inactivity for 3 days"], dna: [{subject:'F',A:45,B:85},{subject:'B',A:55,B:90},{subject:'A',A:40,B:80},{subject:'S',A:65,B:85},{subject:'L',A:50,B:95},{subject:'Se',A:30,B:75}] }
  ];

  const batchProgressData = [
    { week: 'Week 1', progress: 45, mastery: 40 },
    { week: 'Week 2', progress: 55, mastery: 48 },
    { week: 'Week 3', progress: 68, mastery: 62 },
    { week: 'Week 4', progress: 82, mastery: 75 },
  ];

  useEffect(() => {
    if (subFlow === 'dashboard' || subFlow === 'training-dashboard') fetchSuggestions();
    if (subFlow === 'training-dashboard') runRiskAnalysis();
  }, [subFlow]);

  const fetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const data = await getSmartSuggestions('college', { batchSize: 2450, placed: 640 });
      setSuggestions(data);
    } catch (e) {
      setSuggestions([
        { title: 'Curriculum Alert', suggestion: 'Technical scores trailing in Security. Suggest 1-week intensive.', priority: 'High', action: 'students' },
        { title: 'Placement Edge', suggestion: 'High demand for AWS specialists. Shift focus for Batch B.', priority: 'Medium', action: 'employers' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const runRiskAnalysis = async () => {
    setIsAnalyzingRisk(true);
    try {
      const analysis = await getBatchRiskAnalysis(studentsData);
      setRiskAnalysis(analysis);
    } catch (e) {
      setRiskAnalysis("Patterns indicate 15% of the batch needs immediate intervention in System Architecture modules.");
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  const handleSuggestionAction = (action?: string) => {
    if (action === 'students') setSubFlow('students');
    if (action === 'employers') setSubFlow('employers');
  };

  const handleCsvUpload = () => {
    setIsUploadingCsv(true);
    setTimeout(() => {
      setIsUploadingCsv(false);
      alert("Successfully onboarded 240 student records via CSV.");
    }, 2000);
  };

  if (subFlow === 'signup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white p-20 rounded-[80px] shadow-2xl border border-slate-100 animate-in zoom-in">
          <h2 className="text-6xl font-black mb-4 text-slate-900 tracking-tighter text-center uppercase">College <span className="text-indigo-600 italic">Onboarding.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 mb-16">
            <div className="space-y-8">
              <input placeholder="Institution Name" className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[32px] font-black text-xl outline-none shadow-inner transition-all" />
              <div className="w-full p-10 border-4 border-dashed border-slate-100 rounded-[40px] text-center bg-slate-50/50 group hover:border-indigo-600 transition-all cursor-pointer">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Drag & Drop Accreditation PDF</span>
              </div>
            </div>
            <div className="space-y-8">
              <input placeholder="Placement Officer Name" className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[32px] font-black text-xl outline-none shadow-inner transition-all" />
              <input placeholder="Institutional Email" className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[32px] font-black text-xl outline-none shadow-inner transition-all" />
            </div>
          </div>
          <button onClick={() => setSubFlow('otp')} className="w-full bg-indigo-600 text-white py-10 rounded-[48px] font-black text-3xl shadow-2xl active:scale-95 transition-all">Continue to Verification →</button>
        </div>
      </div>
    );
  }

  if (subFlow === 'otp') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 p-24 rounded-[80px] shadow-2xl w-full max-w-md border border-slate-100 animate-in slide-in-from-bottom-4">
          <h2 className="text-4xl font-black mb-12 tracking-tighter uppercase leading-none">Institutional Verification</h2>
          <div className="flex justify-center gap-4 mb-12">
            {[1, 2, 3, 4].map(i => <input key={i} type="text" maxLength={1} className="w-16 h-16 text-center text-4xl font-black rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none shadow-inner transition-all" />)}
          </div>
          <button onClick={() => setSubFlow('subscription')} className="w-full bg-indigo-600 text-white py-8 rounded-[32px] font-black text-2xl shadow-xl active:scale-95 transition-all">Verify Credentials</button>
        </div>
      </div>
    );
  }

  if (subFlow === 'subscription') {
    return (
      <div className="min-h-screen bg-slate-50 p-12 md:p-24">
        <h2 className="text-9xl font-black text-center mb-24 tracking-tighter leading-[0.85] uppercase">Portal Capacity.</h2>
        <div className="grid md:grid-cols-3 gap-16 max-w-[1500px] mx-auto">
          {COLLEGE_PLANS.map(plan => (
            <div key={plan.id} onClick={() => setSubFlow('dashboard')} className="bg-white p-16 rounded-[80px] border-4 border-transparent hover:border-indigo-600 transition-all cursor-pointer group shadow-sm hover:shadow-2xl flex flex-col items-center text-center glass-morphism relative overflow-hidden">
               <h3 className="text-5xl font-black mb-4 text-slate-900 group-hover:text-indigo-600 transition-all uppercase leading-none tracking-tighter">{plan.name}</h3>
               <div className="text-6xl font-black text-indigo-600 mb-10 tracking-tighter">{plan.price}</div>
               <div className="bg-slate-50 px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest text-slate-400 mb-16">{plan.capacity} Limit</div>
               <button className="mt-auto w-full bg-slate-900 group-hover:bg-indigo-600 text-white py-8 rounded-[40px] font-black text-2xl transition-all shadow-xl active:scale-95">Activate Portal</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-indigo-100">
      <aside className="w-96 bg-slate-900 text-slate-400 p-12 flex flex-col gap-12 h-screen sticky top-0 border-r border-slate-800 shadow-2xl overflow-y-auto">
        <div className="flex items-center gap-4 text-white font-black text-4xl tracking-tighter"><div className="w-12 h-12 bg-indigo-500 rounded-[20px] shadow-lg flex items-center justify-center text-white text-2xl">C</div> HiredPath</div>
        <nav className="flex-1 space-y-4">
          {[
            {id:'dashboard',l:'KPI Dashboard'}, 
            {id:'training-dashboard',l:'Training Analytics'}, 
            {id:'students',l:'Student Management'}, 
            {id:'employers',l:'Employer Pipeline'}
          ].map(item => (
            <button key={item.id} onClick={() => setSubFlow(item.id as any)} className={`w-full text-left px-10 py-6 rounded-[32px] font-black text-base transition-all ${subFlow === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30' : 'hover:bg-slate-800 hover:text-white'}`}>{item.l}</button>
          ))}
        </nav>
        <button onClick={onLogout} className="text-[10px] font-black hover:text-rose-500 uppercase tracking-[0.4em] text-slate-500 pb-10 transition-all">Sign Out Portal</button>
      </aside>

      <main className="flex-1 p-16 md:p-24 overflow-y-auto relative">
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[100] p-12 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[80px] p-24 relative shadow-2xl">
               <button onClick={() => setSelectedStudent(null)} className="absolute top-12 right-12 w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-3xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕</button>
               <h2 className="text-7xl font-black text-slate-900 tracking-tighter leading-none mb-12 uppercase italic underline decoration-indigo-600 decoration-8 underline-offset-[16px]">{selectedStudent.n} Progress Mirror.</h2>
               <div className="grid grid-cols-2 gap-16">
                  <div className="bg-slate-50 p-16 rounded-[64px] border h-[500px] shadow-inner relative overflow-hidden">
                    <h4 className="font-black text-2xl mb-12 tracking-tight text-slate-400 uppercase">Skill Fingerprint</h4>
                    <ResponsiveContainer width="100%" height="80%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedStudent.dna}><PolarGrid stroke="#e2e8f0"/><PolarAngleAxis dataKey="subject" tick={{fill:'#94a3b8', fontSize:10, fontWeight:'black' }}/><Radar name="Student" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5}/><Tooltip/></RadarChart></ResponsiveContainer>
                  </div>
                  <div className="bg-slate-50 p-16 rounded-[64px] border flex flex-col shadow-inner relative">
                    <h4 className="font-black text-2xl mb-12 tracking-tight text-slate-400 uppercase">Audit Trail</h4>
                    <div className="space-y-6 flex-1 overflow-y-auto">{selectedStudent.logs.map((log: string, i: number) => <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 text-sm italic font-bold text-slate-700 shadow-sm">• {log}</div>)}</div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {subFlow === 'dashboard' && (
          <div className="animate-in fade-in duration-700 space-y-24">
            <h1 className="text-9xl font-black text-slate-900 tracking-tighter leading-none uppercase">KPI Dashboard.</h1>
            <div className="grid grid-cols-4 gap-12">
              {[ { l: 'Total Students', v: '2,450' }, { l: 'In Training', v: '890' }, { l: 'Interview Ready', v: '420' }, { l: 'Placed Success', v: '92%' } ].map((k, i) => (
                <div key={i} className="bg-white p-12 rounded-[64px] border shadow-sm glass-morphism hover:shadow-2xl transition-all relative overflow-hidden group">
                  <div className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{k.l}</div>
                  <div className="text-7xl font-black text-slate-900 leading-none tracking-tighter">{k.v}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2 bg-slate-900 p-20 rounded-[80px] shadow-2xl h-[600px] flex flex-col">
                 <h4 className="text-white font-black text-4xl mb-16 tracking-tighter uppercase italic">Placement Readiness Distribution</h4>
                 <ResponsiveContainer width="100%" height="80%">
                    <ComposedChart data={[{ name: 'Frontend', supply: 85, demand: 95 }, { name: 'AI/ML', supply: 40, demand: 98 }, { name: 'Cloud', supply: 60, demand: 88 }, { name: 'Data Sci', supply: 75, demand: 70 }, { name: 'DevOps', supply: 30, demand: 92 }]} margin={{ left: 20, right: 20 }}>
                       <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'black' }} axisLine={false} tickLine={false} />
                       <Tooltip />
                       <Bar name="Students Ready" dataKey="supply" fill="#4f46e5" radius={[16, 16, 0, 0]} barSize={80} />
                       <Line name="Market Demand" type="monotone" dataKey="demand" stroke="#fbbf24" strokeWidth={6} dot={{ r: 10, fill: '#fbbf24' }} />
                       <Legend verticalAlign="top" height={36}/>
                    </ComposedChart>
                 </ResponsiveContainer>
               </div>
               <div className="bg-white p-12 rounded-[64px] border shadow-sm flex flex-col glass-morphism relative overflow-hidden">
                  <h4 className="font-black text-3xl tracking-tighter text-slate-900 uppercase italic mb-12 underline decoration-indigo-600 decoration-4">Strategic AI Pulse</h4>
                  <div className="space-y-8 flex-1 overflow-y-auto">
                    {suggestions.map((s, i) => (
                       <div key={i} onClick={() => handleSuggestionAction(s.action)} className="p-8 rounded-[40px] border-4 border-slate-50 bg-slate-50/50 hover:border-indigo-600 transition-all group relative overflow-hidden shadow-sm cursor-pointer">
                          <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                             <span>{s.title}</span>
                             <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[8px]">{s.priority}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-600 italic leading-relaxed mb-4">{s.suggestion}</p>
                          {s.action && <div className="text-[10px] font-black uppercase text-indigo-600 underline">Intervene Now →</div>}
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {subFlow === 'training-dashboard' && (
          <div className="animate-in fade-in duration-700 space-y-24">
             <header className="flex justify-between items-end">
                <div>
                   <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">Training Analytics.</h1>
                   <p className="text-slate-500 text-3xl font-medium italic mt-4 opacity-70">Aggregated Batch Mastery • AI Risk Identification</p>
                </div>
                <div className="bg-white px-8 py-4 rounded-[32px] border shadow-sm flex items-center gap-6">
                   <div className="text-center"><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mastery</div><div className="text-3xl font-black text-indigo-600">72%</div></div>
                   <div className="w-px h-10 bg-slate-100"></div>
                   <div className="text-center"><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">At Risk</div><div className="text-3xl font-black text-rose-500">12%</div></div>
                </div>
             </header>

             <div className="grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 bg-white p-16 rounded-[72px] shadow-2xl border h-[500px] flex flex-col relative overflow-hidden">
                   <h4 className="text-slate-900 font-black text-3xl mb-12 tracking-tight uppercase italic underline decoration-indigo-600 decoration-4">Batch Progress Curve</h4>
                   <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={batchProgressData}>
                        <defs>
                          <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                        </defs>
                        {/* Correctly using CartesianGrid which is now imported */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="week" tick={{fill:'#94a3b8', fontSize:10, fontWeight:'black' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:'#94a3b8', fontSize:10, fontWeight:'black' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius:'24px', border:'none', backgroundColor:'#0f172a', color:'#fff'}} />
                        <Area name="Course Progress" type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorProg)" />
                        <Area name="Avg Mastery" type="monotone" dataKey="mastery" stroke="#10b981" strokeWidth={4} fill="none" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="bg-slate-900 p-12 rounded-[64px] text-white shadow-2xl relative overflow-hidden flex flex-col">
                   <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><div className="text-9xl font-black italic">!</div></div>
                   <div className="flex justify-between items-center mb-10">
                      <h4 className="font-black text-2xl tracking-tighter uppercase italic">AI Risk Audit</h4>
                      <button onClick={runRiskAnalysis} disabled={isAnalyzingRisk} className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all ${isAnalyzingRisk ? 'animate-pulse' : ''}`}>Re-Audit</button>
                   </div>
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {isAnalyzingRisk ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                           <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synthesizing Patterns...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <p className="text-sm font-medium italic text-slate-400 leading-relaxed border-l-4 border-indigo-500 pl-4">{riskAnalysis || "Patterns indicate a consistent drop-off in System Architecture engagement for 15% of the batch."}</p>
                           <div className="grid grid-cols-1 gap-4">
                              <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] group hover:border-indigo-500 transition-all cursor-pointer">
                                 <div className="text-rose-400 font-black text-[10px] uppercase mb-1">Pattern: Inertia</div>
                                 <p className="text-xs font-bold text-slate-300">Rahul Mehta + 4 others showing 0 activity in 48h.</p>
                              </div>
                              <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] group hover:border-indigo-500 transition-all cursor-pointer">
                                 <div className="text-amber-400 font-black text-[10px] uppercase mb-1">Pattern: Logical Bottleneck</div>
                                 <p className="text-xs font-bold text-slate-300">Avg score in "Memory Management" is 42% (Batch Target: 85%).</p>
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                   <button onClick={() => setSubFlow('students')} className="mt-8 w-full bg-white text-slate-900 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-50 transition-all shadow-xl">Initiate Intervention →</button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {[
                   {l:'Eligibility Rate', v:'54%', d:'Students ready for interviews'},
                   {l:'Avg Mastery', v:'72%', d:'Logic assessment benchmark'},
                   {l:'Course Velocity', v:'1.4x', d:'Progress relative to schedule'},
                   {l:'Lab Engagement', v:'94%', d:'Weekly active lab usage'}
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-10 rounded-[48px] border shadow-sm glass-morphism hover:scale-105 transition-all group">
                     <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 group-hover:text-indigo-600">{stat.l}</div>
                     <div className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">{stat.v}</div>
                     <p className="text-[10px] font-bold italic text-slate-400 opacity-60">{stat.d}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {subFlow === 'students' && (
          <div className="animate-in slide-in-from-bottom-10 duration-700 space-y-20">
            <div className="flex justify-between items-end">
               <h1 className="text-9xl font-black text-slate-900 tracking-tighter leading-none uppercase">Batch Records.</h1>
               <button onClick={handleCsvUpload} disabled={isUploadingCsv} className={`bg-indigo-600 text-white px-10 py-6 rounded-[32px] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all ${isUploadingCsv ? 'animate-pulse opacity-70' : ''}`}>
                 {isUploadingCsv ? 'Ingesting CSV...' : 'Upload Student CSV'}
               </button>
            </div>
            <div className="bg-white rounded-[80px] border shadow-sm overflow-hidden glass-morphism shadow-2xl">
               <table className="w-full text-left border-collapse font-black">
                 <thead className="bg-slate-50 text-[12px] uppercase text-slate-400 tracking-[0.4em]"><tr className="border-b border-slate-100"><th className="px-20 py-12">Student</th><th className="px-20 py-12">Score</th><th className="px-20 py-12">Action</th></tr></thead>
                 <tbody className="divide-y divide-slate-50">
                   {studentsData.map(s => (
                     <tr key={s.n} className="hover:bg-slate-50 transition-all group">
                       <td className="px-20 py-12"><div><div className="text-4xl text-slate-900 tracking-tight leading-none mb-2">{s.n}</div><div className="text-[12px] text-slate-400 uppercase tracking-widest">{s.st}</div></div></td>
                       <td className="px-20 py-12">
                         <div className="flex items-center gap-8">
                            <div className="text-6xl text-indigo-600 tracking-tighter">{s.pr}</div>
                            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${s.risk === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{s.risk} Risk</span>
                         </div>
                       </td>
                       <td className="px-20 py-12"><button onClick={() => setSelectedStudent(s)} className="bg-slate-900 text-white px-12 py-5 rounded-[28px] hover:bg-indigo-600 transition-all text-[12px] uppercase tracking-[0.4em] shadow-xl active:scale-95">Mirror Journey →</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {subFlow === 'employers' && (
          <div className="animate-in fade-in duration-700 space-y-24">
             <h1 className="text-9xl font-black text-slate-900 tracking-tighter leading-none uppercase italic underline decoration-indigo-600 decoration-8 underline-offset-[16px]">Partner Pipeline.</h1>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
               {['Google', 'Meta', 'Netflix', 'Razorpay', 'CRED'].map((partner, i) => (
                 <div key={partner} className="bg-white p-16 rounded-[80px] border shadow-sm glass-morphism relative overflow-hidden group hover:shadow-2xl transition-all">
                   <div className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-12">Corporate Partner</div>
                   <h3 className="text-5xl font-black text-slate-900 mb-6 leading-tight group-hover:text-indigo-600 transition-all">{partner} India</h3>
                   <div className="flex justify-between items-center mt-16 pt-10 border-t-4 border-slate-50">
                      <div className="text-[12px] font-black uppercase text-slate-400 tracking-widest">{10 + i * 2} Students Shortlisted</div>
                   </div>
                   <button className="mt-12 w-full bg-slate-900 text-white py-8 rounded-[36px] font-black text-xs uppercase tracking-[0.5em] group-hover:bg-indigo-600 transition-all shadow-2xl active:scale-95">Analyze Role Mapping →</button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollegeFlow;
