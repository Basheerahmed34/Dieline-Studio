import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  ParsedAuthError,
  parseFirebaseAuthError,
  useAuth,
} from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    firebaseConsoleAuthUrl,
    firebaseProjectId,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'google' | 'facebook' | 'email' | null>(null);
  const [authError, setAuthError] = useState<ParsedAuthError | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setActiveProvider('google');
      setAuthError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(parseFirebaseAuthError(err, 'google'));
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setActiveProvider('facebook');
      setAuthError(null);
      await loginWithFacebook();
    } catch (err: any) {
      setAuthError(parseFirebaseAuthError(err, 'facebook'));
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setAuthError({
        code: 'validation/missing-fields',
        message: 'Please provide both your email address and password.',
        isProviderDisabled: false,
        isAccountNotFound: false,
        isEmailInUse: false,
        isPopupClosed: false,
      });
      return;
    }
    if (password.length < 6) {
      setAuthError({
        code: 'validation/short-password',
        message: 'Password must be at least 6 characters.',
        isProviderDisabled: false,
        isAccountNotFound: false,
        isEmailInUse: false,
        isPopupClosed: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      setActiveProvider('email');
      setAuthError(null);
      if (mode === 'signup') {
        await registerWithEmail(name, cleanEmail, password);
      } else {
        await loginWithEmail(cleanEmail, password);
      }
    } catch (err: any) {
      setAuthError(parseFirebaseAuthError(err, 'email'));
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Modal Top Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-600">
                Verified Authorization
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Sign in to Download' : 'Create Free Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Authenticate via Google, Facebook, or your original email &amp; password to download high-resolution vector dielines.
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Actionable Error State */}
          {authError && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                authError.isProviderDisabled
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    authError.isProviderDisabled ? 'text-amber-600' : 'text-rose-600'
                  }`}
                />
                <div className="flex-1 leading-relaxed">
                  <strong className="block font-semibold">
                    {authError.isProviderDisabled
                      ? 'Firebase Provider Activation Required'
                      : 'Authentication Notice'}
                  </strong>
                  <span>{authError.message}</span>
                </div>
              </div>

              {/* If provider is disabled in Firebase console (operation-not-allowed) */}
              {authError.isProviderDisabled && (
                <div className="pt-2 border-t border-amber-200/80 space-y-2 text-[11px]">
                  <p className="text-amber-800">
                    To enable <strong>{authError.providerName || 'this sign-in method'}</strong> in your Firebase project ({firebaseProjectId}):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-900/90 pl-1 font-mono text-[10px]">
                    <li>Go to Authentication &rarr; Sign-in method</li>
                    <li>Select &quot;{authError.providerName || 'Email/Password'}&quot;</li>
                    <li>Toggle Enable &rarr; Save</li>
                  </ol>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={firebaseConsoleAuthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                    >
                      <span>Open Firebase Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleGoogleLogin}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-lg font-semibold text-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Use Google (Active Now)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick switch if account not found during sign-in */}
              {authError.isAccountNotFound && mode === 'signin' && (
                <div className="pt-1.5 border-t border-rose-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700">Need to create this account?</span>
                  <button
                    onClick={() => {
                      setMode('signup');
                      setAuthError(null);
                    }}
                    className="font-semibold text-blue-600 hover:underline text-xs"
                  >
                    Create Account with this email &rarr;
                  </button>
                </div>
              )}

              {/* Quick switch if email is already in use during signup */}
              {authError.isEmailInUse && mode === 'signup' && (
                <div className="pt-1.5 border-t border-rose-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700">Already registered?</span>
                  <button
                    onClick={() => {
                      setMode('signin');
                      setAuthError(null);
                    }}
                    className="font-semibold text-blue-600 hover:underline text-xs"
                  >
                    Sign in with this email &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Social Auth Buttons (Google & Facebook) */}
          <div className="space-y-2.5">
            {/* Google OAuth Button - Active and verified out of the box */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full relative flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/30 text-slate-800 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isLoading && activeProvider === 'google'
                  ? 'Connecting to Google...'
                  : 'Continue with Google'}
              </span>
              <span className="hidden sm:inline-block absolute right-3 text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                Active
              </span>
            </button>

            {/* Facebook OAuth Button */}
            <button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>
                {isLoading && activeProvider === 'facebook'
                  ? 'Connecting to Facebook...'
                  : 'Continue with Facebook'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider relative">
              or original email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Original Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="designer@packaging.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-slate-400">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md active:scale-98 cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && activeProvider === 'email' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account &amp; Download</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center pt-2 text-xs text-slate-500">
            {mode === 'signin' ? (
              <span>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setAuthError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Create free account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setAuthError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign in with email
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Modal Security Trust Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Firebase Auth &amp; 256-bit SSL</span>
          </div>
          <a
            href={firebaseConsoleAuthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            title="View Firebase Auth Console"
          >
            <span>Firebase: {firebaseProjectId}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
