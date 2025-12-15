
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = authService.login(email, password);
        onLoginSuccess(user);
      } else {
        if (!name) {
          setError('이름을 입력해주세요.');
          return;
        }
        authService.saveUser({ email, password, name });
        // Auto login after signup
        const user = authService.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1e1e1e] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-400">
            {isLogin ? '계정에 로그인하세요' : '새로운 계정을 만드세요'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">이름</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="홍길동"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1.5">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1.5">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isLogin ? (
              <>
                <LogIn className="w-5 h-5" /> 로그인
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> 회원가입
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};
