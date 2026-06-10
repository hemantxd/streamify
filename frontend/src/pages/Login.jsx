import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
      {/* Background blobs */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[120px] opacity-15 -top-40 -right-40 animate-float pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-10 -bottom-20 -left-20 animate-float-reverse pointer-events-none" />

      {/* Main card */}
      <div className="flex w-full max-w-[960px] min-h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        {/* Left brand panel */}
        <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/5 relative overflow-hidden">
          <div className="absolute w-80 h-80 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[80px] opacity-20 -top-20 -left-20 pointer-events-none" />
          <div className="text-center relative z-10">
            <div className="text-7xl mb-4 animate-bounce">🎧</div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">Streamify</h1>
            <p className="text-white/60 text-base max-w-[280px] mx-auto leading-relaxed">Welcome back! Stream your world.</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-white/40 text-sm mb-7">Continue your journey</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#667eea]/30 active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
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