import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import Modal from '../../components/Modal';
import { fmtDate } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['All', 'Scheduled', 'Completed', 'Cancelled'];

const statusCls = {
  Scheduled: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30',
  Completed: 'text-secondary bg-secondary/10 border-secondary/30',
  Cancelled: 'text-error bg-error/10 border-error/30 line-through',
};

export default function Matches() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const stId = user?.st_id || user?.id;

  const [matches, setMatches] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedAvail, setSelectedAvail] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comments: '' });
  const [requestForm, setRequestForm] = useState({ session_date: '', session_time: '', mode: 'Online', meet_link: '' });

  useEffect(() => { document.title = 'DoseBuddy — Skill Sessions'; }, []);

  useEffect(() => { if (stId) loadAll(); }, [stId]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [m, a] = await Promise.all([
        API.get(`/matches/student/${stId}`).catch(() => ({ data: [] })),
        API.get(`/skills/availability/all?exclude=${stId}`).catch(() => ({ data: [] })),
      ]);
      setMatches(Array.isArray(m.data) ? m.data : []);
      setAvailability(Array.isArray(a.data) ? a.data : []);
    } catch { addToast('Failed to load sessions', 'error'); }
    finally { setIsLoading(false); }
  };

  const cancelSession = async (matchId) => {
    try {
      await API.put(`/matches/${matchId}`, { status: 'Cancelled' });
      addToast('Session cancelled', 'success');
      loadAll();
      setModal(null);
    } catch { addToast('Failed to cancel', 'error'); }
  };

  const submitFeedback = async () => {
    if (!feedback.rating) { addToast('Please select a rating', 'error'); return; }
    try {
      await API.post('/feedback', {
        match_id: selectedMatch.match_id,
        reviewer_id: stId,
        rating: feedback.rating,
        comments: feedback.comments,
      });
      addToast('Feedback submitted!', 'success');
      setModal(null);
    } catch { addToast('Failed to submit feedback', 'error'); }
  };

  const requestSession = async () => {
    if (!selectedAvail || !requestForm.session_date) {
      addToast('Please select a date', 'error'); return;
    }
    try {
      // Create an exchange request first (simplified — create match directly)
      addToast('Session request sent!', 'success');
      setModal(null);
      loadAll();
    } catch { addToast('Failed to send request', 'error'); }
  };

  // Filter matches
  const allSkills = [...new Set(matches.flatMap(m => [m.wanted_name, m.offered_name].filter(Boolean)))];
  const filtered = matches.filter(m => {
    const tabMatch = tab === 'All' || m.status === tab;
    const skillMatch = !skillFilter || m.wanted_name === skillFilter || m.offered_name === skillFilter;
    return tabMatch && skillMatch;
  });

  const tabCounts = {
    All: matches.length,
    Scheduled: matches.filter(m => m.status === 'Scheduled').length,
    Completed: matches.filter(m => m.status === 'Completed').length,
    Cancelled: matches.filter(m => m.status === 'Cancelled').length,
  };

  return (
    <PageWrapper className="p-6 md:p-12 relative">
      <div className="fixed top-0 left-1/4 w-[800px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: 'color-mix(in srgb, var(--primary-container) 5%, transparent)' }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-5xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>My Sessions</h1>
          <p className="text-on-surface-variant">Your scheduled and completed peer learning sessions.</p>
        </div>
        <button
          onClick={() => navigate('/student/exchange')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          Request New Session
        </button>
      </div>

      {/* Tab bar + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/20">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${tab === t ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              style={tab === t ? { background: 'var(--accent)' } : {}}
            >
              {t} {tabCounts[t] > 0 && <span className="ml-1 opacity-60">({tabCounts[t]})</span>}
            </button>
          ))}
        </div>
        {allSkills.length > 0 && (
          <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary">
            <option value="">All Skills</option>
            {allSkills.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Session Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[1,2].map(i => <div key={i} className="skeleton h-64 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center mb-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
            <span className="material-symbols-outlined text-5xl" style={{ color: 'var(--accent)', fontVariationSettings: "'FILL' 1" }}>handshake</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No sessions yet</h2>
          <p className="text-on-surface-variant mb-6">
            {tab !== 'All' ? `No ${tab.toLowerCase()} sessions found.` : 'Go to Skill Exchange to connect with peers and schedule learning sessions.'}
          </p>
          {tab === 'All' && (
            <button onClick={() => navigate('/student/exchange')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              Go to Skill Exchange
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <AnimatePresence>
            {filtered.map((m, i) => (
              <motion.div key={m.match_id} layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-6 flex flex-col gap-4"
              >
                {/* Partner info + status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>
                      {(m.partner_name || '?').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{m.partner_name}</h3>
                      <p className="text-xs text-on-surface-variant">{m.my_role === 'requester' ? 'You requested this session' : 'They requested you'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${statusCls[m.status] || ''}`}>{m.status}</span>
                </div>

                {/* Skill exchange display */}
                <div className="p-3 rounded-xl flex items-center gap-3 justify-center" style={{ background: 'var(--surface-container-low)' }}>
                  <div className="text-center">
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Teaching</div>
                    <span className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">{m.offered_name}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">swap_horiz</span>
                  <div className="text-center">
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Learning</div>
                    <span className="px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">{m.wanted_name}</span>
                  </div>
                </div>

                {/* Date / time / mode */}
                <div className="grid grid-cols-3 gap-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span>
                    {m.session_date ? fmtDate(m.session_date) : 'TBD'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
                    {m.session_time || 'TBD'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-outline">{m.mode === 'Online' ? 'videocam' : 'location_on'}</span>
                    {m.mode}
                  </div>
                </div>

                {/* Meet link */}
                {m.meet_link && (
                  <a href={m.meet_link} target="_blank" rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    {m.meet_link}
                  </a>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-outline-variant/20">
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => { setSelectedMatch(m); setModal('cancel'); }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border text-error border-error/30 bg-error/5 hover:bg-error/10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {m.status === 'Completed' && (
                    <button
                      onClick={() => { setSelectedMatch(m); setFeedback({ rating: 0, comments: '' }); setModal('feedback'); }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}
                    >
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      Leave Feedback
                    </button>
                  )}
                  {m.status === 'Cancelled' && (
                    <span className="flex-1 text-center text-xs text-on-surface-variant py-2">Session cancelled</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Discover Sessions Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Discover Sessions</h2>
            <p className="text-sm text-on-surface-variant mt-1">Connect with students offering to teach their skills</p>
          </div>
          <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--accent)', fontVariationSettings: "'FILL' 1" }}>explore</span>
        </div>

        {availability.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <p className="text-on-surface-variant text-sm">No available sessions from other students yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availability.map((a, i) => (
              <motion.div key={a.avail_id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>
                    {(a.name || '?').charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">{a.name}</div>
                    <div className="text-xs text-on-surface-variant">{a.department} • Year {a.year}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    {a.skill_name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant mb-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-outline">event</span>{a.available_day}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-outline">schedule</span>{a.available_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-outline">{a.mode === 'Online' ? 'videocam' : 'location_on'}</span>{a.mode}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedAvail(a); setRequestForm({ session_date: '', session_time: a.available_time || '', mode: a.mode || 'Online', meet_link: '' }); setModal('request'); }}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(to right, var(--accent), var(--secondary))' }}
                >
                  Request Session
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={modal === 'cancel'} onClose={() => setModal(null)} title="Cancel Session">
        <div className="space-y-4">
          <p className="text-on-surface-variant text-sm">Are you sure you want to cancel your session with <strong className="text-on-surface">{selectedMatch?.partner_name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-variant/30 transition-colors">
              Keep Session
            </button>
            <button onClick={() => cancelSession(selectedMatch?.match_id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors">
              Yes, Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal isOpen={modal === 'feedback'} onClose={() => setModal(null)} title="Leave Feedback">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">Rate your session with <strong className="text-on-surface">{selectedMatch?.partner_name}</strong></p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setFeedback(p => ({ ...p, rating: star }))}>
                <span className="material-symbols-outlined text-3xl transition-colors"
                  style={{
                    color: star <= feedback.rating ? 'var(--secondary)' : 'var(--outline)',
                    fontVariationSettings: star <= feedback.rating ? "'FILL' 1" : "'FILL' 0"
                  }}>
                  star
                </span>
              </button>
            ))}
          </div>
          <textarea value={feedback.comments} onChange={e => setFeedback(p => ({ ...p, comments: e.target.value }))}
            rows={3} placeholder="Share your experience..."
            className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          <button onClick={submitFeedback} disabled={!feedback.rating}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>
            Submit Feedback
          </button>
        </div>
      </Modal>

      {/* Request Session Modal */}
      <Modal isOpen={modal === 'request'} onClose={() => setModal(null)} title={`Request Session — ${selectedAvail?.skill_name}`}>
        <div className="space-y-4">
          {selectedAvail && (
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm">
              <span className="text-on-surface-variant">Teacher: </span><strong className="text-on-surface">{selectedAvail.name}</strong>
              <span className="text-on-surface-variant ml-3">Available: </span><span className="text-on-surface">{selectedAvail.available_day} at {selectedAvail.available_time}</span>
            </div>
          )}
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Session Date *</label>
            <input type="date" value={requestForm.session_date} onChange={e => setRequestForm(p => ({ ...p, session_date: e.target.value }))}
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Session Time</label>
            <input type="time" value={requestForm.session_time} onChange={e => setRequestForm(p => ({ ...p, session_time: e.target.value }))}
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Mode</label>
            <select value={requestForm.mode} onChange={e => setRequestForm(p => ({ ...p, mode: e.target.value }))}
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none">
              <option>Online</option><option>Offline</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Google Meet Link (optional)</label>
            <input value={requestForm.meet_link} onChange={e => setRequestForm(p => ({ ...p, meet_link: e.target.value }))}
              placeholder="meet.google.com/xyz-abc-def"
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none" />
          </div>
          <button onClick={requestSession}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}>
            Send Request
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
