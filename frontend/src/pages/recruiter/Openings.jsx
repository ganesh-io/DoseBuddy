import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import Modal from '../../components/Modal';
import { fmtDate } from '../../utils/helpers';

export default function Openings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [openings, setOpenings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [newOpening, setNewOpening] = useState({ role:'', type:'Internship', skills_required:'', min_cgpa:'', deadline:'', stipend_salary:'', description:'' });

  useEffect(() => { document.title = 'DoseBuddy — Openings'; }, []);

  useEffect(() => {
    load();
    // Fetch company_id for this recruiter
    API.get('/companies').then(({ data }) => {
      const match = data.find(c => c.company_name === user?.company_name);
      if (match) setCompanyId(match.company_id);
    }).catch(() => {});
  }, []);
  const load = async () => {
    try { setIsLoading(true); const { data } = await API.get('/companies/openings'); setOpenings(data); } catch { addToast('Failed', 'error'); } finally { setIsLoading(false); }
  };

  const viewApplicants = async (opening) => {
    setSelectedOpening(opening);
    try {
      const { data } = await API.get(`/companies/openings/${opening.opening_id}/applicants`);
      setApplicants(data);
    } catch { addToast('Failed to load applicants', 'error'); setApplicants([]); }
  };

  const updateApplicantStatus = async (appId, status) => {
    try {
      await API.put(`/applications/${appId}`, { status });
      addToast('Status updated', 'success');
      viewApplicants(selectedOpening);
    } catch { addToast('Failed', 'error'); }
  };

  const togglePause = async (opening) => {
    try {
      const newPaused = opening.is_paused ? 0 : 1;
      await API.put(`/companies/openings/${opening.opening_id}/status`, { is_paused: newPaused, is_active: newPaused ? opening.is_active : 1 });
      addToast(newPaused ? 'Opening paused' : 'Opening resumed', 'success'); load();
    } catch { addToast('Failed', 'error'); }
  };

  const createOpening = async () => {
    if (!newOpening.role) { addToast('Role is required', 'error'); return; }
    if (!companyId) { addToast('Could not find your company. Contact admin.', 'error'); return; }
    try {
      await API.post('/companies/openings', { ...newOpening, company_id: companyId });
      addToast('Opening created!', 'success');
      setAddModal(false);
      setNewOpening({ role:'', type:'Internship', skills_required:'', min_cgpa:'', deadline:'', stipend_salary:'', description:'' });
      load();
    } catch { addToast('Failed to create opening', 'error'); }
  };

  const toggleClose = async (opening) => {
    try {
      const newActive = opening.is_active ? 0 : 1;
      await API.put(`/companies/openings/${opening.opening_id}/status`, { is_active: newActive, is_paused: 0 });
      addToast(newActive ? 'Opening reactivated' : 'Opening closed', 'success'); load();
    } catch { addToast('Failed', 'error'); }
  };

  const statusColor = {
    Applied: 'text-primary bg-primary/10 border-primary/30',
    Screening: 'text-tertiary bg-tertiary/10 border-tertiary/30',
    Interview: 'text-secondary bg-secondary/10 border-secondary/30',
    Selected: 'text-secondary bg-secondary/20 border-secondary/40',
    Rejected: 'text-error bg-error/10 border-error/30',
  };

  return (
    <PageWrapper className="p-6 md:p-12">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <h1 className="text-5xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Openings</h1>
        <button onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}>
          <span className="material-symbols-outlined text-[18px]">add</span> Add Opening
        </button>
      </div>
      <p className="text-on-surface-variant mb-8">Manage job openings, view applicants, and control visibility.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton h-48 w-full rounded-xl" />)
        ) : openings.length === 0 ? (
          <div className="md:col-span-2 glass-panel rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">work_off</span>
            <p className="text-on-surface-variant">No openings created yet.</p>
          </div>
        ) : (
          openings.map(o => (
            <div key={o.opening_id} className="glass-card rounded-xl p-6 flex flex-col gap-3 relative overflow-hidden">
              {/* Status Badge */}
              {!o.is_active && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/30">Closed</div>
              )}
              {o.is_active && o.is_paused ? (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary border border-tertiary/30">Paused</div>
              ) : o.is_active ? (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/30">Active</div>
              ) : null}

              <div>
                <h3 className="font-display text-lg font-semibold text-on-surface">{o.role}</h3>
                <p className="text-sm text-on-surface-variant">{o.company_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-outline">work</span>{o.type}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-outline">payments</span>{o.stipend_salary || '-'}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-outline">school</span>Min CGPA: {o.min_cgpa || '-'}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-outline">event</span>{fmtDate(o.deadline)}</span>
              </div>
              {o.skills_required && (
                <div className="flex flex-wrap gap-1.5">{o.skills_required.split(',').map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[11px]">{s.trim()}</span>
                ))}</div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-2 pt-3 border-t border-outline-variant/20">
                <button onClick={() => viewApplicants(o)}
                  className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-on-primary-container flex items-center justify-center gap-1"
                  style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))' }}>
                  <span className="material-symbols-outlined text-[16px]">group</span> View Applicants
                </button>
                <button onClick={() => togglePause(o)} title={o.is_paused ? 'Resume' : 'Pause'}
                  className={`px-3 py-2 rounded-lg text-[12px] font-semibold border flex items-center gap-1 ${o.is_paused ? 'bg-secondary/10 text-secondary border-secondary/30' : 'bg-tertiary/10 text-tertiary border-tertiary/30'}`}>
                  <span className="material-symbols-outlined text-[16px]">{o.is_paused ? 'play_arrow' : 'pause'}</span>
                </button>
                <button onClick={() => toggleClose(o)} title={o.is_active ? 'Close' : 'Reactivate'}
                  className={`px-3 py-2 rounded-lg text-[12px] font-semibold border flex items-center gap-1 ${!o.is_active ? 'bg-secondary/10 text-secondary border-secondary/30' : 'bg-error/10 text-error border-error/30'}`}>
                  <span className="material-symbols-outlined text-[16px]">{o.is_active ? 'close' : 'restart_alt'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Applicants Modal */}
      <Modal isOpen={!!selectedOpening} onClose={() => { setSelectedOpening(null); setApplicants([]); }} title={`Applicants — ${selectedOpening?.role} at ${selectedOpening?.company_name}`} size="xl">
        {applicants.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">person_off</span>
            <p className="text-on-surface-variant">No applications received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-outline-variant/20">
                {['Student', 'Department', 'CGPA', 'Applied', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {applicants.map(a => (
                  <tr key={a.app_id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>
                          {(a.name || '?').charAt(0)}
                        </div>
                        <div><div className="text-sm font-medium text-on-surface">{a.name}</div><div className="text-[10px] text-outline">{a.email}</div></div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-on-surface-variant">{a.department}</td>
                    <td className="py-3 px-3 text-sm font-semibold text-secondary">{a.cgpa}</td>
                    <td className="py-3 px-3 text-sm text-on-surface-variant">{fmtDate(a.applied_at)}</td>
                    <td className="py-3 px-3">
                      <select value={a.status} onChange={e => updateApplicantStatus(a.app_id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer ${statusColor[a.status] || ''}`}>
                        <option>Applied</option><option>Screening</option><option>Interview</option><option>Selected</option><option>Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Opening">
        <div className="space-y-4">
          {[{l:'Role / Position *',f:'role',ph:'e.g. Frontend Developer Intern',t:'text'},
            {l:'Stipend / Salary',f:'stipend_salary',ph:'e.g. ₹15,000/month',t:'text'},
            {l:'Min CGPA',f:'min_cgpa',ph:'e.g. 7.5',t:'number'},
            {l:'Deadline',f:'deadline',ph:'',t:'date'},
            {l:'Required Skills (comma separated)',f:'skills_required',ph:'React, Node.js, MySQL',t:'text'},
          ].map(({l,f,ph,t}) => (
            <div key={f}>
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{l}</label>
              <input type={t} value={newOpening[f]} onChange={e => setNewOpening(p => ({...p,[f]:e.target.value}))}
                placeholder={ph}
                className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Type</label>
            <select value={newOpening.type} onChange={e => setNewOpening(p => ({...p,type:e.target.value}))}
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none">
              <option>Internship</option><option>Full-Time</option><option>Contract</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Description</label>
            <textarea value={newOpening.description} onChange={e => setNewOpening(p => ({...p,description:e.target.value}))}
              rows={3} placeholder="Job description..."
              className="w-full mt-1 bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary outline-none" />
          </div>
          <button onClick={createOpening} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}>
            Create Opening
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
