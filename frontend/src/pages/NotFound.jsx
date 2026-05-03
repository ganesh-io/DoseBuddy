import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { document.title = 'DoseBuddy — Page Not Found'; }, []);

  const goHome = () => {
    if (user) navigate(role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="text-center max-w-md">
        <div className="text-8xl mb-4">🌌</div>
        <h1 className="font-display text-7xl font-bold text-on-surface mb-4">404</h1>
        <p className="text-xl text-on-surface-variant mb-2">Page not found</p>
        <p className="text-sm text-outline mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={goHome} className="px-8 py-3 rounded-full font-semibold text-sm text-on-primary-container" style={{background:'linear-gradient(to right, var(--primary-container), var(--secondary-container))'}}>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">home</span> Go to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
}
