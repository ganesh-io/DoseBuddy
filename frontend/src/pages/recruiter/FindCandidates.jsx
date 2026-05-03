import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import Modal from '../../components/Modal';

export default function FindCandidates() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const recId = user?.rec_id || user?.id;
  const [filters, setFilters] = useState({ skill_name: '', department: '', min_cgpa: '', year: '' });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => { document.title = 'DoseBuddy — Find Candidates'; search(); }, []);

  const search = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
      const { data } = await API.get('/companies/search', { params });
      setCandidates(Array.isArray(data) ? data : []);
    } catch { addToast('Search failed', 'error'); setCandidates([]); }
    finally { setLoading(false); setHasSearched(true); }
  };

  const shortlist = async (stId) => {
    try {
      const companyId = user?.company_id || user?.companyId;
      if (!companyId) {
        // Fallback: look up company by recruiter
        const { data } = await API.get('/companies');
        const match = data.find(c => c.company_name === user?.company_name);
        if (match) {
          await API.post('/companies/shortlist', { company_id: match.company_id, st_id: stId, shortlisted_by: recId });
          addToast('Candidate shortlisted!', 'success'); return;
        }
        // If still no match, shortlist with first company as fallback
        if (data.length > 0) {
          await API.post('/companies/shortlist', { company_id: data[0].company_id, st_id: stId, shortlisted_by: recId });
          addToast('Candidate shortlisted!', 'success'); return;
        }
        addToast('No companies available', 'error'); return;
      }
      await API.post('/companies/shortlist', { company_id: companyId, st_id: stId, shortlisted_by: recId });
      addToast('Candidate shortlisted!', 'success');
    } catch { addToast('Failed to shortlist', 'error'); }
  };

  const inputCls = "w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none";

  return (
    <PageWrapper className="p-6 md:p-12">
      <h1 className="font-display text-5xl font-bold text-on-surface mb-2">Find Candidates</h1>
      <p className="text-lg text-on-surface-variant mb-8">Search and discover talent by skills, department, and academic performance.</p>

      {/* Filter Form */}
      <div className="glass-panel rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Skill</label>
          <input value={filters.skill_name} onChange={e => setFilters(p => ({ ...p, skill_name: e.target.value }))} placeholder="e.g. React, Python" className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Department</label>
          <input value={filters.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))} placeholder="e.g. CSE" className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Min CGPA</label>
          <input type="number" step="0.1" min="0" max="10" value={filters.min_cgpa} onChange={e => setFilters(p => ({ ...p, min_cgpa: e.target.value }))} className={inputCls + ' mt-1'} /></div>
          <div><label className="text-[11px] font-semibold text-on-surface-variant uppercase">Year</label>
          <select value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))} className={inputCls + ' mt-1'}>
            <option value="">All</option><option>1</option><option>2</option><option>3</option><option>4</option>
          </select></div>
        </div>
        <button onClick={search} disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-on-primary-container flex items-center gap-2" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>
          <span className="material-symbols-outlined text-[18px]">search</span> {loading ? 'Searching...' : 'Search Candidates'}
        </button>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 w-full rounded-xl" />)}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(c => (
            <div key={c.st_id} className="glass-card rounded-xl p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))' }}>{(c.name || '?').charAt(0)}</div>
                  <div>
                    <h3 className="font-display font-semibold text-on-surface">{c.name}</h3>
                    <p className="text-xs text-on-surface-variant">{c.department} • Year {c.year || '-'}</p>
                  </div>
                </div>
                <span className="font-display text-xl font-bold text-secondary">{c.cgpa}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(c.skills || []).slice(0, 3).map(s => (
                  <span key={s.skill_name} className="px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[11px]">{s.skill_name}</span>
                ))}
              </div>
              <div className="text-xs text-on-surface-variant mt-1">{c.projectCount} projects • {c.certCount} certificates</div>
              <div className="flex gap-2 mt-auto pt-3">
                <button onClick={() => setSelected(c)} className="flex-1 py-2 rounded-lg bg-surface border border-outline-variant text-on-surface text-[12px] font-semibold hover:border-primary hover:text-primary transition-colors">View Profile</button>
                <button onClick={() => shortlist(c.st_id)} className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))' }}>Shortlist</button>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-16 glass-panel rounded-xl">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">person_search</span>
          <p className="text-on-surface-variant">No candidates found matching your criteria.</p>
        </div>
      ) : null}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-on-surface-variant">Department:</span> <span className="text-on-surface">{selected.department}</span></div>
              <div><span className="text-on-surface-variant">CGPA:</span> <span className="text-secondary font-bold">{selected.cgpa}</span></div>
              <div><span className="text-on-surface-variant">Year:</span> <span className="text-on-surface">{selected.year || '-'}</span></div>
              <div><span className="text-on-surface-variant">Email:</span> <span className="text-on-surface">{selected.email}</span></div>
            </div>
            <div><h4 className="text-sm font-semibold text-on-surface mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(selected.skills || []).map(s => (
                <span key={s.skill_name} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">{s.skill_name} ({s.proficiency})</span>
              ))}
            </div></div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
