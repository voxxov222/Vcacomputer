import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, X, Check, AlertCircle, Sparkles, LogIn, UserPlus, Fingerprint } from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isAuthModalOpen, closeAuthModal, user, signInGoogle, signInGuest, loginEmail, registerEmail, signOut } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isVisible = isOpen !== undefined ? isOpen : isAuthModalOpen;
  const handleClose = onClose || closeAuthModal;

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginEmail(email, password);
      } else {
        await registerEmail(email, password, name);
      }
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGoogle();
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google sign-in popup was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#080e1e] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden">
        {/* Holographic background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">VCA PERSISTENCE</div>
              <h3 className="text-lg font-bold text-white font-mono">
                {user && !user.isAnonymous ? 'COLLECTOR PROFILE' : mode === 'login' ? 'VAULT SIGN IN' : 'CREATE COLLECTOR VAULT'}
              </h3>
            </div>
          </div>
          <button 
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 relative z-10">
          {user && !user.isAnonymous ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg font-mono">
                  {user.displayName?.[0] || user.email?.[0] || 'V'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{user.displayName || 'VCA Verified Collector'}</div>
                  <div className="text-xs text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Firestore Cloud Vault Synced
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                All scanned cards, custom variants, and pricing metrics are safely backed up under your UID ({user.uid.substring(0, 10)}...) and available across all your mobile & desktop devices.
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  closeAuthModal();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-300 font-mono">
                Sign in to sync your scanned Pokémon portfolio across devices with Firebase Firestore.
              </p>

              {/* Google One-Click Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/50 text-white font-mono text-xs font-bold flex items-center justify-center gap-3 transition shadow-lg group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">or email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Collector Handle</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ash Ketchum"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                        required={mode === 'register'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="trainer@vca.network"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-[11px] font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Successfully authenticated! Syncing vault...</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>AUTHENTICATING...</span>
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" /> SIGN IN TO VAULT
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> CREATE VAULT ACCOUNT
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="hover:text-cyan-400 transition underline underline-offset-4"
                >
                  {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign in"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await signInGuest();
                    closeAuthModal();
                  }}
                  className="hover:text-slate-200 text-slate-500 flex items-center gap-1"
                >
                  <Fingerprint className="w-3.5 h-3.5" /> Guest Mode
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
