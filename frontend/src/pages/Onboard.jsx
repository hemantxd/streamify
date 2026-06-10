import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { title: 'Profile', icon: '👤', subtitle: 'Tell us about yourself' },
  { title: 'Language', icon: '🌍', subtitle: 'Your language preferences' },
  { title: 'Location', icon: '📍', subtitle: 'Where are you based?' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

export default function Onboard() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    nativeLanguage: '',
    learningLanguage: '',
    location: '',
  });
  const { user, onboard } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step === 0 && (!form.fullName.trim() || !form.bio.trim())) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 1 && (!form.nativeLanguage || !form.learningLanguage)) {
      setError('Please select both languages');
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!form.location.trim()) {
      setError('Please enter your location');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onboard(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const nativeLang = LANGUAGES.find((l) => l.code === form.nativeLanguage);
  const learningLang = LANGUAGES.find((l) => l.code === form.learningLanguage);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full blur-[100px] opacity-15 -top-40 -left-20 animate-float" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-full blur-[100px] opacity-15 -bottom-20 -right-20 animate-float-reverse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-full blur-[100px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
      </div>

      <div className="w-full max-w-[600px] relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                  i < step
                    ? 'bg-[#34d399] border-transparent text-white text-sm'
                    : i === step
                    ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] border-transparent text-white shadow-lg shadow-[#667eea]/40'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}>
                  {i < step ? '✓' : s.icon}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-white">{s.title}</span>
                  <span className="text-xs text-white/40">{s.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">{STEPS[step].title}</h2>
            <p className="text-white/40 text-sm">{STEPS[step].subtitle}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Bio</label>
                <textarea
                  placeholder="Tell the world a bit about yourself..."
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] focus:ring-3 focus:ring-[#667eea]/20 transition-all resize-vertical min-h-[100px]"
                />
                <span className="block text-xs text-white/30 mt-1.5">{form.bio.length}/200</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Native Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { update('nativeLanguage', lang.code); if (form.learningLanguage === lang.code) update('learningLanguage', ''); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        form.nativeLanguage === lang.code
                          ? 'bg-[#667eea]/20 border-[#667eea] text-white shadow-sm shadow-[#667eea]/20'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Language you want to learn</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {LANGUAGES.filter((l) => l.code !== form.nativeLanguage).map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => update('learningLanguage', lang.code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        form.learningLanguage === lang.code
                          ? 'bg-[#667eea]/20 border-[#667eea] text-white shadow-sm shadow-[#667eea]/20'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
                {!form.learningLanguage && (
                  <span className="block text-xs text-white/30 mt-2">Select a language different from your native language</span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Your Location</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 focus-within:border-[#667eea] focus-within:ring-3 focus-within:ring-[#667eea]/20 transition-all">
                  <span className="text-lg">📍</span>
                  <input
                    type="text"
                    placeholder="e.g. New York, USA"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    className="flex-1 py-3 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
                  />
                </div>
                <span className="block text-xs text-white/30 mt-1.5">This helps us connect you with nearby learners</span>
              </div>

              {/* Preview Card */}
              <div className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-xl mt-4">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-2xl">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm text-white/60">
                  <strong className="text-white text-base">{form.fullName || 'Your Name'}</strong>
                  <span>{form.bio ? (form.bio.length > 60 ? form.bio.slice(0, 60) + '...' : form.bio) : 'Your bio'}</span>
                  <span>
                    {nativeLang?.flag || '🌐'} Native · {learningLang?.flag || '🌐'} Learning
                  </span>
                  <span>{form.location || 'Your location'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((prev) => prev - 1)}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 transition-all hover:shadow-lg hover:shadow-[#667eea]/30 active:scale-[0.98]"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all animate-pulse-soft active:scale-[0.98]"
              >
                {loading ? 'Setting up...' : '🚀 Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}