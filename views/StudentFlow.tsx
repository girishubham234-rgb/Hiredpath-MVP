import React, { useState, useEffect } from 'react';
import { UserStatus } from '../types';
import { SKILLS_LIST, ROLE_MARKETPLACE } from '../constants';
import { 
  getSmartSuggestions, 
  getCourseSuggestions, 
  getConceptExplanation, 
  getAssessmentQuestions, 
  getNegotiationTactics, 
  getSkillSuggestions,
  getComplexAnalysis,
  analyzeImage,
  editImage
} from '../services/geminiService';

interface StudentFlowProps {
  status: UserStatus;
  setStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
  onLogout: () => void;
}

type SubView = 'signup' | 'otp' | 'profile' | 'skills' | 'assessment' | 'assessment-summary' | 'gap-result' | 'marketplace' | 'path-detail' | 'subscription' | 'dashboard' | 'learning' | 'readiness' | 'interviews' | 'offer' | 'success' | 'ai-lab';

// PhaseIndicator Component defined outside the main component for stability
const PhaseIndicator: React.FC<{ step: number; phase: number }> = ({ step, phase }) => (
  <div className="mb-12">
    <div className="flex justify-between items-end mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">
      <span>Phase {phase} • Step {step} of 4</span>
      <span className="text-slate-400">{step * 25}% PHASE COMPLETE</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
      <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${step * 25}%` }}></div>
    </div>
  </div>
);

// StudentLayout Component defined outside the main component for stability
interface StudentLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setSubView: (view: SubView) => void;
  onLogout: () => void;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, currentTab, setSubView, onLogout }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <aside className="w-full md:w-96 bg-white border-r p-12 flex flex-col gap-16 h-screen sticky top-0 shadow-sm overflow-y-auto">
       <div className="font-black text-4xl tracking-tighter flex items-center gap-4 text-slate-900">
          <div className="w-12 h-12 bg-indigo-600 rounded-[22px] shadow-lg flex items-center justify-center text-white text-3xl">H</div> HiredPath
       </div>
       <nav className="flex-1 space-y-4">
         {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'learning', label: 'Learning Lab' },
            { id: 'ai-lab', label: 'AI Strategic Lab' },
            { id: 'marketplace', label: 'Marketplace' }
         ].map(v => (
           <button 
             key={v.id} 
             onClick={() => setSubView(v.id as SubView)} 
             className={`w-full text-left px-10 py-6 rounded-[32px] font-black text-base transition-all ${currentTab === v.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
           >
             {v.label}
           </button>
         ))}
       </nav>
       <button onClick={onLogout} className="text-[10px] font-black text-slate-300 hover:text-rose-600 transition-all uppercase tracking-[0.4em] pb-10">Term Session</button>
    </aside>
    <main className="flex-1 p-16 md:p-24 overflow-y-auto">
      {children}
    </main>
  </div>
);

