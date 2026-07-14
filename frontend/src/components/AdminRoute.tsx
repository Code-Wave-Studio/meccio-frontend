import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser } from '@/lib/adminAuth';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb]">
        <div className="w-8 h-8 border-2 border-[#c4a962] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
