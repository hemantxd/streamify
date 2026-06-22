import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundBlobs from '../components/ui/BackgroundBlobs';
import AuthBrand from '../components/ui/AuthBrand';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-5 relative overflow-hidden">
      <BackgroundBlobs variant="auth" />

      <div className="flex w-full max-w-[960px] min-h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <AuthBrand subtitle="Welcome back! Continue your language journey." />

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-white/40 text-sm mb-7">Continue your journey</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#667eea] hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}