import { createContext, useContext, useState, useEffect } from 'react';

// 6 dramatically different themes — each with unique button radius
export const themes = {
  'Midnight': {
    label: 'Midnight', desc: 'Deep indigo darkness',
    preview: { bg:'#07071a', card:'#0e0e2a', acc:'#7c6ef8', txt:'#e8e8ff' },
    vars: {
      '--background':'#07071a','--surface':'#0e0e2a','--surface-dim':'#07071a','--surface-bright':'#1e1e3a',
      '--surface-container-lowest':'#040412','--surface-container-low':'#090920','--surface-container':'#0e0e2a',
      '--surface-container-high':'#141430','--surface-container-highest':'#1a1a3d',
      '--surface-variant':'#16162e','--surface-tint':'#7c6ef8',
      '--on-surface':'#e8e8ff','--on-surface-variant':'#9090c0','--on-background':'#e8e8ff',
      '--primary':'#7c6ef8','--primary-container':'#4338ca','--primary-fixed':'#c7d2fe','--primary-fixed-dim':'#7c6ef8',
      '--on-primary':'#ffffff','--on-primary-container':'#e0e7ff','--on-primary-fixed':'#1e1b4b','--inverse-primary':'#4338ca',
      '--secondary':'#a78bfa','--secondary-container':'#5b21b6','--secondary-fixed':'#ddd6fe','--secondary-fixed-dim':'#a78bfa',
      '--on-secondary':'#ffffff','--on-secondary-container':'#ede9fe','--on-secondary-fixed':'#2e1065',
      '--tertiary':'#38bdf8','--tertiary-container':'#0369a1','--tertiary-fixed':'#bae6fd','--tertiary-fixed-dim':'#38bdf8',
      '--on-tertiary':'#ffffff','--on-tertiary-container':'#e0f2fe',
      '--outline':'#475569','--outline-variant':'rgba(124,110,248,0.15)',
      '--error':'#f87171','--error-container':'#7f1d1d','--on-error':'#ffffff','--on-error-container':'#fee2e2',
      '--inverse-surface':'#e8e8ff','--inverse-on-surface':'#07071a',
      '--accent':'#7c6ef8','--sidebar-bg':'#090920','--btn-r':'10px',
    }
  },
  'Sakura': {
    label: 'Sakura', desc: 'Cherry blossom night',
    preview: { bg:'#12000a', card:'#1e0012', acc:'#ff6eb4', txt:'#ffe0f0' },
    vars: {
      '--background':'#12000a','--surface':'#1e0012','--surface-dim':'#12000a','--surface-bright':'#3d1830',
      '--surface-container-lowest':'#0a0006','--surface-container-low':'#160009','--surface-container':'#1e0012',
      '--surface-container-high':'#280018','--surface-container-highest':'#320020',
      '--surface-variant':'#220015','--surface-tint':'#ff6eb4',
      '--on-surface':'#ffe0f0','--on-surface-variant':'#cc88aa','--on-background':'#ffe0f0',
      '--primary':'#ff6eb4','--primary-container':'#be185d','--primary-fixed':'#fce7f3','--primary-fixed-dim':'#ff6eb4',
      '--on-primary':'#ffffff','--on-primary-container':'#fce7f3','--on-primary-fixed':'#500724','--inverse-primary':'#9d174d',
      '--secondary':'#ff9ed2','--secondary-container':'#831843','--secondary-fixed':'#fce7f3','--secondary-fixed-dim':'#ff9ed2',
      '--on-secondary':'#ffffff','--on-secondary-container':'#fce7f3','--on-secondary-fixed':'#500724',
      '--tertiary':'#c084fc','--tertiary-container':'#7e22ce','--tertiary-fixed':'#f3e8ff','--tertiary-fixed-dim':'#c084fc',
      '--on-tertiary':'#ffffff','--on-tertiary-container':'#f3e8ff',
      '--outline':'#6b3a55','--outline-variant':'rgba(255,110,180,0.18)',
      '--error':'#fb7185','--error-container':'#881337','--on-error':'#ffffff','--on-error-container':'#ffe4e6',
      '--inverse-surface':'#ffe0f0','--inverse-on-surface':'#12000a',
      '--accent':'#ff6eb4','--sidebar-bg':'#160009','--btn-r':'999px',
    }
  },
  'Hacker': {
    label: 'Hacker', desc: 'Matrix terminal green',
    preview: { bg:'#000000', card:'#001200', acc:'#00ff41', txt:'#00ff41' },
    vars: {
      '--background':'#000000','--surface':'#001200','--surface-dim':'#000000','--surface-bright':'#0f2a0f',
      '--surface-container-lowest':'#000000','--surface-container-low':'#000a00','--surface-container':'#001200',
      '--surface-container-high':'#0f1a0f','--surface-container-highest':'#152215',
      '--surface-variant':'#0a1f0a','--surface-tint':'#00ff41',
      '--on-surface':'#00ff41','--on-surface-variant':'#008822','--on-background':'#00ff41',
      '--primary':'#00ff41','--primary-container':'#004d00','--primary-fixed':'#b9f6ca','--primary-fixed-dim':'#00ff41',
      '--on-primary':'#000000','--on-primary-container':'#00ff41','--on-primary-fixed':'#002200','--inverse-primary':'#006600',
      '--secondary':'#00cc33','--secondary-container':'#003d00','--secondary-fixed':'#b9f6ca','--secondary-fixed-dim':'#00cc33',
      '--on-secondary':'#000000','--on-secondary-container':'#00ff41','--on-secondary-fixed':'#001a00',
      '--tertiary':'#39ff14','--tertiary-container':'#004d00','--tertiary-fixed':'#b9f6ca','--tertiary-fixed-dim':'#39ff14',
      '--on-tertiary':'#000000','--on-tertiary-container':'#00ff41',
      '--outline':'#006600','--outline-variant':'rgba(0,255,65,0.2)',
      '--error':'#ff3333','--error-container':'#4d0000','--on-error':'#ffffff','--on-error-container':'#ffcccc',
      '--inverse-surface':'#00ff41','--inverse-on-surface':'#000000',
      '--accent':'#00ff41','--sidebar-bg':'#000a00','--btn-r':'2px',
    }
  },
  'Amber': {
    label: 'Amber', desc: 'Warm whiskey night',
    preview: { bg:'#0d0800', card:'#1a1000', acc:'#ffb020', txt:'#fff3d0' },
    vars: {
      '--background':'#0d0800','--surface':'#1a1000','--surface-dim':'#0d0800','--surface-bright':'#2d2200',
      '--surface-container-lowest':'#080500','--surface-container-low':'#120900','--surface-container':'#1a1000',
      '--surface-container-high':'#221800','--surface-container-highest':'#2d2200',
      '--surface-variant':'#1f1800','--surface-tint':'#ffb020',
      '--on-surface':'#fff3d0','--on-surface-variant':'#aa8840','--on-background':'#fff3d0',
      '--primary':'#ffb020','--primary-container':'#92400e','--primary-fixed':'#fef3c7','--primary-fixed-dim':'#ffb020',
      '--on-primary':'#000000','--on-primary-container':'#fef3c7','--on-primary-fixed':'#451a03','--inverse-primary':'#b45309',
      '--secondary':'#ffd060','--secondary-container':'#78350f','--secondary-fixed':'#fef9c3','--secondary-fixed-dim':'#ffd060',
      '--on-secondary':'#000000','--on-secondary-container':'#fef9c3','--on-secondary-fixed':'#422006',
      '--tertiary':'#fb923c','--tertiary-container':'#9a3412','--tertiary-fixed':'#ffedd5','--tertiary-fixed-dim':'#fb923c',
      '--on-tertiary':'#000000','--on-tertiary-container':'#ffedd5',
      '--outline':'#78550a','--outline-variant':'rgba(255,176,32,0.18)',
      '--error':'#f87171','--error-container':'#7f1d1d','--on-error':'#ffffff','--on-error-container':'#fee2e2',
      '--inverse-surface':'#fff3d0','--inverse-on-surface':'#0d0800',
      '--accent':'#ffb020','--sidebar-bg':'#120900','--btn-r':'8px',
    }
  },
  'Arctic': {
    label: 'Arctic Pro', desc: 'Clean light professional',
    preview: { bg:'#eef2f7', card:'#ffffff', acc:'#2563eb', txt:'#0f172a' },
    vars: {
      '--background':'#eef2f7','--surface':'#ffffff','--surface-dim':'#e2e8f0','--surface-bright':'#ffffff',
      '--surface-container-lowest':'#ffffff','--surface-container-low':'#f8fafc','--surface-container':'#ffffff',
      '--surface-container-high':'#e2e8f0','--surface-container-highest':'#cbd5e1',
      '--surface-variant':'#e2e8f0','--surface-tint':'#2563eb',
      '--on-surface':'#0f172a','--on-surface-variant':'#64748b','--on-background':'#0f172a',
      '--primary':'#2563eb','--primary-container':'#dbeafe','--primary-fixed':'#dbeafe','--primary-fixed-dim':'#2563eb',
      '--on-primary':'#ffffff','--on-primary-container':'#1e3a5f','--on-primary-fixed':'#1e3a5f','--inverse-primary':'#93c5fd',
      '--secondary':'#3b82f6','--secondary-container':'#bfdbfe','--secondary-fixed':'#dbeafe','--secondary-fixed-dim':'#3b82f6',
      '--on-secondary':'#ffffff','--on-secondary-container':'#1e3a5f','--on-secondary-fixed':'#1e3a5f',
      '--tertiary':'#0ea5e9','--tertiary-container':'#e0f2fe','--tertiary-fixed':'#e0f2fe','--tertiary-fixed-dim':'#0ea5e9',
      '--on-tertiary':'#ffffff','--on-tertiary-container':'#0c4a6e',
      '--outline':'#94a3b8','--outline-variant':'rgba(37,99,235,0.1)',
      '--error':'#dc2626','--error-container':'#fee2e2','--on-error':'#ffffff','--on-error-container':'#991b1b',
      '--inverse-surface':'#1e293b','--inverse-on-surface':'#f8fafc',
      '--accent':'#2563eb','--sidebar-bg':'#f8fafc','--btn-r':'8px',
    }
  },
  'Aurora': {
    label: 'Aurora', desc: 'Northern lights dream',
    preview: { bg:'#030b18', card:'#071525', acc:'#a78bfa', txt:'#e0e8ff' },
    vars: {
      '--background':'#030b18','--surface':'#071525','--surface-dim':'#030b18','--surface-bright':'#1a2d4a',
      '--surface-container-lowest':'#010814','--surface-container-low':'#050f1e','--surface-container':'#071525',
      '--surface-container-high':'#0e1e35','--surface-container-highest':'#142642',
      '--surface-variant':'#0e1e35','--surface-tint':'#a78bfa',
      '--on-surface':'#e0e8ff','--on-surface-variant':'#7088aa','--on-background':'#e0e8ff',
      '--primary':'#a78bfa','--primary-container':'#4338ca','--primary-fixed':'#c7d2fe','--primary-fixed-dim':'#a78bfa',
      '--on-primary':'#ffffff','--on-primary-container':'#e0e7ff','--on-primary-fixed':'#1e1b4b','--inverse-primary':'#4f46e5',
      '--secondary':'#34d399','--secondary-container':'#065f46','--secondary-fixed':'#a7f3d0','--secondary-fixed-dim':'#34d399',
      '--on-secondary':'#ffffff','--on-secondary-container':'#a7f3d0','--on-secondary-fixed':'#022c22',
      '--tertiary':'#818cf8','--tertiary-container':'#3730a3','--tertiary-fixed':'#c7d2fe','--tertiary-fixed-dim':'#818cf8',
      '--on-tertiary':'#ffffff','--on-tertiary-container':'#c7d2fe',
      '--outline':'#2d4a6a','--outline-variant':'rgba(167,139,250,0.15)',
      '--error':'#fca5a5','--error-container':'#7f1d1d','--on-error':'#450a0a','--on-error-container':'#fee2e2',
      '--inverse-surface':'#e0e8ff','--inverse-on-surface':'#030b18',
      '--accent':'#a78bfa','--sidebar-bg':'#050f1e','--btn-r':'10px',
    }
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('db_theme');
    if (saved && themes[saved]) return saved;
    return 'Midnight';
  });

  useEffect(() => {
    const t = themes[themeName];
    if (t?.vars) {
      Object.entries(t.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      localStorage.setItem('db_theme', themeName);
    }
  }, [themeName]);

  const switchTheme = (name) => {
    if (themes[name]) setThemeName(name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, switchTheme, themeList: Object.keys(themes), themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
