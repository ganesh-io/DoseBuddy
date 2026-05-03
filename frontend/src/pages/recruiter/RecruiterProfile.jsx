import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';

export default function RecruiterProfile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const recId = user?.rec_id || user?.id;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState({});
  const [photo, setPhoto] = useState(() => localStorage.getItem(`recruiter_photo_${recId}`) || null);

  useEffect(() => { if (recId) load(); }, [recId]);
  const load = async () => {
    try {
      const [p, s] = await Promise.all([API.get(`/recruiters/${recId}`), API.get(`/dashboard/recruiter/${recId}`)]);
      setProfile(p.data); setStats(s.data.stats || {});
    } catch { addToast('Failed to load', 'error'); }
  };

  const save = async () => {
    try {
      const { data } = await API.put(`/recruiters/${recId}`, form);
      setProfile(data); updateUser(data); setEditing(false); addToast('Profile saved!', 'success');
    } catch { addToast('Failed to save', 'error'); }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      localStorage.setItem(`recruiter_photo_${recId}`, base64);
      localStorage.setItem(`profile_img_${recId}`, base64);
      setPhoto(base64);
      addToast('Photo updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => { document.title = 'DoseBuddy — Profile'; }, []);

  if (!profile) return <PageWrapper className="p-12"><div className="space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-24 w-full"/>)}</div></PageWrapper>;

  const F = ({label, field, type='text'}) => editing ? (
    <input type={type} value={form[field]||''} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary outline-none"/>
  ) : <span className="text-on-surface text-sm">{profile[field] || '-'}</span>;

  const memberSince = profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '-';

  return (
    <PageWrapper className="p-6 md:p-12 max-w-4xl mx-auto">
      {/* Profile Card */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-panel rounded-2xl p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          {/* Avatar with photo upload */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{
                width: 96, height: 96, borderRadius: '50%',
                objectFit: 'cover', border: '3px solid var(--accent)',
              }}/>
            ) : (
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 700, color: 'var(--on-surface)',
                fontFamily: 'Space Grotesk, sans-serif',
                border: '3px solid var(--accent)',
              }}>
                {(profile.name || '?').charAt(0)}
              </div>
            )}
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--background)', fontSize: 14,
            }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>photo_camera</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }}/>
            </label>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-on-secondary" style={{ transform: 'translateX(-50%)' }}>Recruiter</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            {editing ? (
              <input value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="font-display text-3xl font-bold bg-transparent border-b-2 border-primary text-on-surface outline-none w-full mb-2"/>
            ) : <h1 className="font-display text-3xl font-bold text-on-surface mb-1">{profile.name}</h1>}
            <p className="text-primary text-lg">{profile.company_name}</p>
            <p className="text-on-surface-variant text-sm">{profile.company_email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">{profile.company_size || 'N/A'} size</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-container border border-outline-variant text-on-surface-variant">Member since {memberSince}</span>
            </div>
          </div>
          <button onClick={() => { if (editing) { save(); } else { setForm({name:profile.name,company_name:profile.company_name,company_size:profile.company_size,website:profile.website,superior_ref:profile.superior_ref}); setEditing(true); }}}
            className="px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-on-primary-container" style={{background:'linear-gradient(to right, var(--primary-container), var(--secondary-container))'}}>
            <span className="material-symbols-outlined text-[18px]">{editing?'save':'edit'}</span> {editing?'Save':'Edit Profile'}
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{l:'Company',f:'company_name'},{l:'Company Size',f:'company_size'},{l:'Website',f:'website'},{l:'Superior Reference',f:'superior_ref'}].map(({l,f})=>(
            <div key={f} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <label className="text-[10px] font-bold text-outline uppercase tracking-widest">{l}</label>
              <div className="mt-1">{f==='website' && !editing && profile.website ? <a href={profile.website.startsWith('http')?profile.website:`https://${profile.website}`} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">{profile.website} ↗</a> : <F label={l} field={f}/>}</div>
            </div>
          ))}
        </div>
        {editing && <button onClick={()=>setEditing(false)} className="mt-4 text-sm text-on-surface-variant hover:text-error transition-colors">Cancel</button>}
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'Shortlisted',v:stats.shortlisted||0,icon:'bookmark',c:'primary'},{l:'Selected',v:stats.selected||0,icon:'check_circle',c:'secondary'},{l:'Openings',v:stats.openings||0,icon:'work',c:'tertiary'}].map(s=>(
          <div key={s.l} className="glass-panel rounded-xl p-5 text-center">
            <span className="material-symbols-outlined text-2xl mb-2" style={{color:`var(--${s.c})`,fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
            <div className="font-display text-3xl font-bold text-on-surface">{s.v}</div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
