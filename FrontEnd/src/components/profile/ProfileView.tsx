import { useState } from 'react';
import { Edit3, MapPin, Link2, Camera, Plus, Loader2, Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export function ProfileView() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', headline: user?.headline || '', location: user?.location || '', about: user?.about || '', skills: user?.skills?.join(', ') || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditing(false); }, 1500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const experience = [
    { title: 'Software Developer (Node.js / Next.js)', company: 'SyncUp', period: 'Jan 2023 – Present · 2 yrs', location: 'San Francisco, CA', logo: 'S' },
    { title: 'Full Stack Developer', company: 'TechStartup Inc.', period: 'Mar 2020 – Dec 2022 · 2 yrs 9 mos', location: 'Remote', logo: 'T' },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Header card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 50%, #0c0d12 100%)' }}>
          {user?.coverUrl && <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
          <button className="absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-all" style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}>
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex items-end justify-between">
            <div className="mt-[-3rem]">
              <Avatar src={user?.avatarUrl} alt={user?.name} size="2xl" online style={{ border: '4px solid var(--bg-card)', background:"#fff"}} />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all"
                style={{ border: '1px solid var(--border-accent)', color: 'var(--text-secondary)', background: 'transparent' }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {editing ? 'Cancel' : 'Edit'}
              </button>
              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
                  {saved ? 'Saved!' : 'Save'}
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-3">
              {[
                { label: 'Name', key: 'name', placeholder: 'Your full name' },
                { label: 'Headline', key: 'headline', placeholder: 'Software Developer at ...' },
                { label: 'Location', key: 'location', placeholder: 'City, Country' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>About</label>
                <textarea
                  value={form.about}
                  onChange={e => setForm({ ...form, about: e.target.value })}
                  rows={3}
                  placeholder="Tell your story..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Skills (comma separated)</label>
                <input
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="Node.js, React, Redis..."
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.headline}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.location}</span>}
                <span className="flex items-center gap-1" style={{ color: 'var(--accent-cyan)' }}>
                  <Link2 className="w-3 h-3" />{user?.connections?.length || 0}+ connections
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="h-9 px-5 rounded-full text-sm font-semibold" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>Open to</button>
                <button className="h-9 px-5 rounded-full text-sm font-medium" style={{ border: '1px solid var(--border-accent)', color: 'var(--text-secondary)', background: 'transparent' }}>
                  <Plus className="w-4 h-4 inline mr-1" />Add section
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-base font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Analytics</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Profile views', value: user?.profileViews || 0, sub: 'Last 90 days', color: 'var(--accent-cyan)' },
            { label: 'Post impressions', value: '1.2k', sub: 'This week', color: 'var(--accent-violet)' },
            { label: 'Search appearances', value: 24, sub: 'Last week', color: 'var(--accent-green)' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="p-3 rounded-xl cursor-pointer transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <p className="text-xl font-display font-bold" style={{ color }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      {user?.about && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>About</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{user.about}</p>
        </div>
      )}

      {/* Skills */}
      {user?.skills?.length ? (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,207,190,0.2)' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Experience */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Experience</h2>
          <button className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}><Plus className="w-4 h-4" /></button>
        </div>
        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,207,190,0.2)' }}>
                {exp.logo}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{exp.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{exp.company} · Full-time</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{exp.period} · {exp.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