const StudentFlow: React.FC<StudentFlowProps> = ({ status, setStatus, onLogout }) => {
  const [subView, setSubView] = useState<SubView>('signup');
  const [selectedRole, setSelectedRole] = useState<any>(ROLE_MARKETPLACE[0]);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<any[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [negotiationTactics, setNegotiationTactics] = useState<string>("");
  const [isNegotiating, setIsNegotiating] = useState(false);

  const [targetDomain, setTargetDomain] = useState('Frontend Architect');
  const [aiSuggestedSkills, setAiSuggestedSkills] = useState<string[]>([]);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set<string>());

  const [learningTip, setLearningTip] = useState<any>(null);
  const [isFetchingTip, setIsFetchingTip] = useState(false);

  // AI Lab States
  const [complexQuery, setComplexQuery] = useState('');
  const [complexResult, setComplexResult] = useState('');
  const [isAnalyzingComplex, setIsAnalyzingComplex] = useState(false);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);

  useEffect(() => {
    if (status === 'ONBOARDING') setSubView('profile');
    else if (status === 'TRAINING') setSubView('dashboard');
    else if (status === 'INTERVIEWING') setSubView('interviews');
    else if (status === 'PLACED') setSubView('success');
  }, [status]);

  useEffect(() => {
    if (subView === 'dashboard') {
      fetchSuggestions();
      fetchCourseSuggestions();
    }
    if (subView === 'learning') {
      fetchLearningTip();
    }
  }, [subView, selectedRole]);

  const fetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const data = await getSmartSuggestions('student', { score: assessmentScore || 94, target: selectedRole?.title || targetDomain });
      setSuggestions(data);
    } catch (e) {
      setSuggestions([
        { title: 'Path Optimized', suggestion: 'Finish Module 2 for ₹18L+ roles.', priority: 'High', actionLabel: 'Resume Lab', targetView: 'learning' },
        { title: 'Salary Hack', suggestion: 'Add Cloud skills for a 20% premium.', priority: 'Medium', actionLabel: 'Update Skills', targetView: 'skills' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestionAction = (target: string) => {
    if (target === 'learning') setSubView('learning');
    if (target === 'skills') setSubView('skills');
    if (target === 'marketplace') setSubView('marketplace');
    if (target === 'readiness') setSubView('readiness');
  };

  const fetchCourseSuggestions = async () => {
    setIsFetchingCourses(true);
    try {
      const courses = await getCourseSuggestions(selectedRole?.title || targetDomain, ['Architecture', 'Logic']);
      setCourseSuggestions(courses);
    } catch (e) {
      setCourseSuggestions([{ title: 'Elite Systems Design', duration: '2 Weeks', curriculum: ['Clean Code', 'Scalability'] }]);
    } finally {
      setIsFetchingCourses(false);
    }
  };

  const fetchLearningTip = async () => {
    setIsFetchingTip(true);
    try {
      const tip = await getConceptExplanation('System Design and Concurrency');
      setLearningTip(tip);
    } catch (e) {
      setLearningTip({ explanation: 'Focus on Microtasks vs Macrotasks.', interviewTip: 'Explain the order of execution clearly.' });
    } finally {
      setIsFetchingTip(false);
    }
  };

  const handleAiSkillSuggestions = async () => {
    setIsSuggestingSkills(true);
    try {
      const skills = await getSkillSuggestions(targetDomain);
      setAiSuggestedSkills(skills);
    } catch (e) {
      setAiSuggestedSkills(['Microservices', 'Kubernetes', 'Design Patterns']);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const next = new Set(selectedSkills);
    if (next.has(skill)) next.delete(skill);
    else next.add(skill);
    setSelectedSkills(next);
  };

  const handleStartAssessment = async () => {
    setIsGeneratingAssessment(true);
    setSubView('assessment');
    try {
      const roleName = selectedRole?.title || targetDomain;
      // Fixed: Explicitly cast the Array.from result to string[] to resolve the 'unknown[]' inference error.
      const skills = Array.from(selectedSkills) as string[];
      const qs = await getAssessmentQuestions(roleName, skills);
      setAssessmentQuestions(qs);
    } catch (e) {
      setAssessmentQuestions([{ question: 'Explain the Virtual DOM benefit?', options: ['Speed', 'SEO', 'Declarative UI', 'Diffing Efficiency'], answer: 'Diffing Efficiency' }]);
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleNegotiate = async () => {
    setIsNegotiating(true);
    try {
      const tactics = await getNegotiationTactics("₹16.5 LPA Base Offer", 94);
      setNegotiationTactics(tactics || "Highlight your 94% Lab Score to request a 15% bump in ESOPs.");
    } catch (e) {
      setNegotiationTactics("Highlight your 94% Lab Score to request a 15% bump in ESOPs.");
    } finally {
      setIsNegotiating(false);
    }
  };

  const runComplexAnalysis = async () => {
    if (!complexQuery.trim()) return;
    setIsAnalyzingComplex(true);
    try {
      const res = await getComplexAnalysis(complexQuery, { domain: selectedRole?.title || targetDomain, score: assessmentScore });
      setComplexResult(res || '');
    } catch (e) {
      setComplexResult("Analysis failed. Try again.");
    } finally {
      setIsAnalyzingComplex(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runImageAnalysis = async () => {
    if (!uploadedImage) return;
    setIsAnalyzingImage(true);
    try {
      const base64 = uploadedImage.split(',')[1];
      const res = await analyzeImage(base64, "Review this professional resume/certificate and provide 3 improvement tips for getting hired at FAANG companies.");
      setImageAnalysisResult(res || '');
    } catch (e) {
      setImageAnalysisResult("Image analysis failed.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const runImageEdit = async () => {
    if (!uploadedImage || !editPrompt) return;
    setIsEditingImage(true);
    try {
      const base64 = uploadedImage.split(',')[1];
      const res = await editImage(base64, editPrompt);
      setEditedImage(res);
    } catch (e) {
      alert("Image edit failed.");
    } finally {
      setIsEditingImage(false);
    }
  };

  const renderContent = () => {
    switch (subView) {
      case 'signup':
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-12 md:p-16 rounded-[64px] shadow-2xl w-full max-w-md border border-slate-100 animate-in zoom-in">
              <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tighter">Student <span className="text-indigo-600">Signup</span></h2>
              <p className="text-slate-500 mb-10 text-sm italic">Join 120k+ students getting hired by elite companies.</p>
              <div className="space-y-6">
                <input placeholder="Mobile or Email" className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold shadow-inner" />
                <button onClick={() => setSubView('otp')} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl shadow-xl active:scale-95 transition-all">Continue</button>
              </div>
            </div>
          </div>
        );

      case 'otp':
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="bg-white p-16 rounded-[64px] shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4">
              <h2 className="text-4xl font-black mb-10 tracking-tighter">Verification</h2>
              <div className="flex justify-center gap-3 mb-12">
                {[1, 2, 3, 4].map(i => <input key={i} type="text" maxLength={1} className="w-16 h-16 text-center text-3xl font-black rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none shadow-inner" />)}
              </div>
              <button onClick={() => setStatus('ONBOARDING')} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl shadow-xl active:scale-95 transition-all">Verify OTP</button>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-slate-50 p-12 md:p-24">
            <div className="max-w-2xl mx-auto">
              <PhaseIndicator phase={1} step={1} />
              <div className="bg-white p-16 rounded-[64px] shadow-sm border border-slate-100 space-y-10 animate-in fade-in glass-morphism">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Step 1: Profile</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education Level</label>
                    <select className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold"><option>Undergraduate</option><option>Masters</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graduation Year</label>
                    <select className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold"><option>2024</option><option>2025</option></select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Role</label>
                  <input 
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. Frontend Architect" 
                    className="w-full p-6 bg-slate-50 border-4 border-slate-50 rounded-[32px] outline-none font-black text-2xl focus:border-indigo-600 transition-all shadow-inner" 
                  />
                </div>
                <button onClick={() => setSubView('skills')} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-all">Next Step →</button>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="min-h-screen bg-slate-50 p-12 md:p-24">
            <div className="max-w-5xl mx-auto">
              <PhaseIndicator phase={1} step={2} />
              <div className="bg-white p-16 rounded-[64px] shadow-sm border border-slate-100 animate-in fade-in glass-morphism">
                <div className="flex justify-between items-center mb-12">
                   <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">Step 2: Skills</h2>
                   <button 
                     onClick={handleAiSkillSuggestions}
                     disabled={isSuggestingSkills}
                     className={`px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all ${isSuggestingSkills ? 'animate-pulse' : 'hover:scale-105'}`}
                   >
                     {isSuggestingSkills ? 'Gemini Suggesting...' : 'AI Suggest Skills'}
                   </button>
                </div>

                {aiSuggestedSkills.length > 0 && (
                  <div className="mb-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100 animate-in slide-in-from-top-4">
                     <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4">Gemini Recommended for {targetDomain}</p>
                     <div className="flex flex-wrap gap-4">
                        {aiSuggestedSkills.map(skill => (
                          <button 
                            key={skill} 
                            onClick={() => toggleSkill(skill)}
                            className={`px-6 py-3 rounded-full text-xs font-black transition-all border-2 ${selectedSkills.has(skill) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-100 text-indigo-600 hover:border-indigo-600'}`}
                          >
                            {skill} {selectedSkills.has(skill) ? '✓' : '+'}
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                  {SKILLS_LIST.map(skill => (
                    <div 
                      key={skill} 
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center gap-6 p-6 border-2 transition-all cursor-pointer group shadow-sm rounded-[32px] ${selectedSkills.has(skill) ? 'bg-indigo-50 border-indigo-600' : 'bg-slate-50/50 border-slate-50 hover:border-indigo-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedSkills.has(skill) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-100'}`}>
                         {selectedSkills.has(skill) && '✓'}
                      </div>
                      <div className="flex-1 font-black text-slate-900 text-xl">{skill}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleStartAssessment} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-all">Assess My Skills →</button>
              </div>
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="min-h-screen bg-slate-50 p-12 md:p-24">
            <div className="max-w-4xl mx-auto text-center">
              <PhaseIndicator phase={1} step={3} />
              <div className="bg-white p-16 md:p-24 rounded-[80px] shadow-2xl border border-slate-100 relative overflow-hidden glass-morphism text-left">
                {isGeneratingAssessment ? (
                   <div className="py-20 flex flex-col items-center text-center">
                      <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                      <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Logic Generation...</p>
                   </div>
                ) : (
                  <div className="space-y-12">
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-center mb-16">Evaluation: {selectedRole?.title || targetDomain}</h2>
                     {assessmentQuestions.map((q, i) => (
                        <div key={i} className="p-10 border-2 border-slate-50 rounded-[48px] bg-slate-50/50">
                           <p className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">{q.question}</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {q.options.map((opt: string) => <button key={opt} className="p-6 rounded-3xl border-2 border-white bg-white hover:border-indigo-600 transition-all text-sm font-black shadow-sm text-left">{opt}</button>)}
                           </div>
                        </div>
                     ))}
                     <button onClick={() => { setAssessmentScore(94); setSubView('assessment-summary'); }} className="w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-all">Submit Evaluation →</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'assessment-summary':
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
             <div className="bg-white p-20 rounded-[80px] shadow-2xl max-w-2xl w-full border border-slate-100 animate-in zoom-in">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-xl rotate-6">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 className="text-6xl font-black mb-12 tracking-tighter text-slate-900 uppercase leading-none">Score: <span className="text-indigo-600">{assessmentScore}%</span></h2>
                <button onClick={() => setSubView('gap-result')} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black text-2xl shadow-2xl hover:scale-105 transition-all">Next: View Skill Gap →</button>
             </div>
          </div>
        );

      case 'gap-result':
        return (
          <div className="min-h-screen bg-slate-50 p-12 md:p-24">
            <div className="max-w-6xl mx-auto">
              <PhaseIndicator phase={1} step={4} />
              <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-16 uppercase leading-none">Gap Results.</h2>
              <div className="grid lg:grid-cols-3 gap-12 mb-20">
                <div className="bg-white p-12 rounded-[64px] border shadow-sm glass-morphism flex flex-col items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">Direct Match Roles</h4>
                  <div className="space-y-6 w-full flex-1">
                    {ROLE_MARKETPLACE.map(r => (
                      <div key={r.id} onClick={() => { setSelectedRole(r); setSubView('path-detail'); }} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex justify-between items-center group cursor-pointer hover:bg-white hover:border-indigo-600 transition-all">
                        <div className="font-black text-slate-900">{r.title}</div>
                        <svg className="w-6 h-6 text-indigo-300 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"/></svg>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[64px] border shadow-sm text-center glass-morphism flex flex-col justify-center items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">Success Score</h4>
                  <div className="text-9xl font-black text-indigo-600 tracking-tighter mb-4">72%</div>
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 font-bold text-slate-600 italic text-xs leading-relaxed">"Bridge your System Architecture gaps to reach 95% placement probability."</div>
                </div>
                <div className="bg-slate-900 p-12 rounded-[64px] text-white shadow-2xl flex flex-col justify-center text-center">
                   <h4 className="font-black text-2xl mb-10 tracking-tight uppercase italic underline decoration-indigo-500 decoration-4">Critical Fixes</h4>
                   <div className="space-y-4 text-left">
                     {['Architectural Patterns', 'Live Debugging', 'Cloud Orchestration'].map(gap => (
                       <div key={gap} className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex justify-between items-center text-sm font-black text-white italic">
                         {gap} <span className="text-indigo-400">Fix →</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              <button onClick={() => setSubView('marketplace')} className="w-full bg-indigo-600 text-white py-10 rounded-[48px] font-black text-3xl shadow-2xl active:scale-95 transition-all">View Role Training →</button>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <StudentLayout currentTab="marketplace" setSubView={setSubView} onLogout={onLogout}>
               <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-16 uppercase leading-none italic underline decoration-indigo-600 decoration-[8px] underline-offset-[16px]">Role Marketplace.</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {ROLE_MARKETPLACE.map(role => (
                   <div key={role.id} onClick={() => { setSelectedRole(role); setSubView('path-detail'); }} className="bg-white rounded-[56px] border border-slate-100 p-12 shadow-sm hover:shadow-2xl transition-all group cursor-pointer glass-morphism flex flex-col">
                      <div className="flex justify-between items-start mb-10">
                         <h3 className="font-black text-3xl group-hover:text-indigo-600 transition-all leading-tight text-slate-900">{role.title}</h3>
                         {role.hasAssurance && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full">Assurance Active</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-10">
                        {role.companies.map((c: string) => <span key={c} className="text-[10px] font-black uppercase text-slate-400 border px-3 py-1 rounded-full">{c}</span>)}
                      </div>
                      <div className="mt-auto space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500"><span>Target Salary</span><span className="text-indigo-600">{role.salaryRange}</span></div>
                         <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg group-hover:bg-indigo-600 transition-all shadow-xl">Audit Path Strategy</button>
                      </div>
                   </div>
                 ))}
               </div>
          </StudentLayout>
        );

      case 'dashboard':
        return (
          <StudentLayout currentTab="dashboard" setSubView={setSubView} onLogout={onLogout}>
               <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
                  <div>
                    <h1 className="text-8xl font-black text-slate-900 mb-6 tracking-tighter leading-none uppercase italic">Dashboard.</h1>
                    <p className="text-slate-500 text-3xl font-medium italic opacity-70">{selectedRole?.title || targetDomain} Track • 82% Lab Mastery</p>
                  </div>
                  <div className="flex gap-8">
                    <div className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-50 text-center glass-morphism"><div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] mb-4">Module Stat</div><div className="text-5xl font-black text-slate-900">02/04</div></div>
                  </div>
               </header>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-2 space-y-16">
                    <div className="bg-white p-16 rounded-[72px] shadow-sm border glass-morphism">
                        <h4 className="font-black text-4xl mb-12 tracking-tighter text-slate-900 uppercase">Training Modules</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {courseSuggestions.map(course => (
                            <div key={course.title} className="p-10 border-4 border-slate-50 rounded-[56px] hover:border-indigo-600 transition-all group bg-slate-50/30 flex flex-col shadow-sm">
                               <h5 className="font-black text-3xl leading-none text-slate-900 group-hover:text-indigo-600 transition-all mb-4">{course.title}</h5>
                               <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full tracking-widest w-fit mb-12">{course.duration}</span>
                               <ul className="space-y-4 mb-12 flex-1">
                                 {course.curriculum.map((item: string) => <li key={item} className="text-sm font-bold text-slate-500 italic flex items-center gap-3">• {item}</li>)}
                               </ul>
                               <button onClick={() => setSubView('learning')} className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Enter Lab</button>
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                  <div className="bg-white p-12 rounded-[64px] border shadow-sm flex flex-col glass-morphism relative overflow-hidden">
                    <h4 className="font-black text-2xl mb-12 tracking-tight text-slate-900 uppercase italic underline decoration-indigo-600 decoration-4">AI Strategic Pulse</h4>
                    <div className="space-y-8 flex-1">
                      {isAiLoading ? (
                        <div className="space-y-4 animate-pulse">
                          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-[40px]"></div>)}
                        </div>
                      ) : (
                        suggestions.map((s, i) => (
                           <div key={i} className="p-8 rounded-[40px] border-2 border-slate-50 bg-slate-50/50 hover:border-indigo-600 transition-all group relative overflow-hidden shadow-sm">
                              <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                                 <span>{s.title}</span>
                                 <span className={`text-[8px] px-3 py-1 rounded-full ${s.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>{s.priority}</span>
                              </div>
                              <p className="text-sm font-bold text-slate-600 italic leading-relaxed mb-6">{s.suggestion}</p>
                              <button onClick={() => handleSuggestionAction(s.targetView)} className="text-[10px] font-black uppercase text-indigo-600 underline underline-offset-4 hover:text-indigo-900">{s.actionLabel} →</button>
                           </div>
                        ))
                      )}
                    </div>
                    <button onClick={() => setSubView('readiness')} className="mt-8 w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Start Readiness Check →</button>
                  </div>
               </div>
          </StudentLayout>
        );

      case 'ai-lab':
        return (
          <StudentLayout currentTab="ai-lab" setSubView={setSubView} onLogout={onLogout}>
              <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-16 uppercase leading-none italic underline decoration-amber-500 decoration-[8px] underline-offset-[16px]">AI Strategic Lab.</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <section className="bg-white p-12 rounded-[64px] border shadow-sm glass-morphism flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
                    <h3 className="text-4xl font-black tracking-tighter uppercase">Strategic Forecasting</h3>
                  </div>
                  <div className="space-y-6 flex-1 flex flex-col">
                    <textarea 
                      value={complexQuery}
                      onChange={(e) => setComplexQuery(e.target.value)}
                      placeholder="Describe a complex career challenge, e.g., 'Model a 12-month pivot from SDE-1 to Staff Engineer in AI Infrastructure'..."
                      className="w-full flex-1 min-h-[160px] p-8 bg-slate-50 border-4 border-transparent focus:border-amber-400 rounded-[40px] outline-none font-bold italic transition-all shadow-inner"
                    />
                    <button 
                      onClick={runComplexAnalysis}
                      disabled={isAnalyzingComplex}
                      className="bg-amber-500 text-black px-12 py-6 rounded-[32px] font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      {isAnalyzingComplex ? 'Thinking Deeply...' : 'Analyze Scenario →'}
                    </button>
                    {complexResult && (
                      <div className="p-8 bg-slate-900 text-white rounded-[40px] font-medium italic animate-in fade-in overflow-y-auto max-h-[300px]">
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Gemini Thought Execution</div>
                        {complexResult}
                      </div>
                    )}
                  </div>
                </section>

                <div className="space-y-12">
                  <section className="bg-white p-10 rounded-[56px] border shadow-sm glass-morphism">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">📷</div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase">HiredVision Document Audit</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="w-full h-40 bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                        {uploadedImage ? (
                          <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Upload Resume / Cert</p>
                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="text-2xl">📎</div>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={runImageAnalysis}
                        disabled={isAnalyzingImage || !uploadedImage}
                        className="w-full bg-indigo-600 text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
                      >
                        {isAnalyzingImage ? 'Analyzing...' : 'Audit Document'}
                      </button>
                      {imageAnalysisResult && (
                         <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] text-xs font-bold text-slate-600 italic">
                            {imageAnalysisResult}
                         </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-white p-10 rounded-[56px] border shadow-sm glass-morphism">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">✨</div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Profile Enhancer</h3>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1 space-y-4">
                        <input 
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="e.g. 'Add professional background'..."
                          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-400 rounded-2xl outline-none font-bold text-xs shadow-inner"
                        />
                        <button 
                          onClick={runImageEdit}
                          disabled={isEditingImage || !uploadedImage}
                          className="w-full bg-emerald-500 text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest"
                        >
                          {isEditingImage ? 'Editing...' : 'Apply AI Edit'}
                        </button>
                      </div>
                      <div className="w-32 h-32 bg-slate-900 rounded-[32px] flex items-center justify-center overflow-hidden border-4 border-slate-800 shrink-0">
                        {editedImage ? (
                          <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-600 font-black uppercase text-[8px] text-center px-4">Preview Hub</div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
          </StudentLayout>
        );

      case 'learning':
        return (
          <StudentLayout currentTab="learning" setSubView={setSubView} onLogout={onLogout}>
                 <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-16 uppercase leading-none italic underline decoration-indigo-600 decoration-[8px] underline-offset-[16px]">Learning Lab.</h2>
                 
                 <div className="bg-slate-900 aspect-video rounded-[80px] shadow-2xl flex items-center justify-center text-white mb-20 overflow-hidden relative group border-[12px] border-slate-800">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/id/119/1200/600')] bg-cover"></div>
                    <button className="relative z-10 w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all shadow-indigo-500/40"><svg className="w-16 h-16 ml-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z"/></svg></button>
                 </div>
                 
                 <div className="grid lg:grid-cols-3 gap-16 mb-20">
                    <div className="lg:col-span-2">
                       <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">Roadmap Logic: {selectedRole?.title}</h3>
                       <div className="space-y-6">
                         {selectedRole?.roadmap.map((m: any) => (
                            <div key={m.week} className={`p-8 rounded-[40px] border-4 transition-all flex items-center justify-between ${m.status === 'current' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-50 text-slate-900'}`}>
                               <div className="flex items-center gap-6">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${m.status === 'current' ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{m.week}</div>
                                  <span className="text-xl font-black">{m.topic}</span>
                               </div>
                               <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${m.status === 'completed' ? 'bg-emerald-500 text-white' : m.status === 'current' ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{m.status}</span>
                            </div>
                         ))}
                       </div>
                    </div>
                    <div className="space-y-8">
                       {learningTip && (
                         <div className="p-10 bg-indigo-600 rounded-[56px] text-white text-left shadow-2xl relative overflow-hidden animate-in slide-in-from-right-6">
                            <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl italic">AI</div>
                            <h4 className="text-[10px] font-black uppercase text-indigo-200 tracking-[0.4em] mb-6">Lab Pulse Insight</h4>
                            <p className="text-xl font-bold italic leading-relaxed mb-6">"{learningTip.explanation}"</p>
                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl">
                              <span className="text-2xl">🎯</span>
                              <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Interviewer Expectation: {learningTip.interviewTip}</p>
                            </div>
                         </div>
                       )}
                       <button onClick={() => setSubView('readiness')} className="w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 transition-all">Submit Module Progress →</button>
                    </div>
                 </div>
          </StudentLayout>
        );

      case 'path-detail':
        return (
          <div className="min-h-screen bg-white p-12 md:p-24 max-w-7xl mx-auto">
            <button onClick={() => setSubView('marketplace')} className="text-[10px] font-black text-indigo-600 mb-12 uppercase tracking-[0.4em] flex items-center gap-3">← Back to Hub</button>
            <h1 className="text-8xl font-black mb-16 tracking-tighter leading-none text-slate-900 uppercase italic underline decoration-indigo-600 decoration-8 underline-offset-[16px]">{selectedRole?.title} Path.</h1>
            <div className="grid lg:grid-cols-3 gap-24">
               <div className="lg:col-span-2 space-y-10">
                 {selectedRole?.roadmap.map((r: any) => (
                    <div key={r.week} className={`flex gap-10 items-start group`}>
                       <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center font-black text-3xl transition-all shadow-sm ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : r.status === 'current' ? 'bg-indigo-600 text-white shadow-2xl scale-110' : 'bg-slate-50 text-slate-200'}`}>{r.week}</div>
                       <div className={`flex-1 p-10 rounded-[48px] border-2 transition-all ${r.status === 'current' ? 'border-indigo-600 bg-indigo-50/20 shadow-xl' : 'border-slate-100 bg-white'}`}>
                          <h5 className="font-black text-2xl text-slate-900 mb-2 leading-none">{r.topic}</h5>
                          <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full ${r.status === 'completed' ? 'bg-emerald-500 text-white' : r.status === 'current' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{r.status}</span>
                       </div>
                    </div>
                 ))}
               </div>
               <div className="space-y-12">
                  <div className="bg-slate-900 text-white p-12 rounded-[64px] shadow-2xl">
                     <h4 className="font-black text-2xl mb-8 tracking-tight uppercase italic underline decoration-indigo-500 decoration-4">Placement Guarantees</h4>
                     <ul className="space-y-6">
                        {selectedRole?.guarantees.map((g: string) => (
                          <li key={g} className="text-sm font-bold text-slate-400 italic flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> {g}</li>
                        ))}
                     </ul>
                  </div>
                  <button onClick={() => setSubView('subscription')} className="w-full bg-indigo-600 text-white py-10 rounded-[48px] font-black text-2xl shadow-2xl active:scale-95 transition-all">Join this Track →</button>
               </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="min-h-screen bg-slate-50 p-12 md:p-24">
             <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none uppercase">Plan Select.</h2>
                <p className="text-slate-500 text-2xl font-medium italic mb-24 opacity-70">Pay nothing until you're hired from our elite pool.</p>
                <div className="grid md:grid-cols-2 gap-16">
                   <div className="bg-white p-20 rounded-[80px] border shadow-sm flex flex-col items-center glass-morphism">
                      <h4 className="text-4xl font-black mb-4 text-slate-900">ISA (Pay-after-Hire)</h4>
                      <p className="text-slate-500 font-medium italic text-lg mb-12">Pay 15% of your CTC only after joining. No upfront costs.</p>
                      <div className="text-6xl font-black text-slate-900 mb-16 tracking-tighter">₹0 <span className="text-xl text-slate-400">Upfront</span></div>
                      <button onClick={() => { setStatus('TRAINING'); setSubView('dashboard'); }} className="w-full bg-slate-900 text-white py-8 rounded-[40px] font-black text-2xl hover:bg-indigo-600 transition-all shadow-xl">Enroll ISA →</button>
                   </div>
                   <div className="bg-indigo-600 p-20 rounded-[80px] text-white shadow-2xl flex flex-col items-center group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-10 font-black text-9xl">P</div>
                      <h4 className="text-4xl font-black mb-4">Pro Path</h4>
                      <p className="text-indigo-100 font-medium italic text-lg mb-12">Instant roadmaps + direct FAANG mentors + 10 guaranteed interview slots.</p>
                      <div className="text-6xl font-black text-white mb-16 tracking-tighter">₹9,999 <span className="text-xl text-indigo-300">Once</span></div>
                      <button onClick={() => { setStatus('TRAINING'); setSubView('dashboard'); }} className="w-full bg-white text-indigo-600 py-8 rounded-[40px] font-black text-2xl hover:bg-indigo-50 transition-all shadow-2xl">Enroll Pro →</button>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'readiness':
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
             <div className="bg-white p-24 rounded-[100px] shadow-2xl max-w-2xl w-full border border-slate-100 glass-morphism animate-in zoom-in">
                <h2 className="text-7xl font-black text-slate-900 mb-12 tracking-tighter uppercase leading-none italic">Readiness Audit.</h2>
                <div className="bg-slate-50 p-16 rounded-[64px] mb-16 border border-slate-100 shadow-inner">
                   <div className="text-[160px] font-black text-indigo-600 mb-6 tracking-tighter leading-none">94%</div>
                   <div className="text-2xl font-black text-emerald-600 uppercase tracking-[0.4em] px-8 py-3 bg-emerald-50 rounded-3xl inline-block shadow-sm">ELITE ELIGIBLE</div>
                </div>
                <button onClick={() => { setStatus('INTERVIEWING'); setSubView('interviews'); }} className="w-full bg-indigo-600 text-white py-10 rounded-[48px] font-black text-3xl shadow-2xl active:scale-95 transition-all shadow-indigo-500/30">Release to Interview Pool →</button>
             </div>
          </div>
        );

      case 'interviews':
        return (
          <StudentLayout currentTab="interviews" setSubView={setSubView} onLogout={onLogout}>
            <h2 className="text-8xl font-black mb-24 tracking-tighter leading-none text-slate-900 uppercase italic">Hiring Hub.</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-2 bg-white p-20 rounded-[80px] border shadow-sm glass-morphism relative overflow-hidden">
                  <h4 className="font-black text-4xl mb-16 tracking-tight text-slate-900 uppercase italic underline decoration-indigo-600 decoration-8 underline-offset-[12px]">Companies Viewing Profile</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-16">
                     {['Google', 'Meta', 'Netflix', 'CRED', 'Uber', 'Zomato', 'Microsoft', 'Razorpay'].map(co => (
                        <div key={co} className="flex flex-col items-center gap-8 group cursor-pointer transition-all">
                           <div className="w-32 h-32 bg-slate-50 rounded-[56px] flex items-center justify-center font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all text-5xl shadow-inner">{co[0]}</div>
                           <span className="text-[12px] font-black uppercase text-slate-900 tracking-[0.3em]">{co}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="space-y-12">
                  <div onClick={() => setSubView('offer')} className="bg-indigo-600 text-white p-16 rounded-[80px] shadow-2xl shadow-indigo-100 flex flex-col justify-center cursor-pointer group hover:scale-105 transition-all">
                    <h4 className="font-black text-4xl mb-12 tracking-tight uppercase leading-tight italic">Upcoming Slot</h4>
                    <div className="text-[12px] font-black uppercase text-indigo-200 mb-8 tracking-[0.5em]">Today 3:00 PM</div>
                    <div className="text-5xl font-black mb-4 leading-none group-hover:text-indigo-100 transition-all">Google India</div>
                  </div>
               </div>
            </div>
          </StudentLayout>
        );

      case 'offer':
        return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-12 text-white">
            <div className="w-full max-w-6xl bg-slate-800 p-24 rounded-[100px] shadow-2xl border border-white/5 animate-in zoom-in text-center">
               <h2 className="text-8xl font-black mb-12 tracking-tighter leading-none italic">Offer <span className="text-indigo-500">Landed.</span></h2>
               <div className="grid md:grid-cols-2 gap-16 mb-24 text-left">
                  <div className="bg-white/5 p-16 rounded-[64px] border border-white/10 backdrop-blur-xl">
                     <div className="text-6xl font-black text-white tracking-tighter mb-10 leading-none">₹16.5 LPA</div>
                     <h3 className="text-4xl font-black mb-4 tracking-tight text-indigo-400 uppercase italic leading-none">Senior Frontend Architect</h3>
                     <p className="text-slate-500 font-bold uppercase text-[12px] tracking-tighter">Google India • Full Time</p>
                  </div>
                  <div className="bg-slate-900 p-16 rounded-[64px] border border-white/5 flex flex-col justify-center">
                     <h4 className="text-[12px] font-black uppercase text-indigo-500 mb-8 tracking-[0.4em]">AI Negotiation Advisor</h4>
                     <p className="text-sm italic font-medium text-slate-400 mb-12 leading-relaxed"> {negotiationTactics || "Analyzing offer vs market benchmarks..."} </p>
                     <button onClick={handleNegotiate} disabled={isNegotiating} className="w-full py-5 bg-white text-slate-900 rounded-[28px] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"> {isNegotiating ? "Computing..." : "Generate Tactics"} </button>
                  </div>
               </div>
               <div className="flex gap-10">
                  <button onClick={() => { setStatus('PLACED'); setSubView('success'); }} className="flex-1 bg-indigo-600 py-10 rounded-[56px] font-black text-4xl shadow-2xl active:scale-95 transition-all shadow-indigo-500/40">Accept Offer →</button>
                  <button onClick={() => setSubView('interviews')} className="px-16 py-10 bg-white/5 rounded-[56px] font-black text-2xl border border-white/10 text-slate-600 hover:text-white transition-all">Hold</button>
               </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-1000 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white opacity-40"></div>
             <div className="text-[260px] mb-16 leading-none animate-bounce drop-shadow-[0_20px_40px_rgba(79,70,229,0.3)]">🎓</div>
             <h2 className="text-9xl font-black text-slate-900 mb-16 tracking-tighter leading-none uppercase italic">Placed. Success!</h2>
             <button onClick={onLogout} className="bg-slate-900 text-white px-32 py-12 rounded-[64px] font-black text-5xl shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-indigo-500/20">Exit Journey Portal</button>
          </div>
        );

      default: return null;
    }
  };

  return renderContent();
};

export default StudentFlow;