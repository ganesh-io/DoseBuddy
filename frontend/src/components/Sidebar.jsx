import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const studentLinks = [
  { to: '/student/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/student/portfolio', icon: 'account_circle', label: 'Portfolio' },
  { to: '/student/exchange', icon: 'swap_horiz', label: 'Skill Exchange' },
  { to: '/student/matches', icon: 'handshake', label: 'Skill Sessions' },
  { to: '/student/companies', icon: 'business', label: 'Companies' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/recruiter/profile', icon: 'person', label: 'Profile' },
  { to: '/recruiter/candidates', icon: 'person_search', label: 'Find Candidates' },
  { to: '/recruiter/shortlisted', icon: 'bookmark', label: 'Shortlisted' },
  { to: '/recruiter/openings', icon: 'work', label: 'Openings' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'recruiter' ? recruiterLinks : studentLinks;

  const profileImg = (() => {
    const id = user?.st_id || user?.rec_id || user?.id;
    return localStorage.getItem(`profile_img_${id}`) || null;
  })();

  return (
    <nav className="fixed left-0 top-0 h-screen w-[260px] border-r flex flex-col py-8 z-50 shadow-2xl" style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--outline-variant)' }}>
      {/* Brand */}
      <div className="px-6 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <h1 className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent)' }}>DoseBuddy</h1>
        <p className="text-xs mt-1 uppercase tracking-widest" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--outline)' }}>Academic Ecosystem</p>
      </div>

      {/* User */}
      <div className="px-6 mb-8 flex items-center gap-3">
        {profileImg ? (
          <img src={profileImg} alt="" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: 'var(--outline-variant)' }} />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2" style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--secondary-container))', borderColor: 'var(--outline-variant)' }}>
            {(user?.name || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--on-surface)' }}>{user?.name}</div>
          <div className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--outline)' }}>{role}</div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1">
        {links.map(link => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 py-3 px-6 transition-all duration-300 font-medium text-sm tracking-wide relative border-l-4 ${
                isActive ? 'text-white bg-gradient-to-r from-[var(--accent)]/10 to-transparent' : 'border-transparent hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? 'var(--on-surface)' : 'var(--outline)',
            })}
          >
            {({ isActive }) => (<>
              <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1", color: 'var(--accent)' } : {}}>{link.icon}</span>
              <span className={isActive ? 'font-bold' : ''}>{link.label}</span>
            </>)}
          </NavLink>
        ))}
      </div>

      {/* Bottom: Help + Logout */}
      <div className="mx-6 my-2" style={{ borderTop: '1px solid var(--outline-variant)' }} />
      <NavLink to="/help"
        className="flex items-center gap-4 py-2.5 px-6 transition-all duration-300 font-display text-sm tracking-wide"
        style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--outline)' })}>
        <span className="material-symbols-outlined text-[18px]">help</span>
        <span>Help & Support</span>
      </NavLink>
      <button onClick={() => { logout(); navigate('/'); }}
        className="flex items-center gap-4 py-2.5 px-6 transition-all duration-300 font-display font-medium text-sm tracking-wide hover:bg-white/5 w-full"
        style={{ color: 'var(--outline)' }}>
        <span className="material-symbols-outlined text-[20px]">logout</span>Logout
      </button>
    </nav>
  );
}
