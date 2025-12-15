
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon, ArrowLeft, KeyRound, CheckCircle, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Reset Specific States
  const [isVerified, setIsVerified] = useState(false);

  const resetState = () => {
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setIsVerified(false);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetState();
    setMode(newMode);
  };

  // 1. Send Password Reset Email
  const handleSendResetEmail = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setIsVerified(true);
      setError('');
      setSuccessMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다. 메일을 확인해주세요.');
    } catch (err: any) {
      setError(err.message || '이메일 발송 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const user = await authService.login(email, password);
        onLoginSuccess(user);
      } else if (mode === 'SIGNUP') {
        if (!name) {
          setError('이름을 입력해주세요.');
          setLoading(false);
          return;
        }
        await authService.signUp(email, password, name);
        // Auto login after signup
        const user = await authService.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      if (msg === 'Invalid login credentials') msg = '이메일 또는 비밀번호가 잘못되었습니다.';
      if (msg.includes('already registered')) msg = '이미 가입된 이메일입니다.';
      setError(msg || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'LOGIN';
  const isSignup = mode === 'SIGNUP';
  const isForgot = mode === 'FORGOT_PASSWORD';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1e1e1e] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-400">
            {isLogin && '계정에 로그인하세요'}
            {isSignup && '새로운 계정을 만드세요'}
            {isForgot && '비밀번호 재설정'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
             <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
             {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            {successMessage}
          </div>
        )}

        {isForgot ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">가입한 이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={isVerified}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {!isVerified ? (
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                비밀번호 재설정 링크 보내기
              </button>
            ) : (
               <div className="text-center text-gray-400 text-sm">
                  이메일함을 확인해주세요.<br/>
                  링크를 클릭하면 로그인 후 새 비밀번호를 설정할 수 있습니다.
               </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => handleSwitchMode('LOGIN')}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          /* Login & Signup Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
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

            {isLogin && (
               <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('FORGOT_PASSWORD')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
               </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? (
                    <> <LogIn className="w-5 h-5" /> 로그인 </>
                ) : (
                    <> <UserPlus className="w-5 h-5" /> 회원가입 </>
                )
              )}
            </button>
            
            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={() => handleSwitchMode(isLogin ? 'SIGNUP' : 'LOGIN')}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors block w-full"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
