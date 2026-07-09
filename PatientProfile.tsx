import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, AlertCircle, ArrowLeft, Stethoscope, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, setAuthToken, AuthUser } from './Shared';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginScreen({ onLogin }: { onLogin: (userData: AuthUser | Screen) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<'doctor' | 'patient'>('doctor');
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // For demo, Google login defaults to Doctor
      onLogin({ email: result.user.email!, role: 'doctor', name: result.user.displayName!, token: 'firebase-session' });
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = authMethod === 'email' 
        ? { email, password, role: loginRole }
        : { phone, otp: otp.join(''), role: loginRole };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      setAuthToken(data.token);
      onLogin({ ...data.user, token: data.token, firebaseToken: data.firebaseToken });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = () => {
    if (phone.length < 10) return setError("Enter valid phone number");
    setOtpSent(true);
    // In a real app, call backend to send OTP via Twilio/Firebase
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={() => (onLogin as any)('LANDING')}
          className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-2 italic">Access</h1>
          <p className="text-zinc-400 text-[10px] tracking-[0.3em] font-bold uppercase">Secure Clinical Portal</p>
        </div>

        {/* Role & Method Switcher */}
        <div className="space-y-4 mb-8">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setLoginRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loginRole === 'doctor' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
            >
              <Stethoscope size={14} /> Doctor
            </button>
            <button 
              onClick={() => setLoginRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loginRole === 'patient' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
            >
              <UserCircle size={14} /> Patient
            </button>
          </div>

          <div className="flex justify-center gap-8 border-b border-white/5 pb-2">
            <button 
              onClick={() => setAuthMethod('email')}
              className={`text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${authMethod === 'email' ? 'border-red-600 text-white' : 'border-transparent text-zinc-500'}`}
            >
              Email Login
            </button>
            <button 
              onClick={() => setAuthMethod('otp')}
              className={`text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${authMethod === 'otp' ? 'border-red-600 text-white' : 'border-transparent text-zinc-500'}`}
            >
              Mobile OTP
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {authMethod === 'email' ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Portal Identifier</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-600 transition-all text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-600 transition-all text-sm" 
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {!otpSent ? (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Phone Number</label>
                  <div className="flex gap-2">
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-600 transition-all text-sm" 
                    />
                    <button 
                      type="button"
                      onClick={sendOtp}
                      className="px-6 bg-red-600 rounded-xl font-bold text-xs uppercase tracking-widest"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-center text-xs text-zinc-500">6-digit OTP sent to {phone}</p>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-12 h-14 bg-white/10 border border-white/10 rounded-xl text-center text-xl font-bold focus:border-red-600 outline-none"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs text-zinc-500 font-bold uppercase tracking-widest hover:text-white">Change Number</button>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || (authMethod === 'otp' && !otpSent)}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : `Enter ${loginRole === 'doctor' ? 'Clinical' : 'Patient'} Suite`}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all text-[10px] uppercase tracking-widest"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Continue with Institutional Auth
          </button>
        </div>
      </motion.div>
    </div>
  );
}

