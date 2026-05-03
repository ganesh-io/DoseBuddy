import { useState, useEffect } from 'react';

export default function ISTClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-sm tracking-wider text-on-surface-variant" style={{ textShadow: '0 0 8px var(--primary-container)' }}>
      {time} <span className="text-[10px] text-outline opacity-60">IST</span>
    </span>
  );
}
