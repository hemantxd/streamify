import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundBlobs from '../components/ui/BackgroundBlobs';
import AuthBrand from '../components/ui/AuthBrand';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
      <BackgroundBlobs variant="auth" />

      <div className="flex w-full max-w-[960px] min-h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <AuthBrand subtitle="Join the community. Start streaming." />

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-white/40 text-sm mb-7">Begin your streaming journey</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Full Name" name="fullName" type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              <Input label="Password" name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} minLength={6} required />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#667eea] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}