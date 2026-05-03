import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import StatCard from '../../components/StatCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'DoseBuddy — Dashboard'; }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const stId = user?.st_id || user?.id;
        const { data: d } = await API.get(`/dashboard/student/${stId}`);
        setData(d);
      } catch (err) {
        addToast('Failed to load dashboard', 'error');
      } finally { setLoading(false); }
    };
    if (user) fetchDashboard();
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '🌅' };
    if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  const greeting = getGreeting();
  const stats = data?.stats || {};
  const statCards = [
    { label: 'Skills', value: stats.skills || 0, icon: 'psychology', color: 'primary' },
    { label: 'Certificates', value: stats.certificates || 0, icon: 'workspace_premium', color: 'tertiary' },
    { label: 'Projects', value: stats.projects || 0, icon: 'folder_special', color: 'secondary' },
    { label: 'Internships', value: stats.internships || 0, icon: 'work', color: 'primary' },
    { label: 'Applications', value: stats.applications || 0, icon: 'send', color: 'tertiary' },
  ];

  const statusColor = {
    Applied: 'border-primary-container/50 text-primary-container bg-primary-container/10',
    Screening: 'border-tertiary-container/50 text-tertiary bg-tertiary/10',
    Interview: 'border-secondary-container/50 text-secondary bg-secondary/10',
    Selected: 'border-secondary/50 text-secondary bg-secondary/10',
    Rejected: 'border-error/50 text-error bg-error/10',
  };

  if (loading) return (
    <PageWrapper className="p-8 max-w-7xl mx-auto w-full">
      <div className="skeleton h-32 w-full rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="skeleton h-96 lg:col-span-1 rounded-xl" />
        <div className="skeleton h-96 lg:col-span-2 rounded-xl" />
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper className="p-8 max-w-7xl mx-auto w-full">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl glass-panel p-8 mb-8 glow-hover transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }} />
        <h2 className="font-display text-4xl font-semibold text-on-surface mb-2 relative z-10">
          {greeting.text}, {user?.name || 'Student'}! {greeting.emoji}
        </h2>
        <p className="text-lg text-on-surface-variant relative z-10">Here's your overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} delay={i} />
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="font-display text-[28px] font-semibold text-on-surface mb-6">Recent Activity</h3>
          <div className="flex-1 flex flex-col gap-6 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5" />
            {(data?.recentActivity || []).slice(0, 5).map((a, i) => (
              <div key={i} className="flex gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  a.type === 'application' ? 'bg-primary/20 border-primary/30' : 'bg-secondary/20 border-secondary/30'
                }`}>
                  <span className={`material-symbols-outlined text-sm ${a.type === 'application' ? 'text-primary' : 'text-secondary'}`}>
                    {a.type === 'application' ? 'send' : 'swap_horiz'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-on-surface">{a.title}</p>
                  <span className="text-xs text-gray-500 mt-1 block">{a.subtitle} • {new Date(a.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-sm text-outline">No recent activity yet.</p>
            )}
          </div>
        </div>

        {/* Application Tracker */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <h3 className="font-display text-[28px] font-semibold text-on-surface mb-6">Application Tracker</h3>
          <div className="flex flex-col gap-4">
            {(data?.applications || []).map(app => (
              <div key={app.app_id} className="bg-surface-container-lowest/60 border border-white/5 p-4 rounded-lg flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">domain</span>
                  </div>
                  <div>
                    <h4 className="text-on-surface font-semibold">{app.company_name}</h4>
                    <p className="text-sm text-gray-400">{app.role || 'Applied'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[app.status] || statusColor.Applied}`}>
                  {app.status}
                </span>
              </div>
            ))}
            {(!data?.applications || data.applications.length === 0) && (
              <p className="text-sm text-outline">No applications yet. Browse companies to get started!</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
