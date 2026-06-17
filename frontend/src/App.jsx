import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboard from './pages/Onboard';
import Home from './pages/Home';
import Communities from './pages/Communities';
import CommunityMembers from './pages/CommunityMembers';
import CommunityChat from './pages/CommunityChat';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import ProtectedRoute from './components/ProtectedRoute';

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-[9999]" style={{ background: 'linear-gradient(135deg, #0a0a1a, #12122a)' }}>
        <div className="w-10 h-10 border-[3px] border-white/10 border-t-[#667eea] rounded-full animate-spin" />
        <p className="text-white/80 text-sm">Loading...</p>
      </div>
    );
  }

  if (user) {
    if (!user.isOnboarded) return <Navigate to="/onboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/onboard" element={<Onboard />} />

      <Route path="/" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
      <Route path="/communities" element={<ProtectedRoute><AppLayout><Communities /></AppLayout></ProtectedRoute>} />
      <Route path="/communities/:language" element={<ProtectedRoute><AppLayout><CommunityMembers /></AppLayout></ProtectedRoute>} />
      <Route path="/communities/:language/chat" element={<ProtectedRoute><AppLayout><CommunityChat /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}