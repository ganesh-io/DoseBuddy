import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  if (allowedRole && role !== allowedRole) {
    const redirect = role === 'student' ? '/student/dashboard' : '/recruiter/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
