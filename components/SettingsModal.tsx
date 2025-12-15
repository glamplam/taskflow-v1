import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { resetGenAI } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('GEMINI_API_KEY');
      setApiKey(stored || '');
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'API 키를 입력해주세요.' });
      return;
    }
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    resetGenAI();
    setMessage({ type: 'success', text: 'API 키가 저장되었습니다.' });
    
    // Auto close after success
    setTimeout(() => {
        onClose();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    resetGenAI();
    setMessage({ type: 'success', text: '초기화되었습니다. 기본 설정(env)을 사용합니다.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl shadow-2xl border border-gray-600 overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                설정
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
               <h3 className="text-sm font-bold text-blue-300 mb-1">Gemini API Key</h3>
               <p className="text-xs text-gray-400 leading-relaxed">
                 Google AI Studio에서 발급받은 키를 입력하세요. <br/>
                 입력된 키는 브라우저에만 저장됩니다.
               </p>
               <a 
                 href="https://aistudio.google.com/app/apikey" 
                 target="_blank" 
                 rel="noreferrer"
                 className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-2 w-fit"
               >
                 키 발급받기 <ExternalLink className="w-3 h-3" />
               </a>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">API Key 입력</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 font-mono text-sm"
              />
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-red-900/30 text-red-300 border border-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-gray-700/50 mt-4">
               <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  title="저장된 키 삭제"
               >
                  <Trash2 className="w-3 h-3" /> 초기화
               </button>
               <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors border border-gray-600"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
                    >
                        <Save className="w-4 h-4" /> 저장
                    </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};