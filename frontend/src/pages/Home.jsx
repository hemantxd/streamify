import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackgroundBlobs from '../components/ui/BackgroundBlobs';
import UserAvatar from '../components/ui/UserAvatar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-5 relative overflow-hidden">
      <BackgroundBlobs variant="app" />

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 sm:p-10 text-center">
          <UserAvatar user={user} size="xl" className="mx-auto mb-5 border-3 border-[#667eea] shadow-lg shadow-[#667eea]/30" />

          <h1 className="text-2xl font-bold text-white mb-3">
            Welcome, {user?.fullName || 'User'}! 🎉
          </h1>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
              <span>✓</span> Onboarded
            </span>
          </div>

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

          <Button variant="danger" onClick={handleLogout}>Sign Out</Button>
        </Card>
      </div>
    </div>
  );
}