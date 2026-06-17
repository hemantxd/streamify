import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import UserAvatar from '../components/ui/UserAvatar';
import Card from '../components/ui/Card';
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

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [friends, setFriends] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', bio: '', location: '' });
  const fileInputRef = useRef(null);

  const fetchFriends = async () => {
    try {
      const res = await axios.get('/friends');
      setFriends(res.data.friends);
    } catch { /* empty */ }
  };

  const fetchCommunities = async () => {
    try {
      const res = await axios.get('/communities');
      setCommunities(res.data.communities.filter((c) => c.userIsJoined));
    } catch { /* empty */ }
  };

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', bio: user.bio || '', location: user.location || '' });
      fetchFriends();
      fetchCommunities();
    }
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post('/upload/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await checkAuth();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/upload/profile', form);
      await checkAuth();
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const nativeLang = LANG_DATA[user?.nativeLanguage];
  const learningLang = LANG_DATA[user?.learningLanguage];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="relative group">
          <UserAvatar user={user} size="xl" className="border-3 border-[#667eea] shadow-lg shadow-[#667eea]/30" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <span className="text-white text-sm font-medium">{uploading ? '...' : 'Change'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        <div className="text-center sm:text-left flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#667eea]"
                placeholder="Full Name"
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#667eea] resize-none"
                placeholder="Bio"
              />
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#667eea]"
                placeholder="Location"
              />
              <div className="flex gap-2">
                <Button variant="primary" className="text-xs py-2" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="secondary" className="text-xs py-2" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">{user?.fullName}</h1>
              <p className="text-white/50 text-sm mb-2">{user?.email}</p>
              {user?.bio && <p className="text-white/60 text-sm mb-2">{user.bio}</p>}
              {user?.location && <p className="text-white/40 text-xs mb-3">📍 {user.location}</p>}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-3">
                {nativeLang && <Badge variant="success">{nativeLang.flag} {nativeLang.name} (Native)</Badge>}
                {learningLang && <Badge variant="accent">{learningLang.flag} {learningLang.name} (Learning)</Badge>}
              </div>
              <Button variant="secondary" className="text-xs py-2" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Friends */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-white/30 text-sm">No friends yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {friends.map((f) => (
                <div key={f._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all">
                  <UserAvatar user={f} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{f.fullName}</p>
                    <p className="text-xs text-white/40 truncate">
                      {f.nativeLanguage && LANG_DATA[f.nativeLanguage]?.flag} {f.learningLanguage && LANG_DATA[f.learningLanguage]?.flag}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Communities */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Communities ({communities.length})</h2>
          {communities.length === 0 ? (
            <p className="text-white/30 text-sm">No communities joined yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {communities.map((c) => (
                <div key={c.code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all">
                  <span className="text-2xl">{c.flag}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white">{c.name}</p>
                    <p className="text-xs text-white/40">{c.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}