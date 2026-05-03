import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const profileImg = localStorage.getItem(`profile_img_${user?.st_id || user?.rec_id || user?.id}`) || null;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  const profileRoute = role === 'student' ? '/student/portfolio' : '/recruiter/profile';

  const groups = [
    [
      { label: 'My Profile', icon: 'person', action: () => navigate(profileRoute) },
      { label: 'Settings', icon: 'settings', action: () => navigate('/settings') },
    ],
    [
      { label: 'Help', icon: 'help', action: () => navigate('/help') },
      { label: 'About DoseBuddy', icon: 'info', action: () => navigate('/about') },
    ],
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-primary transition-colors flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 text-on-surface font-display font-bold text-sm">
        {profileImg ? <img src={profileImg} alt="" className="w-full h-full object-cover" /> : initial}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay to catch outside clicks */}
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'transparent'
              }}
              onClick={() => setOpen(false)}
            />
            <motion.div initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}} transition={{duration:0.15}}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 9999,
                width: '220px',
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                marginTop: '8px'
              }}>
            {/* User info header */}
            <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden" style={{background:'linear-gradient(135deg, var(--primary-container), var(--secondary-container))'}}>
                {profileImg ? <img src={profileImg} alt="" className="w-full h-full object-cover"/> : initial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-on-surface truncate">{user?.name||'User'}</div>
                <div className="text-[10px] text-outline uppercase tracking-wider">{role}</div>
              </div>
            </div>

            {/* Menu groups */}
            {groups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'border-t border-outline-variant/20' : ''}>
                {group.map(item => (
                  <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 flex items-center gap-3 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            ))}

            {/* Logout */}
            <div className="border-t border-outline-variant/20">
              <button onClick={() => { logout(); navigate('/'); setOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/10 flex items-center gap-3 transition-colors">
                <span className="material-symbols-outlined text-[18px]">logout</span>Logout
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
