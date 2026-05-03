import { useTheme, themes } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const THEME_PREVIEWS = {
  Midnight: { bg:'#07071a', card:'#0e0e2a', acc:'#7c6ef8', txt:'#e8e8ff' },
  Sakura:   { bg:'#12000a', card:'#1e0012', acc:'#ff6eb4', txt:'#ffe0f0' },
  Hacker:   { bg:'#000000', card:'#001200', acc:'#00ff41', txt:'#00ff41' },
  Amber:    { bg:'#0d0800', card:'#1a1000', acc:'#ffb020', txt:'#fff3d0' },
  Arctic:   { bg:'#eef2f7', card:'#ffffff', acc:'#2563eb', txt:'#0f172a' },
  Aurora:   { bg:'#030b18', card:'#071525', acc:'#a78bfa', txt:'#e0e8ff' },
};

export default function ThemeSwitcher({ onClose }) {
  const { themeName, switchTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(themes).map(([key, theme]) => {
        const isActive = themeName === key;
        const p = THEME_PREVIEWS[key] || THEME_PREVIEWS.Midnight;
        return (
          <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { switchTheme(key); onClose?.(); }}
            style={{
              borderRadius: 12, overflow: 'hidden',
              border: isActive ? `2px solid ${p.acc}` : '2px solid rgba(255,255,255,0.08)',
              boxShadow: isActive ? `0 0 20px ${p.acc}55` : 'none',
              outline: 'none', textAlign: 'left', cursor: 'pointer',
              position: 'relative', transition: 'all 0.15s ease',
            }}
          >
            {/* Preview (100% hardcoded hex) */}
            <div style={{ background: p.bg, height: 100, borderRadius: '10px 10px 0 0', padding: 10, display: 'flex', gap: 6 }}>
              <div style={{ width: 24, background: p.card, borderRadius: 4, display: 'flex', flexDirection: 'column', padding: 4, gap: 3 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 3, borderRadius: 2, background: i === 1 ? p.acc : p.txt + '44' }}/>
                ))}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ height: 6, width: '70%', borderRadius: 3, background: p.txt + '55' }}/>
                <div style={{ flex: 1, borderRadius: 4, background: p.card, border: `1px solid ${p.acc}44` }}/>
                <div style={{ height: 12, width: '45%', borderRadius: 10, background: p.acc }}/>
              </div>
            </div>
            {/* Info */}
            <div style={{ padding: '8px 12px', background: p.card }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: p.txt, fontSize: 13 }}>{theme.label}</div>
              <div style={{ fontSize: 10, color: p.txt + '88', marginTop: 2 }}>{theme.desc}</div>
            </div>
            {isActive && (
              <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: p.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
