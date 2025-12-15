import React, { useState } from 'react';
import { saveSupabaseConfig } from '../services/supabase';
import { Database, ArrowRight, ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';

export const SupabaseSetup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && apiKey) {
      saveSupabaseConfig(url, apiKey);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6 font-sans">
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Info */}
        <div className="bg-blue-900/20 p-8 md:w-5/12 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col justify-between">
           <div>
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
                <Database className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">서버 연결 설정</h2>
             <p className="text-blue-200/70 text-sm leading-relaxed">
               데이터를 안전하게 저장하기 위해 Supabase 프로젝트와 연결합니다. 
             </p>
           </div>
           
           <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                 <div className="mt-1 bg-blue-800/50 p-1.5 rounded-lg h-fit"><ShieldCheck className="w-4 h-4 text-blue-300" /></div>
                 <div>
                    <h4 className="text-white text-sm font-bold">안전한 저장</h4>
                    <p className="text-xs text-gray-400 mt-0.5">입력한 키는 브라우저 내부에만 저장됩니다.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:w-7/12 bg-[#1e1e1e]">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-gray-400 text-sm font-bold mb-2">Project URL</label>
                 <input 
                    type="url" 
                    placeholder="https://xyz...supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                    required
                 />
              </div>

              <div>
                 <label className="block text-gray-400 text-sm font-bold mb-2">
                    Anon Public Key <span className="text-gray-500 font-normal">(not sb_publishable)</span>
                 </label>
                 <input 
                    type="text" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-mono text-xs"
                    required
                 />
                 {apiKey.startsWith('sb_') && (
                    <div className="mt-2 text-yellow-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        'sb_publishable...' 키는 지원되지 않습니다. 'ey...'로 시작하는 키를 사용해주세요.
                    </div>
                 )}
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                 <h5 className="text-gray-300 text-sm font-bold flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    올바른 키 찾는 법
                 </h5>
                 <ol className="text-xs text-gray-400 space-y-2 list-decimal pl-4">
                    <li><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Supabase 대시보드</a> > Project Settings (톱니바퀴)</li>
                    <li><strong>API</strong> 메뉴 선택</li>
                    <li><strong>Project URL</strong> 복사</li>
                    <li><strong>anon</strong> (public) 키 복사 <br/><span className="text-gray-500">(주의: App Frameworks 탭의 키가 아닙니다)</span></li>
                 </ol>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                연결하기 <ArrowRight className="w-4 h-4" />
              </button>
           </form>
        </div>

      </div>
    </div>
  );
};