import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface LandingLoginPageProps {
  onNavigate: (path: string) => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({ onNavigate }) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsDemoUser,
  } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'user' | 'team_lead'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!displayName.trim()) throw new Error('Please enter a display name.');
        await registerWithEmail(name, displayName, email, password, role);
      } else {
        await loginWithEmail(email, password);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="antialiased min-h-screen flex w-full selection:bg-[var(--color-primary-container)] selection:text-[var(--color-on-primary-container)] font-body-sm text-[var(--color-on-background)] bg-[var(--color-background)]">
      {/* Left Split: Brand Showcase */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-surface)] flex-col justify-between p-12 lg:p-24 border-r border-[var(--color-outline-variant)] relative overflow-hidden">
        {/* Background subtle pattern/decor */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffcc00 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        {/* Header / Logo Area */}
        <div className="flex items-center z-10">
          <img src="/s10-logo.png" alt="S10" className="h-20 w-auto object-contain mix-blend-lighten" />
        </div>
        
        {/* Main Content */}
        <div className="z-10 max-w-lg mt-16 mb-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-container)]"></span>
            <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)]">SYSTEM OPERATIONAL</span>
          </div>
          <h1 className="font-headline-lg text-[32px] font-bold text-[var(--color-primary)] mb-6 leading-[1.1]">Build. Submit. <br />Get Verified.</h1>
          <div className="mb-12 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <img alt="" className="w-full h-auto rounded object-cover aspect-[16/9]" src="/login-bg.png" />
          </div>
          <ul className="space-y-4 font-body-sm text-[14px] text-[var(--color-on-surface-variant)]">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary-container)] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Automated benchmark scoring and instant technical validation.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary-container)] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span>Secure execution environment for all submitted artifacts.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[var(--color-primary-container)] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              <span>Real-time feedback loop directly integrated into your workflow.</span>
            </li>
          </ul>
        </div>
        
        {/* Footer / Technical Info */}
        <div className="z-10 font-mono-data text-[13px] text-[var(--color-on-surface-variant)] flex justify-between items-center border-t border-[var(--color-outline-variant)] pt-6 mt-12">
          <span>TEN PLATFORM v1.0</span>
          <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em]">ENV: PRD</span>
        </div>
      </div>

      {/* Right Split: Auth Container */}
      <div className="w-full lg:w-1/2 bg-[var(--color-surface-container)] flex flex-col p-6 sm:p-12 lg:p-24 relative overflow-y-auto min-h-screen lg:min-h-0">
        
        <div className="w-full max-w-[420px] mx-auto flex flex-col flex-1 justify-center py-8 lg:py-0">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center mb-8">
            <img src="/s10-logo.png" alt="S10" className="h-10 w-auto object-contain mix-blend-lighten" />
          </div>
          
          <div className="mb-8">
            <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[var(--color-primary)] mb-2">
              {isRegistering ? 'Create an account' : 'Welcome to TEN'}
            </h2>
            <p className="font-body-sm text-[14px] text-[var(--color-on-surface-variant)]">
              {isRegistering ? 'Enter your details below to get started.' : 'Sign in to access your dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {isRegistering && (
              <div className="space-y-3 mb-6">
                <label className="block font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] uppercase">Choose your role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${role === 'user' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)] ring-1 ring-[var(--color-primary-container)]' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary-container)] hover:bg-[var(--color-surface-container-low)]'}`}>
                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} className="sr-only" />
                    <div className="flex flex-col gap-1">
                      <span className="block font-headline-md text-[16px] font-semibold text-[var(--color-primary)]">Participant</span>
                      <span className="block font-body-sm text-[12px] text-[var(--color-on-surface-variant)] leading-relaxed">Complete modules, track progress.</span>
                    </div>
                    {role === 'user' && (
                      <div className="absolute top-4 right-4 text-[var(--color-primary-container)]">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    )}
                  </label>
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${role === 'team_lead' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)] ring-1 ring-[var(--color-primary-container)]' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary-container)] hover:bg-[var(--color-surface-container-low)]'}`}>
                    <input type="radio" name="role" value="team_lead" checked={role === 'team_lead'} onChange={() => setRole('team_lead')} className="sr-only" />
                    <div className="flex flex-col gap-1">
                      <span className="block font-headline-md text-[16px] font-semibold text-[var(--color-primary)]">Team Lead</span>
                      <span className="block font-body-sm text-[12px] text-[var(--color-on-surface-variant)] leading-relaxed">Manage groups, view analytics.</span>
                    </div>
                    {role === 'team_lead' && (
                      <div className="absolute top-4 right-4 text-[var(--color-primary-container)]">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {isRegistering && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-body-sm text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary-container)] focus:ring-1 focus:ring-[var(--color-primary-container)] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="block font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] mb-1.5 uppercase">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    placeholder="JDoe99"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-body-sm text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary-container)] focus:ring-1 focus:ring-[var(--color-primary-container)] transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] mb-1.5 uppercase">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-body-sm text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary-container)] focus:ring-1 focus:ring-[var(--color-primary-container)] transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] uppercase">Password</label>
                {!isRegistering && (
                  <a href="#" className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-primary-container)] hover:text-[var(--color-primary)] transition-colors">Forgot?</a>
                )}
              </div>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-body-sm text-[14px] text-[var(--color-primary)] placeholder:text-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary-container)] focus:ring-1 focus:ring-[var(--color-primary-container)] transition-colors"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 mt-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] font-semibold tracking-[0.1em] rounded hover:bg-[var(--color-primary-fixed)] transition-colors flex justify-center items-center gap-2">
              {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[var(--color-outline-variant)] flex-1"></div>
            <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] uppercase">or</span>
            <div className="h-px bg-[var(--color-outline-variant)] flex-1"></div>
          </div>

          {/* Social/Secondary Auth */}
          <button type="button" onClick={handleGoogleLogin} className="w-full py-2.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] text-[var(--color-primary)] font-label-caps text-[12px] font-semibold tracking-[0.1em] rounded hover:bg-[var(--color-surface)] transition-colors flex justify-center items-center gap-2 mb-6 hover:border-[var(--color-primary-container)]">
            <svg className="w-4 h-4 text-[var(--color-primary-container)]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
            </svg>
            CONTINUE WITH GOOGLE
          </button>

          <div className="text-center mb-12">
            <span className="font-body-sm text-[14px] text-[var(--color-on-surface-variant)]">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button onClick={() => setIsRegistering(!isRegistering)} className="font-body-sm text-[14px] text-[var(--color-primary-container)] underline hover:text-[var(--color-primary)] transition-colors">
              {isRegistering ? 'Sign In' : 'Create account'}
            </button>
          </div>

          {/* Demo Access Section */}
          <div className="bg-[var(--color-surface-container-low)] rounded border border-[var(--color-outline-variant)] p-4">
            <div className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-primary-container)]">bolt</span>
              QUICK DEMO ACCESS
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => loginAsDemoUser('admin')} className="px-3 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-mono-data text-[13px] font-medium text-[var(--color-primary)] hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors">Admin</button>
              <button onClick={() => loginAsDemoUser('team_lead')} className="px-3 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-mono-data text-[13px] font-medium text-[var(--color-primary)] hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors">Team Lead</button>
              <button onClick={() => loginAsDemoUser('user')} className="px-3 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-mono-data text-[13px] font-medium text-[var(--color-primary)] hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors">Participant</button>
            </div>
          </div>
        </div>

        {/* Right Side Footer */}
        <div className="w-full max-w-[420px] mx-auto flex justify-center lg:absolute lg:bottom-8 lg:right-8 lg:justify-end gap-6 font-body-sm text-[14px] text-[var(--color-on-surface-variant)] mt-8 lg:mt-0">
          <a href="#" className="hover:text-[var(--color-primary-container)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--color-primary-container)] transition-colors">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};
