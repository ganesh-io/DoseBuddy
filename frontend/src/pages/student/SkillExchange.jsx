import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import Modal from '../../components/Modal';

export default function SkillExchange() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const stId = user?.st_id || user?.id;
  const [allSkills, setAllSkills] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [compatible, setCompatible] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [form, setForm] = useState({});
  const [modal, setModal] = useState(null);
  const [contactTarget, setContactTarget] = useState(null);
  const [sessionForm, setSessionForm] = useState({ date: '', time: '', meet_link: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { document.title = 'DoseBuddy — Skill Exchange'; }, []);

  useEffect(() => { if (stId) loadAll(); }, [stId]);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [sk, mine, avail, all] = await Promise.all([
        API.get('/skills'), API.get(`/exchange/mine/${stId}`), API.get(`/skills/availability/${stId}`), API.get('/exchange'),
      ]);
      setAllSkills(sk.data); setMyRequests(mine.data); setAvailability(avail.data); setAllRequests(all.data.filter(r => r.requester_id !== stId));
      try { const c = await API.get(`/exchange/compatible/${stId}`); setCompatible(c.data); } catch {}
    } catch (err) { addToast('Failed to load data', 'error'); } finally { setIsLoading(false); }
  };

  const createRequest = async () => {
    try {
      await API.post('/exchange', { requester_id: stId, skill_wanted: form.skill_wanted, skill_offered: form.skill_offered });
      addToast('Request created!', 'success'); loadAll(); setModal(null);
    } catch (err) { addToast('Failed', 'error'); }
  };

  const addAvailability = async () => {
    try {
      await API.post('/skills/availability', { st_id: stId, skill_id: form.teach_skill, available_day: form.day, available_time: form.time, duration_mins: form.duration || 60, mode: form.mode || 'Online' });
      addToast('Availability added!', 'success'); loadAll(); setModal(null);
    } catch (err) { addToast('Failed', 'error'); }
  };

  const deleteAvailability = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try { await API.delete(`/skills/availability/${id}`); loadAll(); } catch { addToast('Failed', 'error'); }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this exchange request?')) return;
    try { await API.delete(`/exchange/${id}`); loadAll(); } catch { addToast('Failed', 'error'); }
  };

  const shareAvailability = (a) => {
    const text = `I'm available to teach ${a.skill_name} on ${a.available_day} at ${a.available_time} — contact: ${user?.email || 'me'}`;
    navigator.clipboard.writeText(text).then(() => addToast('Copied to clipboard!', 'success')).catch(() => addToast('Copy failed', 'error'));
  };

  const proposeSession = async () => {
    if (!sessionForm.date || !sessionForm.time) { addToast('Date and time required', 'error'); return; }
    try {
      await API.post('/matches', {
        requester_id: stId,
        matched_with: contactTarget.requester_id || contactTarget.st_id,
        skill_wanted: contactTarget.skill_wanted || null,
        skill_offered: contactTarget.skill_offered || null,
        session_date: sessionForm.date,
        session_time: sessionForm.time,
        mode: 'Online',
        meet_link: sessionForm.meet_link || null,
      });
      setModal(null); setContactTarget(null); setSessionForm({ date: '', time: '', meet_link: '' });
      addToast('Session proposed! Check Skill Sessions page', 'success');
      // Navigate after a short delay so user sees the toast
      setTimeout(() => navigate('/student/matches'), 1200);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to propose session';
      addToast(msg, 'error');
    }
  };

  const inputCls = "w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none";

  return (
    <PageWrapper className="p-6 md:p-12 relative">
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)' }} />

      <header className="max-w-4xl mb-8 relative z-10">
        <h1 className="font-display text-5xl font-bold text-on-surface mb-2">Skill Exchange</h1>
        <p className="text-lg text-on-surface-variant">Trade expertise. Teach what you know, learn what you need.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 flex-1 rounded-xl" />
          </div>
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
          {/* Left: Teach + My Requests */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* I Can Teach */}
            <section className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-on-surface">I Can Teach</h2>
                <span className="material-symbols-outlined text-secondary">school</span>
              </div>
              <button onClick={() => { setForm({}); setModal('addAvail'); }} className="w-full py-3 rounded-lg text-on-secondary text-[12px] font-semibold uppercase tracking-wider transition-all active:scale-[0.98]" style={{ background: 'linear-gradient(to right, var(--secondary), var(--secondary-container))' }}>
                Add Availability
              </button>
              <div className="mt-4 space-y-3">
                {availability.map(a => (
                  <div key={a.avail_id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-on-surface mb-1">{a.skill_name}</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">event</span> {a.available_day} {a.available_time} ({a.duration_mins}min, {a.mode})
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => shareAvailability(a)} className="text-primary hover:bg-primary/10 p-1.5 rounded-full" title="Share availability">
                        <span className="material-symbols-outlined text-[16px]">share</span>
                      </button>
                      <button onClick={() => deleteAvailability(a.avail_id)} className="text-error hover:bg-error/10 p-1.5 rounded-full">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {availability.length === 0 && <p className="text-sm text-outline mt-4">You haven't added any teaching availability.</p>}
              </div>
            </section>

            {/* My Requests */}
            <section className="glass-panel rounded-xl p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-on-surface">My Requests</h2>
                <span className="material-symbols-outlined text-primary">notifications_active</span>
              </div>
              <div className="space-y-3">
                {myRequests.map(r => (
                  <div key={r.req_id} className="p-3 rounded-lg bg-surface-container border border-tertiary/20 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-sm bg-tertiary-container/20 text-tertiary text-[10px] uppercase font-bold tracking-wider mb-1">{r.status}</span>
                        <div className="text-[12px] font-semibold text-on-surface">Want: {r.wanted_name}</div>
                        <div className="text-[11px] text-on-surface-variant">Offering: {r.offered_name}</div>
                      </div>
                      <button onClick={() => deleteRequest(r.req_id)} className="text-error hover:bg-error/10 p-1 rounded-full"><span className="material-symbols-outlined text-[16px]">close</span></button>
                    </div>
                  </div>
                ))}
                {myRequests.length === 0 && <p className="text-sm text-outline mt-2">No active requests.</p>}
              </div>
            </section>
          </div>

          {/* Right: Browse / I Want to Learn */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-on-surface">I Want to Learn</h2>
                <p className="text-[13px] text-on-surface-variant mt-1">Browse available peer mentors or create a request.</p>
              </div>
              <button onClick={() => { setForm({}); setModal('createReq'); }} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))' }}>
                <span className="material-symbols-outlined text-[18px]">add</span> New Request
              </button>
            </div>

            {/* Compatible Matches */}
            {compatible.length > 0 && (
              <div className="glass-panel rounded-xl p-4">
                <h3 className="font-display text-lg font-semibold text-secondary mb-3 flex items-center gap-2">🎯 Compatible Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatible.map((c, i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface-container border border-secondary/20">
                      <h4 className="font-semibold text-on-surface">{c.name}</h4>
                      <p className="text-xs text-on-surface-variant">{c.department} • CGPA: {c.cgpa}</p>
                      <div className="mt-2 text-xs"><span className="text-secondary">They offer:</span> {c.they_offer} | <span className="text-primary">They want:</span> {c.they_want}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Exchange Requests */}
            <div className="space-y-3">
              {allRequests.map(r => (
                <div key={r.req_id} className="glass-panel rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-on-surface font-bold shrink-0" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>
                      {(r.requester_name || '?').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[18px] font-semibold text-on-surface">{r.requester_name}</h3>
                      <div className="mt-2 flex gap-4">
                        <div><div className="text-[10px] text-outline uppercase tracking-wider">Teaches</div>
                        <span className="px-2 py-0.5 rounded-sm bg-secondary/10 border border-secondary/20 text-secondary text-[11px]">{r.offered_name}</span></div>
                        <div><div className="text-[10px] text-outline uppercase tracking-wider">Wants</div>
                        <span className="px-2 py-0.5 rounded-sm bg-surface-bright text-on-surface-variant text-[11px]">{r.wanted_name}</span></div>
                      </div>
                    </div>
                    <button onClick={() => { setContactTarget(r); setSessionForm({ date: '', time: '', meet_link: '' }); setModal('connect'); }}
                      className="px-3 py-2 rounded-lg text-[11px] font-semibold text-on-primary-container flex items-center gap-1"
                      style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))' }}>
                      <span className="material-symbols-outlined text-[14px]">connect_without_contact</span> Connect
                    </button>
                  </div>
                </div>
              ))}
              {allRequests.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">swap_horiz</span>
                  <p className="text-outline">No other students have created exchange requests yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      <Modal isOpen={modal === 'createReq'} onClose={() => setModal(null)} title="Create Exchange Request">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Skill I Want to Learn</label>
          <select value={form.skill_wanted || ''} onChange={e => setForm(p => ({ ...p, skill_wanted: e.target.value }))} className={inputCls + ' mt-1'}>
            <option value="">Select...</option>{allSkills.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
          </select></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Skill I Can Offer</label>
          <select value={form.skill_offered || ''} onChange={e => setForm(p => ({ ...p, skill_offered: e.target.value }))} className={inputCls + ' mt-1'}>
            <option value="">Select...</option>{allSkills.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
          </select></div>
          <button onClick={createRequest} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Create Request</button>
        </div>
      </Modal>

      {/* Add Availability Modal */}
      <Modal isOpen={modal === 'addAvail'} onClose={() => setModal(null)} title="Add Teaching Availability">
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Skill to Teach</label>
          <select value={form.teach_skill || ''} onChange={e => setForm(p => ({ ...p, teach_skill: e.target.value }))} className={inputCls + ' mt-1'}>
            <option value="">Select...</option>{allSkills.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
          </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Day</label>
            <select value={form.day || ''} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className={inputCls + ' mt-1'}>
              <option value="">Select...</option>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d}>{d}</option>)}
            </select></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Time</label>
            <input type="time" value={form.time || ''} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Duration (min)</label>
            <input type="number" value={form.duration || 60} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className={inputCls + ' mt-1'} /></div>
            <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Mode</label>
            <select value={form.mode || 'Online'} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))} className={inputCls + ' mt-1'}>
              <option>Online</option><option>Offline</option><option>Both</option>
            </select></div>
          </div>
          <button onClick={addAvailability} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-secondary" style={{ background: 'linear-gradient(to right, var(--secondary), var(--secondary-container))' }}>Add Availability</button>
        </div>
      </Modal>

      {/* Connect Modal */}
      <Modal isOpen={modal === 'connect'} onClose={() => setModal(null)} title={`Connect with ${contactTarget?.requester_name}`}>
        {contactTarget && (
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="glass-panel rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider">Contact Information</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">email</span>
                {contactTarget.requester_email ? (
                  <a href={`mailto:${contactTarget.requester_email}`} className="text-primary hover:underline">{contactTarget.requester_email}</a>
                ) : <span className="text-on-surface-variant">Not available</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
                {contactTarget.requester_phone ? (
                  <a href={`tel:${contactTarget.requester_phone}`} className="text-primary hover:underline">{contactTarget.requester_phone}</a>
                ) : <span className="text-on-surface-variant">Not available</span>}
              </div>
            </div>
            {/* Propose Session */}
            <div>
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Propose a Session</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Date</label>
                <input type="date" value={sessionForm.date} onChange={e => setSessionForm(p => ({ ...p, date: e.target.value }))} className={inputCls + ' mt-1'} /></div>
                <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Time</label>
                <input type="time" value={sessionForm.time} onChange={e => setSessionForm(p => ({ ...p, time: e.target.value }))} className={inputCls + ' mt-1'} /></div>
              </div>
              <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Google Meet Link (optional)</label>
              <input value={sessionForm.meet_link} onChange={e => setSessionForm(p => ({ ...p, meet_link: e.target.value }))} placeholder="https://meet.google.com/..." className={inputCls + ' mt-1'} /></div>
            </div>
            <button onClick={proposeSession} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>
              <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[16px]">send</span> Propose Session</span>
            </button>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
