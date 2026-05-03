import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

const sections = [
  { title: 'Getting Started', icon: 'rocket_launch', items: [
    { q:'How to register as a student', a:'Go to the Auth page and click "Register". Fill in your SRM email, name, department, year, and password. The system automatically detects your role as a student based on your email domain.' },
    { q:'How to register as a recruiter', a:'Click "Register" on the Auth page and use your company email. Provide your company name, company size, and website. Recruiter accounts are auto-detected by non-.edu email domains.' },
    { q:'How to login and access your portal', a:'Enter your registered email and password on the Login tab. The system auto-detects whether you\'re a student or recruiter and redirects you to the correct dashboard.' },
  ]},
  { title: 'Student Features', icon: 'school', items: [
    { q:'How to build your portfolio', a:'Navigate to Portfolio from the sidebar. Add your skills (with proficiency levels), projects (with GitHub/live links), certificates, and internships. Upload a profile photo and add a summary to complete your portfolio.' },
    { q:'How to use Skill Exchange', a:'Go to Skill Exchange to create exchange requests. Specify what skill you want to learn and what you can offer. Browse other students\' requests and click "Connect" to propose a session with date, time, and optional Google Meet link.' },
    { q:'How to apply to companies', a:'Visit the Companies page to browse all openings. Cards show your eligibility based on CGPA and skills. Click "Apply Now" on eligible openings, add an optional note, and submit. Track your status from the same page.' },
    { q:'What is a Skill Match?', a:'When you create an exchange request (e.g., want React, offer Python) and another student has a complementary request (wants Python, offers React), the system finds a match. You\'ll see compatible matches highlighted in the Skill Exchange section.' },
  ]},
  { title: 'Recruiter Features', icon: 'business_center', items: [
    { q:'How to find candidates', a:'Use Find Candidates to search by skills, department, CGPA, or year. View detailed profiles with skill proficiencies, project counts, and certificates. Click "Shortlist" to add promising candidates to your pipeline.' },
    { q:'How to shortlist and schedule interviews', a:'Once shortlisted, candidates appear in your Shortlisted page. You can update their status, set interview dates, and track the entire hiring pipeline from Applied → Screening → Interview → Selected/Rejected.' },
    { q:'How to manage openings', a:'Go to Openings to view all job postings. Use "View Applicants" to see who applied. Pause openings temporarily or close them permanently. Reactivate anytime. Change applicant statuses directly from the applicants modal.' },
  ]},
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { document.title = 'DoseBuddy — Help Center'; }, []);

  const filtered = sections.map(s => ({
    ...s, items: s.items.filter(i => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase()))
  })).filter(s => s.items.length > 0);

  return (
    <PageWrapper className="p-6 md:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="material-symbols-outlined text-5xl mb-4" style={{color:'var(--accent)',fontVariationSettings:"'FILL' 1"}}>help</span>
        <h1 className="font-display text-4xl font-bold text-on-surface mb-3">Help Center</h1>
        <p className="text-on-surface-variant max-w-xl mx-auto mb-6">Find answers to common questions about DoseBuddy.</p>
        <div className="relative max-w-lg mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search help articles..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"/>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {filtered.map(section => (
          <section key={section.title}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-2xl" style={{color:'var(--accent)',fontVariationSettings:"'FILL' 1"}}>{section.icon}</span>
              <h2 className="font-display text-2xl font-semibold text-on-surface">{section.title}</h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item, i) => {
                const key = `${section.title}-${i}`;
                return (
                  <div key={key} className="glass-card rounded-xl overflow-hidden">
                    <button onClick={() => setExpanded(expanded===key?null:key)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-variant/30 transition-colors">
                      <span className="text-sm font-semibold text-on-surface flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[18px]">article</span>{item.q}
                      </span>
                      <motion.span animate={{rotate:expanded===key?180:0}} className="material-symbols-outlined text-outline text-[18px]">expand_more</motion.span>
                    </button>
                    <AnimatePresence>
                      {expanded===key && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}}>
                          <div className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-3">{item.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
        <div className="glass-panel rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-3xl text-primary mb-2" style={{fontVariationSettings:"'FILL' 1"}}>mail</span>
          <h3 className="font-display font-semibold text-on-surface mb-1">Email Support</h3>
          <p className="text-sm text-primary">dosebuddy.app@gmail.com</p>
        </div>
        <div className="glass-panel rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-3xl text-secondary mb-2" style={{fontVariationSettings:"'FILL' 1"}}>code</span>
          <h3 className="font-display font-semibold text-on-surface mb-1">GitHub</h3>
          <a href="https://github.com/dosebuddy" target="_blank" rel="noreferrer" className="text-sm text-secondary hover:underline">github.com/dosebuddy</a>
        </div>
      </div>
    </PageWrapper>
  );
}
