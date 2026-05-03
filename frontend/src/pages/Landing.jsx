import { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/axios';

const steps = [
  { num: '01', icon: 'person_add', title: 'Register', desc: 'Create your student account using your institutional credentials to enter the ecosystem.' },
  { num: '02', icon: 'dashboard_customize', title: 'Build Portfolio', desc: 'Showcase your projects and achievements in a high-end, digital-native gallery.' },
  { num: '03', icon: 'swap_horiz', title: 'Exchange Skills', desc: 'Connect with peers to trade knowledge in a vibrant, futuristic marketplace.' },
  { num: '04', icon: 'handshake', title: 'Get Matched', desc: 'Let our system connect you with top companies seeking your specific skill set.' },
];

const testimonials = [
  { name: 'Yaswanth', dept: 'CSE', quote: "DoseBuddy completely transformed how I present my skills. I landed my dream internship through the company portal. The skill exchange feature helped me learn React from a peer while I taught them Python!", avatar: '⚡' },
  { name: 'Sai Ganesh', dept: 'CSE', quote: "The portfolio builder is incredible — recruiters can see everything at a glance. I got shortlisted by 3 companies within my first week. The matching algorithm is seriously smart.", avatar: '🔥' },
  { name: 'Priya Sharma', dept: 'ECE', quote: "As a non-CS student, I was nervous about competing. But the skill exchange let me trade my circuit design knowledge for web development skills. Now I have a full-stack portfolio!", avatar: '✨' },
];

const featuredCompanies = ['TCS', 'Google', 'Infosys', 'Freshworks', 'Zoho', 'Microsoft', 'Amazon', 'Wipro'];

const typewriterTexts = ['Building Portfolios...', 'Connecting Skills...', 'Matching Companies...', 'Empowering Students...'];

function useTypewriter(texts, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIndex(c => c + 1);
        }
      } else {
        setDisplay(current.slice(0, charIndex));
        if (charIndex === 0) {
          setDeleting(false);
          setIndex((index + 1) % texts.length);
        } else {
          setCharIndex(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, index, texts, speed, pause]);

  return display;
}

