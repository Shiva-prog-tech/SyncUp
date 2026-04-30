// import { useState } from 'react';
// import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// export function RegisterPage({ onSwitch }: { onSwitch: () => void }) {
//   const { register } = useAuth();
//   const [form, setForm] = useState({ name: '', email: '', password: '', headline: '', location: '' });
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handle = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
//     setLoading(true);
//     try {
//       await register(form);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const Field = ({ label, name, type = 'text', placeholder, required = false }: any) => (
//     <div>
//       <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}{required && ' *'}</label>
//       <input
//         type={type}
//         value={(form as any)[name]}
//         onChange={e => setForm({ ...form, [name]: e.target.value })}
//         placeholder={placeholder}
//         required={required}
//         className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
//         style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
//         onFocus={e => (e.target.style.borderColor = 'var(--accent-cyan)')}
//         onBlur={e => (e.target.style.borderColor = 'var(--border)')}
//       />
//     </div>
//   );

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
//       <div className="w-full max-w-md">
//         <div className="flex items-center gap-3 mb-10">
//           <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}>
//             <Zap className="w-5 h-5 text-white" />
//           </div>
//           <span className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
//             Sync<span style={{ color: 'var(--accent-cyan)' }}>Up</span>
//           </span>
//         </div>

//         <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
//           <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
//           <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Join the SyncUp network</p>

//           <form onSubmit={handle} className="space-y-4">
//             <Field label="Full Name" name="name" placeholder="Alex Johnson" required />
//             <Field label="Email" name="email" type="email" placeholder="you@example.com" required />

//             <div>
//               <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password *</label>
//               <div className="relative">
//                 <input
//                   type={show ? 'text' : 'password'}
//                   value={form.password}
//                   onChange={e => setForm({ ...form, password: e.target.value })}
//                   placeholder="Min. 6 characters"
//                   required
//                   className="w-full h-11 px-4 pr-10 rounded-xl text-sm outline-none transition-all"
//                   style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
//                   onFocus={e => (e.target.style.borderColor = 'var(--accent-cyan)')}
//                   onBlur={e => (e.target.style.borderColor = 'var(--border)')}
//                 />
//                 <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
//                   {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             <Field label="Headline" name="headline" placeholder="Software Developer at SyncUp" />
//             <Field label="Location" name="location" placeholder="San Francisco, CA" />

//             {error && (
//               <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,90,114,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255,90,114,0.2)' }}>{error}</p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
//               style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
//             >
//               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
//             </button>
//           </form>

//           <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
//             Already have an account?{' '}
//             <button onClick={onSwitch} className="font-semibold" style={{ color: 'var(--accent-cyan)' }}>Sign in</button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useRef, useState } from 'react';
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = nameRef.current?.value.trim() ?? '';
    const email = emailRef.current?.value.trim() ?? '';
    const password = passRef.current?.value ?? '';
    const headline = headlineRef.current?.value.trim() ?? '';
    const location = locationRef.current?.value.trim() ?? '';
    if (!name || !email || !password) { setError('Name, email and password are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name, email, password, headline, location });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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

  const fields = [
    { label: 'Full Name *', ref: nameRef, type: 'text', placeholder: 'Alex Johnson', autoComplete: 'name' },
    { label: 'Email *', ref: emailRef, type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { label: 'Headline', ref: headlineRef, type: 'text', placeholder: 'Software Developer at SyncUp', autoComplete: 'off' },
    { label: 'Location', ref: locationRef, type: 'text', placeholder: 'San Francisco, CA', autoComplete: 'off' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-base)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>
            Sync<span style={{ color: 'var(--accent-cyan)' }}>Up</span>
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Create account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Join the SyncUp network</p>

          <form onSubmit={handle} noValidate>
            {fields.map(({ label, ref, type, placeholder, autoComplete }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
                <input
                  ref={ref}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  defaultValue=""
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={passRef}
                  type={show ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
            Already have an account?{' '}
            <button onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13, padding: 0 }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}