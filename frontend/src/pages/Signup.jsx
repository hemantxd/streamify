import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.fullName, form.email, form.password);
      navigate('/onboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[120px] opacity-15 -top-40 -right-40 animate-float pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-10 -bottom-20 -left-20 animate-float-reverse pointer-events-none" />

      <div className="flex w-full max-w-[960px] min-h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/5 relative overflow-hidden">
          <div className="absolute w-80 h-80 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[80px] opacity-20 -top-20 -left-20 pointer-events-none" />
          <div className="text-center relative z-10">
            <div className="text-7xl mb-4 animate-bounce">🎧</div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2">
              Streamify
            </h1>
            <p className="text-white/60 text-base max-w-[280px] mx-auto leading-relaxed">
              Join the community. Start streaming.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-white/40 text-sm mb-7">Begin your streaming journey</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#667eea]/30 active:scale-[0.98]"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#667eea] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}