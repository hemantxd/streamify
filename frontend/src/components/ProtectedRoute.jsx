import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-[9999]" style={{ background: 'linear-gradient(135deg, #0a0a1a, #12122a)' }}>
        <div className="w-10 h-10 border-[3px] border-white/10 border-t-[#667eea] rounded-full animate-spin" />
        <p className="text-white/80 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isOnboarded) {
    return <Navigate to="/onboard" replace />;
  }

  return children;
}