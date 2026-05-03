import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import API from '../../api/axios';
import PageWrapper from '../../components/PageWrapper';
import Modal from '../../components/Modal';
import { motion } from 'framer-motion';
import { fmtDate } from '../../utils/helpers';

const COMPANY_DOMAINS = {
  'Tata Consultancy Services':'tcs.com','Infosys':'infosys.com','Wipro':'wipro.com',
  'HCL Technologies':'hcltech.com','Tech Mahindra':'techmahindra.com','Cognizant':'cognizant.com',
  'Capgemini':'capgemini.com','Accenture':'accenture.com','IBM India':'ibm.com',
  'Microsoft India':'microsoft.com','Google India':'google.com','Amazon India':'amazon.com',
  'Flipkart':'flipkart.com','Paytm':'paytm.com','PhonePe':'phonepe.com','Razorpay':'razorpay.com',
  'Ola':'olacabs.com','Zomato':'zomato.com','Swiggy':'swiggy.com','Freshworks':'freshworks.com',
  'Zoho Corporation':'zoho.com','Meesho':'meesho.com','CRED':'cred.club','Dream11':'dream11.com',
  'Postman':'postman.com','Sarvam AI':'sarvam.ai','Ather Energy':'atherenergy.com',
  'InMobi':'inmobi.com','Mu Sigma':'mu-sigma.com','Fractal Analytics':'fractal.ai',
  'ShareChat':'sharechat.com','Naukri (Info Edge)':'naukri.com','ClearTax':'cleartax.in',
  'Lenskart':'lenskart.com','HealthifyMe':'healthifyme.com',"BYJU'S":'byjus.com',
  'Sprinklr':'sprinklr.com','Hexaware':'hexaware.com','Mphasis':'mphasis.com',
  'Persistent Systems':'persistent.com','Mindtree':'mindtree.com','GlobalLogic':'globallogic.com',
  'EPAM India':'epam.com',
};

function CompanyLogo({ companyName }) {
  const domain = COMPANY_DOMAINS[companyName];
  const [error, setError] = useState(false);
  const colors = ['#6366f1','#f472b6','#34d399','#f59e0b','#22d3ee','#a78bfa'];
  const color = colors[(companyName || '').charCodeAt(0) % colors.length];

  if (!domain || error) {
    return (
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: color + '22', border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 700, color, fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {(companyName || '?')[0]}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={companyName}
      onError={() => setError(true)}
      style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'contain', background: 'white', padding: 6 }}
    />
  );
}

