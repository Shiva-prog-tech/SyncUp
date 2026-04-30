import { useState } from 'react';
import { Briefcase, MapPin, Clock, Bookmark, BookmarkCheck, ArrowRight, Filter } from 'lucide-react';

const JOBS = [
  { id: 'j1', title: 'Software Developer (Node.js / Next.js)', company: 'SyncUp', location: 'San Francisco, CA', type: 'Full-time', posted: '1d ago', salary: '$130k–$180k', tags: ['Node.js', 'Next.js', 'Redis', 'WebSockets'], logo: 'S', featured: true },
  { id: 'j2', title: 'Senior Node.js Developer', company: 'Vercel', location: 'Remote', type: 'Full-time', posted: '2d ago', salary: '$150k–$200k', tags: ['Node.js', 'Next.js', 'TypeScript'], logo: 'V' },
  { id: 'j3', title: 'Backend Engineer – Real-Time Systems', company: 'Supabase', location: 'Remote', type: 'Full-time', posted: '3d ago', salary: '$130k–$170k', tags: ['PostgreSQL', 'WebSockets', 'Redis'], logo: 'S' },
  { id: 'j4', title: 'Full Stack Developer', company: 'Linear', location: 'San Francisco', type: 'Hybrid', posted: '1w ago', salary: '$140k–$180k', tags: ['Next.js', 'GraphQL', 'AWS'], logo: 'L' },
  { id: 'j5', title: 'Software Engineer – AI Platform', company: 'Anthropic', location: 'San Francisco', type: 'On-site', posted: '1w ago', salary: '$180k–$250k', tags: ['Python', 'Node.js', 'AI/ML'], logo: 'A' },
  { id: 'j6', title: 'Platform Engineer', company: 'Stripe', location: 'Remote', type: 'Full-time', posted: '2w ago', salary: '$160k–$210k', tags: ['Go', 'Node.js', 'AWS', 'MongoDB'], logo: 'S' },
];

const TAG_COLORS = ['var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-green)', 'var(--accent-amber)'];

export function JobsView() {
  const [saved, setSaved] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'Remote', 'Full-time', 'Hybrid'];
  const filtered = JOBS.filter(j => filter === 'all' || j.location.toLowerCase().includes(filter.toLowerCase()) || j.type.toLowerCase() === filter.toLowerCase());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Jobs For You</h1>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === f ? 'var(--accent-cyan)' : 'var(--bg-card)',
              color: filter === f ? '#0c0d12' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--accent-cyan)' : 'var(--border)'}`,
            }}
          >{f === 'all' ? 'All Jobs' : f}</button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(job => (
          <div key={job.id} className="rounded-2xl p-5 transition-all relative"
            style={{ background: 'var(--bg-card)', border: `1px solid ${job.featured ? 'var(--accent-cyan)' : 'var(--border)'}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = job.featured ? 'var(--accent-cyan)' : 'var(--border)')}
          >
            {job.featured && (
              <span className="absolute top-3 right-12 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>FEATURED</span>
            )}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0"
                style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,207,190,0.2)' }}>
                {job.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{job.company}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
                  {job.salary && <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>{job.salary}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tags.map((tag, i) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${TAG_COLORS[i % TAG_COLORS.length]}15`, color: TAG_COLORS[i % TAG_COLORS.length] }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSaved(prev => prev.includes(job.id) ? prev.filter(x => x !== job.id) : [...prev, job.id])}
                className="shrink-0 p-2 rounded-full transition-all"
                style={{ color: saved.includes(job.id) ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                {saved.includes(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>
                Easy Apply <ArrowRight className="w-3 h-3" />
              </button>
              <button className="px-4 py-2 rounded-full text-xs font-medium transition-all" style={{ border: '1px solid var(--border-accent)', color: 'var(--text-secondary)', background: 'transparent' }}>
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
