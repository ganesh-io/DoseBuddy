import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import StatCard from '../../components/StatCard';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const recId = user?.rec_id || user?.id;
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { document.title = 'DoseBuddy — Recruiter Dashboard'; }, []);

  useEffect(() => {
    const load = async () => {
      try { setIsLoading(true); const { data } = await API.get(`/dashboard/recruiter/${recId}`); setStats(data.stats || {}); } catch { addToast('Failed to load', 'error'); } finally { setIsLoading(false); }
    };
    if (recId) load();
  }, [recId]);

  const statCards = [
    { label: 'Shortlisted', value: stats.shortlisted || 0, icon: 'bookmark', color: 'primary' },
    { label: 'Selected', value: stats.selected || 0, icon: 'check_circle', color: 'secondary' },
    { label: 'Openings', value: stats.openings || 0, icon: 'work', color: 'tertiary' },
  ];

  const quickActions = [
    { icon: 'person_search', label: 'Search Candidates', desc: 'Find talent by skills, CGPA, department', path: '/recruiter/candidates' },
    { icon: 'bookmark', label: 'View Shortlists', desc: 'Manage your shortlisted candidates', path: '/recruiter/shortlisted' },
    { icon: 'work', label: 'Manage Openings', desc: 'View and create job openings', path: '/recruiter/openings' },
  ];

  return (
    <PageWrapper className="p-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-xl glass-panel p-8 mb-8 glow-hover transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" style={{ background: 'color-mix(in srgb, var(--secondary) 10%, transparent)' }} />
        <h2 className="font-display text-4xl font-semibold text-on-surface mb-2 relative z-10">Welcome, {user?.name}!</h2>
        <p className="text-lg text-on-surface-variant relative z-10">{user?.company_name} • Recruiter Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)
        ) : (
          statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i} />)
        )}
      </div>

      <h3 className="font-display text-2xl font-semibold text-on-surface mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className="glass-panel rounded-xl p-6 text-left hover:border-primary/30 hover:shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_10%,transparent)] transition-all group">
            <span className="material-symbols-outlined text-3xl mb-4 text-on-surface-variant group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
            <h4 className="font-display text-lg font-semibold text-on-surface mb-1">{a.label}</h4>
            <p className="text-sm text-on-surface-variant">{a.desc}</p>
          </button>
        ))}
      </div>
    </PageWrapper>
  );
}