export default function Companies() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const stId = user?.st_id || user?.id;
  const [openings, setOpenings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  useEffect(() => { document.title = 'DoseBuddy — Companies'; }, []);

  useEffect(() => { if (stId) load(); }, [stId]);
  const load = async () => {
    try { setIsLoading(true); const { data } = await API.get(`/companies/openings/${stId}`); setOpenings(data); } catch { addToast('Failed to load', 'error'); } finally { setIsLoading(false); }
  };

  const apply = async () => {
    try {
      await API.post('/applications', { st_id: stId, company_id: selected.company_id, opening_id: selected.opening_id, role: selected.role, note });
      addToast('Application submitted!', 'success'); setModal(null); load();
    } catch (err) { addToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const withdraw = async () => {
    if (!withdrawTarget) return;
    const appId = withdrawTarget.app_id;
    const openingId = withdrawTarget.opening_id;
    if (!appId) { console.error('No app_id found on target:', withdrawTarget); addToast('Cannot withdraw — missing ID', 'error'); return; }
    try {
      await API.delete(`/applications/${appId}`);
      // Immediately update local state
      setOpenings(prev => prev.map(o =>
        o.opening_id === openingId ? { ...o, applicationStatus: null, app_id: null } : o
      ));
      setWithdrawTarget(null);
      setModal(null);
      addToast('Application withdrawn!', 'success');
      // Also refetch from server
      load();
    } catch (err) {
      console.error('Withdraw error:', err);
      addToast(err.response?.data?.error || 'Failed to withdraw', 'error');
    }
  };

  const filtered = openings.filter(o => {
    if (filter === 'eligible') return o.eligible && o.is_active && !o.is_paused;
    if (filter === 'applied') return o.applicationStatus;
    if (filter === 'not-applied') return !o.applicationStatus && o.is_active && !o.is_paused;
    return true;
  });

  const statusBadge = { Applied: 'bg-primary-container/20 text-primary border-primary/20', Screening: 'bg-tertiary-container/20 text-tertiary border-tertiary/20', Interview: 'bg-secondary-container/20 text-secondary border-secondary/20', Selected: 'bg-secondary/20 text-secondary border-secondary/30', Rejected: 'bg-error-container/20 text-error border-error/20' };

  const canApply = (o) => o.is_active && !o.is_paused && !o.applicationStatus;

  return (
    <PageWrapper className="p-6 md:p-12 lg:p-20 relative">
      <div className="fixed top-0 left-1/4 w-[800px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: 'color-mix(in srgb, var(--primary-container) 5%, transparent)' }} />
      <header className="mb-8"><h1 className="font-display text-5xl font-bold text-on-surface mb-2">Company Openings</h1>
      <p className="text-lg text-outline max-w-2xl">Discover opportunities tailored to your skill portfolio.</p></header>

      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-surface-container-high/50">
        {[['all','All'],['eligible','Eligible'],['applied','Applied'],['not-applied','Not Applied']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 rounded-full text-[12px] font-semibold border transition-colors ${filter === k ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant'}`}>{l}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-[400px] w-full rounded-[24px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">business_center</span>
          <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">No companies found</h3>
          <p className="text-outline">There are no openings matching your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((o) => (
            <motion.article key={o.opening_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`group relative bg-surface-container-lowest rounded-[24px] p-6 border border-white/5 overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:border-primary/30 flex flex-col ${(!o.is_active || o.is_paused) ? 'opacity-70' : ''}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--primary-container) 10%, transparent), transparent)' }} />

              {/* Closed/Paused Banner */}
              {!o.is_active && (
                <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-2 mb-4 text-center relative z-10">
                  <span className="text-xs font-semibold text-error flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">block</span> This company is no longer accepting applications
                  </span>
                </div>
              )}
              {!!o.is_active && !!o.is_paused && (
                <div className="bg-tertiary/10 border border-tertiary/20 rounded-lg px-4 py-2 mb-4 text-center relative z-10">
                  <span className="text-xs font-semibold text-tertiary flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pause_circle</span> Applications temporarily paused
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-6 relative z-10">
                <CompanyLogo companyName={o.company_name} />
                {o.applicationStatus ? (
                  <span className={`px-3 py-1 rounded-full text-[12px] font-semibold border flex items-center gap-1 ${statusBadge[o.applicationStatus] || ''}`}>
                    <span className="material-symbols-outlined text-[14px]">send</span> {o.applicationStatus}
                  </span>
                ) : o.eligible && o.is_active && !o.is_paused ? (
                  <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary border border-secondary/20 text-[12px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Eligible
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant border border-outline-variant/30 text-[12px] font-semibold">
                    {!o.is_active ? 'Closed' : o.is_paused ? 'Paused' : 'Not Eligible'}
                  </span>
                )}
              </div>

              <div className="mb-5 relative z-10">
                <h3 className="font-display text-[28px] font-semibold text-on-surface leading-tight">{o.company_name}</h3>
                <p className="text-outline">{o.role} • {o.domain}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 relative z-10 text-sm">
                <div className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-outline">location_on</span>{o.location || 'Remote'}</div>
                <div className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-outline">work</span>{o.type}</div>
                <div className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-outline">payments</span>{o.stipend_salary || '-'}</div>
                <div className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-[18px] text-outline">event</span>{fmtDate(o.deadline)}</div>
              </div>

              <div className="mt-auto relative z-10">
                <p className="text-[10px] font-semibold text-outline uppercase tracking-wider mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(o.matchedSkills || []).map(s => (
                    <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-surface-bright text-[12px] font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-secondary">check</span> {s}
                    </div>
                  ))}
                  {(o.missingSkills || []).map(s => (
                    <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/20 border border-error/20 text-[12px] font-semibold text-outline-variant">
                      <span className="material-symbols-outlined text-[14px]">close</span> {s}
                    </div>
                  ))}
                </div>

                {!o.eligible && !!o.min_cgpa && !!o.is_active && !o.is_paused && (
                  <p className="text-xs text-error mb-3">CGPA requirement: {o.min_cgpa} (yours: {o.studentCgpa})</p>
                )}

                {o.applicationStatus ? (
                  <div className="flex gap-2 items-center">
                    <div className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-[12px] font-semibold ${statusBadge[o.applicationStatus] || 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                      <span className="material-symbols-outlined text-[16px]">info</span> Status: {o.applicationStatus}
                    </div>
                    {o.applicationStatus === 'Applied' && (
                      <button
                        onClick={() => { setWithdrawTarget(o); setModal('withdraw'); }}
                        className="px-3 py-3 rounded-xl text-[11px] font-semibold border border-error/40 text-error bg-error/5 hover:bg-error/10 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                ) : canApply(o) ? (
                  <button onClick={() => { setSelected(o); setNote(''); setModal('apply'); }}
                    className="w-full py-3 rounded-xl text-white text-[12px] font-semibold tracking-wide hover:-translate-y-0.5 transition-all duration-300"
                    style={{ background: 'linear-gradient(to right, var(--primary-container), var(--inverse-primary))', boxShadow: '0 4px 20px color-mix(in srgb, var(--primary-container) 20%, transparent)' }}>
                    Apply Now
                  </button>
                ) : (
                  <button disabled className="w-full py-3 rounded-xl bg-surface-variant text-outline text-[12px] font-semibold cursor-not-allowed flex items-center justify-center gap-2">
                    {!o.is_active ? <><span className="material-symbols-outlined text-[16px]">lock</span> Not Accepting Applications</> : <><span className="material-symbols-outlined text-[16px]">pause</span> Applications Paused</>}
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal isOpen={modal === 'apply'} onClose={() => setModal(null)} title={`Apply — ${selected?.company_name}`}>
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">Role: {selected?.role}</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note (optional)..." className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-2.5 px-3 text-on-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          <button onClick={apply} className="w-full py-2.5 rounded-lg text-sm font-semibold text-on-primary-container" style={{ background: 'linear-gradient(to right, var(--primary-container), var(--secondary-container))' }}>Submit Application</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'withdraw'} onClose={() => { setModal(null); setWithdrawTarget(null); }} title="Withdraw Application">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to withdraw your application from <strong className="text-on-surface">{withdrawTarget?.company_name}</strong>? You can re-apply later.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setModal(null); setWithdrawTarget(null); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-variant/30 transition-colors">
              Keep Application
            </button>
            <button onClick={withdraw}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors">
              Yes, Withdraw
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
