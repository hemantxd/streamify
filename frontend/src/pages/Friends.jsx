import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

export default function Friends() {
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchFriends = useCallback(async () => {
    try {
      const { data } = await axios.get('/friends');
      setFriends(data.friends);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await axios.get('/friends/requests/pending');
      setRequests(data.requests);
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  const searchUsers = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await axios.get('/friends/search', { params: { q } });
      setSearchResults(data.users);
    } catch { /* empty */ }
    setSearching(false);
  };

  const sendRequest = async (receiverId) => {
    try {
      await axios.post('/friends/request', { receiverId });
      setSearchResults((prev) =>
        prev.map((u) => (u._id === receiverId ? { ...u, requestSentByMe: true, requestStatus: 'pending' } : u))
      );
    } catch { /* empty */ }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.put(`/friends/request/${requestId}/accept`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      fetchFriends();
    } catch { /* empty */ }
  };

  const declineRequest = async (requestId) => {
    try {
      await axios.put(`/friends/request/${requestId}/decline`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch { /* empty */ }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`/friends/${friendId}`);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch { /* empty */ }
  };

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: requests.length, highlight: requests.length > 0 },
    { id: 'search', label: 'Add People' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Friends 👥</h1>
      <p className="text-white/50 text-sm mb-6">Manage your connections and find new language partners</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative ${
              tab === t.id
                ? 'text-white bg-white/5 border-b-2 border-[#667eea]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                t.highlight ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends Tab */}
      {tab === 'friends' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-[3px] border-white/10 border-t-[#667eea] rounded-full animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🤝</p>
              <p className="text-white/50 text-lg">No friends yet</p>
              <p className="text-white/30 text-sm mt-1">Go to "Add People" tab to find friends</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((f) => (
                <div key={f._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {f.profilePicture ? (
                        <img src={f.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        f.fullName?.charAt(0) || '?'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.fullName}</p>
                      <p className="text-xs text-white/40 flex gap-2">
                        {f.nativeLanguage && <span>🗣️ {f.nativeLanguage}</span>}
                        {f.learningLanguage && <span>📚 {f.learningLanguage}</span>}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFriend(f._id)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-all">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-white/50 text-lg">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {r.sender?.profilePicture ? <img src={r.sender.profilePicture} alt="" className="w-full h-full object-cover" /> : r.sender?.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.sender?.fullName}</p>
                      <p className="text-xs text-white/40">Sent you a friend request</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(r._id)} className="px-4 py-1.5 text-xs font-medium bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 rounded-lg hover:bg-[#34d399]/25 transition-all">Accept</button>
                    <button onClick={() => declineRequest(r._id)} className="px-4 py-1.5 text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {tab === 'search' && (
        <div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 mb-6 focus-within:border-[#667eea] focus-within:ring-3 focus-within:ring-[#667eea]/20 transition-all">
            <span className="text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => searchUsers(e.target.value)}
              className="flex-1 py-3 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
            />
            {searching && <div className="w-4 h-4 border-2 border-white/10 border-t-[#667eea] rounded-full animate-spin" />}
          </div>

          {searchQuery.length < 2 ? (
            <p className="text-white/30 text-sm text-center py-8">Type at least 2 characters to search</p>
          ) : searchResults.length === 0 && !searching ? (
            <p className="text-white/50 text-sm text-center py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((u) => (
                <div key={u._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : u.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{u.fullName}</p>
                      <p className="text-xs text-white/40">{u.nativeLanguage && `🗣️ ${u.nativeLanguage}`}{u.learningLanguage && ` · 📚 ${u.learningLanguage}`}</p>
                    </div>
                  </div>
                  <div>
                    {u.isFriend ? (
                      <span className="text-xs text-[#34d399]">✓ Friends</span>
                    ) : u.requestSentByMe ? (
                      <span className="text-xs text-yellow-400">⏳ Sent</span>
                    ) : u.requestStatus === 'pending' ? (
                      <span className="text-xs text-yellow-400">⏳ Pending</span>
                    ) : (
                      <button onClick={() => sendRequest(u._id)} className="px-4 py-1.5 text-xs font-medium text-[#667eea] border border-[#667eea]/30 rounded-lg hover:bg-[#667eea]/10 transition-all">+ Add</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}