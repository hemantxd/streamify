import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[100px] opacity-15 -top-40 -left-20 animate-float" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-15 -bottom-20 -right-20 animate-float-reverse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-full blur-[100px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl text-center animate-slide-up">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full mx-auto mb-5 overflow-hidden border-3 border-[#667eea] shadow-lg shadow-[#667eea]/30">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-3xl font-bold text-white">
                {user?.fullName?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            Welcome, {user?.fullName || 'User'}! 🎉
          </h1>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
              <span>✓</span> Onboarded
            </span>
          </div>

          {/* Info Grid */}
          <div className="space-y-3 mb-7 text-left">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Bio', value: user?.bio || 'No bio yet' },
              { label: 'Location', value: user?.location || 'Not set' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center gap-4 px-3.5 py-2.5 bg-white/5 rounded-lg">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm text-white/80 text-right break-words max-w-[60%]">{item.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 font-semibold text-sm hover:bg-red-500/20 transition-all active:scale-[0.98]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}