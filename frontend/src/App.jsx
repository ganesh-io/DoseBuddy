import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Help from './pages/Help';
import About from './pages/About';
import NotFound from './pages/NotFound';
import StudentDashboard from './pages/student/Dashboard';
import Portfolio from './pages/student/Portfolio';
import SkillExchange from './pages/student/SkillExchange';
import Matches from './pages/student/Matches';
import Companies from './pages/student/Companies';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import FindCandidates from './pages/recruiter/FindCandidates';
import Shortlisted from './pages/recruiter/Shortlisted';
import Openings from './pages/recruiter/Openings';
import Settings from './pages/Settings';

function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <Navbar />
        <main className="mt-16">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, role } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={user ? <Navigate to={role === 'student' ? '/student/dashboard' : '/recruiter/dashboard'} /> : <Landing />} />
        <Route path="/auth" element={user ? <Navigate to={role === 'student' ? '/student/dashboard' : '/recruiter/dashboard'} /> : <Auth />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student"><DashboardLayout /></ProtectedRoute>}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/portfolio" element={<Portfolio />} />
          <Route path="/student/exchange" element={<SkillExchange />} />
          <Route path="/student/matches" element={<Matches />} />
          <Route path="/student/companies" element={<Companies />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRole="recruiter"><DashboardLayout /></ProtectedRoute>}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/profile" element={<RecruiterProfile />} />
          <Route path="/recruiter/candidates" element={<FindCandidates />} />
          <Route path="/recruiter/shortlisted" element={<Shortlisted />} />
          <Route path="/recruiter/openings" element={<Openings />} />
        </Route>

        {/* Shared Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
