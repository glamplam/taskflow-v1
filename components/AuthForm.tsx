import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon, ArrowLeft, KeyRound, CheckCircle, Loader2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

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
  const [showResend, setShowResend] = useState(false);

  // Password Reset Specific States
  const [isVerified, setIsVerified] = useState(false);

  // Get current origin for display
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:xxxx';

  const resetState = () => {
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setIsVerified(false);
    setShowResend(false);
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

  const handleResendSignup = async () => {
    if (!email) return;
    setLoading(true);
    try {
        await authService.resendSignup(email);
        setSuccessMessage('인증 메일을 다시 보냈습니다. 받은 편지함을 확인해주세요.');
        setError('');
    } catch (err: any) {
        setError(err.message || '메일 재전송 실패. 잠시 후 다시 시도해주세요.');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
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
        
        // Attempt auto-login, but catch errors if email confirmation is required
        try {
            const user = await authService.login(email, password);
            onLoginSuccess(user);
        } catch (loginError: any) {
             // Check for "Email not confirmed" error
             if (loginError.message.includes('Email not confirmed')) {
                setSuccessMessage('가입 확인 메일이 발송되었습니다.');
                setShowResend(true);
                setMode('LOGIN'); 
             } else {
                setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');
                setMode('LOGIN');
             }
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      if (msg === 'Invalid login credentials') msg = '이메일 또는 비밀번호가 잘못되었습니다.';
      if (msg.includes('Email not confirmed')) {
          msg = '이메일 인증이 완료되지 않았습니다. 메일을 확인해주세요.';
          setShowResend(true);
      }
      if (msg.includes('already registered') || msg.includes('User already registered') || msg.includes('unique constraint')) {
         msg = '이미 가입된 이메일입니다. 로그인해주세요.';
      }
      setError(msg || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'LOGIN';
  const isSignup = mode === 'SIGNUP';
  const isForgot = mode === 'FORGOT_PASSWORD';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 font-sans">
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
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2 animate-pulse">
             <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
             <div>
                {error}
                {showResend && (
                    <button 
                        onClick={handleResendSignup}
                        className="block mt-2 text-xs underline hover:text-white flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> 인증 메일 다시 보내기
                    </button>
                )}
             </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-2 text-green-300 mb-3">
               <CheckCircle className="w-5 h-5 shrink-0" />
               <span className="text-sm font-medium">{successMessage}</span>
            </div>
            
            {/* Troubleshooting Guide */}
            <div className="bg-black/30 rounded p-4 text-xs text-gray-300 space-y-3">
                <div className="font-bold text-yellow-500 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    메일 링크 오류 해결 방법
                </div>
                <p className="leading-relaxed">
                    링크 클릭 시 <strong>'사이트에 연결할 수 없음'</strong> 오류가 뜬다면 Supabase 설정을 변경해야 합니다.
                </p>
                <div className="pl-3 border-l-2 border-gray-600 space-y-1.5">
                    <div className="flex gap-2">
                        <span className="font-bold text-gray-400">1.</span> 
                        <span><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">Supabase 대시보드 <ExternalLink className="w-3 h-3"/></a> 접속</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-gray-400">2.</span>
                        <span>좌측 메뉴 <strong>Authentication</strong> (자물쇠 아이콘 🔒) 클릭</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-gray-400">3.</span>
                        <span><strong>URL Configuration</strong> 메뉴 선택</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-gray-400">4.</span>
                        <span><strong>Site URL</strong>을 아래 주소로 변경 후 Save</span>
                    </div>
                </div>
                <code className="block bg-black/50 p-2.5 rounded text-blue-300 font-mono break-all select-all text-center border border-gray-700">
                    {currentOrigin}
                </code>
                <div className="pt-2 border-t border-gray-700/50">
                    <p className="text-gray-400 mb-2">
                        설정 저장 후, 아래 버튼을 눌러 메일을 다시 받으세요.
                    </p>
                    {showResend && (
                        <button 
                            onClick={handleResendSignup}
                            disabled={loading}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded flex items-center justify-center gap-2 transition-colors font-medium"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                            새로운 인증 메일 받기
                        </button>
                    )}
                </div>
            </div>
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
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors block w-full p-2 hover:bg-gray-800 rounded-lg"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}