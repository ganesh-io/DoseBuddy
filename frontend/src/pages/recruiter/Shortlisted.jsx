import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';

export default function Shortlisted() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const recId = user?.rec_id || user?.id;
  const [shortlists, setShortlists] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { document.title = 'DoseBuddy — Shortlisted Candidates'; }, []);

  useEffect(() => { if (recId) load(); }, [recId]);
  const load = async () => {
    try { setIsLoading(true); const { data } = await API.get(`/companies/shortlist/recruiter/${recId}`); setShortlists(data); } catch { addToast('Failed to load', 'error'); } finally { setIsLoading(false); }
  };

  const updateStatus = async (companyId, stId, status) => {
    try { await API.put('/companies/shortlist', { company_id: companyId, st_id: stId, status }); addToast('Updated!', 'success'); load(); } catch { addToast('Failed', 'error'); }
  };

  const updateDate = async (companyId, stId, date) => {
    try { await API.put('/companies/shortlist', { company_id: companyId, st_id: stId, interview_date: date }); load(); } catch { addToast('Failed', 'error'); }
  };

  const filtered = shortlists.filter(s => statusFilter === 'all' || s.status === statusFilter);
  const statusColor = { Pending: 'text-tertiary bg-tertiary/10 border-tertiary/30', Selected: 'text-secondary bg-secondary/10 border-secondary/30', Rejected: 'text-error bg-error/10 border-error/30' };

  return (
    <PageWrapper className="p-6 md:p-12">
      <h1 className="font-display text-5xl font-bold text-on-surface mb-2">Shortlisted Candidates</h1>
      <p className="text-lg text-on-surface-variant mb-8">Manage interview pipeline and candidate status.</p>

      <div className="flex gap-2 mb-6">
        {['all','Pending','Selected','Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-[12px] font-semibold border transition-colors ${statusFilter === s ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">bookmark_border</span>
          <p className="text-on-surface-variant">No shortlisted candidates.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant/20">
              {['Candidate', 'Department', 'CGPA', 'Company', 'Interview Date', 'Status'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={`${s.company_id}-${s.st_id}`} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4"><div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>{(s.name||'?').charAt(0)}</div>
                    <div><span className="text-sm font-medium text-on-surface">{s.name}</span><br/><span className="text-xs text-outline">{s.email}</span></div>
                  </div></td>
                  <td className="py-4 px-4 text-sm text-on-surface-variant">{s.department}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-secondary">{s.cgpa}</td>
                  <td className="py-4 px-4 text-sm text-on-surface-variant">{s.company_name}</td>
                  <td className="py-4 px-4"><input type="date" value={s.interview_date?.split('T')[0] || ''} onChange={e => updateDate(s.company_id, s.st_id, e.target.value)} className="bg-surface-container-low border border-surface-variant rounded px-2 py-1 text-sm text-on-surface outline-none focus:border-primary" /></td>
                  <td className="py-4 px-4">
                    <select value={s.status} onChange={e => updateStatus(s.company_id, s.st_id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer ${statusColor[s.status] || ''}`}>
                      <option>Pending</option><option>Selected</option><option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