function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(Math.floor(duration / end), 15);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const [showTop, setShowTop] = useState(false);
  const [liveStats, setLiveStats] = useState({ students: 8, companies: 50, skills: 20, exchanges: 4 });
  const [activeSection, setActiveSection] = useState('');
  const heroRef = useRef(null);
  const howRef = useRef(null);
  const statsRef = useRef(null);
  const testRef = useRef(null);
  const howInView = useInView(howRef, { once: true, margin: '-100px' });
  const testInView = useInView(testRef, { once: true, margin: '-100px' });
  const typewriter = useTypewriter(typewriterTexts);

  // Get started → redirect if logged in
  const handleGetStarted = useCallback(() => {
    if (user) navigate(role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    else navigate('/auth');
  }, [user, role, navigate]);

  useEffect(() => {
    const handler = (e) => setGlow({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 200);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { document.title = 'DoseBuddy — Your Portfolio. Your Skills. Your Future.'; }, []);

  // Scroll spy for active nav highlighting
  useEffect(() => {
    const handler = () => {
      const sections = ['how-it-works', 'stats', 'testimonials', 'companies'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom > 200) { setActiveSection(id); return; }
        }
      }
      setActiveSection('');
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Live stats
  useEffect(() => {
    API.get('/companies/stats/live').then(r => setLiveStats(r.data)).catch(() => {});
  }, []);

  const navItems = [
    { label: 'How it Works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'Stats', href: '#stats', id: 'stats' },
    { label: 'Testimonials', href: '#testimonials', id: 'testimonials' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container scroll-smooth">
      {/* Cursor Glow */}
      <div className="fixed pointer-events-none z-0 w-[400px] h-[400px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', left: glow.x - 200, top: glow.y - 200, transition: 'left 0.1s, top 0.1s' }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 shadow-xl" style={{ background: 'color-mix(in srgb, var(--background) 85%, transparent)', backdropFilter: 'blur(16px)' }}>
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3"><span className="font-display text-[24px] md:text-[28px] font-bold" style={{ color: 'var(--accent)' }}>DoseBuddy</span></Link>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a key={item.id} href={item.href}
                className={`text-sm font-medium transition-colors ${activeSection === item.id ? 'font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                style={activeSection === item.id ? { color: 'var(--accent)' } : {}}>{item.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleGetStarted}
              className="hidden md:flex relative overflow-hidden button-gradient text-surface-container-lowest font-bold px-6 py-2 rounded-full items-center gap-2 text-sm group">
              <span className="relative z-10">{user ? 'Go to Portal' : 'Get Started'}</span>
              <span className="material-symbols-outlined text-sm relative z-10">arrow_forward</span>
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>
            <button className="md:hidden text-on-surface" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="material-symbols-outlined text-[28px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-surface border-b border-white/5">
              <div className="flex flex-col px-6 py-4 gap-4">
                {navItems.map(item => (
                  <a key={item.id} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-on-surface-variant hover:text-on-surface py-2 border-b border-white/5">{item.label}</a>
                ))}
                <button onClick={handleGetStarted} className="w-full button-gradient text-surface-container-lowest font-bold px-6 py-3 rounded-xl mt-2">
                  {user ? 'Go to Portal' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <header ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] -z-10" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 25%, transparent) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] -z-10" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 15%, transparent) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-[64px] font-bold text-on-surface mb-4 leading-tight">
              Your Portfolio. <br className="hidden md:block" />
              <span className="hero-gradient-text">Your Skills.</span> Your Future.
            </h1>
            {/* Typewriter subtitle */}
            <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto h-8 flex items-center justify-center gap-1">
              <span className="font-mono" style={{ color: 'var(--accent)' }}>{typewriter}</span>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-0.5 h-5 inline-block" style={{ background: 'var(--accent)' }} />
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {/* Shimmer CTA */}
              <button onClick={handleGetStarted}
                className="relative overflow-hidden button-gradient text-surface-container-lowest font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all group">
                <span className="relative z-10">{user ? 'Go to Portal' : 'Get Started'}</span>
                <span className="material-symbols-outlined text-sm relative z-10">arrow_forward</span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} />
              </button>
              <a href="#how-it-works" className="glass-panel px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-surface-variant text-on-surface font-semibold transition-all">
                Learn More <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Live Stats Section */}
      <section id="stats" ref={statsRef} className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Students', value: liveStats.students, icon: 'school', suffix: '' },
            { label: 'Companies', value: liveStats.companies, icon: 'business', suffix: '+' },
            { label: 'Skills', value: liveStats.skills, icon: 'psychology', suffix: '+' },
            { label: 'Active Since', value: 2025, icon: 'event', suffix: '' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-xl p-6 text-center hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl mb-3" style={{ color: 'var(--accent)', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <div className="font-display text-4xl font-bold text-on-surface"><CountUp end={s.value} />{s.suffix}</div>
              <div className="text-xs text-outline uppercase tracking-widest mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why DoseBuddy? */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-on-surface mb-4">Why DoseBuddy?</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">The ultimate platform designed specifically for the modern academic ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'target', emoji: '🎯', title: 'Smart Matching', desc: 'Our algorithm connects you to companies and peers based on your exact skill proficiencies.' },
              { icon: 'handshake', emoji: '🤝', title: 'Peer Learning', desc: 'Exchange knowledge directly with other students through structured, recorded sessions.' },
              { icon: 'business', emoji: '🏢', title: 'Direct Hiring', desc: 'Skip the generic job boards. Get recruited straight out of your university portfolio.' }
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                className="glass-panel rounded-[24px] p-8 text-center hover:border-primary/50 transition-colors">
                <div className="text-5xl mb-6">{f.emoji}</div>
                <h3 className="font-display text-2xl font-bold text-on-surface mb-3">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howRef} className="py-24 bg-surface-container-lowest relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-on-surface mb-4">How It Works</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">A seamless journey from setting up your profile to landing your next opportunity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} animate={howInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-panel rounded-xl p-8 flex flex-col relative group hover:scale-[1.02] transition-all duration-300">
                <div className="absolute -top-4 -right-4 text-6xl font-display font-bold text-surface-variant opacity-20 group-hover:opacity-40 transition-opacity">{step.num}</div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface mb-3">{step.title}</h3>
                <p className="text-sm text-on-surface-variant">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testRef} className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-on-surface mb-4">What Students Say</h2>
            <p className="text-on-surface-variant">Real experiences from the DoseBuddy community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} animate={testInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.15 }}
                className="glass-panel rounded-xl p-8 flex flex-col relative group">
                <div className="text-4xl mb-4">{t.avatar}</div>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="mt-6 pt-4 border-t border-outline-variant/20">
                  <h4 className="font-display font-bold text-on-surface">{t.name}</h4>
                  <p className="text-xs text-outline">{t.dept} Department</p>
                </div>
                <div className="flex gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[16px]" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>star</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section id="companies" className="py-16 bg-surface-container-lowest relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-outline uppercase tracking-widest mb-8">Trusted By Top Companies</p>
          <div className="flex flex-wrap justify-center gap-4">
            {featuredCompanies.map(c => (
              <motion.div key={c} whileHover={{ scale: 1.05 }}
                className="glass-panel px-6 py-3 rounded-full text-sm font-semibold text-on-surface-variant border border-outline-variant/30 hover:border-primary/50 hover:text-on-surface transition-colors cursor-default">
                {c}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 mt-auto" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <span className="font-display text-lg font-bold" style={{ color: 'var(--accent)' }}>DoseBuddy</span>
            <p className="text-sm text-outline">Empowering your academic journey.</p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-outline">
              <span>dosebuddy.app@gmail.com</span><span>+91-9876543210</span><span>Chennai</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-sm text-on-surface uppercase tracking-wider mb-2 font-display">Platform</h4>
            <Link to="/about" className="text-sm text-outline hover:text-[var(--accent)] transition-colors">About Us</Link>
            <Link to="/help" className="text-sm text-outline hover:text-[var(--accent)] transition-colors">Help Center</Link>
            <Link to="/auth" className="text-sm text-outline hover:text-[var(--accent)] transition-colors">Student Login</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-sm text-on-surface uppercase tracking-wider mb-2 font-display">Connect</h4>
            <a href="https://github.com/dosebuddy" target="_blank" rel="noreferrer" className="text-sm hover:text-[var(--accent)] transition-colors flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <span className="material-symbols-outlined text-[16px]">code</span> GitHub
            </a>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 px-6 md:px-12 text-center flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
          <p className="text-sm text-outline font-display">© 2025 DoseBuddy. Empowering your academic journey.</p>
          <p className="text-xs text-outline">Created with ♥ for SRM Institute Students</p>
        </div>
      </footer>

      {/* Back to top FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={showTop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center z-50 shadow-lg hover:scale-110 transition-transform"
        style={{ background: 'var(--accent)' }}>
        <span className="material-symbols-outlined text-white">arrow_upward</span>
      </motion.button>
    </div>
  );
}
