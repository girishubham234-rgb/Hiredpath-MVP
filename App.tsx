
import React, { useState, useEffect, useRef } from 'react';
import { AppRole, UserStatus } from './types';
import LandingView from './views/LandingView';
import StudentFlow from './views/StudentFlow';
import CollegeFlow from './views/CollegeFlow';
import CompanyFlow from './views/CompanyFlow';
import AdminFlow from './views/AdminFlow';
import { getChatbotResponse } from './services/geminiService';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hello! I am HiredAI. How can I assist your career growth today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const botResponse = await getChatbotResponse(history, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: botResponse || "I'm sorry, I couldn't process that request." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection issues. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 z-[100] w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white"
      >
        {isOpen ? <span className="text-2xl font-black">✕</span> : <span className="text-3xl">💬</span>}
      </button>

      {isOpen && (
        <div className="fixed bottom-44 right-8 z-[100] w-[400px] max-w-[90vw] h-[500px] bg-white rounded-[40px] shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
            <div>
              <div className="font-black uppercase tracking-widest text-[10px]">Active Mentor</div>
              <div className="text-xl font-black italic">HiredAI</div>
            </div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-[24px] text-sm font-bold shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[24px] rounded-tl-none border border-slate-100 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask HiredAI anything..."
              className="flex-1 bg-slate-50 px-6 py-3 rounded-full text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
            />
            <button 
              onClick={handleSend}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole>(AppRole.GUEST);
  const [view, setView] = useState<string>('landing');
  const [userStatus, setUserStatus] = useState<UserStatus>('NOT_STARTED');

  const handleRoleChange = (newRole: AppRole) => {
    setRole(newRole);
    if (newRole === AppRole.GUEST) setView('landing');
    else setView('dashboard');
  };

  const renderView = () => {
    if (role === AppRole.GUEST) {
      return <LandingView onStart={(selectedRole) => handleRoleChange(selectedRole)} />;
    }

    switch (role) {
      case AppRole.STUDENT:
        return <StudentFlow status={userStatus} setStatus={setUserStatus} onLogout={() => handleRoleChange(AppRole.GUEST)} />;
      case AppRole.COLLEGE:
        return <CollegeFlow onLogout={() => handleRoleChange(AppRole.GUEST)} />;
      case AppRole.COMPANY:
        return <CompanyFlow onLogout={() => handleRoleChange(AppRole.GUEST)} />;
      case AppRole.ADMIN:
        return <AdminFlow onLogout={() => handleRoleChange(AppRole.GUEST)} />;
      default:
        return <LandingView onStart={(selectedRole) => handleRoleChange(selectedRole)} />;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 glass-morphism rounded-full shadow-2xl flex gap-3 items-center border border-indigo-100/50 backdrop-blur-xl">
        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mr-2 px-2">Personas</span>
        <button onClick={() => handleRoleChange(AppRole.GUEST)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${role === AppRole.GUEST ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Landing</button>
        <button onClick={() => handleRoleChange(AppRole.STUDENT)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${role === AppRole.STUDENT ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Student</button>
        <button onClick={() => handleRoleChange(AppRole.COLLEGE)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${role === AppRole.COLLEGE ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>College</button>
        <button onClick={() => handleRoleChange(AppRole.COMPANY)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${role === AppRole.COMPANY ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Company</button>
        <button onClick={() => handleRoleChange(AppRole.ADMIN)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${role === AppRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>Admin</button>
      </nav>
      {renderView()}
      <Chatbot />
    </div>
  );
};

export default App;
