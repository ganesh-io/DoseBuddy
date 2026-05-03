import { useState } from 'react';
import ISTClock from './ISTClock';
import ProfileDropdown from './ProfileDropdown';
import ThemeSwitcher from './ThemeSwitcher';
import Modal from './Modal';

export default function Navbar() {
  const [showTheme, setShowTheme] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 border-b border-white/5 z-40 flex justify-between items-center px-8" style={{ background: 'color-mix(in srgb, var(--sidebar-bg) 80%, transparent)', backdropFilter: 'blur(20px)' }}>
        <div className="font-display font-bold text-lg" style={{ color: 'var(--accent)' }}>DoseBuddy</div>
        <div className="flex items-center gap-6">
          <ISTClock />
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <button onClick={() => setShowTheme(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--accent)] transition-colors hover:bg-surface-variant/50">
              <span className="material-symbols-outlined">palette</span>
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <Modal isOpen={showTheme} onClose={() => setShowTheme(false)} title="Choose Theme">
        <ThemeSwitcher onClose={() => setShowTheme(false)} />
      </Modal>
    </>
  );
}
