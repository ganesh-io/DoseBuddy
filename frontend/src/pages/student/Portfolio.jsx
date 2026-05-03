import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import SkillChip from '../../components/SkillChip';
import Modal from '../../components/Modal';
import { fmtDate, getGrade } from '../../utils/helpers';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const stId = user?.st_id || user?.id;
  const [tab, setTab] = useState('skills');
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [internships, setInternships] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const fileRef = useRef(null);
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem(`profile_img_${stId}`) || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { document.title = 'DoseBuddy — Portfolio'; }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const b64 = reader.result; localStorage.setItem(`profile_img_${stId}`, b64); setProfileImg(b64); addToast('Photo updated!', 'success'); };
    reader.readAsDataURL(file);
  };

  const shareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${stId}`)
      .then(() => addToast('Profile link copied!', 'success')).catch(() => addToast('Copy failed', 'error'));
  };

  const completionPct = () => {
    let c = 0; if (skills.length) c++; if (projects.length) c++; if (certs.length) c++; if (internships.length) c++; if (profile?.resume?.summary) c++;
    return Math.round((c / 5) * 100);
  };

  useEffect(() => { if (stId) loadAll(); }, [stId]);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [p, s, pr, c, i, as] = await Promise.all([
        API.get(`/students/${stId}`), API.get(`/skills/student/${stId}`),
        API.get(`/projects/student/${stId}`), API.get(`/certificates/student/${stId}`),
        API.get(`/internships/student/${stId}`), API.get('/skills'),
      ]);
      setProfile(p.data); setSkills(s.data); setProjects(pr.data); setCerts(c.data); setInternships(i.data); setAllSkills(as.data);
    } catch (err) { addToast('Failed to load portfolio', 'error'); } finally { setIsLoading(false); }
  };

  const saveProfile = async () => {
    try {
      await API.put(`/students/${stId}`, form);
      addToast('Profile updated!', 'success'); loadAll(); setModal(null);
    } catch (err) { addToast('Failed to save', 'error'); }
  };

  const addSkill = async () => {
    try {
      await API.post(`/skills/student/${stId}`, { skill_id: form.skill_id, proficiency: form.proficiency || 'Medium' });
      addToast('Skill added!', 'success'); loadAll(); setModal(null);
    } catch (err) { addToast('Failed to add skill', 'error'); }
  };

  const deleteSkill = async (skillId) => {
    if (!window.confirm('Remove this skill?')) return;
    try { await API.delete(`/skills/student/${stId}/${skillId}`); loadAll(); } catch (err) { addToast('Failed', 'error'); }
  };

  const addProject = async () => {
    try { await API.post('/projects', { st_id: stId, ...form }); addToast('Project added!', 'success'); loadAll(); setModal(null); } catch (err) { addToast('Failed', 'error'); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await API.delete(`/projects/${id}`); loadAll(); } catch (err) { addToast('Failed', 'error'); }
  };

  const addCert = async () => {
    try { await API.post('/certificates', { st_id: stId, ...form }); addToast('Certificate added!', 'success'); loadAll(); setModal(null); } catch (err) { addToast('Failed', 'error'); }
  };

  const deleteCert = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try { await API.delete(`/certificates/${id}`); loadAll(); } catch (err) { addToast('Failed', 'error'); }
  };

  const addInternship = async () => {
    try { await API.post('/internships', { st_id: stId, ...form }); addToast('Internship added!', 'success'); loadAll(); setModal(null); } catch (err) { addToast('Failed', 'error'); }
  };

  const deleteInternship = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try { await API.delete(`/internships/${id}/student/${stId}`); loadAll(); } catch (err) { addToast('Failed', 'error'); }
  };

  const tabs = [
    { key: 'skills', label: 'Skills', icon: 'code' },
    { key: 'projects', label: 'Projects', icon: 'folder_special' },
    { key: 'certificates', label: 'Certificates', icon: 'workspace_premium' },
    { key: 'internships', label: 'Internships', icon: 'work' },
  ];

  const inputCls = "w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none";

  // Group skills by category
  const skillGroups = skills.reduce((acc, s) => { (acc[s.category || 'Other'] = acc[s.category || 'Other'] || []).push(s); return acc; }, {});

  return (
    <PageWrapper className="p-6 md:p-12 max-w-[1200px] mx-auto">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 pointer-events-none" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)' }} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {isLoading ? (
        <div className="space-y-6">
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="skeleton h-64 md:col-span-8 rounded-xl" />
            <div className="skeleton h-64 md:col-span-4 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Completion Bar */}
      <div className="glass-panel rounded-xl p-4 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Portfolio Completion</span>
          <span className="text-sm font-bold text-primary">{completionPct()}%</span>
        </div>
        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct()}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))' }} />
        </div>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 mb-8">
        <div className="col-span-1 md:col-span-8 glass-panel rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-32 h-32 shrink-0 group">
            <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{ background: 'linear-gradient(to top right, var(--primary), var(--secondary))' }} />
            <div className="w-full h-full rounded-full flex items-center justify-center border-4 border-surface relative z-10 text-4xl font-display font-bold overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>
              {profileImg ? <img src={profileImg} alt="" className="w-full h-full object-cover" /> : (user?.name || '?').charAt(0)}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 z-20 w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--primary)' }}>
              <span className="material-symbols-outlined text-[14px] text-on-primary">photo_camera</span>
            </button>
          </div>
          <div className="flex-grow text-center md:text-left space-y-3">
            <div>
              <h1 className="font-display text-5xl font-bold text-on-surface mb-1">{user?.name}</h1>
              <p className="text-lg text-primary">SRM {profile?.department || 'CSE'} · Year {profile?.year || '-'}</p>
            </div>
            <p className="text-on-surface-variant max-w-2xl">{profile?.resume?.summary || 'No summary yet. Click Edit to add one!'}</p>
            {/* LinkedIn Preview */}
            {profile?.resume?.linkedin_url && (
              <a href={profile.resume.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-[#0a66c2] text-xs font-semibold hover:bg-[#0a66c2]/20 transition-colors">
                <span className="material-symbols-outlined text-[16px]">link</span> LinkedIn Profile ↗
              </a>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <button onClick={() => { setForm({ name: profile?.name, summary: profile?.resume?.summary, linkedin_url: profile?.resume?.linkedin_url, github_url: profile?.resume?.github_url, portfolio_url: profile?.resume?.portfolio_url, cgpa: profile?.cgpa }); setModal('editProfile'); }}
                className="px-6 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2 text-white" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))' }}>
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
              </button>
              <button onClick={shareProfile} className="px-4 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">share</span> Share Profile
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[12px] font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">Academic Standing</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="font-display text-5xl font-bold text-secondary leading-none">{profile?.cgpa || '-'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getGrade(profile?.cgpa).bg} ${getGrade(profile?.cgpa).color}`}>{getGrade(profile?.cgpa).grade}</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-6">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((parseFloat(profile?.cgpa) || 0) / 10) * 100}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-secondary" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-[12px] font-semibold text-on-surface-variant">Projects</span><span className="text-on-surface">{projects.length}</span></div>
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-[12px] font-semibold text-on-surface-variant">Certificates</span><span className="text-on-surface">{certs.length}</span></div>
            <div className="flex justify-between items-center py-2"><span className="text-[12px] font-semibold text-on-surface-variant">Skills</span><span className="text-on-surface">{skills.length}</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant/30 sticky top-[64px] z-30 bg-background/80 backdrop-blur-xl pt-4 mb-8">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 text-[12px] font-semibold whitespace-nowrap px-2 border-b-2 transition-colors ${
                tab === t.key ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/50'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skillGroups).map(([cat, items]) => (
              <div key={cat} className="glass-card rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
                  <span className="material-symbols-outlined text-primary">terminal</span>
                  <h3 className="font-display text-[20px] font-semibold text-on-surface">{cat}</h3>
                </div>
                <div className="space-y-2">
                  {items.map((s, i) => (
                    <div key={s.skill_id} className="flex items-center gap-3">
                      <SkillChip name={s.skill_name} proficiency={s.proficiency} delay={i} onDelete={() => deleteSkill(s.skill_id)} />
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: s.proficiency === 'High' ? '100%' : s.proficiency === 'Medium' ? '66%' : '33%' }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: s.proficiency === 'High' ? 'var(--secondary)' : s.proficiency === 'Medium' ? 'var(--primary)' : 'var(--outline)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={() => { setForm({ skill_id: '', proficiency: 'Medium' }); setModal('addSkill'); }}
              className="glass-panel border-dashed border-2 border-outline-variant/40 text-on-surface-variant px-8 py-4 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all w-full max-w-md">
              <span className="material-symbols-outlined text-[32px]">add_circle</span> Add Skill
            </button>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-4">
          <button onClick={() => { setForm({}); setModal('addProject'); }} className="glass-panel px-4 py-2 rounded-lg text-primary text-[12px] font-semibold flex items-center gap-2 hover:bg-primary/5">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Project
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => (
              <div key={p.project_id} className="glass-card rounded-xl p-6 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-lg font-semibold text-on-surface">{p.title}</h3>
                  <button onClick={() => deleteProject(p.project_id)} className="text-error hover:bg-error/10 p-1 rounded-full"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
                <p className="text-sm text-on-surface-variant">{p.description}</p>
                {p.tech_stack && <div className="flex flex-wrap gap-1.5">{p.tech_stack.split(',').map(t => <span key={t} className="px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[11px]">{t.trim()}</span>)}</div>}
                <div className="flex gap-3 mt-2">
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">GitHub ↗</a>}
                  {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline">Live ↗</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="space-y-4">
          <button onClick={() => { setForm({}); setModal('addCert'); }} className="glass-panel px-4 py-2 rounded-lg text-primary text-[12px] font-semibold flex items-center gap-2 hover:bg-primary/5">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Certificate
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map(c => (
              <div key={c.cert_id} className="glass-card rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 5%, var(--surface)) 0%, var(--surface) 100%)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-2xl">workspace_premium</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-bold"><span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>Verified</span>
                  </div>
                  <button onClick={() => deleteCert(c.cert_id)} className="text-error hover:bg-error/10 p-1 rounded-full"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
                <h3 className="font-display font-semibold text-on-surface">{c.cert_name}</h3>
                <p className="text-sm text-on-surface-variant">{c.issuer}</p>
                <p className="text-xs text-outline">{fmtDate(c.issue_date)}</p>
                {c.cert_url && <a href={c.cert_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1">View Certificate ↗</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'internships' && (
        <div className="space-y-4">
          <button onClick={() => { setForm({}); setModal('addInternship'); }} className="glass-panel px-4 py-2 rounded-lg text-primary text-[12px] font-semibold flex items-center gap-2 hover:bg-primary/5">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Internship
          </button>
          {internships.map(i => (
            <div key={i.intern_id} className="glass-card rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-on-surface">{i.role} at {i.company}</h3>
                <p className="text-sm text-on-surface-variant">{i.duration} • ₹{i.stipend}</p>
                <p className="text-xs text-outline">{i.start_date} → {i.end_date || 'Present'}</p>
              </div>
              <button onClick={() => deleteInternship(i.intern_id)} className="text-error hover:bg-error/10 p-2 rounded-full"><span className="material-symbols-outlined">delete</span></button>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={modal === 'addSkill'} onClose={() => setModal(null)} title="Add Skill">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Skill</label>
          <select value={form.skill_id || ''} onChange={e => setForm(p => ({ ...p, skill_id: e.target.value }))} className={inputCls + ' mt-1'}>
            <option value="">Select...</option>{allSkills.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name} ({s.category})</option>)}
          </select></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Proficiency</label>
          <select value={form.proficiency || 'Medium'} onChange={e => setForm(p => ({ ...p, proficiency: e.target.value }))} className={inputCls + ' mt-1'}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select></div>
          <button onClick={addSkill} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Add Skill</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'editProfile'} onClose={() => setModal(null)} title="Edit Profile">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Summary</label>
          <textarea value={form.summary || ''} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={3} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">CGPA</label>
          <input type="number" step="0.01" min="0" max="10" value={form.cgpa || ''} onChange={e => setForm(p => ({ ...p, cgpa: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">LinkedIn URL</label>
          <input value={form.linkedin_url || ''} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">GitHub URL</label>
          <input value={form.github_url || ''} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Portfolio URL</label>
          <input value={form.portfolio_url || ''} onChange={e => setForm(p => ({ ...p, portfolio_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <button onClick={saveProfile} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Save Changes</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'addProject'} onClose={() => setModal(null)} title="Add Project">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Title *</label>
          <input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls + ' mt-1'} required /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Description</label>
          <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Tech Stack (comma-separated)</label>
          <input value={form.tech_stack || ''} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} className={inputCls + ' mt-1'} placeholder="React, Node.js, MySQL" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">GitHub URL</label>
            <input value={form.github_url || ''} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Live URL</label>
            <input value={form.live_url || ''} onChange={e => setForm(p => ({ ...p, live_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          </div>
          <button onClick={addProject} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Add Project</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'addCert'} onClose={() => setModal(null)} title="Add Certificate">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Certificate Name *</label>
          <input value={form.cert_name || ''} onChange={e => setForm(p => ({ ...p, cert_name: e.target.value }))} className={inputCls + ' mt-1'} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Issuer</label>
            <input value={form.issuer || ''} onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Issue Date</label>
            <input type="date" value={form.issue_date || ''} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          </div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Certificate URL</label>
          <input value={form.cert_url || ''} onChange={e => setForm(p => ({ ...p, cert_url: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <button onClick={addCert} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Add Certificate</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'addInternship'} onClose={() => setModal(null)} title="Add Internship">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Company *</label>
            <input value={form.company || ''} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className={inputCls + ' mt-1'} required /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Role *</label>
            <input value={form.role || ''} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls + ' mt-1'} required /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Duration</label>
            <input value={form.duration || ''} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className={inputCls + ' mt-1'} placeholder="3 months" /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Start Date</label>
            <input type="date" value={form.start_date || ''} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Stipend</label>
            <input type="number" value={form.stipend || ''} onChange={e => setForm(p => ({ ...p, stipend: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          </div>
          <button onClick={addInternship} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Add Internship</button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
