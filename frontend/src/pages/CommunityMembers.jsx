import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import UserAvatar from '../components/ui/UserAvatar';
import Button, { Badge } from '../components/ui/Button';

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

export default function CommunityMembers() {
  const { language } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const lang = LANG_DATA[language];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/communities/${language}/members`);
        setMembers(data.members);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetch();
  }, [language]);

  const sendFriendRequest = async (receiverId) => {
    try {
      await axios.post('/friends/request', { receiverId });
      setMembers((prev) =>
        prev.map((m) =>
          m._id === receiverId ? { ...m, requestStatus: 'pending', requestSentByMe: true } : m
        )
      );
    } catch { /* empty */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/communities')} className="text-white/40 hover:text-white/70 text-sm mb-4 flex items-center gap-1">← Back to Communities</button>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{lang?.flag || '🌐'}</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{lang?.name || language} Community</h1>
      </div>
      <div className="flex gap-3 mb-8">
        {user?.nativeLanguage === language && <Badge variant="success">Your native language</Badge>}
        {user?.learningLanguage === language && <Badge variant="accent">Learning</Badge>}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white/50 text-lg">No members found in this community yet</p>
          <p className="text-white/30 text-sm mt-1">Be the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <Card key={m._id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar user={m} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.fullName}</p>
                  <p className="text-xs text-white/40 truncate">{m.location || 'No location'}</p>
                </div>
              </div>
              <div className="mb-3">
                <Badge variant={m.relation === 'native' ? 'success' : 'accent'}>
                  {m.relation === 'native' ? 'Native speaker' : 'Learning'}
                </Badge>
              </div>
              {m.bio && <p className="text-xs text-white/40 line-clamp-2 mb-3">{m.bio}</p>}

              {m._id !== user._id && (
                <div className="mt-auto">
                  {m.isFriend ? (
                    <span className="text-xs text-[#34d399]">✓ Friends</span>
                  ) : m.requestSentByMe ? (
                    <span className="text-xs text-yellow-400">⏳ Request sent</span>
                  ) : m.requestStatus === 'pending' ? (
                    <span className="text-xs text-yellow-400">⏳ Pending response</span>
                  ) : (
                    <Button variant="accent" className="w-full py-1.5 text-xs" onClick={() => sendFriendRequest(m._id)}>
                      + Add Friend
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}