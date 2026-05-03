import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StatCard({ label, value, icon, color = 'primary', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplayValue(0); return; }
    const duration = 800;
    const stepTime = Math.max(Math.floor(duration / end), 20);
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    accent: 'text-primary-container',
  };

  const bgMap = {
    primary: 'bg-primary/5 group-hover:bg-primary/10',
    secondary: 'bg-secondary/5 group-hover:bg-secondary/10',
    tertiary: 'bg-tertiary/5 group-hover:bg-tertiary/10',
    accent: 'bg-primary-container/5 group-hover:bg-primary-container/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      className="glass-panel p-6 rounded-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <div className={`absolute inset-0 ${bgMap[color]} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`material-symbols-outlined ${colorMap[color]} text-xl`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-3 relative z-10">
        <span className="font-display text-4xl font-semibold text-on-surface">{displayValue}</span>
      </div>
    </motion.div>
  );
}
