import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Button';

const LANG_DATA = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  de: { name: 'German', flag: '🇩🇪' },
  it: { name: 'Italian', flag: '🇮🇹' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  ja: { name: 'Japanese', flag: '🇯🇵' },
  ko: { name: 'Korean', flag: '🇰🇷' },
  zh: { name: 'Chinese', flag: '🇨🇳' },
  hi: { name: 'Hindi', flag: '🇮🇳' },
};

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/communities');
        setCommunities(data.communities);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Language Communities 🌍</h1>
        <p className="text-white/50 text-sm">Browse communities and connect with language learners & native speakers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((c) => {
          const lang = LANG_DATA[c.code];
          return (
            <Card key={c.code} onClick={() => navigate(`/communities/${c.code}`)} className="p-5 group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{lang?.flag || '🌐'}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{lang?.name || c.code}</h3>
                  <div className="flex gap-3 text-xs text-white/40 mt-0.5">
                    <span>👤 {c.nativeCount} native</span>
                    <span>📚 {c.learningCount} learning</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {c.userIsNative && <Badge variant="success">Your native language</Badge>}
                {c.userIsLearning && <Badge variant="accent">Learning</Badge>}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/30 group-hover:text-white/60 transition-all">View members →</span>
                <span className="text-xl opacity-0 group-hover:opacity-100 transition-all">→</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}