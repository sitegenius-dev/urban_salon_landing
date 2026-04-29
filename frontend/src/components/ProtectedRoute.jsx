import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={role === 'developer' ? '/developer/login' : '/admin/login'} replace />;
  }

  if (role && user.role !== role) {

    if (role === 'admin' && user.role === 'super_admin') return children;
    return <Navigate to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/developer'} replace />;
  }

  return children;
}
