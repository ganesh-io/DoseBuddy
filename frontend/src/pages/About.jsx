import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

const team = [
  { name:'Yaswanth', id:'S101', role:'Full Stack Developer & DB Architect', skills:['React','Node.js','MySQL','Python'], github:'github.com/yaswanth', quote:'Built this to solve real problems we face every day', emoji:'⚡' },
  { name:'Sai Ganesh', id:'S102', role:'Frontend Developer & UI Designer', skills:['React','Java','MySQL','DSA'], github:'github.com/ganesh-io', linkedin:'linkedin.com/in/saiganesh-s', quote:'Design is not just how it looks — it\'s how it works', emoji:'🔥' },
];

const techStack = ['MySQL','React 18','Node.js','Express','Vite','Framer Motion','JWT','bcryptjs','TailwindCSS'];

export default function About() {
  useEffect(() => { document.title = 'DoseBuddy — About'; }, []);

  return (
    <PageWrapper className="p-6 md:p-12 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[100px] -z-10" style={{background:'color-mix(in srgb, var(--primary) 15%, transparent)'}}/>
        <motion.div animate={{rotate:[0,5,-5,0]}} transition={{repeat:Infinity,duration:4}} className="text-6xl mb-4">🎓</motion.div>
        <h1 className="font-display text-5xl font-bold text-on-surface mb-3">DoseBuddy</h1>
        <p className="text-xl text-on-surface-variant max-w-xl mx-auto">A student-first platform built at SRM Institute of Science and Technology</p>
        <div className="mt-4 flex justify-center gap-2">
          {['💻','📊','🤝','🚀'].map((e,i) => <motion.span key={i} animate={{y:[0,-6,0]}} transition={{repeat:Infinity,delay:i*0.2,duration:1.5}} className="text-2xl">{e}</motion.span>)}
        </div>
      </div>

      {/* Team */}
      <h2 className="font-display text-3xl font-semibold text-on-surface text-center mb-8">Built By</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {team.map(m => (
          <motion.div key={m.id} whileHover={{scale:1.02}} className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(to right, var(--primary), var(--secondary))'}}/>
            <motion.div animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:2}} className="text-5xl mb-4">{m.emoji}</motion.div>
            <h3 className="font-display text-2xl font-bold text-on-surface">{m.name}</h3>
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary mt-2 mb-1">{m.id} · CSE Year 2</span>
            <p className="text-sm text-on-surface-variant mb-4">{m.role}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {m.skills.map(s => <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container border border-outline-variant text-on-surface">{s}</span>)}
            </div>
            <p className="text-sm text-on-surface-variant italic mb-4">"{m.quote}"</p>
            <div className="flex justify-center gap-3">
              <a href={`https://${m.github}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">code</span>{m.github}</a>
              {m.linkedin && <a href={`https://${m.linkedin}`} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">link</span>LinkedIn</a>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Info */}
      <div className="glass-panel rounded-2xl p-8 mb-8">
        <h2 className="font-display text-2xl font-semibold text-on-surface mb-6 text-center">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{l:'Platform',v:'DoseBuddy V2'},{l:'Version',v:'2.0.0'},{l:'Stack',v:'React + Node + MySQL'},{l:'Batch',v:'2024 – 2028'}].map(({l,v}) => (
            <div key={l} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{l}</div>
              <div className="text-sm font-medium text-on-surface">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-semibold text-on-surface mb-4">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {techStack.map((t,i) => (
            <motion.span key={t} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:i*0.08}}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 border border-primary/20 text-primary">{t}</motion.span>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="glass-panel rounded-xl p-6 text-center">
        <p className="font-display text-lg font-semibold text-on-surface">v2.0 · May 2025</p>
        <p className="text-sm text-on-surface-variant mt-1">Built with ❤️ for DBMS</p>
      </div>
    </PageWrapper>
  );
}
