import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import API from '../api/axios';
import PageWrapper from '../components/PageWrapper';
import { useTheme, themes } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const THEME_PREVIEWS = {
  Midnight: { bg:'#07071a', card:'#0e0e2a', acc:'#7c6ef8', txt:'#e8e8ff' },
  Sakura:   { bg:'#12000a', card:'#1e0012', acc:'#ff6eb4', txt:'#ffe0f0' },
  Hacker:   { bg:'#000000', card:'#001200', acc:'#00ff41', txt:'#00ff41' },
  Amber:    { bg:'#0d0800', card:'#1a1000', acc:'#ffb020', txt:'#fff3d0' },
  Arctic:   { bg:'#eef2f7', card:'#ffffff', acc:'#2563eb', txt:'#0f172a' },
  Aurora:   { bg:'#030b18', card:'#071525', acc:'#a78bfa', txt:'#e0e8ff' },
};

export default function Settings() {
  const { user, role, updateUser } = useAuth();
  const { addToast } = useToast();
  const { themeName, switchTheme } = useTheme();
  const id = user?.st_id || user?.rec_id || user?.id;
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });

  useEffect(() => { document.title = 'DoseBuddy — Settings'; }, []);

  const saveProfile = async () => {
    try {
      const endpoint = role === 'student' ? `/students/${id}` : `/recruiters/${id}`;
      const { data } = await API.put(endpoint, profileForm);
      updateUser(data);
      addToast('Profile saved!', 'success');
    } catch { addToast('Failed to save', 'error'); }
  };

  const changePassword = async () => {
    if (!pw.currentPassword || !pw.newPassword) { addToast('Both fields required', 'error'); return; }
    try {
      await API.put(`/students/${id}/password`, pw);
      addToast('Password changed!', 'success');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const inputCls = "w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none";

  return (
    <PageWrapper className="p-6 md:p-12 max-w-3xl mx-auto">
      <h1 className="text-5xl font-bold text-on-surface mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Settings</h1>

      {/* Profile */}
      <section className="glass-panel rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-on-surface mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Profile</h2>
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Name</label>
          <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <div className="text-sm text-on-surface-variant">Email: {user?.email || user?.company_email}</div>
          <div className="text-sm text-on-surface-variant">Role: {role}</div>
          <button onClick={saveProfile} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Save</button>
        </div>
      </section>

      {/* Theme */}
      <section className="glass-panel rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-on-surface mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Appearance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(themes).map(([key, theme]) => {
            const isActive = themeName === key;
            const p = THEME_PREVIEWS[key] || THEME_PREVIEWS.Midnight;
            return (
              <motion.button
                key={key}
                onClick={() => switchTheme(key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: isActive ? `2px solid ${p.acc}` : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? `0 0 24px ${p.acc}55` : 'none',
                  outline: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* ── Preview (100% hardcoded hex — NO CSS vars, NO Tailwind) ── */}
                <div style={{
                  background: p.bg,
                  height: 100,
                  borderRadius: '10px 10px 0 0',
                  padding: 10,
                  display: 'flex',
                  gap: 6,
                }}>
                  <div style={{
                    width: 24, background: p.card, borderRadius: 4,
                    display: 'flex', flexDirection: 'column', padding: 4, gap: 3,
                  }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        height: 3, borderRadius: 2,
                        background: i === 1 ? p.acc : p.txt + '44',
                      }}/>
                    ))}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ height: 6, width: '70%', borderRadius: 3, background: p.txt + '55' }}/>
                    <div style={{ flex: 1, borderRadius: 4, background: p.card, border: `1px solid ${p.acc}44` }}/>
                    <div style={{ height: 12, width: '45%', borderRadius: 10, background: p.acc }}/>
                  </div>
                </div>
                {/* ── Info (hardcoded) ── */}
                <div style={{ padding: '8px 12px', background: p.card }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: p.txt, fontSize: 13 }}>{theme.label}</div>
                  <div style={{ fontSize: 10, color: p.txt + '88', marginTop: 2 }}>{theme.desc}</div>
                </div>
                {isActive && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: p.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Password */}
      {role === 'student' && (
        <section className="glass-panel rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-on-surface mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Change Password</h2>
          <div className="space-y-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Current Password</label>
            <input type="password" value={pw.currentPassword} onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">New Password</label>
            <input type="password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <button onClick={changePassword} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Update Password</button>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
