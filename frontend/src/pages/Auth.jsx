import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import API from '../api/axios';

export default function Auth() {
  const [tab, setTab] = useState('login'); // login | register
  const [regRole, setRegRole] = useState(null); // student | recruiter
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', name: '', st_id: '', department: '', year: '', phone: '', cgpa: '', company_email: '', company_name: '', company_size: '1-50', website: '' });

  useEffect(() => { document.title = 'DoseBuddy — Auth'; }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email: form.email, password: form.password });
      login(data.token, data.user, data.role);
      addToast('Welcome back!', 'success');
      navigate(data.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = regRole === 'student' ? '/auth/register-student' : '/auth/register-recruiter';
      const payload = regRole === 'student'
        ? { st_id: form.st_id, name: form.name, email: form.email, password: form.password, department: form.department, year: form.year ? parseInt(form.year) : null, phone: form.phone, cgpa: form.cgpa ? parseFloat(form.cgpa) : null }
        : { name: form.name, company_email: form.company_email, company_name: form.company_name, company_size: form.company_size, password: form.password, website: form.website };
      const { data } = await API.post(endpoint, payload);
      login(data.token, data.user, regRole);
      addToast('Account created!', 'success');
      navigate(regRole === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full bg-surface-container-low border border-surface-variant rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(198,191,255,0.15)] transition-all text-sm";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding Panel */}
      <div className="hidden md:flex md:w-[40%] relative overflow-hidden flex-col justify-between p-12 border-r border-white/5" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="absolute inset-0 opacity-30 z-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[100px] pointer-events-none z-0" style={{ background: 'color-mix(in srgb, var(--secondary) 10%, transparent)' }} />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col items-start gap-1">
            <button onClick={() => navigate('/')} className="font-display text-4xl font-bold hero-gradient-text hover:opacity-80 transition-opacity">DoseBuddy</button>
            <button onClick={() => navigate('/')} className="text-sm font-semibold text-outline hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Home
            </button>
          </div>
          <div className="mt-auto mb-12">
            <h1 className="font-display text-5xl font-bold text-on-background mb-6 leading-tight">
              Your Portfolio.<br />Your Skills.<br /><span className="text-secondary">Your Future.</span>
            </h1>
            <ul className="space-y-4 text-lg text-on-surface-variant">
              {['Peer Skill Exchange', 'Portfolio Building', 'Company Shortlisting', 'Student Ecosystem'].map(item => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[12px] font-semibold text-outline uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">verified</span> Verified Academic Network
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-[60%] bg-surface flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="w-full max-w-md px-6 py-20 z-10">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-surface-variant mb-12 relative">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setRegRole(null); }}
                className={`font-display text-[28px] font-semibold pb-2 relative ${tab === t ? 'text-on-surface' : 'text-outline-variant hover:text-on-surface-variant'} transition-colors`}>
                {t.toUpperCase()}
                {tab === t && <motion.div layoutId="auth-tab" className="absolute bottom-[-1px] left-0 w-full h-[2px]" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary)' }} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-6">
                <p className="text-center text-outline mb-4">Welcome back. Enter your credentials to access your workspace.</p>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest ml-2">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@university.edu" className={inputCls} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-2 mr-1">
                    <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-widest">Password</label>
                    <a href="#" className="text-[12px] font-semibold text-primary hover:text-secondary transition-colors uppercase tracking-widest">Forgot?</a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={inputCls} required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low/50 border border-surface-variant/50">
                  <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
                  <span className="text-[11px] font-semibold text-outline-variant uppercase tracking-wider">System auto-detects Student or Recruiter account</span>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 px-6 rounded-lg font-display text-[20px] font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-on-primary-container relative overflow-hidden group"
                  style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">{loading ? 'Signing in...' : 'Access Workspace'}</span>
                  {!loading && <span className="material-symbols-outlined relative z-10">arrow_forward</span>}
                </button>
              </motion.form>
            ) : (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!regRole ? (
                  <div className="space-y-6">
                    <p className="text-center text-outline mb-4">Choose your account type to get started.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[{ role: 'student', icon: 'school', title: 'Student', desc: 'Build portfolio, exchange skills, find companies' },
                        { role: 'recruiter', icon: 'business', title: 'Recruiter', desc: 'Find candidates, manage openings, shortlist talent' }].map(r => (
                        <button key={r.role} onClick={() => setRegRole(r.role)}
                          className="glass-panel rounded-xl p-6 text-left hover:border-primary/50 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_20%,transparent)] transition-all group">
                          <span className="material-symbols-outlined text-3xl mb-3 group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                          <h3 className="font-display text-lg font-semibold text-on-surface mb-1">{r.title}</h3>
                          <p className="text-xs text-on-surface-variant">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <button type="button" onClick={() => setRegRole(null)} className="text-sm text-primary flex items-center gap-1 mb-2 hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span> Change role
                    </button>
                    <h3 className="font-display text-xl font-semibold text-on-surface mb-4">Register as {regRole === 'student' ? 'Student' : 'Recruiter'}</h3>

                    {regRole === 'student' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Student ID *</label>
                          <input value={form.st_id} onChange={e => set('st_id', e.target.value)} placeholder="RA2211003..." className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Full Name *</label>
                          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Yaswanth" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        </div>
                        <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Email *</label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@srmist.edu.in" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Password *</label>
                        <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Department *</label>
                          <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="CSE" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Year</label>
                          <select value={form.year} onChange={e => set('year', e.target.value)} className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                            <option value="">-</option><option>1</option><option>2</option><option>3</option><option>4</option>
                          </select></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Full Name *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Company Email *</label>
                        <input type="email" value={form.company_email} onChange={e => set('company_email', e.target.value)} placeholder="hr@company.com" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Password *</label>
                        <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Company Name *</label>
                          <input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Acme Inc" className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" required /></div>
                          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Company Size *</label>
                          <select value={form.company_size} onChange={e => set('company_size', e.target.value)} className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                            <option>1-50</option><option>51-200</option><option>201-500</option><option>501-2000</option><option>2000+</option>
                          </select></div>
                        </div>
                      </>
                    )}
                    <button type="submit" disabled={loading}
                      className="w-full py-3 px-6 rounded-lg font-display text-[18px] font-semibold shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-on-primary-container mt-6"
                      style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center">
            <p className="text-[11px] font-semibold text-outline-variant">By continuing, you agree to DoseBuddy's <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
