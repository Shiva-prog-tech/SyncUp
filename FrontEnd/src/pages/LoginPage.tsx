import { useRef, useState } from 'react';
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  // Use refs so typing NEVER causes re-render / focus loss
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = emailRef.current?.value.trim() ?? '';
    const password = passRef.current?.value ?? '';
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    color: 'var(--text-primary)',
    width: '100%',
    height: 44,
    padding: '0 16px',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-base)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>
            Sync<span style={{ color: 'var(--accent-cyan)' }}>Up</span>
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>Sign in to your SyncUp account</p>

          <form onSubmit={handle} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <input
                ref={emailRef}
                type="text"
                placeholder="you@example.com"
                autoComplete="email"
                required
                defaultValue=""
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={passRef}
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  defaultValue=""
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,90,114,0.1)', border: '1px solid rgba(255,90,114,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--accent-red)', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44, borderRadius: 12, background: 'var(--accent-cyan)', color: '#0c0d12',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
            Don't have an account?{' '}
            <button onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13, padding: 0 }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}